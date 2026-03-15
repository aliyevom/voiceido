import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { ocrImage } from "./vision.js";
import { chat } from "./openrouter.js";
import { config } from "../config.js";

const MAX_TIMELINE_CHARS = config.maxTimelineChars;

export type TimelineEntry = { timestamp: number; text: string };
export type VideoResult = {
  duration: number;
  frameCount: number;
  timeline: TimelineEntry[];
  summary?: string;
};

async function extractFrames(videoPath: string, fps: number): Promise<{ framesDir: string; duration: number; count: number }> {
  const framesDir = path.join(os.tmpdir(), `voiceido_frames_${Date.now()}`);
  const outPattern = path.join(framesDir, "frame_%04d.png");
  await fs.mkdir(framesDir, { recursive: true });

  // Get duration
  const probe = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    { encoding: "utf-8" }
  ).trim();
  const duration = parseFloat(probe) || 0;

  // Extract at fps (e.g. 1 frame per second)
  execSync(
    `ffmpeg -y -i "${videoPath}" -vf fps=${fps} -vsync vfr "${outPattern}"`,
    { stdio: "pipe" }
  );

  const names = await fs.readdir(framesDir);
  const count = names.filter((n) => n.startsWith("frame_") && n.endsWith(".png")).length;
  return { framesDir, duration, count };
}

function truncateForApi(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const half = Math.floor((maxChars - 80) / 2);
  return (
    text.slice(0, half) +
    "\n\n[... timeline truncated for API ...]\n\n" +
    text.slice(-half)
  );
}

export async function videoToText(
  videoPath: string,
  options: { fps?: number; summarize?: boolean } = {}
): Promise<VideoResult> {
  const fps = options.fps ?? 1;
  const summarize = options.summarize !== false;

  console.log("[Video] Extracting frames (ffmpeg, fps=" + fps + ")...");
  const { framesDir, duration, count } = await extractFrames(videoPath, fps);
  console.log("[Video] Extracted", count, "frames, duration", duration.toFixed(1), "s");

  const allFrameFiles = (await fs.readdir(framesDir))
    .filter((n) => n.startsWith("frame_") && n.endsWith(".png"))
    .sort();
  const maxFrames = config.maxVideoFrames;
  const frameFiles = allFrameFiles.slice(0, maxFrames);
  if (allFrameFiles.length > maxFrames) {
    console.log("[Video] Capping at", maxFrames, "frames (config.maxVideoFrames); skipped", allFrameFiles.length - maxFrames);
  }

  const timeline: TimelineEntry[] = [];
  const total = frameFiles.length;
  const BATCH_SIZE = 20;

  for (let i = 0; i < total; i++) {
    if (i % 10 === 0 || i === total - 1) console.log("[Video] OCR frame", i + 1, "/", total);
    const f = path.join(framesDir, frameFiles[i]);
    const timestamp = duration > 0 ? (i / total) * duration : i;
    const text = await ocrImage(f, false).catch(() => "");
    timeline.push({ timestamp, text: text.trim() });
    if ((i + 1) % BATCH_SIZE === 0) {
      await new Promise((r) => setImmediate(r));
    }
  }

  // Cleanup frames
  await fs.rm(framesDir, { recursive: true, force: true }).catch(() => {});

  let summary: string | undefined;
  if (summarize && timeline.length > 0) {
    console.log("[Video] Building timeline text and calling OpenRouter for summary...");
    const fullText = timeline
      .map((e) => {
        const m = Math.floor(e.timestamp / 60);
        const s = Math.floor(e.timestamp % 60);
        return `[${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}] ${e.text}`;
      })
      .join("\n");
    const truncated = truncateForApi(fullText, MAX_TIMELINE_CHARS);
    if (truncated.length < fullText.length) console.log("[Video] Timeline truncated to", truncated.length, "chars for API (max", MAX_TIMELINE_CHARS + ")");
    const analysisPrompt = `You are summarizing a video timeline (OCR text from each frame). Produce a concise, business-oriented summary: what happens in the video, key screens or steps, and any important text (forms, buttons, notifications). Keep the summary under 500 words.`;
    const content = await chat([
      { role: "system", content: analysisPrompt },
      { role: "user", content: truncated },
    ]);
    summary = content ?? undefined;
    console.log("[Video] Summary done,", summary?.length ?? 0, "chars");
  }

  return { duration, frameCount: count, timeline, summary };
}
