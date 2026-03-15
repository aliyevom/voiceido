import { Router, Request, Response } from "express";
import { upload } from "./upload.js";
import { getSessionId } from "../middleware/session.js";
import * as sessionStore from "../services/sessionStore.js";
import { ocrImage } from "../services/vision.js";
import { analyzeImage } from "../services/analyze.js";
import { transcribe } from "../services/speech.js";
import { videoToText } from "../services/video.js";
import fs from "fs/promises";
import { config } from "../config.js";

const api = Router();

// Single file for all endpoints
const single = upload.single("file");

/** Set long timeout so pipeline requests are never interrupted. */
function setLongTimeout(res: Response): void {
  res.setTimeout(config.requestTimeoutMs, () => {
    // Prevent default socket destroy; we only log. Server timeout is the real cap.
  });
}

api.post("/ocr", single, async (req: Request, res: Response) => {
  setLongTimeout(res);
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Missing file" });
    const preserveLayout = req.body.preserveLayout === "true";
    sessionStore.record(getSessionId(req), "ocr");
    console.log("[OCR] Starting OCR", preserveLayout ? "(layout preserved)" : "", "session:", getSessionId(req).slice(0, 8));
    const text = await ocrImage(file.path, preserveLayout);
    console.log("[OCR] Done,", text.length, "chars");
    await fs.unlink(file.path).catch(() => {});
    return res.json({ text });
  } catch (e) {
    const err = e as Error;
    console.error("[OCR] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

api.post("/analyze", single, async (req: Request, res: Response) => {
  setLongTimeout(res);
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Missing file" });
    sessionStore.record(getSessionId(req), "analyze");
    console.log("[Analyze] Starting diagram analysis", "session:", getSessionId(req).slice(0, 8));
    const analysis = await analyzeImage(file.path);
    console.log("[Analyze] Done,", analysis.length, "chars");
    await fs.unlink(file.path).catch(() => {});
    return res.json({ analysis });
  } catch (e) {
    const err = e as Error;
    console.error("[Analyze] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

api.post("/transcribe", single, async (req: Request, res: Response) => {
  setLongTimeout(res);
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Missing file" });
    const languageCode = (req.body.languageCode as string) || "en-US";
    sessionStore.record(getSessionId(req), "transcribe");
    console.log("[Transcribe] Starting, language:", languageCode, "session:", getSessionId(req).slice(0, 8));
    const text = await transcribe(file.path, languageCode);
    console.log("[Transcribe] Done,", text.length, "chars");
    await fs.unlink(file.path).catch(() => {});
    return res.json({ text });
  } catch (e) {
    const err = e as Error;
    console.error("[Transcribe] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

api.post("/video", single, async (req: Request, res: Response) => {
  setLongTimeout(res);
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Missing file" });
    const fps = Number(req.body.fps) || 1;
    const summarize = req.body.summarize !== "false";
    sessionStore.record(getSessionId(req), "video");
    console.log("[Video] Starting, fps:", fps, "summarize:", summarize, "session:", getSessionId(req).slice(0, 8));
    const result = await videoToText(file.path, { fps, summarize });
    console.log("[Video] Done,", result.frameCount, "frames, timeline", result.timeline.length, "entries");
    await fs.unlink(file.path).catch(() => {});
    return res.json(result);
  } catch (e) {
    const err = e as Error;
    console.error("[Video] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Session usage for the current session (client sends X-Session-Id)
api.get("/session/stats", (req: Request, res: Response) => {
  const id = getSessionId(req);
  const stats = sessionStore.getSessionStats(id);
  if (!stats) {
    return res.json({
      sessionId: id,
      firstSeen: null,
      lastSeen: null,
      counts: { ocr: 0, analyze: 0, transcribe: 0, video: 0 },
      total: 0,
      requests: [],
    });
  }
  return res.json({
    sessionId: stats.sessionId,
    firstSeen: stats.firstSeen,
    lastSeen: stats.lastSeen,
    counts: stats.counts,
    total: stats.requests.length,
    requests: stats.requests.slice(-50), // last 50 for display
  });
});

export default api;
