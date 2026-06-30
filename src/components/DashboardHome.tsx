"use client";
import { useState } from "react";
import ScreenerResults from "./ScreenerResults";

// ── Screener card definitions ───────────────────────────────
export const SCREENERS = [
  {
    id:       "dip",
    icon:     "🔥",
    label:    "หุ้นย่อตัวน่าสนใจ",
    label_en: "Dip Buying",
    desc:     "ย่อจาก ATH 20–35% แต่ปัจจัยพื้นฐานยังแข็งแกร่ง",
    count:    7,
    color:    "#EF4444",
    glow:     "rgba(239,68,68,0.15)",
    tags:     ["Pullback", "ATH -25%", "Strong Fundamental"],
  },
  {
    id:       "growth",
    icon:     "🚀",
    label:    "หุ้นเติบโตสูง",
    label_en: "High Growth",
    desc:     "Revenue โต 30%+ YoY และ Margin กำลังขยาย",
    count:    12,
    color:    "#3B82F6",
    glow:     "rgba(59,130,246,0.15)",
    tags:     ["Rev +30%", "Expanding Margin", "High EPS Growth"],
  },
  {
    id:       "quality",
    icon:     "💎",
    label:    "หุ้นคุณภาพ",
    label_en: "Quality Stocks",
    desc:     "ROE สูง, หนี้น้อย, Moat แข็งแกร่ง ราคาสมเหตุสมผล",
    count:    9,
    color:    "#A855F7",
    glow:     "rgba(168,85,247,0.15)",
    tags:     ["ROE 20%+", "Low Debt", "Wide Moat"],
  },
  {
    id:       "breakout",
    icon:     "📈",
    label:    "หุ้นกำลัง Breakout",
    label_en: "Breakout",
    desc:     "ราคาทะลุ resistance สำคัญพร้อม Volume สูงกว่าปกติ",
    count:    5,
    color:    "#22C55E",
    glow:     "rgba(34,197,94,0.15)",
    tags:     ["Volume Surge", "Resistance Break", "52W High"],
  },
  {
    id:       "ai_tech",
    icon:     "🤖",
    label:    "หุ้น AI & Technology",
    label_en: "AI Stocks",
    desc:     "บริษัทที่ได้ประโยชน์โดยตรงจาก AI Supercycle",
    count:    15,
    color:    "#06B6D4",
    glow:     "rgba(6,182,212,0.15)",
    tags:     ["AI Exposure", "Data Center", "Chip + Software"],
  },
  {
    id:       "cyber",
    icon:     "🛡️",
    label:    "Cybersecurity",
    label_en: "Cyber",
    desc:     "ความต้องการด้าน Security โตต่อเนื่อง ARR แข็งแกร่ง",
    count:    6,
    color:    "#F59E0B",
    glow:     "rgba(245,158,11,0.15)",
    tags:     ["ARR Growth", "Enterprise", "Zero Trust"],
  },
  {
    id:       "dividend",
    icon:     "💰",
    label:    "หุ้นปันผล",
    label_en: "Dividend",
    desc:     "Yield 3–6% พร้อม Dividend Growth ต่อเนื่องมากกว่า 5 ปี",
    count:    18,
    color:    "#22C55E",
    glow:     "rgba(34,197,94,0.15)",
    tags:     ["Yield 3–6%", "5Y Growth", "Dividend King"],
  },
  {
    id:       "earnings",
    icon:     "⚡",
    label:    "Earnings Momentum",
    label_en: "Earnings",
    desc:     "EPS beat 3 ไตรมาสติดกัน และ Guidance ถูกปรับขึ้น",
    count:    8,
    color:    "#F59E0B",
    glow:     "rgba(245,158,11,0.15)",
    tags:     ["3Q EPS Beat", "Guidance Up", "Analyst Upgrade"],
  },
  {
    id:       "value",
    icon:     "💵",
    label:    "หุ้นมูลค่าถูก",
    label_en: "Value",
    desc:     "P/E ต่ำกว่า Sector เฉลี่ย แต่ Growth ยังแข็งแกร่ง",
    count:    11,
    color:    "#A855F7",
    glow:     "rgba(168,85,247,0.15)",
    tags:     ["Low P/E", "PEG < 1", "Undervalued"],
  },
  {
    id:       "megatrend",
    icon:     "🌎",
    label:    "Mega Trend",
    label_en: "Mega Trend",
    desc:     "อยู่ในเทรนด์ระยะยาว: AI / EV / Clean Energy / Biotech",
    count:    20,
    color:    "#3B82F6",
    glow:     "rgba(59,130,246,0.15)",
    tags:     ["Long-term", "Thematic", "Secular Growth"],
  },
];

// ── Market summary mini cards ───────────────────────────────
const MARKET_SUMMARY = [
  { label: "S&P 500",       value: "5,278.00", change: "+0.42%",  up: true,  icon: "📊" },
  { label: "NASDAQ 100",    value: "18,412.30", change: "+0.71%", up: true,  icon: "💻" },
  { label: "Fear & Greed",  value: "72 / Greed", change: "เหลือ",up: true,  icon: "😎" },
  { label: "VIX",           value: "13.2",      change: "-2.1%",  up: false, icon: "📉" },
];

function MarketMiniCard({ item }: { item: typeof MARKET_SUMMARY[0] }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 24 }}>{item.icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>{item.label}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{item.value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: item.up ? "var(--green)" : "var(--red)" }}>{item.change}</div>
      </div>
    </div>
  );
}

