import { sessionHeaders } from "./session";

export type SessionStats = {
  sessionId: string;
  firstSeen: string | null;
  lastSeen: string | null;
  counts: { ocr: number; analyze: number; transcribe: number; video: number };
  total: number;
  requests: { at: string; useCase: string }[];
};

export async function fetchWithSession(
  apiBase: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;
  const headers = new Headers(options.headers);
  Object.entries(sessionHeaders()).forEach(([k, v]) => headers.set(k, v));
  return fetch(url, { ...options, headers });
}

export async function getSessionStats(apiBase: string): Promise<SessionStats> {
  const res = await fetchWithSession(apiBase, "/api/session/stats");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load session stats");
  return data;
}
