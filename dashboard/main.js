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
    statusEl.textContent = pending + " job đang chờ — sẵn sàng tiếp tục";
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
  btnStart.disabled = isRunning || pending === 0;

  // --- Nút Tiếp tục: chỉ khi idle + có pending + lần trước bị dừng/crash ---
  const btnResume = el("btn-resume");
  const showResume = !!(lastWasStopped && pending > 0);
  btnResume.classList.toggle("hidden", !showResume);
  if (showResume) btnResume.textContent = `↺ Tiếp tục (${pending} job)`;

  // --- Nút Stop ---
  const btnStop = el("btn-stop");
  btnStop.disabled = !isRunning || isStopping;
  btnStop.textContent = isStopping ? "Đang dừng..." : "■ Stop";

  // --- Thông báo phụ: retry hoặc no-queue ---
  const msgEl = el("action-msg");
  if (!isRunning && failed > 0) {
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
    const res = await fetch(url);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
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
