// === CẤU HÌNH ===
const DASHBOARD_URL = "/output/reports/translation-dashboard.json";
const PROGRESS_URL = "/api/progress";
const SCRIPTS_URL = "/api/scripts";
const RUN_URL = "/api/run-script";
const STOP_URL = "/api/stop-run";
const RETRY_FAILED_URL = "/api/retry-failed";
const POLL_MS = 3000;

const START_SCRIPT = "translate:all";
const RESUME_SCRIPT = "translate:resume";

// === TRẠNG THÁI ===
let scriptSections = [];
let isStopping = false;
let scriptsPanelBuilt = false;

// === KHỞI ĐỘNG ===
function init() {
  el("btn-start").addEventListener("click", () => runScript(START_SCRIPT));
  el("btn-resume").addEventListener("click", () => runScript(RESUME_SCRIPT));
  el("btn-stop").addEventListener("click", stopRun);
  el("action-msg").addEventListener("click", (e) => {
    if (e.target.closest("[data-action='retry']")) retryFailed();
  });
  loadScripts().then(() => {
    poll();
    setInterval(poll, POLL_MS);
  });
}

init();

// === POLLING ===
async function poll() {
  const [progress, dashboard] = await Promise.all([
    fetchJson(PROGRESS_URL),
    fetchJson(DASHBOARD_URL + "?t=" + Date.now()),
  ]);
  if (!progress || !dashboard) return;
  renderZone1(progress, dashboard);
  renderZone2(progress, dashboard);
  renderZone3(dashboard);
}

// === ZONE 1: TIẾN ĐỘ TỔNG THỂ ===
function renderZone1(progress, dashboard) {
  const pct = Number(dashboard.coverage?.percent ?? 0);
  const translated = dashboard.coverage?.translatedStrings ?? 0;
  const total = dashboard.coverage?.totalStrings ?? 0;
  const pending = progress.queue?.pendingJobs ?? 0;
  const run = progress.currentRun;
  const isRunning = progress.hasRunningRun;

  el("big-pct").textContent = pct + "%";
  el("progress-fill").style.width = Math.min(100, pct) + "%";
  el("strings-count").textContent = `${translated} / ${total} chuỗi đã dịch`;

  const statusEl = el("status-line");
  if (isRunning) {
    statusEl.textContent = "Đang chạy: " + (run?.label || run?.script || "...");
    statusEl.className = "status-line is-running";
  } else if (pending > 0) {
    statusEl.textContent = pending + " job đang chờ - bấm Chạy queue hiện tại";
    statusEl.className = "status-line has-queue";
  } else {
    statusEl.textContent = "Rảnh — không có job nào trong queue";
    statusEl.className = "status-line";
  }
}

