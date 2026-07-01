"use client";
import { useEffect } from "react";

export interface Toast {
  id: string;
  title: string;
  body?: string;
  type?: "alert" | "news" | "score" | "info";
  url?: string;
}

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<string, string> = {
  alert: "🔔",
  news:  "📰",
  score: "📊",
  info:  "ℹ️",
};

export default function NotificationToast({ toasts, onDismiss }: Props) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const t = setTimeout(() => onDismiss(latest.id), 5000);
    return () => clearTimeout(t);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, maxWidth: 340, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", pointerEvents: "all", animation: "slideIn .25s ease", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>
            {ICONS[t.type ?? "info"] ?? "🔔"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t.title}
            </div>
            {t.body && (
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {t.body}
              </div>
            )}
            {t.url && (
              <a href={t.url} style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none", marginTop: 6, display: "inline-block", fontWeight: 600 }}>
                ดูรายละเอียด →
              </a>
            )}
          </div>
          <button onClick={() => onDismiss(t.id)}
            style={{ background: "none", border: "none", color: "var(--faint)", fontSize: 16, cursor: "pointer", flexShrink: 0, lineHeight: 1, padding: 0, marginTop: 1 }}>
            ✕
          </button>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}
