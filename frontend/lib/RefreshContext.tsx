"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type RefreshContextValue = {
  refreshTrigger: number;
  onGenerated: () => void;
};

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const onGenerated = useCallback(() => setRefreshTrigger((t) => t + 1), []);
  return (
    <RefreshContext.Provider value={{ refreshTrigger, onGenerated }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh(): RefreshContextValue {
  const ctx = useContext(RefreshContext);
  if (!ctx) {
    return {
      refreshTrigger: 0,
      onGenerated: () => {},
    };
  }
  return ctx;
}
