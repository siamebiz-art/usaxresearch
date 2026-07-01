"use client";
import { useState, useEffect } from "react";
import { SCREENERS } from "./DashboardHome";
import { addTickerToUserWatchlist } from "@/lib/user-data";

// ── Stock Logo ────────────────────────────────────────────────
function StockLogo({ ticker, size = 36 }: { ticker: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const r = Math.round(size * 0.26);
  const COLORS: Record<string, string> = {
    NVDA: "#76B900", AAPL: "#555", MSFT: "#00A1F1", TSLA: "#CC0000",
    AMZN: "#FF9900", META: "#0866FF", GOOGL: "#4285F4", GOOG: "#4285F4",
    AMD: "#ED1C24", CRWD: "#C1121F", ZS: "#005DAA", PANW: "#00C0E8",
  };
  if (failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: r, background: COLORS[ticker] ?? "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.3), fontWeight: 900, color: "#fff", flexShrink: 0 }}>
        {ticker.slice(0, 2)}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: r, overflow: "hidden", background: "#fff", flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src={`https://assets.parqet.com/logos/symbol/${ticker}?format=jpg`} alt={ticker}
        width={size} height={size} style={{ width: size, height: size, objectFit: "contain" }}
        onError={() => setFailed(true)} />
    </div>
  );
}

// ── Mock results ──────────────────────────────────────────────
const MOCK_RESULTS: Record<string, any[]> = {
  dip: [
    { ticker: "GOOG", name: "Alphabet",   price: 167.40, change: "+1.2%", up: true,  score: 93, pe: 23, rev: "+15%", cap: "2.1T", reasons: ["Down 28% ATH", "AI Revenue", "Buy Zone"] },
    { ticker: "BRKB", name: "Berkshire",  price: 406.10, change: "+0.3%", up: true,  score: 89, pe: 21, rev: "+8%",  cap: "880B", reasons: ["Value Play", "Cash Reserve", "Buffett"] },
    { ticker: "TSLA", name: "Tesla",      price: 176.40, change: "-1.1%", up: false, score: 71, pe: 55, rev: "+3%",  cap: "561B", reasons: ["Down 32% ATH", "EV Leader", "Margin Pressure"] },
    { ticker: "PYPL", name: "PayPal",     price: 63.20,  change: "+2.1%", up: true,  score: 82, pe: 14, rev: "+9%",  cap: "67B",  reasons: ["Down 31% ATH", "Cheap P/E", "Turnaround"] },
    { ticker: "ADBE", name: "Adobe",      price: 414.00, change: "+0.9%", up: true,  score: 86, pe: 28, rev: "+11%", cap: "181B", reasons: ["Down 24% ATH", "AI Tools", "Subscription"] },
    { ticker: "COIN", name: "Coinbase",   price: 201.30, change: "-2.3%", up: false, score: 68, pe: 42, rev: "+89%", cap: "48B",  reasons: ["Crypto Cycle", "High Vol", "Speculative"] },
    { ticker: "SQ",   name: "Block",      price: 66.80,  change: "+1.5%", up: true,  score: 74, pe: 26, rev: "+20%", cap: "41B",  reasons: ["Down 30% ATH", "Cash App", "Bitcoin"] },
  ],
  growth: [
    { ticker: "NVDA", name: "NVIDIA",     price: 1089.0, change: "+3.2%", up: true,  score: 97, pe: 52, rev: "+122%", cap: "2.7T", reasons: ["AI Demand", "Data Center", "Dominant"] },
    { ticker: "META", name: "Meta",       price: 493.60, change: "+1.8%", up: true,  score: 87, pe: 27, rev: "+27%",  cap: "1.25T",reasons: ["Ad Rebound", "AI Infra", "Reality Labs"] },
    { ticker: "CRWD", name: "CrowdStrike",price: 330.50, change: "+2.4%", up: true,  score: 91, pe: 78, rev: "+33%",  cap: "83B", reasons: ["ARR Growth", "Platform", "AI Security"] },
    { ticker: "SNOW", name: "Snowflake",  price: 162.80, change: "+1.1%", up: true,  score: 83, pe: null, rev: "+33%",cap: "54B",  reasons: ["Data Cloud", "AI Workload", "Net Rev Ret"] },
    { ticker: "PLTR", name: "Palantir",   price: 23.40,  change: "+4.5%", up: true,  score: 85, pe: 68, rev: "+21%",  cap: "50B",  reasons: ["US Gov", "AI Platform", "GAAP Profit"] },
  ],
  ai_tech: [
    { ticker: "NVDA", name: "NVIDIA",     price: 1089.0, change: "+3.2%", up: true,  score: 97, pe: 52, rev: "+122%", cap: "2.7T", reasons: ["AI Compute", "H100/H200", "Blackwell"] },
    { ticker: "MSFT", name: "Microsoft",  price: 416.80, change: "+1.1%", up: true,  score: 94, pe: 36, rev: "+17%",  cap: "3.1T", reasons: ["Copilot AI", "Azure AI", "OpenAI"] },
    { ticker: "AVGO", name: "Broadcom",   price: 1687.0, change: "+2.5%", up: true,  score: 91, pe: 31, rev: "+43%",  cap: "786B", reasons: ["AI XPU", "Networking", "VMware"] },
    { ticker: "TSM",  name: "TSMC",       price: 153.40, change: "+1.8%", up: true,  score: 90, pe: 26, rev: "+13%",  cap: "796B", reasons: ["AI Chip Fab", "Monopoly", "CoWoS"] },
    { ticker: "AMD",  name: "AMD",        price: 158.00, change: "+2.1%", up: true,  score: 86, pe: 50, rev: "+2%",   cap: "255B", reasons: ["MI300X", "EPYC Server", "AI Challenger"] },
    { ticker: "ORCL", name: "Oracle",     price: 122.30, change: "+0.9%", up: true,  score: 84, pe: 33, rev: "+7%",   cap: "336B", reasons: ["OCI Cloud", "AI Database", "GPU Cluster"] },
  ],
  quality: [
    { ticker: "MSFT", name: "Microsoft",  price: 416.80, change: "+1.1%", up: true,  score: 94, pe: 36, rev: "+17%", cap: "3.1T", reasons: ["Strong Moat", "Dividend Growth", "Azure"] },
    { ticker: "AAPL", name: "Apple",      price: 195.89, change: "+1.2%", up: true,  score: 85, pe: 28, rev: "+5%",  cap: "3.0T", reasons: ["Brand Moat", "Services", "Loyal Customers"] },
    { ticker: "V",    name: "Visa",       price: 272.00, change: "+0.8%", up: true,  score: 88, pe: 30, rev: "+10%", cap: "556B", reasons: ["Network Effect", "High ROE", "No Credit Risk"] },
    { ticker: "MA",   name: "Mastercard", price: 455.00, change: "+0.9%", up: true,  score: 87, pe: 33, rev: "+11%", cap: "421B", reasons: ["Duopoly", "Global Reach", "Fee Model"] },
  ],
  cyber: [
    { ticker: "CRWD", name: "CrowdStrike",price: 330.50, change: "+2.4%", up: true,  score: 91, pe: 78, rev: "+33%", cap: "83B",  reasons: ["ARR Growth", "Platform", "AI Security"] },
    { ticker: "ZS",   name: "Zscaler",    price: 187.00, change: "+2.5%", up: true,  score: 94, pe: 85, rev: "+24%", cap: "28B",  reasons: ["Zero Trust", "Cloud Security", "ARR"] },
    { ticker: "PANW", name: "Palo Alto",  price: 305.00, change: "+1.2%", up: true,  score: 88, pe: 60, rev: "+16%", cap: "196B", reasons: ["Platform", "AI-Powered", "Consolidation"] },
    { ticker: "FTNT", name: "Fortinet",   price: 59.00,  change: "+0.9%", up: true,  score: 82, pe: 40, rev: "+8%",  cap: "44B",  reasons: ["SD-WAN", "Organic Growth", "OT Security"] },
  ],
  dividend: [
    { ticker: "JNJ",  name: "Johnson & Johnson", price: 155.00, change: "+0.5%", up: true,  score: 84, pe: 15, rev: "+7%",  cap: "372B", reasons: ["Dividend King", "Healthcare Moat", "MedTech"] },
    { ticker: "KO",   name: "Coca-Cola",          price: 63.00,  change: "+0.3%", up: true,  score: 81, pe: 22, rev: "+3%",  cap: "272B", reasons: ["Brand Moat", "Global Reach", "Dividend"] },
    { ticker: "PG",   name: "Procter & Gamble",   price: 168.00, change: "+0.6%", up: true,  score: 83, pe: 25, rev: "+4%",  cap: "396B", reasons: ["Consumer Staples", "Pricing Power", "Dividend"] },
    { ticker: "ABBV", name: "AbbVie",             price: 178.00, change: "+1.2%", up: true,  score: 86, pe: 14, rev: "+5%",  cap: "315B", reasons: ["High Yield", "Pipeline", "Humira Successor"] },
  ],
  earnings: [
    { ticker: "NVDA", name: "NVIDIA",     price: 1089.0, change: "+3.2%", up: true,  score: 97, pe: 52, rev: "+122%", cap: "2.7T", reasons: ["EPS Beat 200%", "Guidance Up", "AI Demand"] },
    { ticker: "META", name: "Meta",       price: 493.60, change: "+1.8%", up: true,  score: 87, pe: 27, rev: "+27%",  cap: "1.25T",reasons: ["EPS Beat 35%", "Margin Expansion", "AI Ads"] },
    { ticker: "AMZN", name: "Amazon",     price: 184.00, change: "+1.3%", up: true,  score: 82, pe: 50, rev: "+13%",  cap: "1.93T",reasons: ["AWS Beat", "Ad Revenue Up", "Cost Cut"] },
  ],
  megatrend: [
    { ticker: "NVDA", name: "NVIDIA",     price: 1089.0, change: "+3.2%", up: true,  score: 97, pe: 52, rev: "+122%", cap: "2.7T", reasons: ["AI Infra", "Data Center", "H100"] },
    { ticker: "TSLA", name: "Tesla",      price: 176.40, change: "-1.1%", up: false, score: 71, pe: 55, rev: "+3%",   cap: "561B", reasons: ["EV Leader", "FSD", "Robotaxi"] },
    { ticker: "ENPH", name: "Enphase",    price: 118.00, change: "+2.1%", up: true,  score: 78, pe: 28, rev: "+5%",   cap: "16B",  reasons: ["Solar", "Clean Energy", "IRA Act"] },
    { ticker: "PLTR", name: "Palantir",   price: 23.40,  change: "+4.5%", up: true,  score: 85, pe: 68, rev: "+21%",  cap: "50B",  reasons: ["AI Platform", "US Gov", "Commercial AI"] },
  ],
  value: [
    { ticker: "GOOG", name: "Alphabet",   price: 167.40, change: "+1.2%", up: true,  score: 93, pe: 23, rev: "+15%", cap: "2.1T", reasons: ["Cheap vs Peers", "AI Revenue", "FCF Strong"] },
    { ticker: "BRKB", name: "Berkshire",  price: 406.10, change: "+0.3%", up: true,  score: 89, pe: 21, rev: "+8%",  cap: "880B", reasons: ["Value Play", "Buffett Premium", "Cash Hoard"] },
    { ticker: "PYPL", name: "PayPal",     price: 63.20,  change: "+2.1%", up: true,  score: 82, pe: 14, rev: "+9%",  cap: "67B",  reasons: ["P/E 14x", "Turnaround", "FCF"] },
    { ticker: "V",    name: "Visa",       price: 272.00, change: "+0.8%", up: true,  score: 88, pe: 30, rev: "+10%", cap: "556B", reasons: ["Quality at Fair Value", "Network Effect", "Moat"] },
  ],
  breakout: [
    { ticker: "NVDA", name: "NVIDIA",     price: 1089.0, change: "+3.2%", up: true,  score: 97, pe: 52, rev: "+122%", cap: "2.7T", reasons: ["ATH Breakout", "Volume Surge", "AI Catalyst"] },
    { ticker: "META", name: "Meta",       price: 493.60, change: "+1.8%", up: true,  score: 87, pe: 27, rev: "+27%",  cap: "1.25T",reasons: ["52W High", "Momentum", "Earnings Catalyst"] },
    { ticker: "UBER", name: "Uber",       price: 75.00,  change: "+3.1%", up: true,  score: 80, pe: 40, rev: "+16%",  cap: "155B", reasons: ["First Profit Year", "Breakout Zone", "AV Partner"] },
  ],
};

function getResults(id: string) {
  return MOCK_RESULTS[id] ?? MOCK_RESULTS["dip"];
}

// ── i18n strings ──────────────────────────────────────────────
const T = {
  reasons_label: { th: "เหตุผลที่เข้าเกณฑ์ (สถิติ)", en: "Reasons — Statistical" },
  disclaimer_short: { th: "ข้อมูลเชิงสถิติเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน", en: "Statistical data only — not investment advice" },
  view_more: { th: "ดูข้อมูลเพิ่มเติม", en: "View Detail" },
  save_watchlist: { th: "บันทึก Watchlist", en: "Save to Watchlist" },
  ai_loading: { th: "AI กำลังค้นหาหุ้น...", en: "AI is screening stocks..." },
  steps_th: ["กำลังดึงข้อมูลหุ้น 5,000+ ตัว", "วิเคราะห์ผลการเงินล่าสุด", "อ่าน Earnings Reports", "วิเคราะห์ข่าวและ Sentiment", "คำนวณ AI Score", "จัดอันดับและสรุปผล"],
  steps_en: ["Fetching 5,000+ stock data", "Analyzing latest financials", "Reading Earnings Reports", "Analyzing news & sentiment", "Computing AI Scores", "Ranking and summarizing"],
  back: { th: "← กลับ", en: "← Back" },
  found: { th: (n: number) => `พบ ${n} ตัว`, en: (n: number) => `${n} stocks` },
  sort_by: { th: "เรียงตาม:", en: "Sort by:" },
  export: { th: "Export PDF", en: "Export PDF" },
  col_company: { th: "บริษัท", en: "Company" },
  col_price: { th: "ราคา", en: "Price" },
  col_pe: { th: "P/E", en: "P/E" },
  col_rev: { th: "Rev Growth", en: "Rev Growth" },
  col_cap: { th: "Mkt Cap", en: "Mkt Cap" },
  col_score: { th: "AI Score", en: "AI Score" },
  summary_title: { th: "สรุปข้อมูลเชิงสถิติ", en: "Statistical Summary" },
  summary_body: {
    th: (n: number, ticker: string, score: number, reasons: string[]) =>
      `จากการวิเคราะห์เชิงสถิติ พบ ${n} บริษัทที่เข้าเกณฑ์ โดย ${ticker} มี AI Score สูงสุดที่ ${score}/100 ปัจจัยที่เข้าเกณฑ์ ได้แก่ ${reasons.join(", ")}`,
    en: (n: number, ticker: string, score: number, reasons: string[]) =>
      `Statistical analysis found ${n} qualifying companies. ${ticker} leads with AI Score ${score}/100 based on ${reasons.join(", ")}`,
  },
  disclaimer_long: {
    th: "ข้อมูลทั้งหมดเป็นเครื่องมือทางสถิติเพื่อการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติมและตัดสินใจด้วยตนเอง",
    en: "All data is for statistical and educational purposes only and does not constitute investment advice. Investors should conduct independent research.",
  },
};

function t(key: keyof typeof T, lang: string): any {
  const v = (T as any)[key];
  if (!v) return "";
  return v[lang] ?? v["en"];
}

const LS_WATCHLIST_KEY = "usax-watchlist-v1";

function saveTickerToWatchlist(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return;
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_WATCHLIST_KEY) ?? "[]");
    const existing = Array.isArray(parsed)
      ? parsed.map((item: unknown) => String(item).trim().toUpperCase()).filter(Boolean)
      : [];
    const next = existing.includes(normalized) ? existing : [...existing, normalized];
    localStorage.setItem(LS_WATCHLIST_KEY, JSON.stringify([...new Set(next)]));
    void addTickerToUserWatchlist(normalized);
    window.dispatchEvent(new CustomEvent("usax-watchlist-updated"));
  } catch {
    localStorage.setItem(LS_WATCHLIST_KEY, JSON.stringify([normalized]));
    void addTickerToUserWatchlist(normalized);
    window.dispatchEvent(new CustomEvent("usax-watchlist-updated"));
  }
}

