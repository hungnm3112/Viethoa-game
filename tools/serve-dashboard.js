import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import url from "node:url";
import { spawn } from "node:child_process";
import { readJson, writeJson } from "./lib/json-store.js";
import { loadSession, updateDashboard } from "./lib/translation-monitor.js";

const root = process.cwd();
const port = Number(process.env.DASHBOARD_PORT ?? 4173);
const commandReportFile = "output/reports/command-center.json";
const commandLogDir = "output/reports/command-logs";
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const scriptEntries = Object.entries(packageJson.scripts ?? {}).map(([name, command]) => ({ name, command }));
const runs = new Map(loadRuns().map((run) => [run.id, run]));

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || "/", true);
  const pathname = decodeURIComponent(parsed.pathname || "/");

  if (pathname.startsWith("/api/")) {
    await handleApi(req, res, pathname);
    return;
  }

  serveStatic(res, pathname);
});

server.listen(port, () => {
  refreshDashboard("all");
  console.log(`Dashboard: http://localhost:${port}/`);
});

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/scripts") {
    return sendJson(res, {
      scripts: scriptEntries,
      runs: summarizeRuns(),
    });
  }

  if (req.method === "GET" && pathname === "/api/runs") {
    return sendJson(res, { runs: summarizeRuns() });
  }

  if (req.method === "POST" && pathname === "/api/run-script") {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const name = String(payload.name ?? "").trim();
    const script = scriptEntries.find((item) => item.name === name);
    if (!script) {
      return sendJson(res, { error: `Unknown script: ${name}` }, 404);
    }
    const run = startScript(script);
    return sendJson(res, { run });
  }

  if (req.method === "POST" && pathname === "/api/dashboard/refresh") {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const scope = String(payload.scope ?? "all");
    const dashboard = refreshDashboard(scope);
    return sendJson(res, dashboard);
  }

  sendJson(res, { error: "Not found" }, 404);
}

function serveStatic(res, pathname) {
  let requestedPath = pathname === "/" ? "/dashboard/index.html" : pathname;
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

  res.writeHead(200, { "Content-Type": contentType(fullPath) });
  fs.createReadStream(fullPath).pipe(res);
}

function startScript(script) {
  const run = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    script: script.name,
    command: script.command,
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exitCode: null,
    logPath: `output/reports/command-logs/${script.name.replace(/[^a-z0-9:_-]/gi, "_")}-${Date.now()}.log`,
  };

  fs.mkdirSync(path.dirname(run.logPath), { recursive: true });
  fs.writeFileSync(run.logPath, `> npm run ${script.name}\n\n`, "utf8");
  runs.set(run.id, run);
  persistRuns();

  const child = spawnShellCommand(`npm run ${script.name}`, {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => appendRunLog(run, String(chunk)));
  child.stderr.on("data", (chunk) => appendRunLog(run, String(chunk)));
  child.on("close", (code) => {
    run.status = code === 0 ? "success" : "failed";
    run.exitCode = code;
    run.finishedAt = new Date().toISOString();
    persistRuns();
    refreshDashboard("all");
  });
  child.on("error", (error) => {
    appendRunLog(run, `\n[spawn-error] ${error.message}\n`);
    run.status = "failed";
    run.exitCode = -1;
    run.finishedAt = new Date().toISOString();
    persistRuns();
  });

  return summarizeRun(run);
}

function appendRunLog(run, text) {
  fs.appendFileSync(run.logPath, text, "utf8");
}

function persistRuns() {
  writeJson(commandReportFile, {
    updatedAt: new Date().toISOString(),
    runs: summarizeRuns(),
  });
}

function loadRuns() {
  return readJson(commandReportFile, { runs: [] }).runs ?? [];
}

function summarizeRuns() {
  return [...runs.values()]
    .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
    .map(summarizeRun);
}

function summarizeRun(run) {
  let logTail = "";
  try {
    const content = fs.readFileSync(run.logPath, "utf8");
    logTail = content.split(/\r?\n/).slice(-60).join("\n");
  } catch {
    logTail = "";
  }
  return {
    ...run,
    logTail,
  };
}

function refreshDashboard(scope) {
  return updateDashboard({
    session: loadSession(),
    scope,
  });
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
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
