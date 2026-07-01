"use client";
import { useState } from "react";
import { useLang } from "@/lib/LangContext";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLang();
  if (dismissed) return null;
  return (
    <div style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)", padding: "8px 20px", display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--muted)", flexWrap: "wrap" }}>
      <span style={{ color: "var(--yellow)", fontWeight: 700, flexShrink: 0 }}>{t.disclaimer_warning}</span>
      <span style={{ flex: 1 }}>{t.disclaimer_text}</span>
      <a href="/disclaimer" style={{ color: "var(--accent)", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{t.disclaimer_read}</a>
      <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", fontSize: 16, flexShrink: 0, padding: "0 4px" }}>✕</button>
    </div>
  );
}

export function DisclaimerFooter() {
  const { t } = useLang();
  return (
    <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--faint)", textAlign: "center" }}>
      <span>{t.copyright}</span>
      <span>·</span>
      <a href="/disclaimer" style={{ color: "var(--faint)" }}>Disclaimer</a>
      <span>·</span>
      <span>{t.disclaimer_footer}</span>
    </div>
  );
}