// ── Score Ring ────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#22C55E" : score >= 75 ? "#EAB308" : "#EF4444";
  const r = 20; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r={r} fill="none" stroke="var(--bg-raised)" strokeWidth="4" />
      <circle cx="27" cy="27" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .5s ease" }} />
      <text x="27" y="31" textAnchor="middle" fill={color} fontSize="13" fontWeight="800">{score}</text>
    </svg>
  );
}

// ── Stock Row ─────────────────────────────────────────────────
function StockRow({ s, rank, color, lang, onViewDetail }: { s: any; rank: number; color: string; lang: string; onViewDetail?: (ticker: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
      <div>
        <div
          className="screener-result-row"
          onClick={() => setExpanded(!expanded)}
        style={{ display: "grid", gridTemplateColumns: "32px 36px 1fr auto auto auto auto auto", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", transition: "background .15s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: rank <= 3 ? color : "var(--faint)", textAlign: "center" }}>#{rank}</div>
        <StockLogo ticker={s.ticker} size={36} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{s.ticker}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>${s.price.toLocaleString()}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: s.up ? "var(--green)" : "var(--red)" }}>{s.change}</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>{s.pe ? `P/E ${s.pe}` : "—"}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", textAlign: "center" }}>{s.rev}</div>
        <div style={{ fontSize: 11, color: "var(--faint)", textAlign: "right" }}>{s.cap}</div>
        <ScoreRing score={s.score} />
      </div>

      {expanded && (
        <div style={{ background: "var(--bg-raised)", borderBottom: "1px solid var(--border)", padding: "14px 16px 14px 60px" }} className="fade-up">
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            📊 {t("reasons_label", lang)}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {s.reasons.map((r: string) => (
              <span key={r} style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "3px 10px" }}>
                ✓ {r}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--faint)", marginBottom: 8 }}>
            ⚠️ {t("disclaimer_short", lang)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={e => { e.stopPropagation(); onViewDetail?.(s.ticker); }}
              style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              📊 {t("view_more", lang)}
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                saveTickerToWatchlist(s.ticker);
                setSaved(true);
                window.setTimeout(() => setSaved(false), 1600);
              }}
              style={{ background: saved ? "var(--green)" : "none", border: saved ? "1px solid var(--green)" : "1px solid var(--accent)", color: saved ? "#fff" : "var(--accent)", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ⭐ {saved ? (lang === "th" ? "เพิ่มแล้ว" : "Added") : t("save_watchlist", lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Loader ─────────────────────────────────────────────────
function AILoader({ screener, lang }: { screener: typeof SCREENERS[0]; lang: string }) {
  const steps = lang === "th" ? T.steps_th : T.steps_en;
  const [step,     setStep]     = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1));
      setProgress(p => Math.min(p + 17, 100));
    }, 600);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: 20, textAlign: "center" }}>
      <div style={{ fontSize: 52 }}>{screener.icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
        {t("ai_loading", lang)}
      </div>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--bg-raised)", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${screener.color}, ${screener.color}88)`, borderRadius: 99, width: `${progress}%`, transition: "width .5s ease" }} />
      </div>
      <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, minHeight: 20 }}>
        {steps[step]}...
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 360 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: i <= step ? "var(--text)" : "var(--faint)", opacity: i <= step ? 1 : 0.4, transition: "all .3s" }}>
            <span style={{ fontSize: 14 }}>{i < step ? "✅" : i === step ? "⏳" : "⬜"}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ScreenerResults ──────────────────────────────────────
