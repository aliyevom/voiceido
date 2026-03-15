"use client";

import { useState, useEffect } from "react";
import { getSessionStats, type SessionStats } from "@/lib/api";

type Props = { apiBase: string; sessionId: string; refreshTrigger: number };

export default function HeaderSessionStats({
  apiBase,
  sessionId,
  refreshTrigger,
}: Props) {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

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
    return () => {
      cancelled = true;
    };
  }, [apiBase, refreshTrigger]);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs">
      <span className="header-journal">
        <span className="header-journal-label">Session</span>
        <code className="header-journal-value font-mono ml-1">{sessionId || "…"}</code>
      </span>
      {loading ? (
        <span className="header-journal-label">Loading…</span>
      ) : stats ? (
        <>
          <span className="header-journal">
            <span className="header-journal-label">Runs</span>
            <span className="header-journal-value ml-1 font-semibold">{stats.total}</span>
          </span>
          <span className="header-journal header-journal-pills">
            <span className="header-journal-ocr">OCR</span>
            <span className="header-journal-num">{stats.counts.ocr}</span>
            <span className="header-journal-dot">·</span>
            <span className="header-journal-analyze">Analyze</span>
            <span className="header-journal-num">{stats.counts.analyze}</span>
            <span className="header-journal-dot">·</span>
            <span className="header-journal-transcribe">Transcribe</span>
            <span className="header-journal-num">{stats.counts.transcribe}</span>
            <span className="header-journal-dot">·</span>
            <span className="header-journal-video">Video</span>
            <span className="header-journal-num">{stats.counts.video}</span>
          </span>
        </>
      ) : null}
    </div>
  );
}
