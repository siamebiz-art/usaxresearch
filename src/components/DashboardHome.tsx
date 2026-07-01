"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import {
  ChevronRight, TrendingUp, TrendingDown, ArrowRight, Plus, Star, ShieldCheck,
  Sparkles, Brain, Zap, Bell, Rocket, Gem, Cpu, ShieldCheck as ShieldOk,
  Coins, Globe, DollarSign, BarChart2,
} from "lucide-react";

// ── Screener icon map (Lucide icons) ─────────────────────────
const SC_ICONS: Record<string, React.ReactNode> = {
  dip:       <TrendingDown size={56} color="#fff" strokeWidth={1.8} />,
  growth:    <Rocket       size={56} color="#fff" strokeWidth={1.8} />,
  quality:   <Gem          size={56} color="#fff" strokeWidth={1.8} />,
  breakout:  <BarChart2    size={56} color="#fff" strokeWidth={1.8} />,
  ai_tech:   <Cpu          size={56} color="#fff" strokeWidth={1.8} />,
  cyber:     <ShieldOk     size={56} color="#fff" strokeWidth={1.8} />,
  dividend:  <Coins        size={56} color="#fff" strokeWidth={1.8} />,
  earnings:  <Zap          size={56} color="#fff" strokeWidth={1.8} />,
  megatrend: <Globe        size={56} color="#fff" strokeWidth={1.8} />,
  value:     <DollarSign   size={56} color="#fff" strokeWidth={1.8} />,
};

