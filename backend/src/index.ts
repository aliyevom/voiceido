import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { sessionId } from "./middleware/session.js";
import api from "./routes/api.js";

function log(...args: unknown[]) {
  const ts = new Date().toISOString();
  console.log(`[${ts}]`, ...args);
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Request logging: method, path, and after response: status + duration
app.use((req, res, next) => {
  const start = Date.now();
  log(`→ ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    const ms = Date.now() - start;
    log(`← ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

app.use(sessionId);
app.use("/api", api);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const server = app.listen(config.port, () => {
  log(`VoiceIDO backend listening on http://localhost:${config.port}`);
});

// Long-running pipeline requests must never be interrupted by server timeout
server.timeout = config.requestTimeoutMs;
server.keepAliveTimeout = Math.max(server.timeout + 10_000, 65_000);
server.headersTimeout = Math.max(server.keepAliveTimeout + 10_000, 66_000);
log(`Server request timeout: ${config.requestTimeoutMs / 1000}s (long-run safe)`);
