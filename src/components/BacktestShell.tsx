"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import BacktestPage from "./BacktestPage";

// Public, no-login wrapper for the backtest (the rest of the app is closed — see src/proxy.ts).
export default function BacktestShell() {
  const { lang, setLang } = useLang();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Sync with the value the root layout's inline script already applied before paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("usax-theme", next); } catch {}
    document.documentElement.setAttribute("data-theme", next);
  };

  const btn: React.CSSProperties = {
    height: 36, minWidth: 36, padding: "0 10px", borderRadius: 10, border: "1px solid var(--border)",
    background: "var(--bg-card)", color: "var(--text)", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/LogoUSAX.png" alt="USAX Research" style={{ height: 38, width: "auto", borderRadius: 6, marginRight: "auto" }} />
          <button type="button" style={btn} onClick={() => setLang(lang === "th" ? "en" : "th")} aria-label="Language">{lang === "th" ? "EN" : "TH"}</button>
          <button type="button" style={btn} onClick={toggleTheme} aria-label="Theme">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>
      <main style={{ padding: "20px 16px" }}>
        <BacktestPage lang={lang} />
      </main>
    </div>
  );
}
