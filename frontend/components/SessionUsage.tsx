"use client";

import { useState, useEffect } from "react";
import { getSessionShortId } from "@/lib/session";
import { getSessionStats, type SessionStats } from "@/lib/api";

type Props = { apiBase: string; refreshTrigger?: number };

export default function SessionUsage({ apiBase, refreshTrigger = 0 }: Props) {
  const [sessionId, setSessionId] = useState("");
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionId(getSessionShortId());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSessionStats(apiBase)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [apiBase, refreshTrigger]);

  return (
    <section className="rounded border border-white/10 bg-black/40 backdrop-blur px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <span className="text-zinc-500">
          Session: <code className="text-zinc-400 font-mono">{sessionId || "…"}</code>
        </span>
        {loading ? (
          <span className="text-zinc-500">Loading usage…</span>
        ) : stats ? (
          <>
            <span className="text-zinc-500">
              Total runs: <strong className="text-white font-medium">{stats.total}</strong>
            </span>
            <span className="text-zinc-500">
              OCR <strong className="text-blue-400">{stats.counts.ocr}</strong>
              {" · "}
              Analyze <strong className="text-blue-400">{stats.counts.analyze}</strong>
              {" · "}
              Transcribe <strong className="text-orange-400">{stats.counts.transcribe}</strong>
              {" · "}
              Video <strong className="text-orange-400">{stats.counts.video}</strong>
            </span>
            {stats.lastSeen && (
              <span className="text-zinc-500">
                Last: {new Date(stats.lastSeen).toLocaleString()}
              </span>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
