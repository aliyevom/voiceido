import speech from "@google-cloud/speech";
import { config } from "../config.js";
import fs from "fs/promises";
import fssync from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

const MAX_REQUEST_BYTES = 10 * 1024 * 1024; // 10 MB
const CHUNK_SECONDS = 55;

let client: speech.SpeechClient | null = null;

function getClient(): speech.SpeechClient {
  if (!client) {
    client = config.gcpCredentialsPath
      ? new speech.SpeechClient({ keyFilename: config.gcpCredentialsPath })
      : new speech.SpeechClient(); // Use Application Default Credentials on GCE/Cloud
  }
  return client;
}

export async function ensureWav(inputPath: string): Promise<string> {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === ".wav") return inputPath;

  console.log("[Speech] Converting to mono 16kHz WAV (ffmpeg)...");
  const outPath = path.join(os.tmpdir(), `voiceido_${Date.now()}.wav`);
  execSync(
    `ffmpeg -y -i "${inputPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${outPath}"`,
    { stdio: "pipe" }
  );
  console.log("[Speech] WAV ready:", outPath);
  return outPath;
}

async function transcribeOne(wavPath: string, languageCode = "en-US"): Promise<string> {
  const c = getClient();
  const content = await fs.readFile(wavPath);
  const [response] = await c.recognize({
    config: {
      encoding: "LINEAR16" as const,
      sampleRateHertz: 16000,
      languageCode,
      enableAutomaticPunctuation: true,
    },
    audio: { content: content as unknown as Uint8Array },
  });

  const lines: string[] = [];
  for (const result of response.results ?? []) {
    const transcript = result.alternatives?.[0]?.transcript?.trim();
    if (transcript) lines.push(transcript);
  }
  return lines.join("\n");
}

function splitWavIntoChunks(wavPath: string): string[] {
  const tmpDir = path.join(os.tmpdir(), `voiceido_chunks_${Date.now()}`);
  fs.mkdir(tmpDir, { recursive: true }).catch(() => {});
  const pattern = path.join(tmpDir, "chunk_%03d.wav");
  execSync(
    `ffmpeg -y -i "${wavPath}" -f segment -segment_time ${CHUNK_SECONDS} -c copy "${pattern}"`,
    { stdio: "pipe" }
  );
  const dir = fssync.readdirSync(tmpDir);
  return dir
    .filter((f: string) => f.startsWith("chunk_") && f.endsWith(".wav"))
    .sort()
    .map((f: string) => path.join(tmpDir, f));
}

export async function transcribe(
  inputPath: string,
  languageCode = "en-US"
): Promise<string> {
  const needsConversion = path.extname(inputPath).toLowerCase() !== ".wav";
  const wavPath = await ensureWav(inputPath);
  const stat = await fs.stat(wavPath);
  let chunkDir: string | null = null;
  try {
    if (stat.size <= MAX_REQUEST_BYTES) {
      console.log("[Speech] Transcribing (single request)...");
      return await transcribeOne(wavPath, languageCode);
    }
    const chunks = splitWavIntoChunks(wavPath);
    chunkDir = chunks.length > 0 ? path.dirname(chunks[0]) : null;
    console.log("[Speech] Large file: transcribing", chunks.length, "chunks");
    const parts: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log("[Speech] Chunk", i + 1, "/", chunks.length);
      const part = await transcribeOne(chunks[i], languageCode);
      if (part) parts.push(part);
    }
    return parts.join("\n\n").trim();
  } finally {
    if (needsConversion && wavPath !== inputPath) {
      await fs.unlink(wavPath).catch(() => {});
    }
    if (chunkDir) {
      await fs.rm(chunkDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
