"use client";

import { useParams } from "next/navigation";
import { useRefresh } from "@/lib/RefreshContext";
import OCRCard from "./OCRCard";
import AnalyzeCard from "./AnalyzeCard";
import TranscribeCard from "./TranscribeCard";
import VideoCard from "./VideoCard";

export type FocusSection = "ocr" | "analyze" | "transcribe" | "video";

type Props = { apiBase: string; focus?: FocusSection };

export default function Dashboard({ apiBase, focus }: Props) {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || "";
  const { onGenerated } = useRefresh();
  const showAll = !focus;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {(showAll || focus === "ocr") && (
          <OCRCard apiBase={apiBase} onGenerated={onGenerated} />
        )}
        {(showAll || focus === "analyze") && (
          <AnalyzeCard apiBase={apiBase} onGenerated={onGenerated} />
        )}
        {(showAll || focus === "transcribe") && (
          <TranscribeCard apiBase={apiBase} onGenerated={onGenerated} />
        )}
        {(showAll || focus === "video") && (
          <VideoCard apiBase={apiBase} onGenerated={onGenerated} />
        )}
      </div>
    </div>
  );
}