export default function ScreenerResults({ screener, onBack, onViewDetail, lang = "th" }: {
  screener: typeof SCREENERS[0];
  onBack: () => void;
  onViewDetail?: (ticker: string) => void;
  lang?: string;
}) {
  const [loading,  setLoading]  = useState(true);
  const [results,  setResults]  = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(getResults(screener.id));
      setLoading(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, [screener.id]);

  const label      = lang === "th" ? screener.label    : screener.label_en;
  const desc       = lang === "th" ? screener.desc     : screener.desc_en;
  const SORT_OPTS  = lang === "th"
    ? ["AI Score", "Market Cap", "Rev Growth", "P/E Ratio"]
    : ["AI Score", "Market Cap", "Rev Growth", "P/E Ratio"];
  const COL_HEADS  = ["#", t("col_company", lang), t("col_price", lang), t("col_pe", lang), t("col_rev", lang), t("col_cap", lang), t("col_score", lang)];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button onClick={onBack}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--muted)", fontSize: 13, padding: "7px 14px", cursor: "pointer" }}>
          {t("back", lang)}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{screener.icon}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</div>
          </div>
        </div>
        {!loading && (
          <div style={{ marginLeft: "auto", background: screener.bg, border: `1px solid ${screener.color}33`, borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: screener.color }}>
            {t("found", lang)(results.length)}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <AILoader screener={screener} lang={lang} />
        </div>
      ) : (
        <>
          {/* Sort bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{t("sort_by", lang)}</span>
            {SORT_OPTS.map((f, i) => (
              <button key={f}
                style={{ background: i === 0 ? screener.color : "var(--bg-card)", border: `1px solid ${i === 0 ? screener.color : "var(--border)"}`, color: i === 0 ? "#fff" : "var(--muted)", borderRadius: 8, fontSize: 12, fontWeight: i === 0 ? 700 : 400, padding: "5px 12px", cursor: "pointer" }}>
                {f}
              </button>
            ))}
            <button style={{ marginLeft: "auto", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--accent)", borderRadius: 8, fontSize: 12, fontWeight: 700, padding: "5px 14px", cursor: "pointer" }}>
              📄 {t("export", lang)}
            </button>
          </div>

          {/* Table */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }} className="fade-up responsive-table-card">
            <div className="screener-result-row" style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto auto auto auto", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              {COL_HEADS.map((h, i) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5, textAlign: i === 0 ? "center" : i <= 1 ? "left" : "right" }}>
                  {h}
                </div>
              ))}
            </div>
            {results.map((r, i) => (
              <StockRow key={r.ticker} s={r} rank={i + 1} color={screener.color} lang={lang} onViewDetail={onViewDetail} />
            ))}
          </div>

          {/* AI Summary */}
          <div style={{ background: `linear-gradient(135deg, var(--bg-card), ${screener.bg})`, border: `1px solid ${screener.color}22`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: screener.color, marginBottom: 8 }}>
              🤖 {t("summary_title", lang)} — {label}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
              {results[0]
                ? (T.summary_body[lang as "th" | "en"] ?? T.summary_body.en)(results.length, results[0].ticker, results[0].score, results[0].reasons)
                : ""}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--faint)", background: "var(--bg-raised)", borderRadius: 8, padding: "8px 12px" }}>
              ⚠️ {t("disclaimer_long", lang)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
