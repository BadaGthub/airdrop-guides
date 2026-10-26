"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Toast = { id: number; kind: "success" | "error"; message: string };
type Ctx = { success: (m: string) => void; error: (m: string) => void };

const ToastCtx = createContext<Ctx>({ success: () => {}, error: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const ctx: Ctx = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto max-w-sm rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              t.kind === "error" ? "bg-red-600" : "bg-ink"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
