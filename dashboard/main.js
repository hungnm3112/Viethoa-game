const reportUrl = "/output/reports/translation-dashboard.json";
const scriptsUrl = "/api/scripts";
const runsUrl = "/api/runs";
const runScriptUrl = "/api/run-script";
const stopRunUrl = "/api/stop-run";
const dashboardRefreshUrl = "/api/dashboard/refresh";
const progressUrl = "/api/progress";
const jobsUrl = {
  pending: "/jobs/pending.json",
  done: "/jobs/done.json",
  failed: "/jobs/failed.json",
};
const phaseConfigUrl = "/config/translation-phases.json";

let selectedRunId = null;
let activeProgressRunId = null;
let progressPollTimer = null;
let progressModal = null;
let runsCache = [];
let scriptSectionsCache = [];
let latestDashboardData = null;
let latestProjectStatus = null;
let latestProgressSnapshot = null;
let phaseConfig = {};
let isStoppingRun = false;

const queueMetricDetails = {
  pendingJobs:
    "Số công việc dịch đã được tạo nhưng chưa chạy. Khi con số này lớn hơn 0, hệ thống vẫn còn nội dung có thể tiếp tục dịch mà không cần quét lại từ đầu.",
  doneJobs:
    "Số công việc đã hoàn tất và đã ghi kết quả vào output hiện tại. Đây là tiến độ thực của queue, khác với số chuỗi tổng thể vì một job có thể chứa nhiều chuỗi.",
  failedJobs:
    "Số công việc đã chạy nhưng lỗi giữa chừng. Những mục này cần xem log để quyết định có nên chạy lại, fallback model, hay rollback output.",
  processedJobs:
    "Tổng số công việc mà phiên hiện tại đã đi qua, bao gồm cả thành công lẫn lỗi. Chỉ số này giúp biết pipeline đã di chuyển tới đâu.",
  fallbackCount:
    "Số lần hệ thống phải chuyển sang model Gemini dự phòng khi model chính bị quá tải, lỗi quota hoặc không trả kết quả hợp lệ.",
  rollbackCount:
    "Số lần output bị khôi phục về trạng thái an toàn trước đó để tránh giữ lại file lỗi hoặc kết quả nửa chừng.",
};

document.getElementById("refreshBtn").addEventListener("click", async () => {
  await refreshAllData(true);
  showRunBanner("Đã làm mới dashboard và đọc lại trạng thái queue hiện tại.", "info");
});

document.getElementById("runWorkflowBtn").addEventListener("click", () => {
  const section = document.getElementById("actionCenter");
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
  section?.classList.remove("section-pulse");
  window.setTimeout(() => section?.classList.add("section-pulse"), 20);
  window.setTimeout(() => section?.classList.remove("section-pulse"), 1400);
  showRunBanner("Đã chuyển tới Trung tâm hành động. Bạn có thể chọn phase phù hợp rồi bấm Chạy hoặc dùng nút Tiếp tục nếu queue còn dang dở.", "info");
});

document.getElementById("openProgressModalBtn").addEventListener("click", () => {
  const run = getCurrentRun();
  if (!run) return;
  openProgressModal(run.id, run);
});

document.getElementById("stopRunBtn").addEventListener("click", async () => {
  await stopCurrentRun();
});

document.getElementById("progressModalStopBtn").addEventListener("click", async () => {
  await stopCurrentRun(activeProgressRunId);
});

document.getElementById("resumeRunBtn").addEventListener("click", async () => {
  const scriptName = latestProjectStatus?.resume?.recommendedScript;
  if (!scriptName) {
    showRunBanner("Hiện chưa có script phù hợp để tiếp tục. Hãy nhìn phần phase hoặc tạo queue mới cho phạm vi bạn muốn dịch.", "info");
    return;
  }
  await handleRunButton(scriptName);
});

document.getElementById("openPendingFilesBtn").addEventListener("click", () => {
  document.getElementById("pendingFilesList")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

initProgressModal();
await bootstrapDashboard();
window.setInterval(pollLiveData, 5000);

async function bootstrapDashboard() {
  await Promise.all([loadPhaseConfig(), loadScripts()]);
  await refreshAllData(true);
}

async function pollLiveData() {
  try {
    await refreshAllData(false);
  } catch (error) {
    console.error("Không thể tự làm mới dashboard", error);
  }
}

async function refreshAllData(forceRegenerate = true) {
  await refreshDashboardData(forceRegenerate);
  await Promise.all([loadRuns(), loadProjectStatus(), loadProgressSnapshot()]);
}

async function loadPhaseConfig() {
  try {
    const response = await fetch(`${phaseConfigUrl}?t=${Date.now()}`);
    phaseConfig = await response.json();
  } catch (error) {
    console.error("Không thể đọc cấu hình phase", error);
    phaseConfig = {};
  }
}

async function refreshDashboardData(forceRegenerate = true) {
  if (forceRegenerate) {
    await fetch(dashboardRefreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "all" }),
    });
  }

  const response = await fetch(`${reportUrl}?t=${Date.now()}`);
  latestDashboardData = await response.json();
  renderDashboard(latestDashboardData);
}

async function loadProjectStatus() {
  const [pendingJobs, doneJobs, failedJobs] = await Promise.all([
    fetchJson(jobsUrl.pending, []),
    fetchJson(jobsUrl.done, []),
    fetchJson(jobsUrl.failed, []),
  ]);

  latestProjectStatus = buildProjectStatus({
    dashboard: latestDashboardData,
    pendingJobs,
    doneJobs,
    failedJobs,
    phaseConfig,
  });

  renderProjectStatus(latestProjectStatus);
  syncRunButtons();
}

async function loadProgressSnapshot(runId = "") {
  const url = runId ? `${progressUrl}?runId=${encodeURIComponent(runId)}&t=${Date.now()}` : `${progressUrl}?t=${Date.now()}`;
  const response = await fetch(url);
  latestProgressSnapshot = await response.json();
  applyProgressSnapshot(latestProgressSnapshot);
}

