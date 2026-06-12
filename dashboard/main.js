// === CẤU HÌNH ===
const DASHBOARD_URL = "/output/reports/translation-dashboard.json";
const PROGRESS_URL = "/api/progress";
const RUN_URL = "/api/run-script";
const STOP_URL = "/api/stop-run";
const RETRY_FAILED_URL = "/api/retry-failed";
const POLL_MS = 3000;

// === TRẠNG THÁI ===
let isStopping = false;

// Workflow BTXT: trạng thái từng bước
const wfSteps = [
  { id: "a", script: "build-btxt:expanded-pilot:dry", btnId: "btn-step-a", badgeId: "badge-a", logId: "log-a", stepElId: "wfs-a" },
  { id: "b", script: "build-btxt:expanded-pilot",     btnId: "btn-step-b", badgeId: "badge-b", logId: "log-b", stepElId: "wfs-b" },
  { id: "c", script: "sync-btxt-languages",           btnId: "btn-step-c", badgeId: "badge-c", logId: "log-c", stepElId: "wfs-c" },
];
const wfState = { a: "idle", b: "idle", c: "idle" }; // idle | running | ok | error
let wfRunningStep = null;  // id của step đang poll
let wfPollTimer = null;

// === KHỞI ĐỘNG ===
function init() {
  // Nút pipeline chính
  for (const btn of document.querySelectorAll(".btn-pipeline[data-script]")) {
    btn.addEventListener("click", () => runScript(btn.dataset.script));
  }
  el("btn-stop").addEventListener("click", stopRun);

  // Nút từng bước workflow
  for (const step of wfSteps) {
    el(step.btnId).addEventListener("click", () => runWorkflowStep(step));
  }

  // Nút chạy cả 3
  el("btn-wf-run").addEventListener("click", runAllSteps);

  poll();
  setInterval(poll, POLL_MS);
}

init();

// === POLLING ===
async function poll() {
  const [progress, dashboard] = await Promise.all([
    fetchJson(PROGRESS_URL),
    fetchJson(DASHBOARD_URL + "?t=" + Date.now()),
  ]);
  if (!progress || !dashboard) return;
  renderHeader(progress, dashboard);
  renderPipeline(progress, dashboard);
  renderLogBox(progress);
  renderCoverage(dashboard);
}

// === HEADER: Tiến độ tổng thể ===
function renderHeader(progress, dashboard) {
  const pct = Number(dashboard.coverage?.percent ?? 0);
  const translated = dashboard.coverage?.translatedStrings ?? 0;
  const total = dashboard.coverage?.totalStrings ?? 0;
  const pending = progress.queue?.pendingJobs ?? 0;
  const isRunning = progress.hasRunningRun;
  const run = progress.currentRun;

  el("big-pct").textContent = pct + "%";
  el("progress-fill").style.width = Math.min(100, pct) + "%";
  el("strings-count").textContent = `${translated} / ${total} chuỗi đã dịch`;

  const statusEl = el("status-line");
  if (isRunning) {
    statusEl.textContent = "Đang chạy: " + (run?.label || run?.script || "...");
    statusEl.className = "status-line is-running";
  } else if (pending > 0) {
    statusEl.textContent = pending + " job đang chờ";
    statusEl.className = "status-line has-queue";
  } else {
    statusEl.textContent = "Sẵn sàng";
    statusEl.className = "status-line";
  }
}

// === PIPELINE: 4 step cards ===
function renderPipeline(progress, dashboard) {
  const isRunning = progress.hasRunningRun;
  const run = progress.currentRun;
  const pending = progress.queue?.pendingJobs ?? 0;
  const failed = progress.queue?.failedJobs ?? 0;
  const script = run?.script ?? "";

  // Xác định step nào đang active
  const activeStep = getActiveStep(script, isRunning);
  for (let i = 1; i <= 4; i++) {
    const card = el("step-" + i);
    card.classList.toggle("is-active", activeStep === i);
  }

  // --- Step 1: Dịch ---
  const hasQueue = pending > 0 || failed > 0;

  // Disable tất cả pipeline buttons nếu đang chạy
  for (const btn of document.querySelectorAll(".btn-pipeline[data-script]")) {
    btn.disabled = isRunning;
  }

  // Stop button
  const btnStop = el("btn-stop");
  btnStop.classList.toggle("hidden", !isRunning);
  btnStop.disabled = !isRunning || isStopping;
  btnStop.textContent = isStopping ? "Đang dừng..." : "■ Stop";

  // Resume button: chỉ hiện khi idle + có queue
  const btnResume = el("btn-resume");
  btnResume.classList.toggle("hidden", !(!isRunning && hasQueue));
  if (!isRunning && hasQueue) {
    btnResume.disabled = false;
    btnResume.textContent = `↺ Tiếp tục (${pending + failed} job)`;
  }

  // Translate button: ẩn khi có queue pending (ưu tiên nút resume)
  const btnTranslate = el("btn-translate");
  btnTranslate.classList.toggle("hidden", !isRunning && hasQueue);

  // Step 1 message: retry failed / queue info
  const msgEl = el("step1-msg");
  if (!isRunning && failed > 0) {
    msgEl.className = "step-msg";
    msgEl.innerHTML =
      `${failed} job lỗi. ` +
      `<button class="btn-retry" id="btn-retry-inline">↩ Đưa về queue</button>`;
    el("btn-retry-inline")?.addEventListener("click", retryFailed);
  } else if (!isRunning && pending > 0) {
    msgEl.className = "step-msg";
    msgEl.textContent = `${pending} job đang chờ xử lý.`;
  } else {
    msgEl.className = "step-msg hidden";
    msgEl.innerHTML = "";
  }
}

