export type RunType = "ocr" | "analyze" | "transcribe" | "video";

export type HistoryEntry = {
  id: string;
  type: RunType;
  at: string;
  fileName?: string;
};

const RESULT_PREFIX = "voiceido_result_";
const HISTORY_KEY = "voiceido_history";
const MAX_HISTORY = 50;

function runId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
}

export function addRun(
  sessionShortId: string,
  type: RunType,
  content: string | Record<string, unknown>,
  fileName?: string
): string {
  const id = runId();
  const key = `${HISTORY_KEY}_${sessionShortId}`;
  const at = new Date().toISOString();
  try {
    const raw = localStorage.getItem(key);
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift({ id, type, at, fileName });
    localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_HISTORY)));
    localStorage.setItem(
      `${RESULT_PREFIX}${id}`,
      JSON.stringify({ type, content })
    );
  } catch {
    // ignore
  }
  return id;
}

export function getHistory(
  sessionShortId: string,
  type: RunType
): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY}_${sessionShortId}`);
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    return list.filter((e) => e.type === type);
  } catch {
    return [];
  }
}

export function getResult(
  runIdParam: string
): { type: RunType; content: string | Record<string, unknown> } | null {
  try {
    const raw = localStorage.getItem(`${RESULT_PREFIX}${runIdParam}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function downloadRun(runIdParam: string, type: RunType): void {
  const data = getResult(runIdParam);
  if (!data) return;
  let blob: Blob;
  let name: string;
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  if (type === "video" && typeof data.content === "object" && data.content !== null) {
    const c = data.content as { summary?: string; timeline?: { timestamp: number; text: string }[] };
    const text = [
      c.summary ? `Summary:\n${c.summary}` : "",
      c.timeline?.length
        ? `\nTimeline:\n${c.timeline.map((e) => `[${Math.floor(e.timestamp / 60)}:${String(Math.floor(e.timestamp % 60)).padStart(2, "0")}] ${e.text}`).join("\n")}`
        : "",
    ].join("\n");
    blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    name = `video-result-${ts}.txt`;
  } else {
    const text = typeof data.content === "string" ? data.content : JSON.stringify(data.content, null, 2);
    blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    name = `${type}-result-${ts}.txt`;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
