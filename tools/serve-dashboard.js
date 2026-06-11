import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import url from "node:url";
import { execFileSync, spawn } from "node:child_process";
import { loadSession, updateDashboard } from "./lib/translation-monitor.js";
import { loadDashboardActions } from "./lib/dashboard-actions.js";
import { appendCollectionLog, readRecentCollectionLogs, readStateJson, writeStateJson } from "./lib/state-repository.js";

const root = process.cwd();
const basePort = Number(process.env.DASHBOARD_PORT ?? 4173);
const autoKillPortBlocker = String(process.env.DASHBOARD_KILL_PORT_BLOCKER ?? "true") === "true";
const commandReportFile = "output/reports/command-center.json";
const phaseActivityFile = "output/reports/phase-activity.ndjson";
const progressStateFile = "output/reports/progress-current.json";
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const scriptEntries = Object.entries(packageJson.scripts ?? {}).map(([name, command]) => ({ name, command }));
const scriptSections = loadDashboardActions(scriptEntries);
const scriptMeta = new Map(
  scriptSections.flatMap((section) => section.actions.map((action) => [action.name, { ...action, sectionId: section.id, sectionTitle: section.title }])),
);
const runs = new Map();
const childProcesses = new Map();
const progressPlans = buildProgressPlans(scriptSections);
const progressFlushTimers = new Map();
const bootTimestamp = new Date();
const bootLabel = formatBootStamp(bootTimestamp);
const bootPid = process.pid;

console.log(`[dashboard] boot=${bootLabel} pid=${bootPid} cwd=${root}`);
console.log(`[dashboard] source=tools/serve-dashboard.js mode=${process.env.NODE_ENV ?? "development"} basePort=${basePort}`);

let hasOrphanedRuns = false;
for (const run of await loadRuns()) {
  // Runs still marked "running" from a previous server session are orphaned — no child process exists.
  if (run.status === "running") {
    run.status = "stopped";
    run.stoppedByUser = false;
    run.finishedAt = run.finishedAt ?? new Date().toISOString();
    hasOrphanedRuns = true;
  }
  runs.set(run.id, run);
}
if (hasOrphanedRuns) await persistRuns();

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || "/", true);
  const pathname = decodeURIComponent(parsed.pathname || "/");

  if (pathname.startsWith("/api/")) {
    await handleApi(req, res, pathname);
    return;
  }

  serveStatic(res, pathname);
});

listenWithFallback(basePort);

async function handleApi(req, res, pathname) {
  await reconcileRunStates();

  if (req.method === "GET" && pathname === "/api/scripts") {
    return sendJson(res, {
      sections: scriptSections,
      runs: await summarizeRuns(),
      phaseActivity: await readPhaseActivity(120),
    });
  }

  if (req.method === "GET" && pathname === "/api/runs") {
    return sendJson(res, { runs: await summarizeRuns(), phaseActivity: await readPhaseActivity(120) });
  }

  if (req.method === "GET" && pathname === "/api/progress") {
    const runId = String(parsedQueryValue(req.url, "runId") ?? "").trim();
    return sendJson(res, await readProgressSnapshot(runId));
  }

  if (req.method === "POST" && pathname === "/api/run-script") {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const name = String(payload.name ?? "").trim();
    const script = scriptEntries.find((item) => item.name === name);
    if (!script) {
      return sendJson(res, { error: `Unknown script: ${name}` }, 404);
    }
    const runningRun = [...runs.values()]
      .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
      .find((item) => item.status === "running");
    if (runningRun) {
      return sendJson(
        res,
        {
          error: `Đang có lệnh "${runningRun.script}" chạy, vui lòng đợi hoàn tất để tránh xung đột.`,
          activeRun: summarizeRun(runningRun),
        },
        409,
      );
    }
    const run = await startScript(script);
    return sendJson(res, { run });
  }

  if (req.method === "POST" && pathname === "/api/stop-run") {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const runId = String(payload.runId ?? "").trim();
    const result = await stopRun(runId);
    return sendJson(res, result, result.ok ? 200 : 404);
  }

  if (req.method === "POST" && pathname === "/api/retry-failed") {
    const failed = safeReadJsonArray("jobs/failed.json");
    if (failed.length === 0) {
      return sendJson(res, { ok: true, retried: 0 });
    }
    const pending = safeReadJsonArray("jobs/pending.json");
    const retried = failed.map(({ attempts, error, failedAt, ...job }) => ({ ...job }));
    await writeStateJson("jobs.pending", "jobs/pending.json", [...pending, ...retried]);
    await writeStateJson("jobs.failed", "jobs/failed.json", []);
    return sendJson(res, { ok: true, retried: retried.length });
  }

  if (req.method === "POST" && pathname === "/api/dashboard/refresh") {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const scope = String(payload.scope ?? "all");
    const dashboard = await refreshDashboard(scope);
    return sendJson(res, dashboard);
  }

  sendJson(res, { error: "Not found" }, 404);
}

