"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLang } from "@/lib/LangContext";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLang();

  if (dismissed) return null;

  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-icon" aria-hidden="true">
        <AlertTriangle size={16} />
      </div>
      <div className="disclaimer-copy">
        <strong>{t.disclaimer_warning.replace("⚠️", "").trim()}</strong>
        <span>{t.disclaimer_text}</span>
      </div>
      <a className="disclaimer-link" href="/disclaimer">
        {t.disclaimer_read}
      </a>
      <button
        className="disclaimer-close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss warning"
      >
        <X size={18} />
      </button>
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