function renderDashboard(data) {
  document.getElementById("generatedAt").textContent = `Cập nhật: ${formatDate(data.generatedAt)}`;
  document.getElementById("sessionStatus").textContent = translateStatus(data.session.status);
  document.getElementById("sessionScope").textContent = data.session.scope;
  document.getElementById("sessionMeta").innerHTML = [
    `Mã phiên: ${escapeHtml(data.session.id)}`,
    `Model đang dùng: ${escapeHtml(data.session.activeModel ?? "-")}`,
    `Bắt đầu: ${escapeHtml(formatDate(data.session.startedAt))}`,
    `Cập nhật: ${escapeHtml(formatDate(data.session.updatedAt))}`,
  ]
    .map((line) => `<div>${line}</div>`)
    .join("");

  document.getElementById("coveragePercent").textContent = `${data.coverage.percent}%`;
  document.getElementById("coverageMeta").textContent = `${data.coverage.translatedStrings}/${data.coverage.totalStrings} chuỗi đã dịch`;
  document.getElementById("coverageBar").style.width = `${Math.min(100, data.coverage.percent)}%`;

  document.getElementById("queueStats").innerHTML = [
    ["Công việc chờ", data.queue.pendingJobs, "pendingJobs"],
    ["Công việc xong", data.queue.doneJobs, "doneJobs"],
    ["Công việc lỗi", data.queue.failedJobs, "failedJobs"],
    ["Đã xử lý", data.session.processedJobs, "processedJobs"],
    ["Lần fallback", data.session.fallbackCount, "fallbackCount"],
    ["Lần rollback", data.session.rollbackCount, "rollbackCount"],
  ]
    .map(
      ([label, value, key]) => `
        <article class="queue-stat-card" data-bs-toggle="tooltip" title="${escapeHtmlAttr(queueMetricDetails[key])}">
          <div class="queue-stat-top">
            <span class="queue-stat-label">${label}</span>
            <strong class="queue-stat-value">${value}</strong>
          </div>
          <div class="queue-stat-description">${escapeHtml(queueMetricDetails[key])}</div>
        </article>`,
    )
    .join("");

  document.getElementById("notes").innerHTML = (data.notes?.length ? data.notes : ["-"])
    .map((note) => `<div>${escapeHtml(note)}</div>`)
    .join("");

  document.getElementById("filesBody").innerHTML = data.files
    .map(
      (file) => `
        <tr>
          <td><span data-bs-toggle="tooltip" title="${escapeHtmlAttr(file.outputFile)}">${escapeHtml(file.file)}</span></td>
          <td>${file.translated}</td>
          <td>${file.total}</td>
          <td>${file.percent}%</td>
        </tr>`,
    )
    .join("");

  document.getElementById("events").innerHTML = (data.recentEvents?.length
    ? data.recentEvents
    : [{ type: "none", at: "-", message: "Chưa có sự kiện" }])
    .map(
      (event) => `
        <div class="event">
          <div class="type">${escapeHtml(event.type)}</div>
          <div>${escapeHtml(formatDate(event.at || event.storedAt))}</div>
          <div>${escapeHtml(summarizeEvent(event))}</div>
        </div>`,
    )
    .join("");

  renderCurrentRunOverview(getCurrentRun());
  activateTooltips();
}

function renderProjectStatus(status) {
  if (!status) return;

  document.getElementById("overallTranslatedStrings").textContent = `${status.overall.translatedStrings}/${status.overall.totalStrings}`;
  document.getElementById("overallRemainingStrings").textContent = String(status.overall.remainingStrings);
  document.getElementById("overallCompletedFiles").textContent = `${status.overall.completedFiles}/${status.overall.totalFiles}`;
  document.getElementById("overallUnfinishedFiles").textContent = String(status.overall.unfinishedFiles);

  const resume = status.resume;
  document.getElementById("resumeStateTitle").textContent = resume.title;
  document.getElementById("resumeStateDescription").textContent = resume.description;
  document.getElementById("resumePendingJobs").textContent = String(resume.pendingJobs);
  document.getElementById("resumeFailedJobs").textContent = String(resume.failedJobs);
  document.getElementById("resumePendingFiles").textContent = String(resume.pendingFilesCount);
  document.getElementById("resumeRecommendedScript").textContent = resume.recommendedLabel || "-";
  document.getElementById("resumeRunBtn").disabled = !resume.canResume || Boolean(getRunningRun()) || isStoppingRun;

  document.getElementById("resumePhaseBadgeRow").innerHTML = [
    resume.scope ? `Phạm vi phiên: ${resume.scope}` : null,
    resume.currentPhase ? `Phase hiện tại: ${resume.currentPhase.id} (${resume.currentPhase.translatedStrings}/${resume.currentPhase.totalStrings} chuỗi)` : null,
    resume.pendingGroups?.length ? `Nhóm job: ${resume.pendingGroups.join(", ")}` : null,
  ]
    .filter(Boolean)
    .map((label) => `<span class="status-chip">${escapeHtml(label)}</span>`)
    .join("");

  document.getElementById("pendingFilesList").innerHTML = status.topPendingFiles.length
    ? status.topPendingFiles
        .map(
          (file) => `
            <article class="pending-file-card">
              <div class="d-flex justify-content-between gap-2 mb-2">
                <strong>${escapeHtml(shortFile(file.file))}</strong>
                <span class="pill">${file.percent}%</span>
              </div>
              <div class="small text-secondary mb-2">${escapeHtml(file.file)}</div>
              <div class="mini-progress mb-2"><span style="width:${clampPercent(file.percent)}%"></span></div>
              <div class="small text-secondary">Đã dịch ${file.translated}/${file.total} chuỗi • Còn lại ${file.remaining} chuỗi</div>
            </article>`,
        )
        .join("")
    : `<div class="pending-file-card">Không còn file dang dở nào trong báo cáo hiện tại.</div>`;

  document.getElementById("phaseProgressList").innerHTML = status.phaseStatus.length
    ? status.phaseStatus
        .map(
          (phase) => `
            <article class="phase-progress-card">
              <div class="d-flex justify-content-between gap-2 mb-2">
                <strong>${escapeHtml(phase.id)}</strong>
                <span class="pill">${phase.percent}%</span>
              </div>
              <div class="small text-secondary mb-2">${escapeHtml(phase.description || "Chưa có mô tả")}</div>
              <div class="mini-progress mb-2"><span style="width:${clampPercent(phase.percent)}%"></span></div>
              <div class="small text-secondary mb-1">Chuỗi: ${phase.translatedStrings}/${phase.totalStrings} • Còn ${phase.remainingStrings}</div>
              <div class="small text-secondary mb-2">Queue: chờ ${phase.pendingJobs} • xong ${phase.doneJobs} • lỗi ${phase.failedJobs}</div>
              <div class="badge-row">
                ${phase.recommendedLabel ? `<span class="status-chip">Nút nên chạy: ${escapeHtml(phase.recommendedLabel)}</span>` : ""}
              </div>
            </article>`,
        )
        .join("")
    : `<div class="phase-progress-card">Chưa có dữ liệu phase.</div>`;

  if (scriptSectionsCache.length > 0) {
    renderScriptSections();
  }
  renderCurrentRunOverview(getCurrentRun());
  activateTooltips();
}

