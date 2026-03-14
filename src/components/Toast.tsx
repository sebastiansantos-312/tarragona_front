import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface ToastItem {
  readonly id: number;
  readonly type: "success" | "error" | "info";
  readonly message: string;
}

let toastId = 0;
let addToastFn: ((t: Omit<ToastItem, "id">) => void) | null = null;

export const toast = {
  success: (message: string) => addToastFn?.({ type: "success", message }),
  error: (message: string) => addToastFn?.({ type: "error", message }),
  info: (message: string) => addToastFn?.({ type: "info", message }),
};

const ICONS: Record<ToastItem["type"], string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const COLORS: Record<ToastItem["type"], { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)", icon: "#22c55e" },
  error: { bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.25)", icon: "#f43f5e" },
  info: { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", icon: "#818cf8" },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((t: Omit<ToastItem, "id">) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

  useEffect(() => {
    addToastFn = add;
    return () => { addToastFn = null; };
  }, [add]);

  return createPortal(
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10, maxWidth: 380,
    }}>
      {toasts.map(t => {
        const c = COLORS[t.type];
        return (
          <div key={t.id} style={{
            background: "var(--surface)",
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            animation: "fadeIn 0.2s ease",
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              background: c.bg, border: `1px solid ${c.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: c.icon, fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {ICONS[t.type]}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 500 }}>
              {t.message}
            </span>
          </div>
        );
      })}
    </div>,
    document.body
  );
}