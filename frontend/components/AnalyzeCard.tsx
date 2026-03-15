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

export default function AnalyzeCard({ apiBase, onGenerated }: Props) {
  const params = useParams();
  const sessionShortId = (params?.sessionId as string) || "";
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (sessionShortId) setHistory(getHistory(sessionShortId, "analyze"));
  }, [sessionShortId]);

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetchWithSession(apiBase, "/api/analyze", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      const analysis = data.analysis ?? "";
      const id = addRun(sessionShortId, "analyze", analysis, file.name);
      setHistory((prev) => [
        { id, type: "analyze", at: new Date().toISOString(), fileName: file.name },
        ...prev,
      ]);
      onGenerated?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fileInputId = "analyze-file";
  return (
    <article className="card-container card-accent-blue p-8">
      <div className="flex items-start gap-4 mb-5">
        <IconBox variant="analyze" />
        <div className="min-w-0 flex-1">
          <span className="tag-bubble tag-bubble--blue">Image</span>
          <h3 className="card-category mt-2">Analyze Image</h3>
          <p className="text-base text-zinc-400 mt-1.5">
            Extract and analyze technical diagrams.
          </p>
        </div>
      </div>
      <div className="flex flex-col flex-1 min-h-0 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={!file || loading}
          className="w-full py-3 px-4 text-base btn-primary"
        >
          {loading ? "Analyzing…" : "Analyze"}
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
                      onClick={() => downloadRun(entry.id, "analyze")}
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
