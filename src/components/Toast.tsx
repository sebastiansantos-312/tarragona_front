import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface ToastItem { id: number; type: "ok" | "err" | "info"; msg: string; }

let uid = 0;
let push: ((t: Omit<ToastItem, "id">) => void) | null = null;

export const toast = {
  ok: (msg: string) => push?.({ type: "ok", msg }),
  err: (msg: string) => push?.({ type: "err", msg }),
  info: (msg: string) => push?.({ type: "info", msg }),
};

const CFG = {
  ok: { bg: "rgba(31,204,106,0.1)", border: "rgba(31,204,106,0.2)", dot: "#1fcc6a" },
  err: { bg: "rgba(240,64,96,0.1)", border: "rgba(240,64,96,0.2)", dot: "#f04060" },
  info: { bg: "rgba(91,94,244,0.1)", border: "rgba(91,94,244,0.2)", dot: "#7b7ef8" },
};

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>([]);

  const add = useCallback((t: Omit<ToastItem, "id">) => {
    const id = ++uid;
    setList(p => [...p, { ...t, id }]);
    setTimeout(() => setList(p => p.filter(x => x.id !== id)), 3800);
  }, []);

  useEffect(() => { push = add; return () => { push = null; }; }, [add]);

  return createPortal(
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
      {list.map(t => {
        const c = CFG[t.type];
        return (
          <div key={t.id} style={{
            background: "var(--surface)", border: `1px solid ${c.border}`,
            borderRadius: 9, padding: "11px 14px",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
            animation: "fi 0.18s ease",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
            <span style={{ fontSize: "0.83rem", color: "var(--text)", fontWeight: 450 }}>{t.msg}</span>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
