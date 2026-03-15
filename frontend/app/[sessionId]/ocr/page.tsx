"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { getSessionShortId } from "@/lib/session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OCRPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    const shortId = getSessionShortId();
    if (shortId && sessionId !== shortId) {
      router.replace(`/${shortId}`);
    }
  }, [sessionId, router]);

  return <Dashboard apiBase={API_BASE} />;
}