// ── Screener Card ───────────────────────────────────────────
function ScreenerCard({ s, onRun }: { s: typeof SCREENERS[0]; onRun: (s: typeof SCREENERS[0]) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? `linear-gradient(135deg, var(--bg-card) 0%, ${s.glow.replace("0.15","0.08")} 100%)` : "var(--bg-card)",
        border: `1px solid ${hover ? s.color + "44" : "var(--border)"}`,
        borderRadius: 16,
        padding: "20px",
        cursor: "pointer",
        transition: "all .2s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow: hover ? `0 8px 32px ${s.glow}` : "none",
      }}
      onClick={() => onRun(s)}
    >
      {/* Glow blob */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: s.glow, borderRadius: "50%", filter: "blur(30px)", opacity: hover ? 1 : 0, transition: "opacity .2s" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 32 }}>{s.icon}</div>
        <div style={{ background: s.glow, border: `1px solid ${s.color}33`, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: s.color }}>
          พบ {s.count} ตัว
        </div>
      </div>

      {/* Labels */}
      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{s.label}</div>
      <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>{s.label_en}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>{s.desc}</div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
        {s.tags.map(tag => (
          <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", background: "var(--bg-raised)", borderRadius: 6, padding: "2px 8px" }}>{tag}</span>
        ))}
      </div>

      {/* CTA */}
      <button
        style={{ width: "100%", background: hover ? s.color : "var(--bg-raised)", border: `1px solid ${hover ? s.color : "var(--border)"}`, color: hover ? "#fff" : "var(--muted)", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
        onClick={e => { e.stopPropagation(); onRun(s); }}>
        🔍 วิเคราะห์เชิงสถิติ
      </button>
    </div>
  );
}

// ── Top AI Picks preview ────────────────────────────────────
const TOP_PICKS = [
  { ticker: "NVDA", name: "NVIDIA",      score: 97, change: "+3.2%", up: true,  reasons: ["AI Demand", "Revenue โต", "Margin ดี"] },
  { ticker: "MSFT", name: "Microsoft",   score: 94, change: "+1.1%", up: true,  reasons: ["Cloud Growth", "AI Copilot", "Moat"] },
  { ticker: "AVGO", name: "Broadcom",    score: 91, change: "+2.5%", up: true,  reasons: ["AI Chip", "VMware", "Dividend"] },
  { ticker: "AMZN", name: "Amazon",      score: 89, change: "-0.4%", up: false, reasons: ["AWS Growth", "Ad Revenue", "Margin"] },
  { ticker: "META", name: "Meta",        score: 87, change: "+1.8%", up: true,  reasons: ["Ad Rebound", "AI Infra", "Monetize"] },
];

function TopPickCard({ p }: { p: typeof TOP_PICKS[0] }) {
  const scoreColor = p.score >= 90 ? "var(--green)" : p.score >= 80 ? "var(--yellow)" : "var(--muted)";
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 14, flex: "1 1 180px", minWidth: 160 }}>
      {/* Score ring */}
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${scoreColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: scoreColor }}>{p.score}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{p.ticker}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: p.up ? "var(--green)" : "var(--red)" }}>{p.change}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>{p.name}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {p.reasons.map(r => (
            <span key={r} style={{ fontSize: 9, fontWeight: 600, color: "var(--green)", background: "rgba(34,197,94,0.08)", borderRadius: 4, padding: "1px 5px" }}>✓ {r}</span>
          ))}
        </div>
      </div>
      <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--muted)", fontSize: 11, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>ดูเพิ่ม</button>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────
export default function DashboardHome() {
  const [activeScreener, setActiveScreener] = useState<typeof SCREENERS[0] | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const greetEmoji = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙";

  if (activeScreener) {
    return <ScreenerResults screener={activeScreener} onBack={() => setActiveScreener(null)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Greeting */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
            {greeting}, Tony! {greetEmoji}
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            AI วิเคราะห์เชิงสถิติพร้อมแล้ว — เลือก Theme แล้วกด Run เพื่อดูข้อมูล
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "var(--green)", fontWeight: 700 }}>
            🟢 ตลาดเปิด
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "var(--muted)" }}>
            อัพเดต 09:32 ET
          </div>
        </div>
      </div>

      {/* Market mini cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {MARKET_SUMMARY.map(m => <MarketMiniCard key={m.label} item={m} />)}
      </div>

      {/* AI Top Picks */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>🏆 AI Score สูงสุดวันนี้</h2>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>ข้อมูลเชิงสถิติจากทุก Screener — ไม่ใช่คำแนะนำซื้อขาย</p>
          </div>
          <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--accent)", fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer" }}>ดูทั้งหมด →</button>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {TOP_PICKS.map(p => <TopPickCard key={p.ticker} p={p} />)}
        </div>
      </section>

      {/* Screener Cards Grid */}
      <section>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>🎯 เลือกเกณฑ์กรองหุ้น</h2>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>กดการ์ดเพื่อดูหุ้นที่ผ่านเกณฑ์เชิงสถิติ — วิเคราะห์เพื่อประกอบการตัดสินใจด้วยตัวเอง</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {SCREENERS.map(s => (
            <ScreenerCard key={s.id} s={s} onRun={setActiveScreener} />
          ))}
        </div>
      </section>

      {/* Quick Stats bar */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px", display: "flex", gap: 32, flexWrap: "wrap" }}>
        {[
          { label: "หุ้นในระบบ",    value: "5,000+",  icon: "📊" },
          { label: "AI วิเคราะห์วันนี้", value: "112",   icon: "🤖" },
          { label: "AI Score > 90",  value: "23 ตัว",  icon: "⭐" },
          { label: "Earnings สัปดาห์นี้", value: "48 บริษัท", icon: "📅" },
        ].map(stat => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