async function loadScripts() {
  const response = await fetch(`${scriptsUrl}?t=${Date.now()}`);
  const data = await response.json();
  scriptSectionsCache = data.sections ?? [];
  renderScriptSections();
}

function renderScriptSections() {
  const recommendedScript = latestProjectStatus?.resume?.recommendedScript ?? null;

  document.getElementById("scriptSections").innerHTML = scriptSectionsCache
    .map(
      (section) => `
        <section class="section-block">
          <div class="section-header">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2">
              <div>
                <h3 class="h5 mb-1">${escapeHtml(section.title)}</h3>
                <div class="section-description">${escapeHtml(section.description ?? "")}</div>
              </div>
              <span class="coverage-badge"><i class="fa-solid fa-layer-group"></i>${section.actions.length} hành động</span>
            </div>
          </div>
          <div class="p-3 pt-2">
            <div class="row g-3">
              ${(section.actions ?? [])
                .map((script) => {
                  const isRecommended = script.name === recommendedScript;
                  return `
                    <div class="col-12 col-md-6 col-xxl-4">
                      <div class="script-card card border-0 ${isRecommended ? "is-recommended" : ""}" data-script-card="${escapeHtmlAttr(script.name)}">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-start gap-2">
                            <h3>
                              ${escapeHtml(script.label)}
                              <i class="fa-solid fa-circle-info text-secondary ms-1"
                                data-bs-toggle="tooltip"
                                title="${escapeHtmlAttr(script.summary ?? "")}"></i>
                            </h3>
                            <span class="pill" data-bs-toggle="tooltip" title="Lệnh npm thực tế đang được gọi">
                              <i class="fa-solid fa-terminal"></i>npm run
                            </span>
                          </div>
                          <div class="small text-secondary">${escapeHtml(script.summary ?? "")}</div>
                          <div class="coverage-badge" data-bs-toggle="tooltip" title="Phạm vi nội dung được xử lý khi bấm nút này">
                            <i class="fa-solid fa-crosshairs"></i>${escapeHtml(script.coverage ?? "")}
                          </div>
                          ${
                            isRecommended
                              ? `<div class="status-chip"><i class="fa-solid fa-arrow-right"></i>Đây là nút phù hợp nhất để tiếp tục queue hiện tại</div>`
                              : ""
                          }
                          <code>${escapeHtml(script.name)} -> ${escapeHtml(script.command)}</code>
                          <div class="d-flex gap-2 align-items-center mt-auto">
                            <button
                              class="btn btn-warning text-dark fw-semibold"
                              data-script="${escapeHtmlAttr(script.name)}"
                              data-bs-toggle="tooltip"
                              title="Bắt đầu chạy hành động này"
                            >
                              <i class="fa-solid fa-play me-2"></i>Chạy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>`;
                })
                .join("")}
            </div>
          </div>
        </section>`,
    )
    .join("");

  for (const button of document.querySelectorAll("[data-script]")) {
    button.addEventListener("click", async () => {
      const scriptName = button.getAttribute("data-script");
      if (!scriptName) return;
      await handleRunButton(scriptName);
    });
  }

  activateTooltips();
  syncRunButtons();
}

async function handleRunButton(scriptName) {
  const runningRun = getRunningRun();
  if (runningRun) {
    showRunBanner(`Đang có task "${runningRun.label || runningRun.script}" chạy. Hãy đợi xong hoặc bấm Stop nếu muốn dừng trước khi mở task mới.`);
    syncRunButtons();
    return;
  }

  try {
    showPendingProgress(scriptName);
    const run = await runScript(scriptName);
    showRunBanner(`Đã khởi chạy "${run?.label || scriptName}". Dashboard sẽ cập nhật log và tiến độ realtime.`);
  } catch (error) {
    console.error(`Không thể chạy ${scriptName}`, error);
    if (progressModal) {
      renderProgressModal({
        id: "-",
        label: findScriptLabel(scriptName),
        script: scriptName,
        status: "failed",
        coverage: findScriptCoverage(scriptName),
        summary: "Khởi chạy thất bại",
        progress: {
          percent: 100,
          currentStep: "Không thể bắt đầu tác vụ",
          totalSteps: 1,
          completedSteps: [],
          detail: error?.payload?.error || error.message || `Không thể chạy ${scriptName}.`,
        },
        logTail: error?.payload?.error || error.message || `Không thể chạy ${scriptName}.`,
      });
    }
    showRunBanner(error?.payload?.error || error.message || `Không thể chạy ${scriptName}.`);
  }
}