function getActiveStep(script, isRunning) {
  if (!isRunning) return 0;
  if (script.startsWith("translate") || script.startsWith("build-jobs")) return 1;
  if (script.startsWith("build-btxt") || script === "build-bmd" || script.startsWith("patch-cluster") || script === "build-runtime") return 2;
  if (script.startsWith("build-pak") || script === "build-game") return 3;
  if (script.startsWith("sync-") || script.startsWith("deploy-")) return 4;
  return 0;
}

// === LOG BOX ===
function renderLogBox(progress) {
  const run = progress.currentRun;
  const isRunning = progress.hasRunningRun;
  const logBox = el("log-box");
  const titleEl = el("log-title");
  const sinceEl = el("log-since");

  const atBottom = logBox.scrollHeight - logBox.scrollTop <= logBox.clientHeight + 60;
  const text = run?.logTail || (isRunning ? "Đang chờ log..." : "Chưa có log.");
  logBox.textContent = text;
  logBox.className = isRunning ? "log-box" : "log-box log-idle";
  if (isRunning && atBottom) logBox.scrollTop = logBox.scrollHeight;

  if (run) {
    titleEl.textContent = isRunning
      ? `Log — ${run.label || run.script}`
      : `Log — ${run.label || run.script}`;
    const stateLabels = { stopped: "Đã dừng", failed: "Lỗi", success: "Hoàn tất", running: "Đang chạy" };
    const stateLabel = stateLabels[run.status] ?? run.status;
    const timeStr = isRunning
      ? "Bắt đầu: " + formatTime(run.startedAt)
      : stateLabel + " — " + formatTime(run.finishedAt || run.startedAt);
    sinceEl.textContent = timeStr;
  } else {
    titleEl.textContent = "Log";
    sinceEl.textContent = "";
  }
}