// ── Tag color helper ─────────────────────────────────────────
function tagStyle(tag: string): { color: string; bg: string } {
  const t = tag.toLowerCase();
  if (t.includes("ย่อตัว") || t.includes("pullback"))            return { color: "#F97316", bg: "rgba(249,115,22,0.18)" };
  if (t.includes("รายได้") || t.includes("rev") || t.includes("กำไร") || t.includes("eps") || t.includes("demand สูง")) return { color: "#22C55E", bg: "rgba(34,197,94,0.18)" };
  if (t.includes("พื้นฐาน") || t.includes("fundamental") || t.includes("base") || t.includes("strong"))  return { color: "#3B82F6", bg: "rgba(59,130,246,0.18)" };
  if (t.includes("ai") || t.includes("chip"))                    return { color: "#06B6D4", bg: "rgba(6,182,212,0.18)" };
  if (t.includes("ตลาด") || t.includes("market") || t.includes("leader")) return { color: "#8B5CF6", bg: "rgba(139,92,246,0.18)" };
  if (t.includes("มูลค่า") || t.includes("value"))              return { color: "#10B981", bg: "rgba(16,185,129,0.18)" };
  if (t.includes("แนวโน้ม") || t.includes("trend"))             return { color: "#14B8A6", bg: "rgba(20,184,166,0.18)" };
  return { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" };
}

// ── Data ────────────────────────────────────────────────────

export const SCREENERS = [
  { id: "dip",       color: "#22C55E", bg: "rgba(34,197,94,0.08)",   gradFrom: "#064e3b", gradTo: "#0d6b3f", icon: "📉", label: "หุ้นย่อตัวน่าสนใจ",    label_en: "Pullback Stocks",   desc: "หาหุ้นคุณภาพดีที่ย่อตัว 20–35%",       desc_en: "Quality stocks with 20–35% pullback", count: 7  },
  { id: "growth",    color: "#3B82F6", bg: "rgba(59,130,246,0.08)",  gradFrom: "#1e3a8a", gradTo: "#1e40af", icon: "🚀", label: "หุ้นเติบโตสูง",         label_en: "High Growth",        desc: "รายได้และกำไรเติบโตต่อเนื่อง",          desc_en: "Revenue growth >20% YoY",             count: 12 },
  { id: "quality",   color: "#8B5CF6", bg: "rgba(139,92,246,0.08)",  gradFrom: "#3b0764", gradTo: "#581c87", icon: "💎", label: "หุ้นคุณภาพสูง",        label_en: "Quality Stocks",     desc: "พื้นฐานแข็งแกร่ง มูลค่าน่าสนใจ",       desc_en: "Strong fundamentals + moat",          count: 9  },
  { id: "breakout",  color: "#F97316", bg: "rgba(249,115,22,0.08)",  gradFrom: "#7c2d12", gradTo: "#9a3412", icon: "📈", label: "หุ้นกำลังเบรกเอาต์",   label_en: "Breakout",           desc: "หุ้นกำลังทะลุแนวต้านสำคัญ โอกาสไปต่อ",  desc_en: "Breaking key resistance levels",      count: 5  },
  { id: "ai_tech",   color: "#06B6D4", bg: "rgba(6,182,212,0.08)",   gradFrom: "#0c4a6e", gradTo: "#075985", icon: "🤖", label: "หุ้นธีม AI",            label_en: "AI Stocks",          desc: "หาหุ้นกลุ่ม AI, Cloud, Semiconductor",  desc_en: "Pure-play AI infrastructure & apps",  count: 15 },
  { id: "cyber",     color: "#2563EB", bg: "rgba(37,99,235,0.08)",   gradFrom: "#172554", gradTo: "#1e3a8a", icon: "🛡️", label: "หุ้น Cybersecurity",    label_en: "Cybersecurity",      desc: "หุ้นกลุ่มความปลอดภัยทางไซเบอร์",       desc_en: "Rising demand for security solutions", count: 8  },
  { id: "dividend",  color: "#EAB308", bg: "rgba(234,179,8,0.08)",   gradFrom: "#713f12", gradTo: "#a16207", icon: "💰", label: "หุ้นปันผลสูง",         label_en: "Dividend",           desc: "Dividend Yield >3% และ DGR สูง",        desc_en: "High yield + strong dividend growth",  count: 11 },
  { id: "earnings",  color: "#EF4444", bg: "rgba(239,68,68,0.08)",   gradFrom: "#7f1d1d", gradTo: "#991b1b", icon: "⚡", label: "หุ้น Earnings Momentum",label_en: "Earnings Momentum",  desc: "กำไรโตเกินคาด ราคายังไม่สะท้อน",       desc_en: "EPS beats with lagged price reaction", count: 6  },
  { id: "megatrend", color: "#14B8A6", bg: "rgba(20,184,166,0.08)",  gradFrom: "#134e4a", gradTo: "#0f766e", icon: "🌍", label: "หุ้น Megatrend",        label_en: "Megatrend",          desc: "ธีมเทรนด์โลก AI EV Cloud Energy",      desc_en: "AI · EV · Cloud · Clean Energy",      count: 14 },
  { id: "value",     color: "#10B981", bg: "rgba(16,185,129,0.08)",  gradFrom: "#064e3b", gradTo: "#047857", icon: "💵", label: "หุ้น Value สุด",        label_en: "Undervalued",        desc: "ราคาต่ำกว่ามูลค่าที่แท้จริง",          desc_en: "Trading below intrinsic value",        count: 10 },
];

const TOP_PICKS = [
  { rank: 1, ticker: "ZS",   name: "Zscaler",                price: "187.32",   change: "+2.45%", up: true,  score: 94, tags_th: ["ย่อตัว 28%", "รายได้โต 24%", "พื้นฐานแข็งแรง"], tags_en: ["Pullback 28%", "Rev +24%", "Strong Base"] },
  { rank: 2, ticker: "CRWD", name: "CrowdStrike",            price: "342.71",   change: "+1.89%", up: true,  score: 92, tags_th: ["ย่อตัว 22%", "ผู้นำตลาด", "รายได้สูง"],        tags_en: ["Pullback 22%", "Market Leader", "High Rev"] },
  { rank: 3, ticker: "NVDA", name: "NVIDIA",                 price: "1,121.91", change: "+3.21%", up: true,  score: 97, tags_th: ["AI Leader", "กำไร 145%", "Demand สูงมาก"],     tags_en: ["AI Leader", "EPS +145%", "High Demand"] },
  { rank: 4, ticker: "NET",  name: "Cloudflare",             price: "96.35",    change: "+2.14%", up: true,  score: 90, tags_th: ["ย่อตัว 25%", "รายได้ 30%", "แนวโน้มดี"],       tags_en: ["Pullback 25%", "Rev +30%", "Good Trend"] },
  { rank: 5, ticker: "AMD",  name: "Advanced Micro Devices", price: "172.44",   change: "+1.76%", up: true,  score: 88, tags_th: ["ย่อตัว 30%", "AI Chip", "มูลค่าน่าสนใจ"],      tags_en: ["Pullback 30%", "AI Chip", "Good Value"] },
];

const WATCHLIST = [
  { ticker: "AAPL",  name: "Apple Inc.",      price: "195.89", change: "+1.15%", up: true,  score: 85, spark: "M0,28 L12,24 L24,22 L36,18 L48,15 L60,12" },
  { ticker: "MSFT",  name: "Microsoft Corp.", price: "446.34", change: "+0.92%", up: true,  score: 90, spark: "M0,26 L12,23 L24,20 L36,17 L48,13 L60,10" },
  { ticker: "TSLA",  name: "Tesla Inc.",      price: "248.42", change: "-0.45%", up: false, score: 70, spark: "M0,12 L12,16 L24,20 L36,18 L48,24 L60,28" },
  { ticker: "AMZN",  name: "Amazon.com",      price: "184.25", change: "+1.34%", up: true,  score: 82, spark: "M0,24 L12,21 L24,19 L36,16 L48,13 L60,10" },
];

const MARKET = [
  { label: "S&P 500",   value: "5,487.03", change: "+0.54%", up: true,  path: "M0,38 L15,32 L30,35 L45,23 L60,26 L75,18 L90,10" },
  { label: "NASDAQ",    value: "17,461.32", change: "+0.75%", up: true,  path: "M0,38 L15,34 L30,30 L45,25 L60,19 L75,13 L90,7"  },
  { label: "DOW JONES", value: "38,868.04", change: "+0.31%", up: true,  path: "M0,34 L15,30 L30,33 L45,27 L60,29 L75,23 L90,18" },
];

const FG_HISTORY = [
  { value: 67, label_th: "Greed",   label_en: "Greed",   color: "#22C55E" },
  { value: 58, label_th: "Neutral", label_en: "Neutral", color: "#EAB308" },
  { value: 45, label_th: "Neutral", label_en: "Neutral", color: "#EAB308" },
  { value: 32, label_th: "Fear",    label_en: "Fear",    color: "#F97316" },
  { value: 28, label_th: "Fear",    label_en: "Fear",    color: "#EF4444" },
  { value: 35, label_th: "Fear",    label_en: "Fear",    color: "#F97316" },
  { value: 42, label_th: "Neutral", label_en: "Neutral", color: "#EAB308" },
];

const EARNINGS = [
  { ticker: "NVDA", name: "NVIDIA Corporation",  date_th: "28 พ.ค. 2024",  date_en: "May 28",  time_th: "หลังตลาดปิด",   time_en: "After Close" },
  { ticker: "CRM",  name: "Salesforce, Inc.",    date_th: "29 พ.ค. 2024",  date_en: "May 29",  time_th: "หลังตลาดปิด",   time_en: "After Close" },
  { ticker: "CRWD", name: "CrowdStrike Holdings",date_th: "4 มิ.ย. 2024",  date_en: "Jun 4",   time_th: "หลังตลาดปิด",   time_en: "After Close" },
  { ticker: "AAPL", name: "Apple Inc.",           date_th: "10 มิ.ย. 2024", date_en: "Jun 10",  time_th: "ก่อนตลาดเปิด", time_en: "Before Open" },
];

const NEWS = [
  { co: "NVDA", color: "#76B900", headline_th: "NVIDIA รายงานผลดีกว่าคาด รายได้พุ่ง 262% จาก AI Demand",               headline_en: "NVIDIA beats estimates; revenue surges 262% on AI demand",              time: "2", s: "positive" },
  { co: "TSLA", color: "#CC0000", headline_th: "Tesla เปิดตัว Robotaxi ส.ค. นี้ นักวิเคราะห์มอง Game Changer",         headline_en: "Tesla launches Robotaxi this August — analysts see it as game changer", time: "4", s: "positive" },
  { co: "FED",  color: "#475569", headline_th: "Fed ส่งสัญญาณลดดอกเบี้ยปลายปีนี้ ตลาดหุ้นตอบรับบวก",                  headline_en: "Fed signals rate cut by year-end; markets respond positively",           time: "6", s: "positive" },
  { co: "MSFT", color: "#00A1F1", headline_th: "Microsoft-OpenAI ร่วมลงทุน $100B ใน AI Data Centers ทั่วโลก",          headline_en: "Microsoft & OpenAI commit $100B to AI data centers globally",           time: "8", s: "positive" },
];

// ── Helpers ──────────────────────────────────────────────────

function getScoreColor(s: number) {
  if (s >= 95) return "#10B981";
  if (s >= 90) return "#22C55E";
  if (s >= 80) return "#3B82F6";
  if (s >= 70) return "#EAB308";
  if (s >= 60) return "#F97316";
  return "#EF4444";
}

const TKR_CLR: Record<string, string> = {
  NVDA: "#76B900", ZS: "#005DAA", CRWD: "#C1121F", NET: "#F48120",
  AMD:  "#ED1C24", AAPL: "#555",  MSFT: "#00A1F1", TSLA: "#CC0000",
  AMZN: "#FF9900", GOOGL: "#4285F4", CRM: "#00A1E0", FED: "#475569",
};

function StockLogo({ ticker, size = 34 }: { ticker: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const r = Math.round(size * 0.26);
  if (failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: r, background: TKR_CLR[ticker] ?? "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.3), fontWeight: 900, color: "#fff", flexShrink: 0 }}>
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
const TickerBadge = StockLogo;

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const fs = size >= 64 ? Math.round(size * 0.24) : size >= 40 ? 10 : 9;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: fs, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        {size >= 60 && <span style={{ fontSize: 8.5, color: "var(--faint)", lineHeight: 1.3 }}>/100</span>}
      </div>
    </div>
  );
}

function MiniSpark({ path, up, w = 60, h = 32 }: { path: string; up: boolean; w?: number; h?: number }) {
  const c = up ? "var(--green)" : "var(--red)";
  return (
    <svg width={w} height={h} style={{ flexShrink: 0 }}>
      <path d={path} fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function scoreStars(s: number) {
  const full = s >= 95 ? 5 : s >= 85 ? 4 : s >= 75 ? 3 : s >= 65 ? 2 : 1;
  return "★".repeat(full) + "☆".repeat(5 - full);
}
function scoreLabel(s: number, th: boolean) {
  if (s >= 95) return th ? "ยอดเยี่ยม" : "Excellent";
  if (s >= 85) return th ? "ดีมาก" : "Very Good";
  if (s >= 75) return th ? "ดี" : "Good";
  if (s >= 65) return th ? "พอใช้" : "Fair";
  return th ? "อ่อนแอ" : "Weak";
}

// ── Quick Actions ─────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: "dip",      icon: "⚡", label_th: "Healthy Pullback", label_en: "Healthy Pullback", color: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)"  },
  { id: "growth",   icon: "🚀", label_th: "Growth Stocks",    label_en: "Growth Stocks",    color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  { id: "ai_tech",  icon: "🤖", label_th: "AI Stocks",        label_en: "AI Stocks",        color: "#06B6D4", bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.3)"  },
  { id: "cyber",    icon: "🛡️", label_th: "Cybersecurity",    label_en: "Cybersecurity",    color: "#2563EB", bg: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.3)"  },
  { id: "breakout", icon: "📈", label_th: "Breakout",         label_en: "Breakout",         color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
  { id: "quality",  icon: "💎", label_th: "Quality Stocks",   label_en: "Quality Stocks",   color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)" },
  { id: "dividend", icon: "💰", label_th: "Dividend Stocks",  label_en: "Dividend Stocks",  color: "#EAB308", bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.3)"  },
];

function QuickActions({ lang }: { lang: string }) {
  const TH = lang === "th";
  const nav = (id: string) =>
    window.dispatchEvent(new CustomEvent("usax-navigate", { detail: { page: "screener", screenerId: id } }));

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {QUICK_ACTIONS.map(a => (
        <button key={a.id} onClick={() => nav(a.id)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: a.bg, border: `1px solid ${a.border}`, borderRadius: 50,
            padding: "9px 18px", cursor: "pointer", color: a.color,
            fontSize: 13, fontWeight: 700, transition: "all .15s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${a.border}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
          <span style={{ fontSize: 15 }}>{a.icon}</span>
          Run {TH ? a.label_th : a.label_en}
        </button>
      ))}
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────────

function HeroSection({ lang }: { lang: string }) {
  const TH = lang === "th";
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 6px", lineHeight: 1.25 }}>
          {TH ? "👋 วันนี้ AI พร้อมคัดกรองหุ้นให้คุณแล้ว" : "👋 Your AI is ready to screen stocks today"}
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          {TH
            ? "เลือกเทคนิคที่ต้องการ แล้วให้ AI วิเคราะห์และคัดหุ้นให้ทันที"
            : "Choose a strategy — AI will analyze and screen top stocks instantly"}
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 20, padding: "4px 12px" }}>
          <Sparkles size={12} color="var(--accent)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 0.3 }}>One-Click AI Stock Research™</span>
        </div>
      </div>
      <QuickActions lang={lang} />
    </section>
  );
}

// ── Market Mini Strip ─────────────────────────────────────────

const MARKET_STRIP = [
  { label: "S&P 500",   value: "5,487", change: "+0.54%", up: true  },
  { label: "NASDAQ",    value: "17,461",change: "+0.75%", up: true  },
  { label: "DOW",       value: "38,868",change: "+0.31%", up: true  },
  { label: "VIX",       value: "13.2",  change: "-2.10%", up: false },
];

function MarketMiniStrip({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [fgValue, setFgValue] = useState(65);
  const fgCol = fgColor(fgValue);

  useEffect(() => {
    fetch("https://api.alternative.me/fng/?limit=1")
      .then(r => r.json())
      .then(d => { if (d.data?.[0]) setFgValue(+d.data[0].value); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 20px", marginBottom: 24, overflowX: "auto", scrollbarWidth: "none" }}>
      {MARKET_STRIP.map((m, i) => (
        <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 20, marginRight: 20, borderRight: "1px solid var(--border)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--faint)", letterSpacing: 0.5, textTransform: "uppercase" }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginTop: 1 }}>{m.value}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: m.up ? "var(--green)" : "var(--red)" }}>
            {m.up ? "▲" : "▼"} {m.change}
          </div>
        </div>
      ))}
      {/* Fear & Greed mini */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--faint)", letterSpacing: 0.5, textTransform: "uppercase" }}>
            {TH ? "ความกลัว/โลภ" : "Fear & Greed"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: fgCol, marginTop: 1 }}>{fgValue}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: fgCol }}>{fgLabel(fgValue, TH)}</div>
          <div style={{ width: 60, height: 5, background: "var(--border)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
            <div style={{ width: `${fgValue}%`, height: "100%", background: fgCol, borderRadius: 99, transition: "width .5s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screener Row (legacy — kept for backward compat) ─────────
function ScreenerRow({ lang }: { lang: string }) {
  const [page, setPage] = useState(0);
  const perPage = 6;
  const pages   = Math.ceil(SCREENERS.length / perPage);
  const visible = SCREENERS.slice(page * perPage, page * perPage + perPage);

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text)" }}>
            {lang === "th" ? "เทคนิคทั้งหมด" : "All Strategies"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
            {lang === "th" ? "กดเพื่อให้ AI คัดหุ้น" : "Click to let AI screen stocks"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.35 : 1, fontSize: 14, color: "var(--muted)" }}>
            ‹
          </button>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}
            style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: page === pages - 1 ? "not-allowed" : "pointer", opacity: page === pages - 1 ? 0.35 : 1, fontSize: 14, color: "var(--muted)" }}>
            ›
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
        {visible.map(sc => (
          <div key={sc.id}
            onClick={() => window.dispatchEvent(new CustomEvent("usax-navigate", { detail: { page: "screener", screenerId: sc.id } }))}
            style={{ background: `linear-gradient(150deg, ${sc.gradFrom}, ${sc.gradTo})`, borderRadius: 18, padding: "20px 14px 16px", cursor: "pointer", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform .15s, box-shadow .15s", boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.18)"; }}>
            <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 120, height: 120, borderRadius: 99, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 14, paddingTop: 4, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
              {SC_ICONS[sc.id]}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 6 }}>
              {lang === "th" ? sc.label : sc.label_en}
            </div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
              {lang === "th" ? sc.desc : sc.desc_en}
            </div>
            <div style={{ display: "inline-flex", alignSelf: "flex-start", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {lang === "th" ? `พบ ${sc.count} ตัว` : `${sc.count} stocks`}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Top Picks (horizontal cards) ─────────────────────────────

function TopPicksCard({ lang }: { lang: string }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
              {lang === "th" ? "AI Top Picks วันนี้" : "AI Top Picks Today"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {lang === "th" ? "อัพเดต: ทุกวันเปิดตลาด 10:00 น." : "Updated daily at market open"}
            </div>
          </div>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--accent)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {lang === "th" ? "ดูทั้งหมด" : "View All"} <ArrowRight size={13} />
        </button>
      </div>

      {/* 5-card horizontal grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
        {TOP_PICKS.map((stock, i) => {
          const tags = lang === "th" ? stock.tags_th : stock.tags_en;
          return (
            <div key={stock.ticker} style={{ padding: "16px 12px", borderRight: i < 4 ? "1px solid var(--border)" : "none", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", cursor: "pointer" }}>
              {/* Rank + Logo row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: i === 0 ? "linear-gradient(135deg,#F59E0B,#EF4444)" : "var(--bg-raised)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 900, color: i === 0 ? "#fff" : "var(--muted)", flexShrink: 0 }}>
                  {stock.rank}
                </div>
                <TickerBadge ticker={stock.ticker} size={36} />
                <div style={{ width: 20 }} />
              </div>

              <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text)", marginBottom: 1 }}>{stock.ticker}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.name}</div>

              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>${stock.price}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: stock.up ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 2, justifyContent: "center", marginBottom: 14 }}>
                {stock.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {stock.change}
              </div>

              <div style={{ fontSize: 9.5, color: "var(--faint)", fontWeight: 600, marginBottom: 6 }}>AI Score</div>
              <ScoreRing score={stock.score} size={72} />
              <div style={{ marginTop: 7, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: getScoreColor(stock.score), fontWeight: 700, letterSpacing: 1 }}>{scoreStars(stock.score)}</div>
                <div style={{ fontSize: 10, color: getScoreColor(stock.score), fontWeight: 700, marginTop: 2 }}>{scoreLabel(stock.score, lang === "th")}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10, width: "100%" }}>
                {tags.map(tag => {
                  const ts = tagStyle(tag);
                  return (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 700, background: ts.bg, color: ts.color, borderRadius: 6, padding: "3px 7px", textAlign: "center" }}>{tag}</span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border)", fontSize: 10.5, color: "var(--faint)" }}>
        ⓘ AI Score คำนวณจาก 20+ ปัจจัย: พื้นฐานทางการเงิน แนวโน้มอุตสาหกรรม เทคนิค ข่าวสาร และ Sentiment
      </div>
    </div>
  );
}

// ── Market Overview ──────────────────────────────────────────

function MarketCard({ lang }: { lang: string }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      <div style={{ padding: "13px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <TrendingUp size={14} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>
            {lang === "th" ? "ภาพรวมตลาด" : "Market Overview"}
          </span>
        </div>
        <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: 7, padding: 2, gap: 2 }}>
          {["US", "Global"].map((tab, i) => (
            <button key={tab} style={{ padding: "3px 10px", borderRadius: 5, border: "none", background: i === 0 ? "var(--bg-card)" : "transparent", color: i === 0 ? "var(--text)" : "var(--faint)", fontSize: 11, fontWeight: i === 0 ? 700 : 400, cursor: "pointer" }}>{tab}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
        {MARKET.map((m, i) => (
          <div key={m.label} style={{ padding: "12px 14px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontSize: 9.5, color: "var(--faint)", fontWeight: 600, marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text)", marginBottom: 2 }}>{m.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: m.up ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 2, marginBottom: 8 }}>
              {m.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />} {m.change}
            </div>
            <MiniSpark path={m.path} up={m.up} w={80} h={36} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fear & Greed ─────────────────────────────────────────────

type FGPoint = { value: number; label: string; color: string };

function fgColor(v: number) {
  return v >= 75 ? "#22C55E" : v >= 55 ? "#84CC16" : v >= 45 ? "#EAB308" : v >= 25 ? "#F97316" : "#EF4444";
}
function fgLabel(v: number, th: boolean) {
  if (v >= 75) return th ? "โลภมาก" : "Extreme Greed";
  if (v >= 55) return th ? "ความโลภ" : "Greed";
  if (v >= 45) return th ? "กลาง" : "Neutral";
  if (v >= 25) return th ? "ความกลัว" : "Fear";
  return th ? "กลัวมาก" : "Extreme Fear";
}

function FearGreedCard({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [value,   setValue]   = useState(65);
  const [history, setHistory] = useState<FGPoint[]>(
    FG_HISTORY.map(h => ({ value: h.value, label: TH ? h.label_th : h.label_en, color: h.color }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.alternative.me/fng/?limit=7")
      .then(r => r.json())
      .then(d => {
        const list: any[] = d.data ?? [];
        if (!list.length) return;
        setValue(+list[0].value);
        setHistory(list.map(p => ({
          value: +p.value,
          label: fgLabel(+p.value, TH),
          color: fgColor(+p.value),
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [TH]);

  const color     = fgColor(value);
  const size      = 150;
  const r         = 58;
  const cx        = size / 2;
  const cy        = size / 2;
  const totalLen  = Math.PI * r;
  const fillLen   = (value / 100) * totalLen;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      <div style={{ padding: "13px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 7 }}>
        <Brain size={14} color="var(--purple)" />
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>
          {TH ? "ดัชนีความกลัวและความโลภ" : "Fear & Greed Index"}
        </span>
        {!loading && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--faint)" }}>Live</span>}
      </div>

      <div style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{ position: "relative", width: size, height: size / 2 + 12 }}>
            <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
              <defs>
                <linearGradient id="fg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#EF4444" />
                  <stop offset="25%"  stopColor="#F97316" />
                  <stop offset="50%"  stopColor="#EAB308" />
                  <stop offset="75%"  stopColor="#84CC16" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              <path d={`M ${cx-r},${cy} A ${r},${r} 0 0,0 ${cx+r},${cy}`}
                fill="none" stroke="url(#fg-grad)" strokeWidth={13} strokeLinecap="round" opacity={0.3} />
              <path d={`M ${cx-r},${cy} A ${r},${r} 0 0,0 ${cx+r},${cy}`}
                fill="none" stroke={color} strokeWidth={13} strokeLinecap="round"
                strokeDasharray={`${fillLen} ${totalLen}`} style={{ transition: "stroke-dasharray .6s ease" }} />
            </svg>
            <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color }}>{fgLabel(value, TH)}</div>
            </div>
          </div>
        </div>

        {/* History list */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {TH ? "ย้อนหลัง 7 วัน" : "7-Day History"}
          </div>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: 99, background: h.color, flexShrink: 0 }} />
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", minWidth: 22 }}>{h.value}</div>
              <div style={{ fontSize: 11, color: h.color }}>{h.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Watchlist ────────────────────────────────────────────────

function WatchlistCard({ lang }: { lang: string }) {
  const [starred, setStarred] = useState<Set<string>>(new Set(["AAPL", "MSFT"]));
  const cols_th = ["หุ้น", "ราคา", "เปลี่ยนแปลง", "AI Score", "แนวโน้ม", "แจ้งเตือน"];
  const cols_en = ["Stock", "Price", "Change", "AI Score", "Trend", "Alert"];
  const cols    = lang === "th" ? cols_th : cols_en;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      <div style={{ padding: "13px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Star size={14} color="var(--yellow)" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>
            {lang === "th" ? "AI Watchlist ของคุณ" : "Your AI Watchlist"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 9px", fontSize: 11, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
            <Plus size={11} /> {lang === "th" ? "เพิ่มหุ้น" : "Add"}
          </button>
          <button style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {lang === "th" ? "ดูทั้งหมด" : "View All"}
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr 0.9fr 0.7fr 0.8fr 0.5fr", gap: "0 8px", padding: "7px 18px 5px", fontSize: 9.5, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {cols.map(c => <span key={c}>{c}</span>)}
      </div>

      {WATCHLIST.map(w => (
        <div key={w.ticker} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr 0.9fr 0.7fr 0.8fr 0.5fr", gap: "0 8px", padding: "9px 18px", alignItems: "center", borderTop: "1px solid var(--border)", cursor: "pointer" }}>
          {/* Stock */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => { const s = new Set(starred); s.has(w.ticker) ? s.delete(w.ticker) : s.add(w.ticker); setStarred(s); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 1, display: "flex", color: starred.has(w.ticker) ? "#EAB308" : "var(--border)" }}>
              <Star size={11} fill={starred.has(w.ticker) ? "#EAB308" : "none"} strokeWidth={starred.has(w.ticker) ? 0 : 2} />
            </button>
            <TickerBadge ticker={w.ticker} size={30} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{w.ticker}</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>{w.name}</div>
            </div>
          </div>
          {/* Price */}
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>${w.price}</div>
          {/* Change */}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: w.up ? "var(--green)" : "var(--red)" }}>{w.change}</div>
          {/* Score */}
          <ScoreRing score={w.score} size={30} />
          {/* Sparkline */}
          <MiniSpark path={w.spark} up={w.up} w={60} h={28} />
          {/* Bell */}
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--faint)", display: "flex", alignItems: "center", padding: 0 }}>
            <Bell size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Earnings Calendar ────────────────────────────────────────

function EarningsCard({ lang }: { lang: string }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      <div style={{ padding: "13px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Zap size={14} color="var(--orange)" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>Earnings Calendar</span>
        </div>
        <button style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
          {lang === "th" ? "ดูทั้งหมด" : "View All"}
        </button>
      </div>
      {EARNINGS.map((e, i) => (
        <div key={e.ticker} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: i < EARNINGS.length - 1 ? "1px solid var(--border)" : "none" }}>
          <TickerBadge ticker={e.ticker} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{lang === "th" ? e.date_th : e.date_en}</div>
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: e.time_th === "หลังตลาดปิด" ? "var(--orange)" : "var(--accent)", background: e.time_th === "หลังตลาดปิด" ? "rgba(249,115,22,0.1)" : "rgba(37,99,235,0.1)", borderRadius: 5, padding: "3px 7px", whiteSpace: "nowrap", flexShrink: 0 }}>
            {lang === "th" ? e.time_th : e.time_en}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI News (AI Summary format) ──────────────────────────────

const AI_SUMMARIES = [
  { co: "NVDA", color: "#76B900", signal: "Bullish ↑",    signal_th: "กระทิง ↑",     signalColor: "#22C55E", summary_th: "Demand ยังแข็งแรง GPU H100 Sold Out Q3-Q4", summary_en: "GPU H100 demand stays strong, Sold Out through Q3-Q4" },
  { co: "TSLA", color: "#CC0000", signal: "Caution ↔",    signal_th: "ระวัง ↔",      signalColor: "#EAB308", summary_th: "Robotaxi Catalyst รอ Q4 ราคาใกล้แนวรับ $240", summary_en: "Robotaxi Q4 catalyst pending, price near support $240" },
  { co: "MSFT", color: "#00A1F1", signal: "Bullish ↑",    signal_th: "กระทิง ↑",     signalColor: "#22C55E", summary_th: "Azure AI Cloud โต 31% YoY Copilot แรง",        summary_en: "Azure AI Cloud +31% YoY, Copilot adoption accelerating" },
  { co: "CRWD", color: "#C1121F", signal: "Strong Buy ↑↑",signal_th: "ซื้อแรง ↑↑",  signalColor: "#10B981", summary_th: "Falcon Platform ARR โต 33% ย่อตัวน่าสะสม",      summary_en: "Falcon ARR +33%, pullback creates accumulation zone" },
];

function NewsCard({ lang }: { lang: string }) {
  const TH = lang === "th";
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      <div style={{ padding: "13px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Brain size={14} color="var(--cyan)" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>
            {TH ? "AI สรุปข่าว" : "AI News Summary"}
          </span>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent("usax-navigate", { detail: { page: "news" } }))}
          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
          {TH ? "ดูทั้งหมด" : "View All"}
        </button>
      </div>
      {AI_SUMMARIES.map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < AI_SUMMARIES.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background .15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
          onMouseLeave={e => (e.currentTarget.style.background = "")}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: n.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff" }}>
            {n.co}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{n.co}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: n.signalColor, background: `${n.signalColor}1a`, borderRadius: 5, padding: "1px 7px" }}>
                {TH ? n.signal_th : n.signal}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.45 }}>
              💡 {TH ? n.summary_th : n.summary_en}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI News old (kept for NewsPage only) ─────────────────────
function _OldNewsCard({ lang }: { lang: string }) {
  const sentColor = (s: string) => s === "positive" ? "var(--green)" : s === "negative" ? "var(--red)" : "var(--yellow)";
  const sentBg    = (s: string) => s === "positive" ? "rgba(34,197,94,0.1)" : s === "negative" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)";
  const sentLabel = (s: string) => s === "positive" ? (lang === "th" ? "บวก" : "Pos") : s === "negative" ? (lang === "th" ? "ลบ" : "Neg") : (lang === "th" ? "เป็นกลาง" : "Neutral");

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
      <div style={{ padding: "13px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Brain size={14} color="var(--cyan)" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{lang === "th" ? "ข่าวเด่นที่ AI คัดให้" : "AI-Curated News"}</span>
        </div>
      </div>
      {NEWS.map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 18px", borderBottom: i < NEWS.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
          <div style={{ width: 44, height: 44, borderRadius: 9, background: n.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff" }}>
            {n.co}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.45, marginBottom: 5 }}>
              {lang === "th" ? n.headline_th : n.headline_en}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 10, color: "var(--faint)" }}>{n.time} {lang === "th" ? "ชั่วโมงที่แล้ว" : "h ago"}</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: sentColor(n.s), background: sentBg(n.s), borderRadius: 4, padding: "1px 6px" }}>
                {sentLabel(n.s)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────

export default function DashboardHome() {
  const { lang } = useLang();
  return (
    <div className="fade-up">
      {/* Hero + One-Click Quick Actions */}
      <HeroSection lang={lang} />

      {/* Market mini strip */}
      <MarketMiniStrip lang={lang} />

      {/* 2-col: Top Picks (60%) + AI News + Screener (40%) */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, marginBottom: 28 }} className="dash-main">
        {/* Left: AI Top Picks */}
        <TopPicksCard lang={lang} />

        {/* Right: AI News + Screener preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <NewsCard lang={lang} />
          {/* Screener shortcut card */}
          <div
            onClick={() => window.dispatchEvent(new CustomEvent("usax-navigate", { detail: { page: "screener" } }))}
            style={{ background: "linear-gradient(135deg, #1e3a8a, #3730a3)", borderRadius: 16, padding: "22px 22px", cursor: "pointer", transition: "transform .15s, box-shadow .15s", boxShadow: "0 2px 12px rgba(30,58,138,0.2)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(30,58,138,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(30,58,138,0.2)"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{lang === "th" ? "เปิด AI Screener" : "Open AI Screener"}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{lang === "th" ? "ดูเทคนิคทั้งหมด 10 แบบ" : "Explore all 10 strategies"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["📉 Pullback", "🚀 Growth", "🤖 AI", "💎 Quality"].map(t => (
                <span key={t} style={{ fontSize: 10.5, fontWeight: 600, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", borderRadius: 6, padding: "3px 9px" }}>{t}</span>
              ))}
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>+6 more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screener cards grid */}
      <ScreenerRow lang={lang} />

      {/* Compliance */}
      <div style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 12, padding: "11px 18px", display: "flex", alignItems: "flex-start", gap: 9, marginTop: 8 }}>
        <ShieldCheck size={13} color="#EAB308" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
          {lang === "th"
            ? "ข้อมูลทั้งหมดจัดทำเพื่อ \"วัตถุประสงค์ทางสถิติ\" เท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน ผู้ใช้ควรศึกษาข้อมูลเพิ่มเติมและตัดสินใจลงทุนด้วยตนเอง"
            : "All data is for statistical purposes only. Not investment advice. Users should conduct their own research before making investment decisions."}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) { .dash-main { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px)  { .dash-main { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
