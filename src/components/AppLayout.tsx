"use client";
import { useState, useEffect } from "react";
import { DisclaimerBanner, DisclaimerFooter } from "./Disclaimer";

// ── Nav definition ──────────────────────────────────────────
const NAV = [
  { id: "dashboard",  icon: "⊞",  label: "Dashboard",      group: "หลัก" },
  { id: "screener",   icon: "🤖", label: "AI Screener",    group: "หลัก" },
  { id: "compare",    icon: "⚡", label: "Compare Stocks", group: "หลัก" },
  { id: "watchlist",  icon: "⭐", label: "Watchlist",      group: "Portfolio" },
  { id: "portfolio",  icon: "💼", label: "Portfolio",      group: "Portfolio" },
  { id: "alerts",     icon: "🔔", label: "Alerts",         group: "Portfolio" },
  { id: "market",     icon: "🌎", label: "Market",         group: "Research" },
  { id: "news",       icon: "📰", label: "AI News",        group: "Research" },
  { id: "learn",      icon: "📚", label: "Learn",          group: "Research" },
  { id: "settings",   icon: "⚙️", label: "Settings",       group: "บัญชี" },
];

// ── Market Ticker data (static placeholder) ────────────────
const TICKERS = [
  { label: "S&P 500", value: "5,278", change: "+0.4%", up: true },
  { label: "NASDAQ",  value: "18,412", change: "+0.7%", up: true },
  { label: "DOW",     value: "39,156", change: "-0.1%", up: false },
  { label: "VIX",     value: "13.2",  change: "-2.1%", up: false },
  { label: "Gold",    value: "2,329", change: "+0.3%", up: true },
  { label: "BTC",     value: "67,420", change: "+1.2%", up: true },
  { label: "DXY",     value: "104.8", change: "-0.2%", up: false },
  { label: "10Y",     value: "4.42%", change: "+0.02", up: true },
];

function MarketTickerBar() {
  return (
    <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "6px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", gap: 32, overflowX: "auto", padding: "0 20px", scrollbarWidth: "none" }}>
        {TICKERS.map(t => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{t.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{t.value}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.up ? "var(--green)" : "var(--red)" }}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarContent({ active, setActive, closeSidebar }: { active: string; setActive: (id: string) => void; closeSidebar: () => void }) {
  const groups = [...new Set(NAV.map(n => n.group))];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0 }}>U</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>USAXresearch</div>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 0.5 }}>AI Stock Research</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {groups.map(group => (
          <div key={group}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--faint)", letterSpacing: 1.2, padding: "14px 8px 5px", textTransform: "uppercase" }}>{group}</div>
            {NAV.filter(n => n.group === group).map(n => {
              const isActive = active === n.id;
              return (
                <div key={n.id}
                  onClick={() => { setActive(n.id); closeSidebar(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 2, background: isActive ? "rgba(59,130,246,0.12)" : "transparent", color: isActive ? "var(--accent)" : "var(--muted)", fontSize: 14, fontWeight: isActive ? 600 : 400, transition: "all .15s" }}>
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
                  <span>{n.label}</span>
                  {n.id === "alerts" && <span style={{ marginLeft: "auto", background: "var(--accent)", color: "#fff", borderRadius: 99, fontSize: 9, fontWeight: 700, padding: "1px 6px" }}>3</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* User card */}
      <div style={{ padding: "12px 12px 16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-raised)", borderRadius: 12 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #F59E0B, #EF4444)", borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>T</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Tony Stark</div>
            <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>Premium Plan</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--faint)", cursor: "pointer" }}>⚙️</div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ active, onMenuClick, onThemeToggle, theme }: any) {
  const navLabel = NAV.find(n => n.id === active)?.label ?? active;
  return (
    <div style={{ height: 56, background: "var(--bg-card)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, padding: "0 20px", flexShrink: 0 }}>
      {/* Mobile menu */}
      <button onClick={onMenuClick} style={{ display: "none", background: "none", border: "none", color: "var(--text)", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1 }} className="mobile-menu-btn">☰</button>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
        <span>USAXresearch</span>
        <span>/</span>
        <span style={{ color: "var(--text)", fontWeight: 600 }}>{navLabel}</span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--faint)" }}>🔍</span>
        <input placeholder="ค้นหาหุ้น เช่น NVDA, AAPL, TSLA..." style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", padding: "8px 12px 8px 36px", fontSize: 13, outline: "none" }} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        <button onClick={onThemeToggle}
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 14, cursor: "pointer", color: "var(--muted)" }}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <div style={{ position: "relative" }}>
          <button style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 14, cursor: "pointer", color: "var(--muted)" }}>🔔</button>
          <div style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "var(--red)", borderRadius: 99, border: "2px solid var(--bg-card)" }} />
        </div>
        <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #F59E0B, #EF4444)", borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer" }}>T</div>
      </div>
    </div>
  );
}

// ── Page components (stub → replace with real pages) ────────
function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "var(--faint)" }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--muted)" }}>{title}</div>
      <div style={{ fontSize: 13 }}>กำลังสร้าง...</div>
    </div>
  );
}

// ── Main AppLayout ──────────────────────────────────────────
export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("usax-theme") ?? "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved === "light" ? "light" : "");
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("usax-theme", next);
    document.documentElement.setAttribute("data-theme", next === "light" ? "light" : "");
  }

  const pageForActive = () => {
    if (active === "dashboard" && children) return children;
    const map: Record<string, { title: string; icon: string }> = {
      screener:  { title: "AI Screener", icon: "🤖" },
      compare:   { title: "Compare Stocks", icon: "⚡" },
      watchlist: { title: "Watchlist", icon: "⭐" },
      portfolio: { title: "Portfolio", icon: "💼" },
      alerts:    { title: "Alerts", icon: "🔔" },
      market:    { title: "Market Overview", icon: "🌎" },
      news:      { title: "AI News", icon: "📰" },
      learn:     { title: "Learn", icon: "📚" },
      settings:  { title: "Settings", icon: "⚙️" },
    };
    const p = map[active];
    return p ? <PlaceholderPage title={p.title} icon={p.icon} /> : children;
  };

  const SIDEBAR_W = 220;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div style={{
        width: SIDEBAR_W, flexShrink: 0, background: "var(--bg-card)", borderRight: "1px solid var(--border)",
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (sidebarOpen ? 0 : -SIDEBAR_W) : undefined,
        top: 0, bottom: 0, zIndex: isMobile ? 50 : undefined,
        transition: "left .25s cubic-bezier(.4,0,.2,1)",
        height: "100vh",
      }}>
        <SidebarContent active={active} setActive={setActive} closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar active={active} onMenuClick={() => setSidebarOpen(!sidebarOpen)} onThemeToggle={toggleTheme} theme={theme} />
        <DisclaimerBanner />
        <MarketTickerBar />
        <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24 }}>
          {pageForActive()}
          <DisclaimerFooter />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
