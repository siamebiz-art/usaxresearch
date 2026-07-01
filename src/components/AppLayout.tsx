"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Brain, ArrowLeftRight, Star, Briefcase, Bell,
  Globe, Newspaper, Calendar, TrendingUp, FileText, Lightbulb, BookOpen,
  Search, ChevronDown, Sun, Moon, LogOut, Settings, Menu, X,
  Crown, Zap, TrendingDown, Rocket, Gem, BarChart2, Cpu, ShieldCheck,
  Coins, DollarSign, ArrowRight,
} from "lucide-react";
import { DisclaimerBanner, DisclaimerFooter } from "./Disclaimer";
import PaymentModal from "./PaymentModal";
import { useLang } from "@/lib/LangContext";
import { SCREENERS } from "./DashboardHome";
import ScreenerResults from "./ScreenerResults";
import SettingsPage from "./SettingsPage";
import ComparePage from "./ComparePage";
import WatchlistPage from "./WatchlistPage";
import MarketOverviewPage from "./MarketOverviewPage";
import EarningsPage from "./EarningsPage";
import NewsPage from "./NewsPage";
import AlertsPage from "./AlertsPage";
import StockDetailPage from "./StockDetailPage";
import PortfolioPage from "./PortfolioPage";
import EconomicCalendarPage from "./EconomicCalendarPage";
import AnalysisPage from "./AnalysisPage";
import IdeasPage from "./IdeasPage";
import EducationPage from "./EducationPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Nav definition ────────────────────────────────────────────
type NavItem = { id: string; group: string; icon: React.ReactNode; isNew?: boolean };

const NAV: NavItem[] = [
  { id: "dashboard", group: "top",      icon: <LayoutDashboard size={16} /> },
  { id: "screener",  group: "tools",    icon: <Brain          size={16} />, isNew: true },
  { id: "watchlist", group: "tools",    icon: <Star           size={16} /> },
  { id: "portfolio", group: "tools",    icon: <Briefcase      size={16} /> },
  { id: "compare",   group: "tools",    icon: <ArrowLeftRight size={16} /> },
  { id: "market",    group: "research", icon: <Globe          size={16} /> },
  { id: "news",      group: "research", icon: <Newspaper      size={16} /> },
  { id: "earnings",  group: "research", icon: <Calendar       size={16} /> },
  { id: "education", group: "learn",    icon: <BookOpen       size={16} /> },
  { id: "settings",  group: "account",  icon: <Settings       size={16} /> },
];

const GROUP_LABELS: Record<string, Record<string, string>> = {
  top:      { th: "",          en: "" },
  tools:    { th: "AI TOOLS",  en: "AI TOOLS" },
  research: { th: "RESEARCH",  en: "RESEARCH" },
  learn:    { th: "LEARN",     en: "LEARN" },
  account:  { th: "ACCOUNT",   en: "ACCOUNT" },
};

const NAV_LABELS: Record<string, Record<string, string>> = {
  dashboard: { th: "แดชบอร์ด",          en: "Dashboard" },
  screener:  { th: "คัดหุ้นด้วย AI",    en: "AI Screener" },
  compare:   { th: "เปรียบเทียบหุ้น",   en: "Compare Stocks" },
  watchlist: { th: "AI Watchlist",      en: "AI Watchlist" },
  portfolio: { th: "Portfolio Analysis",en: "Portfolio Analysis" },
  "stock-detail": { th: "รายละเอียดหุ้น", en: "Stock Detail" },
  alerts:    { th: "AI Alerts",         en: "AI Alerts" },
  market:    { th: "Market Overview",   en: "Market Overview" },
  news:      { th: "ข่าวสารตลาด",       en: "Market News" },
  earnings:  { th: "Earnings Calendar", en: "Earnings Calendar" },
  economic:  { th: "Economic Calendar", en: "Economic Calendar" },
  analysis:  { th: "บทวิเคราะห์",       en: "Research Reports" },
  ideas:     { th: "ไอเดียการลงทุน",    en: "Investment Ideas" },
  education: { th: "ความรู้การลงทุน",   en: "Investor Education" },
  settings:  { th: "ตั้งค่า",           en: "Settings" },
};