function serveStatic(res, pathname) {
  if (pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  let requestedPath = pathname === "/" ? "/dashboard/index.html" : pathname;
  if (requestedPath === "/styles.css" || requestedPath === "/main.js") {
    requestedPath = `/dashboard${requestedPath}`;
  }
  const fullPath = path.join(root, requestedPath);

  if (!fullPath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentType(fullPath),
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  fs.createReadStream(fullPath).pipe(res);
}

async function startScript(script) {
  const metadata = scriptMeta.get(script.name);
  const run = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    script: script.name,
    label: metadata?.label ?? script.name,
    summary: metadata?.summary ?? "",
    coverage: metadata?.coverage ?? "",
    phase: metadata?.phase ?? "uncategorized",
    sectionTitle: metadata?.sectionTitle ?? "Lenh chua phan loai",
    command: script.command,
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exitCode: null,
    pid: null,
    stopRequestedAt: null,
    stoppedByUser: false,
    logPath: `output/reports/command-logs/${script.name.replace(/[^a-z0-9:_-]/gi, "_")}-${Date.now()}.log`,
  };

  fs.mkdirSync(path.dirname(run.logPath), { recursive: true });
  fs.writeFileSync(run.logPath, `> npm run ${script.name}\n\n`, "utf8");
  runs.set(run.id, run);
  await persistRuns();
  await persistProgressSnapshot(run.id);
  await appendPhaseActivity("script-start", run);

  const child = spawnShellCommand(`npm run ${script.name}`, {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  run.pid = child.pid ?? null;
  childProcesses.set(run.id, child);
  await persistRuns();

  child.stdout.on("data", (chunk) => appendRunLog(run, String(chunk)));
  child.stderr.on("data", (chunk) => appendRunLog(run, String(chunk)));
  child.on("close", async (code) => {
    childProcesses.delete(run.id);
    clearScheduledProgressFlush(run.id);
    run.status = run.stoppedByUser ? "stopped" : code === 0 ? "success" : "failed";
    run.exitCode = code;
    run.finishedAt = new Date().toISOString();
    await persistRuns();
    await persistProgressSnapshot(run.id);
    await appendPhaseActivity("script-finish", run);
    await refreshDashboard("all");
  });
  child.on("error", async (error) => {
    childProcesses.delete(run.id);
    clearScheduledProgressFlush(run.id);
    appendRunLog(run, `\n[spawn-error] ${error.message}\n`);
    run.status = "failed";
    run.exitCode = -1;
    run.finishedAt = new Date().toISOString();
    await persistRuns();
    await persistProgressSnapshot(run.id);
    await appendPhaseActivity("script-error", { ...run, error: error.message });
  });

  return summarizeRun(run);
}

async function stopRun(runId) {
  const run = runId
    ? runs.get(runId)
    : [...runs.values()]
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
        .find((item) => item.status === "running");

  if (!run || run.status !== "running") {
    return { ok: false, error: "Không tìm thấy tác vụ đang chạy để dừng." };
  }

  const child = childProcesses.get(run.id);
  const targetPid = child?.pid ?? run.pid;
  if (!targetPid) {
    return { ok: false, error: "Không xác định được PID của tác vụ đang chạy." };
  }

  run.stoppedByUser = true;
  run.stopRequestedAt = new Date().toISOString();
  appendRunLog(run, `\n[stop-request] User requested stop at ${run.stopRequestedAt}\n`);
  await persistRuns();
  await persistProgressSnapshot(run.id);

  try {
    killProcess(targetPid);
    await appendPhaseActivity("script-stop", run);
    return { ok: true, run: summarizeRun(run) };
  } catch (error) {
    appendRunLog(run, `\n[stop-error] ${error.message}\n`);
    await persistRuns();
    return { ok: false, error: `Không thể dừng tác vụ: ${error.message}` };
  }
}

function appendRunLog(run, text) {
  fs.appendFileSync(run.logPath, text, "utf8");
  scheduleProgressFlush(run.id);
}

async function persistRuns() {
  await writeStateJson("dashboard.commandRuns", commandReportFile, {
    updatedAt: new Date().toISOString(),
    runs: await summarizeRuns(),
  });
}

async function loadRuns() {
  return (await readStateJson("dashboard.commandRuns", commandReportFile, { runs: [] })).runs ?? [];
}

async function summarizeRuns() {
  return [...runs.values()]
    .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
    .map(summarizeRun);
}

async function reconcileRunStates() {
  let changed = false;
  const session = await loadSession().catch(() => null);

  for (const run of runs.values()) {
    if (run.status !== "running") continue;

    const child = childProcesses.get(run.id);
    const pid = child?.pid ?? run.pid;
    if (child && isProcessAlive(pid)) continue;
    if (!child && isProcessAlive(pid)) continue;

    const nextState = inferRecoveredRunState(run, session);
    if (
      run.status !== nextState.status ||
      run.finishedAt !== nextState.finishedAt ||
      run.exitCode !== nextState.exitCode ||
      run.stoppedByUser !== nextState.stoppedByUser
    ) {
      run.status = nextState.status;
      run.finishedAt = nextState.finishedAt;
      run.exitCode = nextState.exitCode;
      run.stoppedByUser = nextState.stoppedByUser;
      changed = true;
    }
  }

  if (changed) {
    await persistRuns();
    await persistProgressSnapshot();
  }
}

async function persistProgressSnapshot(runId = null) {
  const snapshot = await buildProgressSnapshot(runId);
  await writeStateJson("dashboard.progress.current", progressStateFile, snapshot);
  if (snapshot.currentRun?.id) {
    await writeStateJson(`dashboard.progress.run.${snapshot.currentRun.id}`, progressFileForRun(snapshot.currentRun.id), snapshot);
  }
  return snapshot;
}

async function readProgressSnapshot(runId = "") {
  const snapshot = await buildProgressSnapshot(runId || null);
  if (runId) {
    await writeStateJson(`dashboard.progress.run.${runId}`, progressFileForRun(runId), snapshot);
    return snapshot;
  }
  await writeStateJson("dashboard.progress.current", progressStateFile, snapshot);
  return snapshot;
}

async function buildProgressSnapshot(runId = null) {
  const allRuns = await summarizeRuns();
  const currentRun = runId ? allRuns.find((item) => item.id === runId) ?? null : getActiveOrLatestRun(allRuns);
  const queue = {
    pendingJobs: safeReadJsonArray("jobs/pending.json").length,
    doneJobs: safeReadJsonArray("jobs/done.json").length,
    failedJobs: safeReadJsonArray("jobs/failed.json").length,
  };

  return {
    updatedAt: new Date().toISOString(),
    currentRun,
    queue,
    hasRunningRun: allRuns.some((item) => item.status === "running"),
    latestRunId: allRuns[0]?.id ?? null,
  };
}

function summarizeRun(run) {
  let logContent = "";
  let logTail = "";
  let logUpdatedAt = null;
  try {
    logContent = fs.readFileSync(run.logPath, "utf8");
    logTail = logContent.split(/\r?\n/).slice(-60).join("\n");
    logUpdatedAt = fs.statSync(run.logPath).mtime.toISOString();
  } catch {
    logContent = "";
    logTail = "";
    logUpdatedAt = null;
  }
  const progress = inferProgress(run, logContent);
  return {
    ...run,
    logTail,
    logUpdatedAt,
    progress,
  };
}

async function appendPhaseActivity(type, run) {
  const line = {
    at: new Date().toISOString(),
    type,
    runId: run.id,
    script: run.script,
    label: run.label,
    phase: run.phase,
    sectionTitle: run.sectionTitle,
    summary: run.summary,
    coverage: run.coverage,
    status: run.status,
    exitCode: run.exitCode,
    error: run.error ?? null,
  };
  await appendCollectionLog(phaseActivityFile, "dashboard_phase_activity", line);
}

async function readPhaseActivity(limit) {
  return readRecentCollectionLogs(phaseActivityFile, "dashboard_phase_activity", limit);
}

async function refreshDashboard(scope) {
  return updateDashboard({
    session: await loadSession(),
    scope,
  });
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".ndjson": "application/x-ndjson; charset=utf-8",
      ".log": "text/plain; charset=utf-8",
    }[extension] ?? "application/octet-stream"
  );
}

function spawnShellCommand(command, options) {
  if (process.platform === "win32") {
    return spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", command], options);
  }
  return spawn("/bin/sh", ["-lc", command], options);
}

function listenWithFallback(startPort) {
  const tryListen = (port) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        if (autoKillPortBlocker && tryKillPortBlocker(port)) {
          console.warn(`Da giai phong port ${port}. Thu bind lai...`);
          setTimeout(() => tryListen(port), 250);
          return;
        }
        console.warn(`Port ${port} dang duoc su dung, thu port ${port + 1}...`);
        setTimeout(() => tryListen(port + 1), 100);
        return;
      }
      throw error;
    });

    server.listen(port, async () => {
      await refreshDashboard("all");
      console.log(`[dashboard] ready=${formatBootStamp(new Date())} pid=${bootPid} url=http://localhost:${port}/`);
      console.log(`Dashboard: http://localhost:${port}/`);
    });
  };

  tryListen(startPort);
}

