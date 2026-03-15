"use client";

import Link from "next/link";
import Image from "next/image";
import { useRefresh } from "@/lib/RefreshContext";
import HeaderSessionStats from "./HeaderSessionStats";
import CodeRain from "./CodeRain";

type Props = { children: React.ReactNode; sessionId: string; apiBase: string };

export default function AppShell({ children, sessionId, apiBase }: Props) {
  const base = `/${sessionId}`;
  const { refreshTrigger } = useRefresh();

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="bg-lines absolute inset-0 pointer-events-none" aria-hidden />
      <CodeRain />
      <header className="relative z-10 flex-shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-6">
          <Link
            href={base}
            className="flex items-center shrink-0 text-white hover:opacity-90 transition-opacity"
            aria-label="VoiceIDO home"
          >
            <Image
              src="/voiceido.png"
              alt="VoiceIDO"
              width={320}
              height={72}
              className="h-16 w-auto object-contain object-left sm:h-20"
              priority
            />
          </Link>
          <HeaderSessionStats
            apiBase={apiBase}
            sessionId={sessionId}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </header>
      <div className="relative z-10 flex-1 min-h-0 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-4 py-6 w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
