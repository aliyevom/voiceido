"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionShortId } from "@/lib/session";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const shortId = getSessionShortId();
    if (shortId) router.replace(`/${shortId}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-400 text-sm">
      Loading…
    </div>
  );
}
