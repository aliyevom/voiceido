"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getResult } from "@/lib/runHistory";

export default function ViewResultPage() {
  const params = useParams();
  const runIdParam = params.runId as string;
  const [content, setContent] = useState<React.ReactNode>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const data = getResult(runIdParam);
    if (!data) {
      setNotFound(true);
      return;
    }
    if (data.type === "video" && typeof data.content === "object" && data.content !== null) {
      const c = data.content as {
        summary?: string;
        timeline?: { timestamp: number; text: string }[];
        duration?: number;
        frameCount?: number;
      };
      setContent(
        <div className="space-y-6 max-w-3xl mx-auto p-6">
          {(c.frameCount != null || c.duration != null) && (
            <p className="text-sm text-zinc-500">
              {c.frameCount != null && `${c.frameCount} frames`}
              {c.duration != null && ` · ${c.duration.toFixed(1)}s`}
            </p>
          )}
          {c.summary && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Summary
              </h2>
              <pre className="whitespace-pre-wrap text-zinc-300 font-sans text-sm">
                {c.summary}
              </pre>
            </section>
          )}
          {c.timeline && c.timeline.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Timeline
              </h2>
              <pre className="whitespace-pre-wrap text-zinc-400 font-mono text-xs max-h-[60vh] overflow-auto">
                {c.timeline
                  .map(
                    (e) =>
                      `[${Math.floor(e.timestamp / 60)}:${String(Math.floor(e.timestamp % 60)).padStart(2, "0")}] ${e.text}`
                  )
                  .join("\n")}
              </pre>
            </section>
          )}
        </div>
      );
    } else {
      const text = typeof data.content === "string" ? data.content : JSON.stringify(data.content, null, 2);
      setContent(
        <pre className="max-w-3xl mx-auto p-6 whitespace-pre-wrap text-zinc-300 font-mono text-sm overflow-auto">
          {text || "(empty)"}
        </pre>
      );
    }
  }, [runIdParam]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-400 flex items-center justify-center p-6">
        <p>Result expired or not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="border-b border-white/10 py-3 px-4">
        <p className="text-sm text-zinc-500">View result</p>
      </div>
      {content}
    </div>
  );
}
