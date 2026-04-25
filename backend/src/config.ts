import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load backend/.env first, then OCR repo root .env so one file works for both Python and VoiceIDO
dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });
dotenv.config(); // process.cwd() .env (e.g. backend/.env)

/** Timeout for long-running pipeline requests (OCR, analyze, transcribe, video). Never interrupt. */
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 60 * 60 * 1000; // 1 hour default

/** Max video frames to process (safety cap). At 1 fps this is ~1 hour of video. */
const MAX_VIDEO_FRAMES = Number(process.env.MAX_VIDEO_FRAMES) || 3600;

export const config = {
  port: Number(process.env.PORT) || 4000,
  gcpCredentialsPath: process.env.GCP_CREDENTIALS_PATH ?? "",
  gcpProjectId: process.env.GCP_PROJECT_ID ?? "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterUrl: "https://openrouter.ai/api/v1/chat/completions",
  // Default to a widely-available multimodal model; override via OPENROUTER_MODEL.
  analysisModel: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  uploadDir: process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"),
  maxTimelineChars: Number(process.env.MAX_TIMELINE_CHARS) || 80_000,
  /** Request timeout for pipeline endpoints so long runs are never interrupted. */
  requestTimeoutMs: REQUEST_TIMEOUT_MS,
  /** Max frames to OCR in video pipeline (chunk cap). */
  maxVideoFrames: MAX_VIDEO_FRAMES,
} as const;

if (config.gcpCredentialsPath) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = config.gcpCredentialsPath;
}