async function runScript(name) {
  const response = await fetch(runScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error || `Không thể chạy script ${name}`);
    error.code = response.status;
    error.payload = data;
    throw error;
  }

  await refreshAllData(true);
  if (data?.run?.id) {
    await loadProgressSnapshot(data.run.id);
  }
  renderScriptSections();

  if (data?.run?.id) {
    openProgressModal(data.run.id, data.run);
  }

  return data?.run ?? null;
}

async function stopCurrentRun(runId = null) {
  const runningRun = runId ? runsCache.find((run) => run.id === runId) : getRunningRun();
  if (!runningRun || isStoppingRun) return;

  isStoppingRun = true;
  syncRunButtons();

  try {
    const response = await fetch(stopRunUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: runningRun.id }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error || "Không thể dừng tác vụ hiện tại.");
    }
    showRunBanner(`Đã gửi yêu cầu dừng task "${runningRun.label || runningRun.script}".`);
    await refreshAllData(true);
  } catch (error) {
    console.error("Không thể stop task", error);
    showRunBanner(error.message || "Không thể dừng task hiện tại.");
  } finally {
    isStoppingRun = false;
    syncRunButtons();
  }
}

async function loadRuns() {
  const response = await fetch(`${runsUrl}?t=${Date.now()}`);
  const data = await response.json();
  runsCache = data.runs ?? [];

  renderRuns(runsCache);
  renderPhaseActivity(data.phaseActivity ?? []);
  syncProgressModal(runsCache);
  renderCurrentRunOverview(getCurrentRun());
  syncRunButtons();
  activateTooltips();
}

function renderRuns(runs) {
  const running = runs.filter((run) => run.status === "running").length;
  const success = runs.filter((run) => run.status === "success").length;
  const failed = runs.filter((run) => run.status === "failed").length;
  const stopped = runs.filter((run) => run.status === "stopped").length;

  document.getElementById("runSummary").innerHTML = `
    <div class="d-flex justify-content-between mb-2"><span><i class="fa-solid fa-spinner me-2 text-warning"></i>Đang chạy</span><strong>${running}</strong></div>
    <div class="d-flex justify-content-between mb-2"><span><i class="fa-solid fa-circle-check me-2 text-success"></i>Thành công</span><strong>${success}</strong></div>
    <div class="d-flex justify-content-between mb-2"><span><i class="fa-solid fa-circle-stop me-2 text-secondary"></i>Đã dừng</span><strong>${stopped}</strong></div>
    <div class="d-flex justify-content-between mb-2"><span><i class="fa-solid fa-circle-xmark me-2 text-danger"></i>Thất bại</span><strong>${failed}</strong></div>
    <div class="d-flex justify-content-between"><span><i class="fa-solid fa-list me-2 text-secondary"></i>Tổng lần chạy</span><strong>${runs.length}</strong></div>
  `;

  if (!selectedRunId && runs.length > 0) {
    selectedRunId = runs[0].id;
  }

  document.getElementById("runsList").innerHTML = runs.length
    ? runs
        .map(
          (run) => `
            <div class="run-card" data-run-id="${escapeHtmlAttr(run.id)}">
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h3>${escapeHtml(run.label || run.script)}</h3>
                <span class="pill ${escapeHtmlAttr(run.status)}">${statusIcon(run.status)}${escapeHtml(translateStatus(run.status))}</span>
              </div>
              <div class="text-secondary mb-1"><i class="fa-regular fa-clock me-2"></i>Bắt đầu: ${escapeHtml(formatDate(run.startedAt))}</div>
              <div class="text-secondary mb-1"><i class="fa-regular fa-flag me-2"></i>Kết thúc: ${escapeHtml(formatDate(run.finishedAt))}</div>
              <div class="text-secondary mb-1"><i class="fa-solid fa-crosshairs me-2"></i>${escapeHtml(run.coverage ?? "")}</div>
              <div class="text-secondary mb-1"><i class="fa-solid fa-list-check me-2"></i>${escapeHtml(progressTaskSummary(run.progress))}</div>
              <div class="text-secondary"><i class="fa-solid fa-hashtag me-2"></i>Mã thoát: ${escapeHtml(run.exitCode ?? "-")}</div>
            </div>`,
        )
        .join("")
    : `<div class="run-card">Chưa có lần chạy nào.</div>`;

  for (const card of document.querySelectorAll("[data-run-id]")) {
    card.addEventListener("click", () => {
      selectedRunId = card.getAttribute("data-run-id");
      highlightSelectedRun();
      const current = runs.find((item) => item.id === selectedRunId);
      document.getElementById("runLog").textContent = current?.logTail || "Không có log.";
    });
  }

  const current = runs.find((item) => item.id === selectedRunId) ?? runs[0];
  highlightSelectedRun();
  document.getElementById("runLog").textContent = current?.logTail || "Chọn một lệnh để xem log.";
}

