import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = 4173;
const publicFiles = new Set([
  "experience.html",
  "index.html",
  "experience.css",
  "experience.js",
  "atlas-visual.css",
  "atlas-visual.js",
  "photo-store.js",
  "app.js",
  "styles.css",
  "assets/earth-clouds.png",
  "assets/earth-day.jpg",
  "assets/earth-night.png",
  "assets/leaflet.css",
  "assets/leaflet.js",
  "assets/memory-atlas.png"
]);
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"]
]);
const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self' https://accounts.google.com",
    "script-src 'self' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://tile.openstreetmap.org https://services.arcgisonline.com https://*.arcgisonline.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://photospicker.googleapis.com https://lh3.googleusercontent.com https://tile.openstreetmap.org https://services.arcgisonline.com https://*.arcgisonline.com",
    "frame-src https://accounts.google.com",
    "worker-src 'self' blob:"
  ].join("; "),
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Content-Type-Options": "nosniff"
};

const server = createServer(async (request, response) => {
  response.setHeaders(new Headers(securityHeaders));

  if (request.method === "POST") {
    let pathname;
    try {
      pathname = new URL(request.url, "http://localhost").pathname;
    } catch {
      response.writeHead(400).end("Bad request");
      return;
    }
    if (pathname !== "/__save-demo" || request.headers.host !== `localhost:${port}` || request.headers.origin !== `http://localhost:${port}`) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    if (!request.headers["content-type"]?.startsWith("text/html")) {
      response.writeHead(415).end("Expected an HTML export");
      return;
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 40 * 1024 * 1024) {
        response.writeHead(413).end("Export is too large");
        return;
      }
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    const html = body.toString("utf8");
    if (!html.startsWith("<!doctype html>") || !html.includes('id="globe"') || !html.includes("const photos=")) {
      response.writeHead(400).end("Invalid photo atlas export");
      return;
    }
    try {
      await writeFile(resolve(root, "atlante-fotografico-demo.html"), body, { flag: "wx" });
      response.writeHead(201, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify({ saved: "atlante-fotografico-demo.html", bytes: body.length }));
    } catch (error) {
      response.writeHead(error.code === "EEXIST" ? 409 : 500).end(error.code === "EEXIST" ? "Export file already exists" : "Could not save export");
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD, POST" }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const relativePath = pathname === "/" ? "experience.html" : pathname.replace(/^\/+/, "");
  if (!publicFiles.has(relativePath)) {
    response.writeHead(404).end("Not found");
    return;
  }

  try {
    const body = await readFile(resolve(root, relativePath));
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(extname(relativePath).toLowerCase()) || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    if (request.method === "HEAD") response.end();
    else response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

server.listen(port, "localhost", () => {
  process.stdout.write(`Archetype preview: http://localhost:${port}/experience.html\n`);
});
