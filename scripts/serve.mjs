import http from "node:http";
import { readFile, stat, watch } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const watchMode = process.argv.includes("--watch");
const reloadClients = new Set();
let rebuildTimer;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const liveReloadScript = `<script>new EventSource('/__live_reload').onmessage=event=>{if(event.data==='reload')location.reload()};</script>`;

function build() {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn(process.execPath, [path.join(projectRoot, "scripts/build.mjs")], { cwd: projectRoot, stdio: ["ignore", "pipe", "pipe"] });
    let error = "";
    buildProcess.stderr.on("data", (chunk) => { error += chunk; });
    buildProcess.on("close", (code) => code === 0 ? resolve() : reject(new Error(error || `Build zakończył się kodem ${code}`)));
  });
}

function notifyReload() {
  for (const response of reloadClients) response.write("data: reload\n\n");
}

function watchSources() {
  const sources = [
    [path.join(projectRoot, "src"), { recursive: true }],
    [path.join(projectRoot, "public"), { recursive: true }],
    [path.join(projectRoot, "scripts/build.mjs"), {}]
  ];
  for (const [source, options] of sources) {
    (async function processChanges() {
      const events = watch(source, options);
      for await (const event of events) {
        if (!event.filename) continue;
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(async () => {
          try {
            await build();
            console.log(`Przebudowano po zmianie: ${event.filename}`);
            notifyReload();
          } catch (error) {
            console.error(error.message);
          }
        }, 100);
      }
    })().catch((error) => console.error(`Nie można obserwować ${source}: ${error.message}`));
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "http://localhost");
    if (watchMode && url.pathname === "/__live_reload") {
      response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
      response.write("\n");
      reloadClients.add(response);
      request.on("close", () => reloadClients.delete(response));
      return;
    }
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}${path.sep}`) && file !== path.join(root, "index.html")) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" }).end("Forbidden");
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) throw new Error("Not a file");
    const body = await readFile(file);
    const extension = path.extname(file).toLowerCase();
    const cache = "no-cache";
    response.writeHead(200, { "content-type": contentTypes[extension] || "application/octet-stream", "cache-control": cache, "x-content-type-options": "nosniff" });
    if (request.method === "HEAD") response.end();
    else if (watchMode && extension === ".html") response.end(body.toString().replace("</body>", `${liveReloadScript}</body>`));
    else response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }).end("Not found");
  }
});

if (watchMode) await build();
server.listen(port, host, () => console.log(`Papryczka Preview nasłuchuje na http://${host}:${port}`));
if (watchMode) console.log("Tryb live: obserwuję src/, public/ i scripts/build.mjs");
if (watchMode) watchSources();
