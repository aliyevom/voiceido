import AppShell from "@/components/AppShell";
import { RefreshProvider } from "@/lib/RefreshContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function SessionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <RefreshProvider>
      <AppShell sessionId={sessionId} apiBase={API_BASE}>
        {children}
      </AppShell>
    </RefreshProvider>
  );
}