function tryKillPortBlocker(port) {
  try {
    const blockers = findListeningPids(port);
    if (blockers.length === 0) return false;

    for (const pid of blockers) {
      if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid) continue;
      const processName = readProcessName(pid);
      console.warn(`Port ${port} dang bi PID ${pid}${processName ? ` (${processName})` : ""} chiem. Dang stop...`);
      killProcess(pid);
    }

    return findListeningPids(port).length === 0;
  } catch (error) {
    console.warn(`Khong the giai phong port ${port}: ${error.message}`);
    return false;
  }
}

function findListeningPids(port) {
  if (process.platform === "win32") {
    const output = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
    return parseWindowsNetstatPids(output, port);
  }

  const output = execFileSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" });
  return parsePidList(output);
}

function readProcessName(pid) {
  try {
    if (process.platform === "win32") {
      const output = execFileSync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], {
        encoding: "utf8",
      }).trim();
      const firstColumn = output.split(",")[0] ?? "";
      return firstColumn.replace(/^"|"$/g, "");
    }
    return execFileSync("ps", ["-p", String(pid), "-o", "comm="], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function killProcess(pid) {
  if (process.platform === "win32") {
    execFileSync("taskkill", ["/PID", String(pid), "/F", "/T"], { encoding: "utf8" });
    return;
  }
  execFileSync("kill", ["-9", String(pid)], { encoding: "utf8" });
}

function parsePidList(output) {
  return String(output ?? "")
    .split(/\r?\n/)
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function parseWindowsNetstatPids(output, port) {
  const suffix = `:${port}`;
  const pids = new Set();
  for (const rawLine of String(output ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !line.startsWith("TCP")) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 5) continue;
    const localAddress = parts[1];
    const state = parts[3];
    const pid = Number.parseInt(parts[4], 10);
    if (!localAddress.endsWith(suffix)) continue;
    if (state !== "LISTENING") continue;
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  return [...pids];
}

function scheduleProgressFlush(runId) {
  if (!runId || progressFlushTimers.has(runId)) return;
  const timer = setTimeout(async () => {
    progressFlushTimers.delete(runId);
    try {
      await persistProgressSnapshot(runId);
    } catch (error) {
      console.warn(`Khong the ghi progress snapshot cho ${runId}: ${error.message}`);
    }
  }, 1000);
  progressFlushTimers.set(runId, timer);
}

function clearScheduledProgressFlush(runId) {
  const timer = progressFlushTimers.get(runId);
  if (timer) {
    clearTimeout(timer);
    progressFlushTimers.delete(runId);
  }
}

function getActiveOrLatestRun(allRuns) {
  return allRuns.find((item) => item.status === "running") ?? allRuns[0] ?? null;
}

function progressFileForRun(runId) {
  return `output/reports/run-progress/${runId}.json`;
}

function parsedQueryValue(requestUrl, key) {
  const parsed = url.parse(requestUrl || "/", true);
  return parsed.query?.[key];
}

function formatBootStamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function inferRecoveredRunState(run, session) {
  const finishedAt = session?.updatedAt ?? new Date().toISOString();

  if (run.script.startsWith("translate") && session && String(session.startedAt) >= String(run.startedAt)) {
    if (session.status === "completed") {
      return {
        status: "success",
        finishedAt: session.completedAt ?? session.updatedAt ?? finishedAt,
        exitCode: 0,
        stoppedByUser: false,
      };
    }

    if (session.status === "paused") {
      return {
        status: "stopped",
        finishedAt: session.updatedAt ?? finishedAt,
        exitCode: 0,
        stoppedByUser: false,
      };
    }
  }

  return {
    status: "stopped",
    finishedAt,
    exitCode: run.exitCode ?? null,
    stoppedByUser: false,
  };
}

function isProcessAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function buildProgressPlans(sections) {
  const plans = new Map();

  for (const section of sections) {
    for (const action of section.actions ?? []) {
      plans.set(action.name, createProgressPlan(action));
    }
  }

  return plans;
}

function createProgressPlan(action) {
  const name = String(action.name ?? "");
  const label = String(action.label ?? name);
  const coverage = String(action.coverage ?? "");
  const phaseTitle = String(action.sectionTitle ?? action.phase ?? "");

  if (name === "translate:all") {
    return {
      totalSteps: 5,
      steps: [
        { key: "start", label: "Khởi động pipeline Việt hóa toàn bộ", percent: 5 },
        { key: "queue", label: "Chuẩn bị queue và session", percent: 15 },
        { key: "cycles", label: "Chạy các chu kỳ dịch", percent: 85 },
        { key: "refresh", label: "Làm mới báo cáo tổng", percent: 95 },
        { key: "finish", label: "Hoàn tất pipeline", percent: 100 },
      ],
      detail: "Pipeline full-run có resume, fallback model và rollback output an toàn.",
    };
  }

  if (name.startsWith("translate")) {
    return {
      totalSteps: 4,
      steps: [
        { key: "start", label: `Khởi động ${label}`, percent: 10 },
        { key: "load-jobs", label: "Đọc queue và khôi phục phiên dịch", percent: 20 },
        { key: "translate-batch", label: "Dịch và ghi kết quả theo batch", percent: 85 },
        { key: "finish", label: "Cập nhật báo cáo và chốt phiên", percent: 100 },
      ],
      detail: `${phaseTitle || "Pipeline dịch"} - ${coverage || "Xử lý nội dung đã nằm trong queue hiện tại."}`,
    };
  }

  if (name.startsWith("build-jobs")) {
    return {
      totalSteps: 3,
      steps: [
        { key: "start", label: `Khởi động ${label}`, percent: 10 },
        { key: "scan", label: "Quét input và gom chuỗi cần tạo job", percent: 60 },
        { key: "finish", label: "Ghi queue pending/done/failed mới", percent: 100 },
      ],
      detail: `${phaseTitle || "Queue job"} - ${coverage || "Tạo danh sách công việc dịch mới."}`,
    };
  }

  if (name === "extract") {
    return {
      totalSteps: 3,
      steps: [
        { key: "start", label: "Khởi động trích xuất dữ liệu game", percent: 10 },
        { key: "extract-paks", label: "Giải nén các file .pak cần thiết", percent: 85 },
        { key: "finish", label: "Hoàn tất trích xuất vào thư mục input", percent: 100 },
      ],
      detail: "Trích XML, BTXT/DRL tùy tùy chọn và tài nguyên phục vụ Việt hóa.",
    };
  }

  if (name === "scan" || name.startsWith("translation-status") || name === "dashboard:generate" || name === "font-audit") {
    return {
      totalSteps: 3,
      steps: [
        { key: "start", label: `Khởi động ${label}`, percent: 10 },
        { key: "process", label: "Đọc dữ liệu và tổng hợp báo cáo", percent: 75 },
        { key: "finish", label: "Ghi báo cáo hoàn tất", percent: 100 },
      ],
      detail: coverage || "Chạy bước thống kê/chẩn đoán cho dashboard.",
    };
  }

  if (name === "sync-game" || name === "rollback:output") {
    return {
      totalSteps: 3,
      steps: [
        { key: "start", label: `Khởi động ${label}`, percent: 10 },
        { key: "copy", label: name === "sync-game" ? "Đồng bộ file output sang thư mục game" : "Khôi phục output từ backup gần nhất", percent: 75 },
        { key: "finish", label: "Hoàn tất thao tác file", percent: 100 },
      ],
      detail: coverage || "Thao tác file đầu ra để test hoặc phục hồi.",
    };
  }

  return {
    totalSteps: 3,
    steps: [
      { key: "start", label: `Khởi động ${label}`, percent: 10 },
      { key: "process", label: summaryFallback(label, coverage), percent: 75 },
      { key: "finish", label: "Hoàn tất lệnh", percent: 100 },
    ],
    detail: coverage || "Thực thi lệnh từ dashboard.",
  };
}

function inferProgress(run, logContent) {
  const plan = progressPlans.get(run.script) ?? createProgressPlan(run);
  const defaultState = {
    percent: run.status === "success" ? 100 : run.status === "failed" ? 100 : 8,
    currentStep: run.status === "success" ? "Hoàn tất" : run.status === "failed" ? "Dừng do lỗi" : "Đang khởi động",
    completedSteps: [],
    totalSteps: plan.totalSteps,
    detail: plan.detail,
  };

  if (run.script.startsWith("translate")) {
    return inferTranslationProgress(run, plan, logContent, defaultState);
  }

  if (run.script.startsWith("build-jobs")) {
    return inferBuildJobsProgress(run, plan, logContent, defaultState);
  }

  if (run.script === "extract") {
    return inferExtractProgress(run, plan, logContent, defaultState);
  }

  return inferGenericProgress(run, plan, logContent, defaultState);
}

function inferTranslationProgress(run, plan, logContent, fallbackState) {
  const pendingJobs = safeReadJsonArray("jobs/pending.json").length;
  const doneJobs = safeReadJsonArray("jobs/done.json").length;
  const failedJobs = safeReadJsonArray("jobs/failed.json").length;
  const totalJobs = pendingJobs + doneJobs + failedJobs;
  const processedJobs = doneJobs + failedJobs;
  const batchProgress = totalJobs > 0 ? Math.round((processedJobs / totalJobs) * 100) : 0;
  const completedSteps = [plan.steps[0].label, plan.steps[1].label];
  let currentStep = plan.steps[2].label;
  let percent = clampPercent(Math.max(20, batchProgress));

  if (/fallback/i.test(logContent)) {
    completedSteps.push("Đã kích hoạt fallback model khi cần");
  }
  if (/Done job /i.test(logContent)) {
    const matches = [...logContent.matchAll(/Done job\s+([^\r\n]+)/gi)].map((match) => `Xong: ${match[1]}`);
    completedSteps.push(...matches.slice(-6));
  }
  if (/Failed job /i.test(logContent)) {
    currentStep = "Có job lỗi, đang ghi trạng thái và chuẩn bị vòng tiếp theo";
  }
  if (/Processed \d+ job\(s\)\. Pending: \d+/i.test(logContent)) {
    currentStep = plan.steps[3].label;
    percent = run.status === "success" ? 100 : Math.max(percent, 95);
  }
  if (run.status === "success") {
    completedSteps.push(plan.steps[2].label, plan.steps[3].label);
    currentStep = "Đã hoàn tất";
    percent = 100;
  }
  if (run.status === "failed") {
    currentStep = "Lệnh dịch dừng do lỗi, xem log để biết job cuối cùng";
    percent = Math.max(percent, 15);
  }

  return {
    percent,
    currentStep,
    completedSteps: uniqueRecent(completedSteps, 8),
    totalSteps: plan.totalSteps,
    detail: totalJobs > 0
      ? `Đã xử lý ${processedJobs}/${totalJobs} job trong queue hiện tại. Done=${doneJobs}, lỗi=${failedJobs}, chờ=${pendingJobs}.`
      : plan.detail,
  };
}

function inferBuildJobsProgress(run, plan, logContent, fallbackState) {
  const completedSteps = [plan.steps[0].label];
  let percent = 18;
  let currentStep = plan.steps[1].label;

  const createdMatch = logContent.match(/Created\s+(\d+)\s+jobs/i);
  if (createdMatch) {
    completedSteps.push(`${plan.steps[1].label} (${createdMatch[1]} job)`);
    percent = run.status === "success" ? 100 : 85;
    currentStep = plan.steps[2].label;
  }

  if (/Applied matchers:/i.test(logContent)) {
    completedSteps.push("Đã áp bộ lọc file cho phase hiện tại");
  }

  if (run.status === "success") {
    completedSteps.push(plan.steps[2].label);
    percent = 100;
    currentStep = "Đã hoàn tất";
  }

  if (run.status === "failed") {
    return {
      ...fallbackState,
      currentStep: "Tạo queue thất bại, cần xem log",
      completedSteps: uniqueRecent(completedSteps, 6),
      detail: plan.detail,
    };
  }

  return {
    percent,
    currentStep,
    completedSteps: uniqueRecent(completedSteps, 6),
    totalSteps: plan.totalSteps,
    detail: plan.detail,
  };
}

function inferExtractProgress(run, plan, logContent, fallbackState) {
  const completedSteps = [plan.steps[0].label];
  const pakFiles = listPakFiles();
  const extractedPakMatches = [...logContent.matchAll(/([^\r\n]+\.pak): extracted\s+\d+\s+files/gi)];
  const extractedPakCount = extractedPakMatches.length;
  let percent = pakFiles.length > 0 ? Math.round((extractedPakCount / pakFiles.length) * 75) + 10 : 20;
  let currentStep = plan.steps[1].label;

  if (extractedPakCount > 0) {
    completedSteps.push(...extractedPakMatches.slice(-5).map((match) => `Đã giải nén ${match[1]}`));
  }
  if (/Done\. Extracted\s+\d+\s+files into/i.test(logContent)) {
    currentStep = plan.steps[2].label;
    percent = run.status === "success" ? 100 : 95;
  }
  if (run.status === "success") {
    completedSteps.push(plan.steps[2].label);
    currentStep = "Đã hoàn tất";
    percent = 100;
  }
  if (run.status === "failed") {
    return {
      ...fallbackState,
      currentStep: "Trích xuất dừng do lỗi, kiểm tra pak hoặc đường dẫn input",
      completedSteps: uniqueRecent(completedSteps, 6),
      detail: `Đã xử lý ${extractedPakCount}/${pakFiles.length || "?"} file pak trước khi dừng.`,
    };
  }

  return {
    percent: clampPercent(percent),
    currentStep,
    completedSteps: uniqueRecent(completedSteps, 6),
    totalSteps: plan.totalSteps,
    detail: `Đã xử lý ${extractedPakCount}/${pakFiles.length || "?"} file pak trong thư mục dữ liệu game.`,
  };
}

function inferGenericProgress(run, plan, logContent, fallbackState) {
  const completedSteps = [plan.steps[0].label];
  let percent = 18;
  let currentStep = plan.steps[1].label;

  const lines = logContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("> npm run "));

  if (lines.length > 0) {
    completedSteps.push(...lines.slice(-4).map((line) => normalizeProgressLine(line)));
    percent = 78;
  }

  if (run.status === "success") {
    completedSteps.push(plan.steps[2].label);
    currentStep = "Đã hoàn tất";
    percent = 100;
  } else if (run.status === "failed") {
    currentStep = "Lệnh dừng do lỗi, xem log chi tiết";
    percent = Math.max(percent, 20);
  }

  return {
    percent: clampPercent(percent),
    currentStep,
    completedSteps: uniqueRecent(completedSteps, 6),
    totalSteps: plan.totalSteps,
    detail: plan.detail,
  };
}

function safeReadJsonArray(filePath) {
  try {
    const fullPath = path.join(root, filePath);
    if (!fs.existsSync(fullPath)) return [];
    const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function listPakFiles() {
  try {
    const pakRoot = path.join(root, "data-game-park");
    if (!fs.existsSync(pakRoot)) return [];
    return fs.readdirSync(pakRoot).filter((name) => name.toLowerCase().endsWith(".pak"));
  } catch {
    return [];
  }
}

function normalizeProgressLine(line) {
  return String(line).replace(/\s+/g, " ").trim();
}

function uniqueRecent(items, maxItems) {
  const seen = new Set();
  const output = [];
  for (const item of items.filter(Boolean).reverse()) {
    if (seen.has(item)) continue;
    seen.add(item);
    output.push(item);
    if (output.length >= maxItems) break;
  }
  return output.reverse();
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0));
}

function summaryFallback(label, coverage) {
  if (coverage) return coverage;
  return `Đang xử lý ${label}`;
}
