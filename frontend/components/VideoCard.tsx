"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import IconBox from "./IconBox";
import { fetchWithSession } from "@/lib/api";
import {
  addRun,
  getHistory,
  downloadRun,
  type HistoryEntry,
} from "@/lib/runHistory";

type Props = { apiBase: string; onGenerated?: () => void };

type VideoApiResult = {
  duration: number;
  frameCount: number;
  timeline: { timestamp: number; text: string }[];
  summary?: string;
};

export default function VideoCard({ apiBase, onGenerated }: Props) {
  const params = useParams();
  const sessionShortId = (params?.sessionId as string) || "";
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(1);
  const [summarize, setSummarize] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (sessionShortId) setHistory(getHistory(sessionShortId, "video"));
  }, [sessionShortId]);

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("fps", String(fps));
    form.append("summarize", String(summarize));
    try {
      const res = await fetchWithSession(apiBase, "/api/video", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      const result: VideoApiResult = data;
      const id = addRun(
        sessionShortId,
        "video",
        {
          summary: result.summary,
          timeline: result.timeline,
          duration: result.duration,
          frameCount: result.frameCount,
        },
        file.name
      );
      setHistory((prev) => [
        {
          id,
          type: "video",
          at: new Date().toISOString(),
          fileName: file.name,
        },
        ...prev,
      ]);
      onGenerated?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fileInputId = "video-file";
  return (
    <article className="card-container card-accent-orange p-8">
      <div className="flex items-start gap-4 mb-5">
        <IconBox variant="video" />
        <div className="min-w-0 flex-1">
          <span className="tag-bubble tag-bubble--orange">Video</span>
          <h3 className="card-category mt-2">Video to Text</h3>
          <p className="text-base text-zinc-400 mt-1.5">
            Extract text from video frames and optional summary.
          </p>
        </div>
      </div>
      <div className="flex flex-col flex-1 min-h-0 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            id={fileInputId}
            type="file"
            accept="video/*"
            className="file-input-hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <label htmlFor={fileInputId} className="btn-file-bubble cursor-pointer">
            Select file
          </label>
          {file && (
            <span className="text-sm text-zinc-500 truncate max-w-[180px]">
              {file.name}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            FPS
            <input
              type="number"
              min={0.5}
              max={5}
              step={0.5}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-16 rounded-full border border-white/10 bg-zinc-800/80 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={summarize}
              onChange={(e) => setSummarize(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-blue-500"
            />
            Summary
          </label>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!file || loading}
          className="w-full py-3 px-4 text-base btn-primary"
        >
          {loading ? "Running…" : "Run"}
        </button>
        {error && (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {history.length > 0 && (
          <div className="mt-auto pt-6 border-t border-white/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Recent runs
            </h4>
            <ul className="space-y-2.5 max-h-48 overflow-auto">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="text-zinc-400 truncate">
                    {new Date(entry.at).toLocaleString()}
                    {entry.fileName && ` · ${entry.fileName}`}
                  </span>
                  <span className="flex gap-1.5 flex-shrink-0">
                    <a
                      href={`/${sessionShortId}/view/${entry.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tag-bubble tag-bubble--action"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadRun(entry.id, "video")}
                      className="tag-bubble tag-bubble--action"
                    >
                      Download
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