function renderPhaseActivity(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.phase || "uncategorized";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const preferredOrder = ["foundation", "phase1", "phase2", "phase3", "fullrun", "builddeploy", "fontui", "diagnostics", "uncategorized"];
  const keys = [...groups.keys()].sort((a, b) => {
    const ai = preferredOrder.indexOf(a);
    const bi = preferredOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  document.getElementById("phaseActivity").innerHTML = keys.length
    ? keys
        .map((key) => {
          const logs = groups.get(key) ?? [];
          const title = logs[0]?.sectionTitle || key;
          return `
            <section class="phase-column">
              <h3>${escapeHtml(title)}</h3>
              <div class="phase-sub">${escapeHtml(key)}</div>
              <div class="phase-log-list">
                ${logs
                  .slice(0, 12)
                  .map(
                    (item) => `
                      <div class="phase-log-item">
                        <div class="d-flex justify-content-between gap-2 mb-1">
                          <strong>${escapeHtml(item.label || item.script)}</strong>
                          <span class="pill ${escapeHtmlAttr(item.status || "running")}">${escapeHtml(translateStatus(item.status || item.type))}</span>
                        </div>
                        <div class="small text-secondary mb-1">${escapeHtml(item.summary || "")}</div>
                        <div class="small text-secondary mb-1">${escapeHtml(item.coverage || "")}</div>
                        <div class="small">${escapeHtml(formatDate(item.at || item.storedAt))}</div>
                      </div>`,
                  )
                  .join("")}
              </div>
            </section>`;
        })
        .join("")
    : `<div class="text-secondary">Chưa có log hoạt động theo giai đoạn.</div>`;
}

function renderCurrentRunOverview(run) {
  const queue = latestProjectStatus?.queue ?? latestDashboardData?.queue ?? {};
  const coverage = latestProjectStatus?.overall
    ? {
        translatedStrings: latestProjectStatus.overall.translatedStrings,
        totalStrings: latestProjectStatus.overall.totalStrings,
      }
    : latestDashboardData?.coverage ?? {};
  const progress = run?.progress ?? {};
  const completedSteps = Array.isArray(progress.completedSteps) ? progress.completedSteps : [];
  const totalSteps = Number(progress.totalSteps ?? completedSteps.length ?? 0);
  const percent = run ? clampPercent(progress.percent ?? 0) : clampPercent(coverage.totalStrings ? (Number(coverage.translatedStrings ?? 0) / Number(coverage.totalStrings ?? 1)) * 100 : 0);

  document.getElementById("currentRunLabel").textContent = run ? (run.label || run.script) : "Chưa có task đang chạy";
  document.getElementById("currentRunStep").textContent = run ? (progress.currentStep || "Đang chờ cập nhật") : "Không có task chạy, hãy xem tiến độ tổng thể bên dưới";
  document.getElementById("currentRunTaskProgress").textContent = run
    ? `${completedSteps.length} / ${Math.max(totalSteps, completedSteps.length)} bước`
    : `${queue.doneJobs ?? 0} job đã xong`;
  document.getElementById("currentRunOverallProgress").textContent = `${coverage.translatedStrings ?? 0} / ${coverage.totalStrings ?? 0} chuỗi`;

  document.getElementById("currentRunPercent").textContent = `${percent}%`;
  document.getElementById("currentRunBar").style.width = `${percent}%`;
  document.getElementById("currentRunBar").textContent = `${percent}%`;
  document.getElementById("currentRunDoneInTask").textContent = String(run ? completedSteps.length : queue.doneJobs ?? 0);
  document.getElementById("currentRunDoneOverall").textContent = String(queue.doneJobs ?? 0);
  document.getElementById("currentRunPendingOverall").textContent = String(queue.pendingJobs ?? 0);
  document.getElementById("currentRunFailedOverall").textContent = String(queue.failedJobs ?? 0);

  document.getElementById("currentRunMeta").innerHTML = run
    ? [
        `Mã run: ${escapeHtml(run.id || "-")}`,
        `Script: ${escapeHtml(run.script || "-")}`,
        `Trạng thái: ${escapeHtml(translateStatus(run.status || "-"))}`,
        `Bắt đầu: ${escapeHtml(formatDate(run.startedAt))}`,
        `File log: ${escapeHtml(run.logPath || "-")}`,
        `Phạm vi: ${escapeHtml(run.coverage || "-")}`,
      ]
        .map((line) => `<div>${line}</div>`)
        .join("")
    : [
        `Tiến độ tổng thể: ${escapeHtml(`${coverage.translatedStrings ?? 0}/${coverage.totalStrings ?? 0} chuỗi`)}`,
        `Queue chờ: ${escapeHtml(String(queue.pendingJobs ?? 0))}`,
        `Job lỗi: ${escapeHtml(String(queue.failedJobs ?? 0))}`,
        `Gợi ý tiếp tục: ${escapeHtml(latestProjectStatus?.resume?.recommendedLabel || "-")}`,
      ]
        .map((line) => `<div>${line}</div>`)
        .join("");

  document.getElementById("currentRunTerminal").textContent = run?.logTail || buildIdleTerminalText();

  updateStopButtons(Boolean(getRunningRun()));
  if (run) {
    showRunBanner(
      run.status === "running"
        ? `Đang chạy "${run.label || run.script}" và các nút Chạy khác đang bị khóa để tránh xung đột.`
        : `Task gần nhất: "${run.label || run.script}" ở trạng thái ${translateStatus(run.status)}.`,
    );
  }
}

function applyProgressSnapshot(snapshot) {
  if (!snapshot) return;
  const currentRun = snapshot.currentRun ?? null;
  if (currentRun?.id) {
    const existingIndex = runsCache.findIndex((item) => item.id === currentRun.id);
    if (existingIndex >= 0) {
      runsCache[existingIndex] = currentRun;
    } else {
      runsCache = [currentRun, ...runsCache.filter((item) => item.id !== currentRun.id)];
    }
  }

  if (activeProgressRunId && currentRun && currentRun.id === activeProgressRunId) {
    renderProgressModal(currentRun);
  }

  renderCurrentRunOverview(getCurrentRun());
  syncRunButtons();
}

function buildIdleTerminalText() {
  if (!latestProjectStatus) return "Chưa có log realtime.";
  const lines = [
    `Tổng chuỗi đã dịch: ${latestProjectStatus.overall.translatedStrings}/${latestProjectStatus.overall.totalStrings}`,
    `Chuỗi còn lại: ${latestProjectStatus.overall.remainingStrings}`,
    `Queue pending: ${latestProjectStatus.queue.pendingJobs}`,
    `Queue failed: ${latestProjectStatus.queue.failedJobs}`,
    `Nút nên chạy tiếp: ${latestProjectStatus.resume.recommendedLabel || "-"}`,
  ];
  return lines.join("\n");
}

function showRunBanner(message, tone = "warning") {
  const banner = document.getElementById("runQueueBanner");
  banner.textContent = message;
  banner.classList.remove("d-none", "is-info");
  if (tone === "info") {
    banner.classList.add("is-info");
  }
}

function hideRunBanner() {
  document.getElementById("runQueueBanner").classList.add("d-none");
}

function syncRunButtons() {
  const runningRun = getRunningRun();
  const isBusy = Boolean(runningRun);
  const recommendedScript = latestProjectStatus?.resume?.recommendedScript ?? null;

  for (const button of document.querySelectorAll("[data-script]")) {
    const scriptName = button.getAttribute("data-script");
    const isCurrent = scriptName === runningRun?.script;
    button.disabled = isBusy || isStoppingRun;
    button.innerHTML = isCurrent
      ? `<i class="fa-solid fa-spinner me-2"></i>Đang chạy`
      : scriptName === recommendedScript
        ? `<i class="fa-solid fa-play me-2"></i>Chạy tiếp`
        : `<i class="fa-solid fa-play me-2"></i>Chạy`;
    button.closest("[data-script-card]")?.classList.toggle("is-running", isCurrent);
    button.closest("[data-script-card]")?.classList.toggle("is-recommended", scriptName === recommendedScript);
  }

  document.getElementById("runWorkflowBtn").disabled = false;
  updateStopButtons(isBusy);
}

function updateStopButtons(hasRunningTask) {
  const disabled = !hasRunningTask || isStoppingRun;
  const stopLabel = isStoppingRun
    ? `<i class="fa-solid fa-spinner me-2"></i>Đang dừng`
    : `<i class="fa-solid fa-stop me-2"></i>Stop`;

  document.getElementById("stopRunBtn").disabled = disabled;
  document.getElementById("progressModalStopBtn").disabled = disabled;
  document.getElementById("stopRunBtn").innerHTML = stopLabel;
  document.getElementById("progressModalStopBtn").innerHTML = stopLabel;
  document.getElementById("openProgressModalBtn").disabled = !getCurrentRun();
  document.getElementById("resumeRunBtn").disabled =
    !latestProjectStatus?.resume?.canResume || hasRunningTask || isStoppingRun;
}

function getRunningRun() {
  return latestProgressSnapshot?.currentRun?.status === "running"
    ? latestProgressSnapshot.currentRun
    : runsCache.find((run) => run.status === "running") ?? null;
}

function getCurrentRun() {
  return getRunningRun() || latestProgressSnapshot?.currentRun || runsCache[0] || null;
}

function progressTaskSummary(progress) {
  const completed = Array.isArray(progress?.completedSteps) ? progress.completedSteps.length : 0;
  const total = Number(progress?.totalSteps ?? completed);
  return `${completed}/${Math.max(total, completed)} bước • ${clampPercent(progress?.percent ?? 0)}%`;
}

function summarizeEvent(event) {
  return [
    event.jobId ? `job ${event.jobId}` : null,
    event.inputFile ?? null,
    event.model ? `model=${event.model}` : null,
    event.reason ?? null,
    event.error ?? null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function formatDate(value) {
  if (!value || value === "-") return "-";
  return new Date(value).toLocaleString("vi-VN");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function statusIcon(status) {
  if (status === "running") return `<i class="fa-solid fa-spinner me-1"></i>`;
  if (status === "success") return `<i class="fa-solid fa-check me-1"></i>`;
  if (status === "failed") return `<i class="fa-solid fa-xmark me-1"></i>`;
  if (status === "stopped") return `<i class="fa-solid fa-stop me-1"></i>`;
  return `<i class="fa-regular fa-circle me-1"></i>`;
}

function translateStatus(status) {
  const map = {
    running: "đang chạy",
    success: "thành công",
    failed: "thất bại",
    queued: "đang chờ",
    paused: "tạm dừng",
    completed: "hoàn tất",
    stopped: "đã dừng",
    idle: "nhàn rỗi",
  };
  return map[status] || status;
}

function highlightSelectedRun() {
  for (const card of document.querySelectorAll("[data-run-id]")) {
    card.classList.toggle("active", card.getAttribute("data-run-id") === selectedRunId);
  }
}

function activateTooltips() {
  if (!window.bootstrap?.Tooltip) return;
  for (const element of document.querySelectorAll('[data-bs-toggle="tooltip"]')) {
    if (window.bootstrap.Tooltip.getInstance(element)) continue;
    new window.bootstrap.Tooltip(element);
  }
}

function initProgressModal() {
  const modalElement = document.getElementById("progressModal");
  if (!modalElement || !window.bootstrap?.Modal) return;
  progressModal = new window.bootstrap.Modal(modalElement);
  modalElement.addEventListener("hidden.bs.modal", () => {
    activeProgressRunId = null;
    stopProgressPolling();
  });
}

function openProgressModal(runId, initialRun) {
  activeProgressRunId = runId;
  progressModal?.show();
  renderProgressModal(initialRun ?? null);
  startProgressPolling();
}

function showPendingProgress(scriptName) {
  const label = findScriptLabel(scriptName);
  const coverage = findScriptCoverage(scriptName);
  const now = new Date().toISOString();
  const pendingRun = {
    id: "dang-khoi-dong",
    label,
    script: scriptName,
    status: "running",
    startedAt: now,
    coverage,
    summary: "Đang gửi yêu cầu khởi chạy",
    progress: {
      percent: 3,
      currentStep: "Đang gửi yêu cầu tới server...",
      totalSteps: 4,
      completedSteps: ["Đã nhận thao tác click từ giao diện"],
      detail: `UI đã nhận lệnh "${label}" và đang chờ server local khởi tạo tiến trình thực tế.`,
    },
    logTail: [
      `[ui] Đã bấm nút chạy cho script: ${scriptName}`,
      `[ui] Đang gửi yêu cầu khởi chạy tới server local...`,
      `[ui] Khi server phản hồi, popup này sẽ chuyển sang log realtime của tiến trình thật.`,
    ].join("\n"),
  };

  activeProgressRunId = null;
  renderProgressModal(pendingRun);
  progressModal?.show();
  document.getElementById("currentRunTerminal").textContent = pendingRun.logTail;
  showRunBanner(`Đang khởi tạo tác vụ "${label}"...`);
}

function startProgressPolling() {
  stopProgressPolling();
  progressPollTimer = window.setInterval(async () => {
    if (!activeProgressRunId) return;
    try {
      await loadProgressSnapshot(activeProgressRunId);
      await loadRuns();
      await loadProjectStatus();
    } catch (error) {
      console.error("Không thể cập nhật popup tiến trình", error);
    }
  }, 5000);
}

function stopProgressPolling() {
  if (progressPollTimer) {
    clearInterval(progressPollTimer);
    progressPollTimer = null;
  }
}

function syncProgressModal(runs) {
  if (!activeProgressRunId) return;
  const run = runs.find((item) => item.id === activeProgressRunId);
  if (!run) return;
  renderProgressModal(run);
  if (run.status !== "running") {
    stopProgressPolling();
  }
}

function renderProgressModal(run) {
  const title = document.getElementById("progressModalTitle");
  const subtitle = document.getElementById("progressModalSubtitle");
  const currentStep = document.getElementById("progressCurrentStep");
  const percentLabel = document.getElementById("progressPercentLabel");
  const percentBar = document.getElementById("progressModalBar");
  const runId = document.getElementById("progressRunId");
  const scriptName = document.getElementById("progressScriptName");
  const coverage = document.getElementById("progressCoverage");
  const completedSteps = document.getElementById("progressCompletedSteps");
  const logElement = document.getElementById("progressModalLog");

  if (!run) {
    title.textContent = "Đang chuẩn bị chạy lệnh";
    subtitle.textContent = "Hệ thống đang chờ dữ liệu tiến trình đầu tiên.";
    currentStep.textContent = "Đang khởi động...";
    percentLabel.textContent = "0%";
    percentBar.style.width = "0%";
    percentBar.textContent = "0%";
    runId.textContent = "-";
    scriptName.textContent = "-";
    coverage.textContent = "-";
    completedSteps.innerHTML = `<div class="text-secondary">Chưa có bước hoàn thành nào.</div>`;
    logElement.textContent = "Chưa có log.";
    updateStopButtons(Boolean(getRunningRun()));
    return;
  }

  const progress = run.progress ?? {};
  const percent = clampPercent(progress.percent ?? 0);
  const completed = Array.isArray(progress.completedSteps) ? progress.completedSteps : [];
  const totalSteps = Number(progress.totalSteps ?? completed.length);

  title.textContent = run.label || run.script;
  subtitle.textContent = `${progress.detail || run.summary || run.coverage || "Đang xử lý tác vụ được chọn."} • ${completed.length}/${Math.max(totalSteps, completed.length)} bước`;
  currentStep.textContent = progress.currentStep || "Đang xử lý...";
  percentLabel.textContent = `${percent}%`;
  percentBar.style.width = `${percent}%`;
  percentBar.textContent = `${percent}%`;
  percentBar.setAttribute("aria-valuenow", String(percent));
  runId.textContent = run.id || "-";
  scriptName.textContent = `${run.script || "-"} • ${translateStatus(run.status || "")}`;
  coverage.textContent = run.coverage || "-";
  completedSteps.innerHTML = completed.length
    ? completed
        .map(
          (item) => `
            <div class="progress-step-item">
              <i class="fa-solid fa-circle-check"></i>
              <div class="progress-step-text">${escapeHtml(item)}</div>
            </div>`,
        )
        .join("")
    : `<div class="text-secondary">Chưa có bước hoàn thành nào.</div>`;
  logElement.textContent = run.logTail || "Chưa có log.";
  updateStopButtons(Boolean(getRunningRun()));
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function shortFile(filePath) {
  const normalized = String(filePath ?? "").replaceAll("\\", "/");
  const parts = normalized.split("/");
  return parts.slice(-3).join("/");
}

async function fetchJson(url, fallback) {
  try {
    const response = await fetch(`${url}?t=${Date.now()}`);
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

function buildProjectStatus({ dashboard, pendingJobs, doneJobs, failedJobs, phaseConfig: phases }) {
  const files = (dashboard?.files ?? []).filter((file) => Number(file.total ?? 0) > 0);
  const coverage = dashboard?.coverage ?? { translatedStrings: 0, totalStrings: 0, percent: 0 };
  const translatedStrings = Number(coverage.translatedStrings ?? 0);
  const totalStrings = Number(coverage.totalStrings ?? 0);
  const completedFiles = files.filter((file) => Number(file.translated ?? 0) >= Number(file.total ?? 0)).length;
  const partialFiles = files.filter((file) => Number(file.translated ?? 0) > 0 && Number(file.translated ?? 0) < Number(file.total ?? 0)).length;
  const untouchedFiles = files.filter((file) => Number(file.translated ?? 0) === 0).length;
  const phaseStatus = Object.entries(phases ?? {}).map(([id, phase]) => summarizePhase(id, phase, files, pendingJobs, doneJobs, failedJobs));
  const resume = buildResumeState(dashboard?.session ?? {}, pendingJobs, failedJobs, phaseStatus);

  return {
    overall: {
      translatedStrings,
      totalStrings,
      remainingStrings: Math.max(0, totalStrings - translatedStrings),
      percent: Number(coverage.percent ?? 0),
      totalFiles: files.length,
      completedFiles,
      partialFiles,
      untouchedFiles,
      unfinishedFiles: files.length - completedFiles,
    },
    queue: {
      pendingJobs: pendingJobs.length,
      doneJobs: doneJobs.length,
      failedJobs: failedJobs.length,
    },
    phaseStatus,
    resume,
    topPendingFiles: files
      .filter((file) => Number(file.translated ?? 0) < Number(file.total ?? 0))
      .map((file) => ({
        file: file.file,
        translated: Number(file.translated ?? 0),
        total: Number(file.total ?? 0),
        remaining: Math.max(0, Number(file.total ?? 0) - Number(file.translated ?? 0)),
        percent: Number(file.percent ?? 0),
      }))
      .sort((a, b) => b.remaining - a.remaining || a.file.localeCompare(b.file))
      .slice(0, 8),
  };
}

function summarizePhase(id, phase, files, pendingJobs, doneJobs, failedJobs) {
  const matchers = Array.isArray(phase?.match) ? phase.match : [];
  const matchedFiles = files.filter((file) => matchers.some((matcher) => file.file.includes(matcher)));
  const translatedStrings = matchedFiles.reduce((sum, file) => sum + Number(file.translated ?? 0), 0);
  const totalStrings = matchedFiles.reduce((sum, file) => sum + Number(file.total ?? 0), 0);
  const remainingStrings = Math.max(0, totalStrings - translatedStrings);
  const percent = totalStrings === 0 ? 0 : Number(((translatedStrings / totalStrings) * 100).toFixed(2));
  const recommendedScript = recommendedScriptForPhase(id);

  return {
    id,
    description: String(phase?.description ?? ""),
    translatedStrings,
    totalStrings,
    remainingStrings,
    percent,
    pendingJobs: pendingJobs.filter((job) => matchers.some((matcher) => String(job.inputFile ?? "").includes(matcher))).length,
    doneJobs: doneJobs.filter((job) => matchers.some((matcher) => String(job.inputFile ?? "").includes(matcher))).length,
    failedJobs: failedJobs.filter((job) => matchers.some((matcher) => String(job.inputFile ?? "").includes(matcher))).length,
    recommendedScript,
    recommendedLabel: recommendedScript ? findScriptLabel(recommendedScript) : null,
  };
}

function buildResumeState(session, pendingJobs, failedJobs, phaseStatus) {
  const scope = String(session?.scope ?? "all");
  const recommendedScript = resolveResumeScript(scope, pendingJobs, phaseStatus);
  const pendingFiles = [...new Set(pendingJobs.map((job) => String(job.inputFile ?? "").trim()).filter(Boolean))];
  const pendingGroups = [...new Set(pendingJobs.map((job) => String(job.group ?? "").trim()).filter(Boolean))];
  const currentPhase = phaseStatus.find((phase) => phase.id === scope.replace(/^profile:/, "")) ?? null;
  const canResume = pendingJobs.length > 0 && Boolean(recommendedScript);

  let title = "Chưa có tiến trình dở dang";
  let description =
    "Hiện không có queue pending nào để chạy tiếp. Nếu project vẫn còn nhiều chuỗi chưa dịch, hãy tạo queue cho phase bạn muốn rồi mới bắt đầu chạy dịch.";
  if (canResume) {
    title = "Có thể tiếp tục ngay";
    description = `Queue hiện còn ${pendingJobs.length} công việc chờ. Bạn có thể bấm Tiếp tục để đi tiếp đúng script phù hợp mà không lặp lại phần đã xong.`;
  } else if (failedJobs.length > 0) {
    title = "Có công việc lỗi cần xem lại";
    description = `Hiện có ${failedJobs.length} công việc nằm ở failed. Bạn nên xem log, cân nhắc rollback hoặc tạo queue lại trước khi tiếp tục.`;
  }

  return {
    canResume,
    title,
    description,
    status: session?.status ?? "idle",
    scope,
    pendingJobs: pendingJobs.length,
    failedJobs: failedJobs.length,
    pendingFilesCount: pendingFiles.length,
    pendingGroups,
    currentPhase,
    recommendedScript,
    recommendedLabel: recommendedScript ? findScriptLabel(recommendedScript) : null,
  };
}

function resolveResumeScript(scope, pendingJobs, phaseStatus) {
  const normalizedScope = String(scope ?? "all").replace(/^profile:/, "");
  const direct = recommendedScriptForPhase(normalizedScope);
  if (pendingJobs.length === 0) return direct || null;
  if (direct) return direct;

  const pendingFiles = pendingJobs.map((job) => String(job.inputFile ?? ""));
  for (const phase of phaseStatus) {
    const matchers = phaseConfig?.[phase.id]?.match ?? [];
    if (matchers.length > 0 && pendingFiles.every((file) => matchers.some((matcher) => file.includes(matcher)))) {
      return recommendedScriptForPhase(phase.id);
    }
  }

  return "translate:all";
}

function recommendedScriptForPhase(phaseId) {
  const map = {
    phase1: "translate:phase1",
    phase2: "translate:phase2",
    phase3: "translate:phase3",
    "playable-base": "translate:all",
    all: "translate:all",
  };
  return map[phaseId] ?? null;
}

function findScriptLabel(scriptName) {
  for (const section of scriptSectionsCache) {
    const action = (section.actions ?? []).find((item) => item.name === scriptName);
    if (action) return action.label || scriptName;
  }
  return scriptName;
}

function findScriptCoverage(scriptName) {
  for (const section of scriptSectionsCache) {
    const action = (section.actions ?? []).find((item) => item.name === scriptName);
    if (action) return action.coverage || "-";
  }
  return "-";
}
