import axios from "axios";
import { config } from "../config.js";

const OPENROUTER_TIMEOUT_MS = 300_000; // 5 min for large analyses
const OPENROUTER_RETRIES = 1;

export type Message = { role: "user" | "assistant" | "system"; content: string | OpenRouterContent[] };
export type OpenRouterContent = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export async function chat(
  messages: Message[],
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<string | null> {
  const { maxTokens = 8192, temperature = 0.2 } = opts;
  if (!config.openRouterApiKey) throw new Error("OPENROUTER_API_KEY is not set.");

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= OPENROUTER_RETRIES; attempt++) {
    try {
      const { data } = await axios.post(
        config.openRouterUrl,
        {
          model: config.analysisModel,
          messages,
          max_tokens: maxTokens,
          temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${config.openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://voiceido.local",
            "X-Title": "VoiceIDO",
          },
          timeout: OPENROUTER_TIMEOUT_MS,
        }
      );
      const content = data?.choices?.[0]?.message?.content;
      return content ?? null;
    } catch (e) {
      lastErr = e as Error;
      const isRetryable =
        axios.isAxiosError(e) &&
        (e.code === "ECONNABORTED" || e.response?.status === 408 || e.response?.status === 502 || e.response?.status === 503);
      if (attempt < OPENROUTER_RETRIES && isRetryable) {
        console.warn("[OpenRouter] Retry after", lastErr.message);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr ?? new Error("OpenRouter request failed");
}
