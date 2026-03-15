export type UseCase = "ocr" | "analyze" | "transcribe" | "video";

export type SessionRecord = {
  at: string; // ISO timestamp
  useCase: UseCase;
};

export type SessionData = {
  sessionId: string;
  firstSeen: string; // ISO
  lastSeen: string; // ISO
  requests: SessionRecord[];
  counts: Record<UseCase, number>;
};

const sessions = new Map<string, SessionData>();

function ensureSession(sessionId: string): SessionData {
  let data = sessions.get(sessionId);
  if (!data) {
    const now = new Date().toISOString();
    data = {
      sessionId,
      firstSeen: now,
      lastSeen: now,
      requests: [],
      counts: { ocr: 0, analyze: 0, transcribe: 0, video: 0 },
    };
    sessions.set(sessionId, data);
  }
  return data;
}

export function record(sessionId: string, useCase: UseCase): void {
  const id = sessionId || "anonymous";
  const data = ensureSession(id);
  const now = new Date().toISOString();
  data.lastSeen = now;
  data.requests.push({ at: now, useCase });
  data.counts[useCase] = (data.counts[useCase] ?? 0) + 1;
}

export function getSessionStats(sessionId: string): SessionData | null {
  if (!sessionId) return null;
  return sessions.get(sessionId) ?? null;
}

export function getAllSessions(): SessionData[] {
  return Array.from(sessions.values());
}