// === BẢNG COVERAGE ===
function renderCoverage(dashboard) {
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
    // Nếu resume → retry failed jobs trước
    if (name === "translate:resume") {
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
    await poll();
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

// ================================================
// BTXT WORKFLOW
// ================================================

async function runWorkflowStep(step) {
  if (wfRunningStep) return; // đang có step khác chạy
  setWfStepState(step.id, "running", "");
  wfRunningStep = step.id;
  setWfButtonsDisabled(true);

  // Gọi script qua backend
  try {
    const res = await fetch(RUN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: step.script }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Không thể chạy " + step.script);

    // Bắt đầu poll log của step này
    pollWfStepLog(step, data.run?.id ?? null);
  } catch (err) {
    setWfStepState(step.id, "error", "[Lỗi khởi động] " + err.message);
    wfRunningStep = null;
    setWfButtonsDisabled(false);
  }
}

function pollWfStepLog(step, runId) {
  if (wfPollTimer) clearInterval(wfPollTimer);
  wfPollTimer = setInterval(async () => {
    const progress = await fetchJson(PROGRESS_URL + (runId ? `?runId=${runId}` : ""));
    if (!progress) return;

    const run = progress.currentRun;
    const logText = run?.logTail ?? "";

    // Cập nhật log trực tiếp vào ô log của step
    const logEl = el(step.logId);
    if (logEl) {
      logEl.classList.remove("hidden", "wf-log-error");
      logEl.textContent = logText || "Đang chạy...";
      // Auto-scroll
      const atBottom = logEl.scrollHeight - logEl.scrollTop <= logEl.clientHeight + 40;
      if (atBottom) logEl.scrollTop = logEl.scrollHeight;
    }

    const isRunning = progress.hasRunningRun;
    if (!isRunning && run) {
      // Task xong
      clearInterval(wfPollTimer);
      wfPollTimer = null;
      wfRunningStep = null;

      const isOk = run.status === "success";
      const friendly = isOk ? null : friendlyErrorMessage(logText);
      setWfStepState(step.id, isOk ? "ok" : "error", friendly || logText);
      setWfButtonsDisabled(false);

      // Cập nhật badge text
      const badge = el(step.badgeId);
      if (badge) badge.textContent = isOk ? "✓" : "✗";
    }
  }, 1500);
}

async function runAllSteps() {
  if (wfRunningStep) return;
  el("btn-wf-run").disabled = true;

  // Reset kết quả
  const resultEl = el("wf-result");
  resultEl.className = "wf-result hidden";
  for (const s of wfSteps) {
    setWfStepState(s.id, "idle", "");
    const badge = el(s.badgeId);
    if (badge) badge.textContent = ["1","2","3"][["a","b","c"].indexOf(s.id)];
    const logEl = el(s.logId);
    if (logEl) { logEl.textContent = ""; logEl.classList.add("hidden"); }
  }

  for (const step of wfSteps) {
    // Chạy từng step và chờ hoàn tất
    const ok = await runWorkflowStepSync(step);
    if (!ok) {
      resultEl.className = "wf-result wf-failed";
      resultEl.classList.remove("hidden");
      resultEl.textContent = `✗ Dừng tại bước "${step.script}" — xem log bên dưới để biết lỗi.`;
      el("btn-wf-run").disabled = false;
      return;
    }
  }

  resultEl.className = "wf-result wf-success";
  resultEl.classList.remove("hidden");
  resultEl.textContent = "✓ Hoàn tất cả 3 bước! BTXT đã được kiểm tra kích thước, build và copy vào game. Mở game để kiểm tra.";
  el("btn-wf-run").disabled = false;
}

// Chạy 1 step và trả về Promise<boolean> (true = success)
function runWorkflowStepSync(step) {
  return new Promise(async (resolve) => {
    setWfStepState(step.id, "running", "");
    wfRunningStep = step.id;
    setWfButtonsDisabled(true);

    try {
      const res = await fetch(RUN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: step.script }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể chạy " + step.script);

      const runId = data.run?.id ?? null;

      // Poll đến khi xong
      const timer = setInterval(async () => {
        const progress = await fetchJson(PROGRESS_URL + (runId ? `?runId=${runId}` : ""));
        if (!progress) return;

        const run = progress.currentRun;
        const logText = run?.logTail ?? "";

        const logEl = el(step.logId);
        if (logEl) {
          logEl.classList.remove("hidden", "wf-log-error");
          logEl.textContent = logText || "Đang chạy...";
          const atBottom = logEl.scrollHeight - logEl.scrollTop <= logEl.clientHeight + 40;
          if (atBottom) logEl.scrollTop = logEl.scrollHeight;
        }

        if (!progress.hasRunningRun && run) {
          clearInterval(timer);
          wfRunningStep = null;
          setWfButtonsDisabled(false);

          const isOk = run.status === "success";
          setWfStepState(step.id, isOk ? "ok" : "error", logText);
          const badge = el(step.badgeId);
          if (badge) badge.textContent = isOk ? "✓" : "✗";
          resolve(isOk);
        }
      }, 1500);

    } catch (err) {
      setWfStepState(step.id, "error", "[Lỗi] " + err.message);
      wfRunningStep = null;
      setWfButtonsDisabled(false);
      resolve(false);
    }
  });
}

function setWfStepState(id, state, logText) {
  wfState[id] = state;
  const step = wfSteps.find(s => s.id === id);
  if (!step) return;

  const badge = el(step.badgeId);
  const stepEl = el(step.stepElId);

  if (badge) badge.setAttribute("data-state", state);
  if (stepEl) {
    stepEl.classList.remove("wf-running", "wf-ok", "wf-error");
    if (state === "running") stepEl.classList.add("wf-running");
    else if (state === "ok") stepEl.classList.add("wf-ok");
    else if (state === "error") stepEl.classList.add("wf-error");
  }

  if (state === "running") {
    // Bắt đầu spin badge
    if (badge) badge.textContent = "⟳";
    const logEl = el(step.logId);
    if (logEl) { logEl.classList.remove("hidden", "wf-log-error"); logEl.textContent = "Đang chạy..."; }
  } else if (state === "error") {
    const logEl = el(step.logId);
    if (logEl && logText) { logEl.classList.remove("hidden"); logEl.classList.add("wf-log-error"); logEl.textContent = logText; }
  }
}

function setWfButtonsDisabled(disabled) {
  for (const s of wfSteps) {
    const btn = el(s.btnId);
    if (btn) btn.disabled = disabled;
  }
}

// === HELPER ===

// Chuyển lỗi kỹ thuật thành thông báo tiếng Việt rõ ràng
function friendlyErrorMessage(logText) {
  if (!logText) return null;
  const t = logText.toLowerCase();

  if (t.includes("game appears to be running") || t.includes("close the game")) {
    return [
      "\u26a0\ufe0f Game đang mở (StateOfDecay.exe đang chạy).",
      "",
      "\u2192 Tắt game trước, sau đó bam lại nút Copy.",
      "",
      logText,
    ].join("\n");
  }

  if (t.includes("missing built btxt") || t.includes("no such file") && t.includes(".btxt")) {
    return [
      "\u26a0\ufe0f Chưa có file BTXT output.",
      "",
      "\u2192 Chạy bước 2 (Build BTXT) trước khi copy.",
      "",
      logText,
    ].join("\n");
  }

  if (t.includes("game languages folder not found")) {
    return [
      "\u26a0\ufe0f Không tìm thấy thư mục game.",
      "",
      "\u2192 Kiểm tra biến SOD_GAME_ROOT trong .env, hoặc thư mục game chưa tồn tại.",
      "",
      logText,
    ].join("\n");
  }

  return null; // không nhận ra → hiển log gốc
}
async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    return res.ok ? res.json() : null;
  } catch {
    return null;
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