const TICKERS = [
  { label: "S&P 500", value: "5,487", change: "+0.54%", up: true },
  { label: "NASDAQ",  value: "17,461", change: "+0.75%", up: true },
  { label: "DOW",     value: "38,868", change: "+0.31%", up: true },
  { label: "VIX",     value: "13.2",   change: "-2.1%",  up: false },
  { label: "Gold",    value: "2,329",  change: "+0.3%",  up: true },
  { label: "DXY",     value: "104.8",  change: "-0.2%",  up: false },
  { label: "10Y UST", value: "4.42%",  change: "+0.02",  up: true },
  { label: "BTC",     value: "67,420", change: "+1.2%",  up: true },
];

// ── Market Ticker Bar ─────────────────────────────────────────
function MarketTickerBar() {
  return (
    <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "5px 0" }}>
      <div style={{ display: "flex", gap: 28, overflowX: "auto", padding: "0 20px", scrollbarWidth: "none", alignItems: "center" }}>
        {TICKERS.map(t => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600, letterSpacing: 0.3 }}>{t.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{t.value}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.up ? "var(--green)" : "var(--red)" }}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────
function SidebarContent({ active, setActive, closeSidebar, profile, user, onSignOut, onUpgrade, lang }: {
  active: string; setActive: (id: string) => void; closeSidebar: () => void;
  profile: any; user: any; onSignOut: () => void; onUpgrade: () => void; lang: string;
}) {
  const plan    = profile?.plan ?? "free";
  const initial = (profile?.display_name ?? user?.email ?? "U")[0].toUpperCase();
  const name    = profile?.display_name ?? user?.email?.split("@")[0] ?? "User";

  const groups = ["top", "tools", "research", "learn", "account"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <img src="/LogoUSAX.png" alt="USAX Research" style={{ height: 53, width: "auto", display: "block", borderRadius: 6 }} />
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px 8px" }}>
        {groups.map(group => {
          const items = NAV.filter(n => n.group === group);
          if (!items.length) return null;
          const groupLabel = GROUP_LABELS[group]?.[lang] ?? "";
          return (
            <div key={group}>
              {groupLabel && (
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--faint)", letterSpacing: 1.2, padding: "13px 8px 4px", textTransform: "uppercase" }}>
                  {groupLabel}
                </div>
              )}
              {items.map(n => {
                const isActive = active === n.id;
                const label    = NAV_LABELS[n.id]?.[lang] ?? n.id;
                return (
                  <div key={n.id} style={{ position: "relative", marginBottom: 2 }}>
                    {isActive && (
                      <div style={{ position: "absolute", left: 0, top: 7, bottom: 7, width: 3, borderRadius: "0 3px 3px 0", background: "var(--accent)", zIndex: 1 }} />
                    )}
                    <div
                      onClick={() => { setActive(n.id); closeSidebar(); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "8px 10px 8px 14px",
                        borderRadius: 9, cursor: "pointer",
                        background: isActive ? "rgba(37,99,235,0.09)" : "transparent",
                        color: isActive ? "var(--accent)" : "var(--muted)",
                        fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                        transition: "all .15s",
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text)"; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; } }}
                    >
                      <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0, color: isActive ? "var(--accent)" : "inherit" }}>{n.icon}</span>
                      <span style={{ flex: 1 }}>{label}</span>
                      {n.isNew && (
                        <span style={{ background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff", borderRadius: 5, fontSize: 8.5, fontWeight: 800, padding: "2px 6px", letterSpacing: 0.3 }}>
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Pro Plan upgrade card */}
      {plan === "free" && (
        <div style={{ padding: "0 12px 12px", flexShrink: 0 }}>
          <div style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)", borderRadius: 13, padding: "16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Crown size={16} color="#fff" />
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>Pro Plan</div>
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.55, marginBottom: 13 }}>
              {lang === "th"
                ? "ปลดล็อกฟีเจอร์ขั้นสูง\nให้ AI ได้ไม่จำกัด"
                : "Unlock advanced features\nUnlimited AI analysis"}
            </div>
            <button onClick={onUpgrade}
              style={{ background: "#fff", color: "#7C3AED", border: "none", borderRadius: 10, padding: "10px 0", width: "100%", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "opacity .15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              {lang === "th" ? "อัพเกรดตอนนี้" : "Upgrade Now"}
            </button>
          </div>
        </div>
      )}

      {/* User */}
      <div style={{ padding: "10px 12px 14px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: "var(--bg-raised)", borderRadius: 11 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #F59E0B, #EF4444)", borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ fontSize: 10, color: plan === "pro" ? "var(--accent)" : plan === "elite" ? "var(--purple)" : "var(--faint)", fontWeight: 600, marginTop: 1 }}>
              {plan === "free" ? "Free Plan" : plan === "pro" ? "Pro ⚡" : "Elite 👑"}
            </div>
          </div>
          <button onClick={onSignOut} title="Sign out" style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", padding: 4, flexShrink: 0, display: "flex", alignItems: "center" }}>
            <LogOut size={14} />
          </button>
        </div>
        {user?.email === "siamebiz@gmail.com" && (
          <a href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 8, color: "#F59E0B", fontSize: 11.5, fontWeight: 700, padding: "6px 0", textDecoration: "none", marginTop: 8 }}>
            ⚙ Admin Panel
          </a>
        )}
      </div>
    </div>
  );
}

// ── Search suggestions data ───────────────────────────────────
const SEARCH_ITEMS = [
  // Screeners
  { type: "screener", id: "dip",       icon: "📉", th: "หุ้นย่อตัว (Dip Buy)",        en: "Dip Buy Screener",      screenerId: "dip" },
  { type: "screener", id: "growth",    icon: "🚀", th: "หุ้นเติบโต (Growth)",          en: "Growth Stocks",         screenerId: "growth" },
  { type: "screener", id: "ai_tech",   icon: "🤖", th: "หุ้น AI & Tech",              en: "AI & Tech Stocks",      screenerId: "ai_tech" },
  { type: "screener", id: "cyber",     icon: "🛡️", th: "หุ้น Cybersecurity",          en: "Cybersecurity Stocks",  screenerId: "cyber" },
  { type: "screener", id: "breakout",  icon: "⚡", th: "หุ้น Breakout",               en: "Breakout Stocks",       screenerId: "breakout" },
  { type: "screener", id: "quality",   icon: "💎", th: "หุ้น Quality (คุณภาพสูง)",   en: "Quality Stocks",        screenerId: "quality" },
  { type: "screener", id: "dividend",  icon: "💰", th: "หุ้นปันผล (Dividend)",        en: "Dividend Stocks",       screenerId: "dividend" },
  // Pages
  { type: "page", id: "dashboard",  icon: "🏠", th: "หน้าหลัก Dashboard",    en: "Dashboard",          page: "dashboard" },
  { type: "page", id: "screener",   icon: "🔍", th: "AI Screener",            en: "AI Screener",        page: "screener" },
  { type: "page", id: "watchlist",  icon: "⭐", th: "Watchlist รายการหุ้น",  en: "Watchlist",          page: "watchlist" },
  { type: "page", id: "portfolio",  icon: "💼", th: "Portfolio พอร์ตของฉัน", en: "My Portfolio",       page: "portfolio" },
  { type: "page", id: "market",     icon: "🌐", th: "ภาพรวมตลาด",            en: "Market Overview",    page: "market" },
  { type: "page", id: "news",       icon: "📰", th: "ข่าวสารตลาด",           en: "Market News",        page: "news" },
  { type: "page", id: "earnings",   icon: "📅", th: "Earnings Calendar",     en: "Earnings Calendar",  page: "earnings" },
  { type: "page", id: "education",  icon: "📚", th: "ความรู้การลงทุน",       en: "Education",          page: "education" },
  { type: "page", id: "settings",   icon: "⚙️", th: "ตั้งค่า Settings",      en: "Settings",           page: "settings" },
];

// ── Search Bar ────────────────────────────────────────────────
function SearchBar({ lang }: { lang: string }) {
  const [query,  setQuery]  = useState("");
  const [open,   setOpen]   = useState(false);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef   = useRef<HTMLDivElement>(null);
  const TH = lang === "th";

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter(item =>
        item.th.toLowerCase().includes(query.toLowerCase()) ||
        item.en.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS;

  const screeners = filtered.filter(i => i.type === "screener");
  const pages     = filtered.filter(i => i.type === "page");

  const navigate = (item: typeof SEARCH_ITEMS[0]) => {
    window.dispatchEvent(new CustomEvent("usax-navigate", {
      detail: { page: item.page ?? "screener", screenerId: item.screenerId ?? null }
    }));
    setQuery(""); setOpen(false); setCursor(-1);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false); setCursor(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allFiltered = [...screeners, ...pages];

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setCursor(c => Math.min(c + 1, allFiltered.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && cursor >= 0) navigate(allFiltered[cursor]);
    if (e.key === "Escape")     { setOpen(false); setCursor(-1); }
  };

  return (
    <div ref={boxRef} style={{ flex: 1, maxWidth: 520, margin: "0 16px", position: "relative" }}>
      <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none", zIndex: 1 }} />
      <input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setCursor(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder={TH ? "ค้นหา เช่น หุ้น AI, Watchlist, ตลาด..." : "Search screeners, pages..."}
        style={{ width: "100%", background: "var(--bg-raised)", border: `1px solid ${open ? "var(--accent)" : "var(--border)"}`, borderRadius: open ? "11px 11px 0 0" : 11, color: "var(--text)", padding: "8px 14px 8px 36px", fontSize: 13, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
      />
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--accent)", borderTop: "none", borderRadius: "0 0 12px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 9999, maxHeight: 360, overflowY: "auto" }}>
          {allFiltered.length === 0 ? (
            <div style={{ padding: "14px 16px", color: "var(--faint)", fontSize: 13 }}>ไม่พบผลลัพธ์</div>
          ) : (
            <>
              {screeners.length > 0 && (
                <>
                  <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em" }}>
                    {TH ? "AI SCREENER" : "AI SCREENER"}
                  </div>
                  {screeners.map((item, i) => {
                    const idx = i;
                    return (
                      <div key={item.id} onMouseDown={() => navigate(item)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: cursor === idx ? "var(--bg-raised)" : "transparent", transition: "background 0.1s" }}
                        onMouseEnter={() => setCursor(idx)}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ fontSize: 13, color: "var(--text)" }}>{TH ? item.th : item.en}</span>
                        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--faint)", background: "var(--bg-raised)", borderRadius: 5, padding: "2px 7px" }}>Screener</span>
                      </div>
                    );
                  })}
                </>
              )}
              {pages.length > 0 && (
                <>
                  <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", borderTop: screeners.length > 0 ? "1px solid var(--border)" : "none", marginTop: screeners.length > 0 ? 4 : 0 }}>
                    {TH ? "หน้า" : "PAGES"}
                  </div>
                  {pages.map((item, i) => {
                    const idx = screeners.length + i;
                    return (
                      <div key={item.id} onMouseDown={() => navigate(item)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: cursor === idx ? "var(--bg-raised)" : "transparent", transition: "background 0.1s" }}
                        onMouseEnter={() => setCursor(idx)}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ fontSize: 13, color: "var(--text)" }}>{TH ? item.th : item.en}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
          <div style={{ padding: "6px 14px 8px", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
            <span style={{ fontSize: 10, color: "var(--faint)" }}>↑↓ เลือก</span>
            <span style={{ fontSize: 10, color: "var(--faint)" }}>Enter ไป</span>
            <span style={{ fontSize: 10, color: "var(--faint)" }}>Esc ปิด</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Top Bar ───────────────────────────────────────────────────
function TopBar({ active, onMenuClick, sidebarOpen, onThemeToggle, theme, user, profile, onUpgrade, lang, setLang }: any) {
  const name    = profile?.display_name ?? user?.email?.split("@")[0] ?? "User";
  const initial = name[0].toUpperCase();
  const plan    = profile?.plan ?? "free";
  const label   = NAV_LABELS[active]?.[lang] ?? active;

  return (
    <div style={{ height: 60, background: "var(--bg-card)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", flexShrink: 0 }}>
      {/* Hamburger (mobile) */}
      <button onClick={onMenuClick}
        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 6, display: "none", alignItems: "center", borderRadius: 8 }}
        className="mobile-menu-btn">
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Page title */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>{label}</div>

      {/* Search bar */}
      <SearchBar lang={lang} />

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {/* Plan badge (Pro/Elite only) */}
        {plan === "pro" && (
          <button onClick={onUpgrade} style={{ display: "flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg, #F59E0B, #EAB308)", border: "none", borderRadius: 20, padding: "5px 13px", color: "#000", fontWeight: 700, fontSize: 11.5, cursor: "pointer", whiteSpace: "nowrap" }}>
            <Crown size={12} /> Pro
          </button>
        )}
        {plan === "free" && (
          <button onClick={onUpgrade} style={{ display: "flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg, #2563EB, #7C3AED)", border: "none", borderRadius: 20, padding: "6px 14px", color: "#fff", fontWeight: 700, fontSize: 11.5, cursor: "pointer", whiteSpace: "nowrap" }}>
            <Zap size={11} /> {lang === "th" ? "อัพเกรด" : "Upgrade"}
          </button>
        )}

        {/* Lang */}
        <button onClick={() => setLang(lang === "th" ? "en" : "th")}
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", color: "var(--muted)", letterSpacing: 0.5, minWidth: 38, textAlign: "center" }}>
          {lang === "th" ? "EN" : "TH"}
        </button>

        {/* Theme */}
        <button onClick={onThemeToggle}
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            <Bell size={15} />
          </button>
          <span style={{ position: "absolute", top: -4, right: -4, background: "var(--red)", color: "#fff", borderRadius: 99, fontSize: 8.5, fontWeight: 800, padding: "1px 4px", lineHeight: 1.4, minWidth: 14, textAlign: "center" }}>4</span>
        </div>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 6px", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text)", textAlign: "right" }}>
              {lang === "th" ? "สวัสดีครับ" : "Hello"}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", textAlign: "right" }}>{name}</div>
          </div>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2563EB, #06B6D4)", borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {initial}
          </div>
          <ChevronDown size={13} color="var(--faint)" />
        </div>
      </div>
    </div>
  );
}

// ── Placeholder page ─────────────────────────────────────────
function PlaceholderPage({ id, lang }: { id: string; lang: string }) {
  const label = NAV_LABELS[id]?.[lang] ?? id;
  const icons: Record<string, React.ReactNode> = {
    compare: <ArrowLeftRight size={40} />, watchlist: <Star size={40} />,
    portfolio: <Briefcase size={40} />, alerts: <Bell size={40} />,
    market: <Globe size={40} />, news: <Newspaper size={40} />,
    earnings: <Calendar size={40} />, economic: <TrendingUp size={40} />,
    analysis: <FileText size={40} />, ideas: <Lightbulb size={40} />,
    education: <BookOpen size={40} />, settings: <Settings size={40} />,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 14, color: "var(--faint)" }}>
      {icons[id] ?? <Globe size={40} />}
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--muted)" }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--faint)" }}>{lang === "th" ? "กำลังพัฒนา..." : "Coming soon..."}</div>
    </div>
  );
}

// ── Screener Page ─────────────────────────────────────────────
const SCREENER_ICONS: Record<string, React.ReactNode> = {
  dip:       <TrendingDown size={42} color="#fff" strokeWidth={1.8} />,
  growth:    <Rocket       size={42} color="#fff" strokeWidth={1.8} />,
  quality:   <Gem          size={42} color="#fff" strokeWidth={1.8} />,
  breakout:  <BarChart2    size={42} color="#fff" strokeWidth={1.8} />,
  ai_tech:   <Cpu          size={42} color="#fff" strokeWidth={1.8} />,
  cyber:     <ShieldCheck  size={42} color="#fff" strokeWidth={1.8} />,
  dividend:  <Coins        size={42} color="#fff" strokeWidth={1.8} />,
  earnings:  <Zap          size={42} color="#fff" strokeWidth={1.8} />,
  megatrend: <Globe        size={42} color="#fff" strokeWidth={1.8} />,
  value:     <DollarSign   size={42} color="#fff" strokeWidth={1.8} />,
};

function ScreenerPage({ selectedId, setSelectedId, lang }: {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  lang: string;
}) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  if (selectedId) {
    const sc = SCREENERS.find(s => s.id === selectedId);
    if (!sc) return null;
    if (selectedStock) {
      return <StockDetailPage ticker={selectedStock} onBack={() => setSelectedStock(null)} lang={lang} />;
    }
    return <ScreenerResults screener={sc} onBack={() => { setSelectedId(null); setSelectedStock(null); }} onViewDetail={setSelectedStock} lang={lang} />;
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
          {lang === "th" ? "คัดหุ้นด้วย AI" : "AI Stock Screener"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 5, lineHeight: 1.6 }}>
          {lang === "th"
            ? "เลือกธีมที่สนใจ ให้ AI วิเคราะห์และคัดกรองหุ้น — ข้อมูลเชิงสถิติเท่านั้น ไม่ใช่คำแนะนำการลงทุน"
            : "Choose a theme for AI to analyze and screen stocks — statistical tools only, not investment advice"}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {SCREENERS.map(sc => (
          <div key={sc.id}
            onClick={() => setSelectedId(sc.id)}
            style={{
              background: `linear-gradient(150deg, ${sc.gradFrom}, ${sc.gradTo})`,
              borderRadius: 18, padding: "22px 16px 18px", cursor: "pointer",
              position: "relative", overflow: "hidden",
              display: "flex", flexDirection: "column",
              transition: "transform .14s, box-shadow .14s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.35)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div style={{ position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)", width: 130, height: 130, borderRadius: 99, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 16, paddingTop: 4, filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.35))" }}>
              {SCREENER_ICONS[sc.id]}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 6 }}>
              {lang === "th" ? sc.label : sc.label_en}
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
              {lang === "th" ? sc.desc : sc.desc_en}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                {lang === "th" ? `พบ ${sc.count} ตัว` : `${sc.count} stocks`}
              </div>
              <ArrowRight size={14} color="rgba(255,255,255,0.55)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Login Modal ───────────────────────────────────────────────
function LoginModal() {
  const { lang, setLang } = useLang();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [mode,     setMode]     = useState<"signin" | "signup" | "magic">("signin");
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState("");
  const [sent,     setSent]     = useState(false);

  const MODES = [
    ["signin", lang === "th" ? "เข้าสู่ระบบ" : "Sign In"],
    ["signup", lang === "th" ? "สมัครสมาชิก" : "Sign Up"],
    ["magic",  lang === "th" ? "ลิงก์ล็อกอิน" : "Magic Link"],
  ] as const;

  const handleAuth = async () => {
    setLoading(true); setMsg("");
    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) setMsg(error.message); else setSent(true);
    } else if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message); else setSent(true);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMsg(error.message);
  };

  const btnLabel = loading ? (lang === "th" ? "กำลังโหลด..." : "Loading...")
    : mode === "signin" ? (lang === "th" ? "เข้าสู่ระบบ" : "Sign In")
    : mode === "signup" ? (lang === "th" ? "สมัครสมาชิก" : "Create Account")
    : (lang === "th" ? "ส่งลิงก์" : "Send Link");

  if (sent) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 360, padding: "40px 28px" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
            {lang === "th" ? "ตรวจสอบอีเมลของคุณ" : "Check your email"}
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            {mode === "magic"
              ? (lang === "th" ? "เราส่งลิงก์ล็อกอินไปที่" : "We sent a login link to")
              : (lang === "th" ? "เราส่งลิงก์ยืนยันไปที่" : "Confirmation sent to")}{" "}
            <b style={{ color: "var(--text)" }}>{email}</b>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 22, padding: "38px 30px", width: "100%", maxWidth: 400, boxShadow: "var(--shadow-md)" }}>
        <div style={{ textAlign: "center", marginBottom: 26, position: "relative" }}>
          <button onClick={() => setLang(lang === "th" ? "en" : "th")}
            style={{ position: "absolute", right: 0, top: 0, background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "var(--text)" }}>
            {lang === "th" ? "EN" : "TH"}
          </button>
          <img src="/LogoUSAX.png" alt="USAX Research" style={{ height: 76, width: "auto", display: "block", margin: "0 auto 10px", borderRadius: 10 }} />
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
            {lang === "th" ? "คัดกรองและวิเคราะห์หุ้นสหรัฐฯ ด้วย AI ในคลิกเดียว" : "AI-powered US stock screening & research platform"}
          </div>
        </div>

        <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: 11, padding: 3, marginBottom: 22, gap: 3 }}>
          {MODES.map(([m, label]) => (
            <button key={m} onClick={() => setMode(m as any)}
              style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: "none", background: mode === m ? "var(--bg-card)" : "transparent", color: mode === m ? "var(--text)" : "var(--muted)", fontWeight: mode === m ? 700 : 400, fontSize: 12, cursor: "pointer", boxShadow: mode === m ? "var(--shadow)" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder={lang === "th" ? "อีเมล" : "Email address"}
          style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 11, padding: "12px 14px", color: "var(--text)", fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }}
        />
        {mode !== "magic" && (
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder={lang === "th" ? "รหัสผ่าน" : "Password"}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
            style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 11, padding: "12px 14px", color: "var(--text)", fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }}
          />
        )}

        {msg && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 9, padding: "10px 13px", color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{msg}</div>}

        <button onClick={handleAuth} disabled={loading || !email}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2563EB, #06B6D4)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading || !email ? "not-allowed" : "pointer", opacity: loading || !email ? 0.7 : 1 }}>
          {btnLabel}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 12px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap" }}>{lang === "th" ? "หรือ" : "or"}</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <button onClick={handleGoogleSignIn}
          style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-raised)", color: "var(--text)", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {lang === "th" ? "เข้าสู่ระบบด้วย Google" : "Sign in with Google"}
        </button>

        <div style={{ fontSize: 11, color: "var(--faint)", textAlign: "center", marginTop: 18, lineHeight: 1.7 }}>
          {lang === "th"
            ? "ข้อมูลทั้งหมดเป็น \"เครื่องมือทางสถิติ\" เท่านั้น\nไม่ถือเป็นคำแนะนำการลงทุน"
            : "All data is for statistical purposes only\nNot investment advice"}
        </div>
      </div>
    </div>
  );
}

