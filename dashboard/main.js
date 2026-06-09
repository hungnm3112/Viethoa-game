const reportUrl = "/output/reports/translation-dashboard.json";
const scriptsUrl = "/api/scripts";
const runsUrl = "/api/runs";
const runScriptUrl = "/api/run-script";
const dashboardRefreshUrl = "/api/dashboard/refresh";
let selectedRunId = null;

document.getElementById("refreshBtn").addEventListener("click", loadDashboard);
loadDashboard();
loadScripts();
setInterval(loadRuns, 3000);

async function loadDashboard() {
  const response = await fetch(`${reportUrl}?t=${Date.now()}`);
  const data = await response.json();

  document.getElementById("generatedAt").textContent = `Cap nhat: ${formatDate(data.generatedAt)}`;
  document.getElementById("sessionStatus").textContent = data.session.status;
  document.getElementById("sessionScope").textContent = data.session.scope;
  document.getElementById("sessionMeta").innerHTML = [
    `Session: ${escapeHtml(data.session.id)}`,
    `Active model: ${escapeHtml(data.session.activeModel ?? "-")}`,
    `Started: ${escapeHtml(formatDate(data.session.startedAt))}`,
    `Updated: ${escapeHtml(formatDate(data.session.updatedAt))}`,
  ]
    .map((line) => `<div>${line}</div>`)
    .join("");

  document.getElementById("coveragePercent").textContent = `${data.coverage.percent}%`;
  document.getElementById("coverageMeta").textContent =
    `${data.coverage.translatedStrings}/${data.coverage.totalStrings} chuoi da dich`;
  document.getElementById("coverageBar").style.width = `${Math.min(100, data.coverage.percent)}%`;

  document.getElementById("queueStats").innerHTML = [
    ["Pending jobs", data.queue.pendingJobs],
    ["Done jobs", data.queue.doneJobs],
    ["Failed jobs", data.queue.failedJobs],
    ["Processed", data.session.processedJobs],
    ["Fallbacks", data.session.fallbackCount],
    ["Rollbacks", data.session.rollbackCount],
  ]
    .map(([label, value]) => `<div class="row"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  document.getElementById("notes").innerHTML = (data.notes?.length ? data.notes : ["-"])
    .map((note) => `<div>${escapeHtml(note)}</div>`)
    .join("");

  document.getElementById("filesBody").innerHTML = data.files
    .map(
      (file) => `
        <tr>
          <td>${escapeHtml(file.file)}</td>
          <td>${file.translated}</td>
          <td>${file.total}</td>
          <td>${file.percent}%</td>
        </tr>`,
    )
    .join("");

  document.getElementById("events").innerHTML = (data.recentEvents?.length ? data.recentEvents : [{ type: "none", at: "-", message: "Chua co event" }])
    .map(
      (event) => `
        <div class="event">
          <div class="type">${escapeHtml(event.type)}</div>
          <div>${escapeHtml(formatDate(event.at))}</div>
          <div>${escapeHtml(summarizeEvent(event))}</div>
        </div>`,
    )
    .join("");
}

async function loadScripts() {
  const response = await fetch(`${scriptsUrl}?t=${Date.now()}`);
  const data = await response.json();
  document.getElementById("scriptButtons").innerHTML = data.scripts
    .map(
      (script) => `
        <div class="script-card">
          <h3>${escapeHtml(script.name)}</h3>
          <code>${escapeHtml(script.command)}</code>
          <div class="script-actions">
            <button data-script="${escapeHtmlAttr(script.name)}">Chay</button>
          </div>
        </div>`,
    )
    .join("");

  for (const button of document.querySelectorAll("[data-script]")) {
    button.addEventListener("click", async () => {
      button.disabled = true;
      await runScript(button.getAttribute("data-script"));
      button.disabled = false;
    });
  }

  renderRuns(data.runs ?? []);
}

async function runScript(name) {
  await fetch(runScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  await refreshDashboardData();
  await loadRuns();
}

async function loadRuns() {
  const response = await fetch(`${runsUrl}?t=${Date.now()}`);
  const data = await response.json();
  renderRuns(data.runs ?? []);
  await refreshDashboardData();
}

function renderRuns(runs) {
  const running = runs.filter((run) => run.status === "running").length;
  const success = runs.filter((run) => run.status === "success").length;
  const failed = runs.filter((run) => run.status === "failed").length;
  document.getElementById("runSummary").innerHTML = `
    <div>Running: <strong>${running}</strong></div>
    <div>Success: <strong>${success}</strong></div>
    <div>Failed: <strong>${failed}</strong></div>
    <div>Total runs: <strong>${runs.length}</strong></div>
  `;

  if (!selectedRunId && runs.length > 0) {
    selectedRunId = runs[0].id;
  }

  document.getElementById("runsList").innerHTML = runs.length
    ? runs
        .map(
          (run) => `
            <div class="run-card" data-run-id="${escapeHtmlAttr(run.id)}">
              <h3>${escapeHtml(run.script)}</h3>
              <div><span class="pill ${escapeHtmlAttr(run.status)}">${escapeHtml(run.status)}</span></div>
              <div>Start: ${escapeHtml(formatDate(run.startedAt))}</div>
              <div>Finish: ${escapeHtml(formatDate(run.finishedAt))}</div>
              <div>Exit: ${escapeHtml(run.exitCode ?? "-")}</div>
            </div>`,
        )
        .join("")
    : `<div class="run-card">Chua co lan chay nao.</div>`;

  for (const card of document.querySelectorAll("[data-run-id]")) {
    card.addEventListener("click", () => {
      selectedRunId = card.getAttribute("data-run-id");
      const current = runs.find((item) => item.id === selectedRunId);
      document.getElementById("runLog").textContent = current?.logTail || "Khong co log.";
    });
  }

  const current = runs.find((item) => item.id === selectedRunId) ?? runs[0];
  document.getElementById("runLog").textContent = current?.logTail || "Chon mot lenh de xem log.";
}

async function refreshDashboardData() {
  await fetch(dashboardRefreshUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "all" }),
  });
  await loadDashboard();
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