// === ZONE 2: ĐIỀU KHIỂN VÀ LOG ===
function renderZone2(progress, dashboard) {
  const isRunning = progress.hasRunningRun;
  const run = progress.currentRun;
  const pending = progress.queue?.pendingJobs ?? 0;
  const failed = progress.queue?.failedJobs ?? 0;
  const hasResumeQueue = !isRunning && (pending > 0 || failed > 0);
  const runStatus = getRunStatusMeta(run, isRunning, pending, failed);

  // Lần trước bị dừng/crash (không phải success, không đang running)
  const lastWasStopped = !isRunning && run && (run.status === "stopped" || run.status === "failed");

  // --- Thông tin task ---
  const nameEl = el("run-name");
  const sinceEl = el("run-since");
  if (isRunning && run) {
    nameEl.textContent = run.label || run.script;
    nameEl.className = "run-name is-running";
    sinceEl.textContent = "Bắt đầu: " + formatTime(run.startedAt);
  } else if (run) {
    nameEl.textContent = run.label || run.script;
    nameEl.className = "run-name was-run";
    const stateLabel = { stopped: "Đã dừng", failed: "Lỗi", success: "Hoàn tất" }[run.status] ?? run.status;
    sinceEl.textContent = stateLabel + ": " + formatTime(run.finishedAt || run.startedAt);
  } else {
    nameEl.textContent = "";
    sinceEl.textContent = "";
  }

  // --- Nút Bắt đầu ---
  const btnStart = el("btn-start");
  btnStart.disabled = isRunning || hasResumeQueue;
  btnStart.textContent = hasResumeQueue ? "▶ Bắt đầu lại từ đầu (đang khóa)" : "▶ Bắt đầu Việt hóa từ đầu";
  btnStart.title = hasResumeQueue
    ? "Đang có queue dang dở. Hãy dùng nút Tiếp tục để chỉ chạy phần chưa dịch và job lỗi."
    : "Dùng khi bạn muốn tạo/chạy lại workflow từ đầu.";

  // --- Nút chạy queue hiện tại: chỉ cần idle + còn pending/failed ---
  const btnResume = el("btn-resume");
  const showResume = hasResumeQueue;
  btnResume.classList.toggle("hidden", !showResume);
  if (showResume) {
    const queueCount = pending + failed;
    btnResume.textContent = `▶ Chạy queue hiện tại (${queueCount} job)`;
    btnResume.title = failed > 0
      ? `Chạy tiếp queue hiện tại và xử lý cả ${failed} job lỗi nếu bạn đã retry.`
      : "Chạy các job đang có trong queue hiện tại, không tạo lại queue.";
  }

  // --- Nút Stop ---
  const btnStop = el("btn-stop");
  btnStop.disabled = !isRunning || isStopping;
  btnStop.textContent = isStopping ? "Đang dừng..." : "■ Stop";

  // --- Thông báo phụ: retry hoặc no-queue ---
  const msgEl = el("action-msg");
  if (isRunning) {
    msgEl.className = `action-msg ${runStatus.tone}`;
    msgEl.innerHTML = `
      <div class="msg-resume-title">${esc(runStatus.title)}</div>
      <div class="msg-resume-body">${esc(runStatus.body)}</div>
    `;
  } else if (!isRunning && hasResumeQueue) {
    const parts = [];
    if (pending > 0) parts.push(`${pending} job chưa xong`);
    if (failed > 0) parts.push(`${failed} job lỗi`);
    msgEl.className = "action-msg msg-resume";
    msgEl.innerHTML = `
      <div class="msg-resume-title">Queue hiện tại đã sẵn sàng</div>
      <div class="msg-resume-body">
        Hệ thống đang còn ${esc(parts.join(" và "))}. Bấm <strong>Chạy queue hiện tại</strong> để dịch tiếp, không tạo lại queue và không làm lại các file đã xong.
      </div>
      ${failed > 0 ? `<button class="btn-retry" data-action="retry">↩ Đưa ${esc(String(failed))} job lỗi về queue</button>` : ""}
    `;
  } else if (!isRunning && failed > 0) {
    msgEl.className = "action-msg";
    msgEl.innerHTML = `<button class="btn-retry" data-action="retry">↩ Thử lại ${esc(String(failed))} job lỗi</button>`;
  } else if (!isRunning && pending === 0) {
    msgEl.className = "action-msg msg-no-queue";
    msgEl.textContent = "Queue trống — hãy tạo queue mới từ danh sách bên dưới.";
  } else {
    msgEl.className = "action-msg hidden";
    msgEl.innerHTML = "";
  }

  // --- Log box (luôn hiển thị) ---
  renderLogBox(run, isRunning);

  // --- Scripts panel (chỉ build 1 lần, ẩn khi đang chạy) ---
  if (!scriptsPanelBuilt && scriptSections.length > 0) {
    renderScriptsPanel();
    scriptsPanelBuilt = true;
  }
  el("scripts-panel").classList.toggle("hidden", isRunning);
}

function renderLogBox(run, isRunning) {
  const logBox = el("log-box");
  const atBottom = logBox.scrollHeight - logBox.scrollTop <= logBox.clientHeight + 60;
  const text = run?.logTail || (isRunning ? "Đang chờ log..." : "Chưa có log.");
  logBox.textContent = text;
  logBox.className = isRunning ? "log-box" : "log-box log-idle";
  if (isRunning && atBottom) logBox.scrollTop = logBox.scrollHeight;
}

