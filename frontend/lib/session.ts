/** In-memory only: new session on every page load/refresh */
let currentSessionId: string | null = null;

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  if (!currentSessionId) {
    currentSessionId = randomId();
  }
  return currentSessionId;
}

/** First 8 chars of session id for URL display (e.g. 7c183d7a) */
export function getSessionShortId(): string {
  const id = getSessionId();
  if (!id) return "";
  return id.replace(/-/g, "").slice(0, 8);
}

export function sessionHeaders(): Record<string, string> {
  const id = getSessionId();
  return id ? { "X-Session-Id": id } : {};
}
