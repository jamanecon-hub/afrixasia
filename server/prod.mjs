import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { attachApi } from "./api.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const distPrefix = dist.endsWith(path.sep) ? dist : dist + path.sep;
const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const layers = [];
attachApi({
  use(handler) {
    layers.push(handler);
  },
});

function insideDist(file) {
  return file === dist || file.startsWith(distPrefix);
}

function resolveFile(urlPath) {
  let decoded = urlPath;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const file = path.join(dist, path.normalize(decoded));
  if (!insideDist(file)) return null;
  return file;
}

function sendFile(req, res, file) {
  const stat = fs.statSync(file);
  const ext = path.extname(file);
  res.statusCode = 200;
  res.setHeader("content-type", types[ext] || "application/octet-stream");
  res.setHeader("content-length", stat.size);
  if (ext === ".html") res.setHeader("cache-control", "no-cache");
  else if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader("cache-control", "public, max-age=31536000, immutable");
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(file).pipe(res);
}

function serveStatic(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("allow", "GET, HEAD");
    res.end("Method not allowed");
    return;
  }
  const url = new URL(req.url, "http://localhost");
  let file = resolveFile(url.pathname);
  if (file && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  const exists = file && fs.existsSync(file) && fs.statSync(file).isFile();
  if (!exists) {
    const ext = path.extname(url.pathname);
    if (ext && ext !== ".html") {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    file = path.join(dist, "index.html");
    if (!fs.existsSync(file)) {
      res.statusCode = 503;
      res.end("App is not built. Run npm run build.");
      return;
    }
  }
  sendFile(req, res, file);
}

function dispatch(req, res) {
  let index = 0;
  const next = (error) => {
    if (error) {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end(error.message || "Server error");
      }
      return;
    }
    const handler = layers[index++];
    if (!handler) {
      serveStatic(req, res);
      return;
    }
    try {
      const result = handler(req, res, next);
      if (result && typeof result.then === "function") result.catch(next);
    } catch (caught) {
      next(caught);
    }
  };
  next();
}

export { dispatch };

if (!process.env.VERCEL) {
  const server = http.createServer(dispatch);
  server.listen(port, host, () => {
    console.log(`AfriXAsia listening on http://${host}:${port}`);
  });
}