// === ZONE 3: BẢNG ĐỘ PHỦ ===
function renderZone3(dashboard) {
  const files = dashboard.files ?? [];
  el("files-body").innerHTML = files.length
    ? files
        .map(
          (f) => `
    <tr>
      <td class="file-name">${esc(shortName(f.file))}</td>
      <td class="num">${f.translated}</td>
      <td class="num">${f.total}</td>
      <td class="num pct-cell">${f.percent}%</td>
    </tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="empty-row">Chưa có dữ liệu.</td></tr>`;
}

// === HÀNH ĐỘNG ===
async function runScript(name) {
  try {
    if (name === RESUME_SCRIPT) {
      await fetch(RETRY_FAILED_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    }

    const res = await fetch(RUN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Không thể chạy " + name);
  } catch (err) {
    alert(err.message);
  }
}

async function stopRun() {
  if (isStopping) return;
  isStopping = true;
  el("btn-stop").disabled = true;
  el("btn-stop").textContent = "Đang dừng...";
  try {
    const res = await fetch(STOP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Không thể dừng task.");
  } catch (err) {
    alert(err.message);
  } finally {
    isStopping = false;
  }
}

async function retryFailed() {
  try {
    const res = await fetch(RETRY_FAILED_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Không thể thử lại job lỗi.");
    await poll();
    alert(`Đã đưa ${data.retried ?? 0} job lỗi trở lại queue. Bây giờ bạn có thể bấm "Tiếp tục Việt hóa".`);
  } catch (err) {
    alert(err.message);
  }
}

// === HELPER ===
async function loadScripts() {
  const data = await fetchJson(SCRIPTS_URL);
  scriptSections = data?.sections ?? [];
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

function getRunStatusMeta(run, isRunning, pending, failed) {
  if (!isRunning || !run) {
    return {
      tone: "msg-info",
      title: "Sẵn sàng",
      body: "Hiện không có tác vụ nào đang chạy.",
    };
  }

  const now = Date.now();
  const logUpdatedAt = run.logUpdatedAt ? Date.parse(run.logUpdatedAt) : NaN;
  const idleMs = Number.isFinite(logUpdatedAt) ? Math.max(0, now - logUpdatedAt) : 0;
  const idleLabel = idleMs > 0 ? formatDuration(idleMs) : null;
  const logTail = String(run.logTail ?? "");
  if (String(run.script ?? "").startsWith("build-jobs")) {
    const createdMatch = logTail.match(/Created\s+(\d+)\s+jobs/i);
    if (createdMatch) {
      return {
        tone: "msg-info",
        title: "Queue đã tạo xong",
        body: `Đã tạo ${createdMatch[1]} job. Khi lệnh tạo queue kết thúc, bấm Chạy queue hiện tại để bắt đầu dịch.`,
      };
    }
    return {
      tone: "msg-running",
      title: "Đang tạo queue",
      body: "Hệ thống đang quét input và ghi jobs/pending.json.",
    };
  }
  const batchLooksDone = /Processed \d+ job\(s\)\. Pending: \d+/i.test(logTail);

  if (batchLooksDone && idleMs >= 20000) {
    return {
      tone: "msg-warn",
      title: "Tác vụ có dấu hiệu đang chờ sau khi xong một batch",
      body: `Batch gần nhất đã xử lý xong nhưng chưa thấy sang chu kỳ tiếp theo trong ${idleLabel}. Nếu trạng thái này giữ nguyên quá lâu, bạn có thể bấm Stop rồi bấm Tiếp tục Việt hóa để nối lại ${pending} job còn lại.`,
    };
  }

  if (batchLooksDone) {
    return {
      tone: "msg-info",
      title: "Đang chờ sang chu kỳ kế tiếp",
      body: `Batch hiện tại đã xong. Hệ thống thường sẽ tiếp tục sang chu kỳ mới để xử lý phần còn lại. Hiện còn ${pending} job trong queue.`,
    };
  }

  return {
    tone: "msg-running",
    title: "Đang dịch bình thường",
    body: `Tác vụ đang chạy và sẽ xử lý theo từng batch tối đa 8 job mỗi chu kỳ. Hiện còn ${pending} job chờ và ${failed} job lỗi.`,
  };
}

function formatDuration(ms) {
  const seconds = Math.max(1, Math.floor(ms / 1000));
  if (seconds < 60) return `${seconds} giây`;
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  if (minutes < 60) return remainSeconds > 0 ? `${minutes} phút ${remainSeconds} giây` : `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return remainMinutes > 0 ? `${hours} giờ ${remainMinutes} phút` : `${hours} giờ`;
}

function renderScriptsPanel() {
  const panel = el("scripts-panel");
  panel.innerHTML = scriptSections
    .map(
      (section) => `
    <div class="script-section">
      <div class="script-section-title">${esc(section.title)}</div>
      <div class="script-btns">
        ${(section.actions ?? [])
          .map((a) => `<button class="btn-script" data-script="${esc(a.name)}" title="${esc(a.summary)}">${esc(a.label)}</button>`)
          .join("")}
      </div>
    </div>`,
    )
    .join("");

  for (const btn of panel.querySelectorAll("[data-script]")) {
    btn.addEventListener("click", () => runScript(btn.dataset.script));
  }
}

function shortName(p) {
  const parts = String(p ?? "").replace(/\\/g, "/").split("/");
  return parts.slice(-2).join("/");
}

function formatTime(iso) {
  return iso ? new Date(iso).toLocaleTimeString("vi-VN") : "-";
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function el(id) {
  return document.getElementById(id);
}
