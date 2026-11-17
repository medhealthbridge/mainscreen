"use client";
import { createContext, useContext, useState } from "react";
import type { Need } from "@/content/projects";

/**
 * Shared answer to "What's slowing your business down?".
 * Used to highlight relevant projects and prefill the inquiry form.
 * Everything stays fully usable when nothing is selected.
 */
type Ctx = { need: Need | null; setNeed: (n: Need | null) => void };
const NeedCtx = createContext<Ctx>({ need: null, setNeed: () => {} });

export function NeedProvider({ children }: { children: React.ReactNode }) {
  const [need, setNeed] = useState<Need | null>(null);
  return <NeedCtx.Provider value={{ need, setNeed }}>{children}</NeedCtx.Provider>;
}
export const useNeed = () => useContext(NeedCtx);