// ── Main AppLayout ────────────────────────────────────────────
export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const { lang, setLang } = useLang();
  const [active,           setActive]          = useState("dashboard");
  const [selectedScreener, setSelectedScreener] = useState<string | null>(null);
  const [selectedStock,    setSelectedStock]    = useState<string | null>(null);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [theme,            setTheme]            = useState("light");
  const [isMobile,         setIsMobile]         = useState(false);

  const [user,        setUser]        = useState<any>(null);
  const [profile,     setProfile]     = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("usax-theme") ?? "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);

    const handleNav = (e: Event) => {
      const { page, screenerId, ticker } = (e as CustomEvent).detail;
      setActive(page);
      setSelectedScreener(screenerId ?? null);
      setSelectedStock(ticker ? String(ticker).toUpperCase() : null);
    };
    window.addEventListener("usax-navigate", handleNav);

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("usax-navigate", handleNav);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data);
    setAuthLoading(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("usax-theme", next);
    document.documentElement.setAttribute("data-theme", next === "dark" ? "dark" : "light");
  };

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [active, selectedStock]);

  const pageForActive = () => {
    if (active === "stock-detail" && selectedStock) {
      return <StockDetailPage ticker={selectedStock} onBack={() => { setSelectedStock(null); setActive("dashboard"); }} lang={lang} />;
    }
    if (active === "dashboard" && children) return children;
    if (active === "screener") return <ScreenerPage selectedId={selectedScreener} setSelectedId={setSelectedScreener} lang={lang} />;
    if (active === "compare")  return <ComparePage lang={lang} />;
    if (active === "watchlist")return <WatchlistPage lang={lang} />;
    if (active === "market")   return <MarketOverviewPage lang={lang} />;
    if (active === "earnings") return <EarningsPage lang={lang} />;
    if (active === "news")     return <NewsPage lang={lang} />;
    if (active === "alerts")   return <AlertsPage lang={lang} />;
    if (active === "portfolio")return <PortfolioPage lang={lang} />;
    if (active === "economic") return <EconomicCalendarPage lang={lang} />;
    if (active === "analysis") return <AnalysisPage lang={lang} />;
    if (active === "ideas")    return <IdeasPage lang={lang} />;
    if (active === "education")return <EducationPage lang={lang} />;
    if (active === "settings") return <SettingsPage user={user} profile={profile} theme={theme} onThemeToggle={toggleTheme} lang={lang} setLang={(l) => setLang(l as "th" | "en")} onSignOut={handleSignOut} onUpgrade={() => setShowPayment(true)} />;
    return <PlaceholderPage id={active} lang={lang} />;
  };

  const SIDEBAR_W = 228;

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #2563EB, #06B6D4)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20, fontWeight: 900, color: "#fff" }}>U</div>
          {lang === "th" ? "กำลังโหลด..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (!user) return <LoginModal />;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <PaymentModal open={showPayment} onClose={() => setShowPayment(false)} userId={user.id} email={user.email} initialPlan="pro" />

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div style={{
        width: SIDEBAR_W, flexShrink: 0, background: "var(--bg-card)", borderRight: "1px solid var(--border)",
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (sidebarOpen ? 0 : -SIDEBAR_W) : undefined,
        top: 0, bottom: 0, zIndex: isMobile ? 50 : undefined,
        transition: "left .22s cubic-bezier(.4,0,.2,1)", height: "100vh",
      }}>
        <SidebarContent
          active={active}
          setActive={(id) => { setActive(id); setSelectedScreener(null); setSelectedStock(null); }}
          closeSidebar={() => setSidebarOpen(false)}
          profile={profile} user={user} onSignOut={handleSignOut}
          onUpgrade={() => setShowPayment(true)} lang={lang}
        />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar
          active={active}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onThemeToggle={toggleTheme}
          theme={theme}
          user={user} profile={profile}
          onUpgrade={() => setShowPayment(true)}
          lang={lang} setLang={setLang}
        />
        <DisclaimerBanner />
        <MarketTickerBar />
        <main ref={mainRef} style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px" : "20px 28px" }}>
          <div key={active}>
            {pageForActive()}
          </div>
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
