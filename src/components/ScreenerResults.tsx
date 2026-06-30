"use client";
import { useState, useEffect } from "react";
import { SCREENERS } from "./DashboardHome";

// ── Mock results for demonstration ─────────────────────────
const MOCK_RESULTS: Record<string, any[]> = {
  dip: [
    { ticker: "GOOG", name: "Alphabet",      price: 167.40, change: "+1.2%", up: true,  score: 93, pe: 23, rev: "+15%", wr: "✓", cap: "2.1T", reasons: ["Down 28% ATH", "AI Revenue", "Buy Zone"] },
    { ticker: "BRKB", name: "Berkshire",     price: 406.10, change: "+0.3%", up: true,  score: 89, pe: 21, rev: "+8%",  wr: "✓", cap: "880B",  reasons: ["Value Play", "Cash Reserve", "Buffett"] },
    { ticker: "TSLA", name: "Tesla",         price: 176.40, change: "-1.1%", up: false, score: 71, pe: 55, rev: "+3%",  wr: "✗", cap: "561B",  reasons: ["Down 32% ATH", "EV Leader", "Margin Pressure"] },
    { ticker: "PYPL", name: "PayPal",        price: 63.20,  change: "+2.1%", up: true,  score: 82, pe: 14, rev: "+9%",  wr: "✓", cap: "67B",   reasons: ["Down 31% ATH", "Cheap P/E", "Turnaround"] },
    { ticker: "ADBE", name: "Adobe",         price: 414.00, change: "+0.9%", up: true,  score: 86, pe: 28, rev: "+11%", wr: "✓", cap: "181B",  reasons: ["Down 24% ATH", "AI Tools", "Subscription"] },
    { ticker: "COIN", name: "Coinbase",      price: 201.30, change: "-2.3%", up: false, score: 68, pe: 42, rev: "+89%", wr: "✗", cap: "48B",   reasons: ["Crypto Cycle", "High Vol", "Speculative"] },
    { ticker: "SQ",   name: "Block",         price: 66.80,  change: "+1.5%", up: true,  score: 74, pe: 26, rev: "+20%", wr: "✓", cap: "41B",   reasons: ["Down 30% ATH", "Cash App", "Bitcoin"] },
  ],
  growth: [
    { ticker: "NVDA", name: "NVIDIA",        price: 1089.0, change: "+3.2%", up: true,  score: 97, pe: 52, rev: "+122%",wr: "✓", cap: "2.7T",  reasons: ["AI Demand", "Data Center", "Dominant"] },
    { ticker: "META", name: "Meta",          price: 493.60, change: "+1.8%", up: true,  score: 87, pe: 27, rev: "+27%", wr: "✓", cap: "1.25T", reasons: ["Ad Rebound", "AI Infra", "Reality Labs"] },
    { ticker: "CRWD", name: "Crowdstrike",   price: 330.50, change: "+2.4%", up: true,  score: 91, pe: 78, rev: "+33%", wr: "✓", cap: "83B",   reasons: ["ARR Growth", "Platform", "AI Security"] },
    { ticker: "SNOW", name: "Snowflake",     price: 162.80, change: "+1.1%", up: true,  score: 83, pe: null, rev: "+33%",wr: "✓", cap: "54B",  reasons: ["Data Cloud", "AI Workload", "Net Rev Ret"] },
    { ticker: "PLTR", name: "Palantir",      price: 23.40,  change: "+4.5%", up: true,  score: 85, pe: 68, rev: "+21%", wr: "✓", cap: "50B",   reasons: ["US Gov", "AI Platform", "GAAP Profit"] },
  ],
  ai_tech: [
    { ticker: "NVDA", name: "NVIDIA",        price: 1089.0, change: "+3.2%", up: true,  score: 97, pe: 52, rev: "+122%",wr: "✓", cap: "2.7T",  reasons: ["AI Compute", "H100/H200", "Blackwell"] },
    { ticker: "MSFT", name: "Microsoft",     price: 416.80, change: "+1.1%", up: true,  score: 94, pe: 36, rev: "+17%", wr: "✓", cap: "3.1T",  reasons: ["Copilot AI", "Azure AI", "OpenAI"] },
    { ticker: "AVGO", name: "Broadcom",      price: 1687.0, change: "+2.5%", up: true,  score: 91, pe: 31, rev: "+43%", wr: "✓", cap: "786B",  reasons: ["AI XPU", "Networking", "VMware"] },
    { ticker: "TSM",  name: "TSMC",          price: 153.40, change: "+1.8%", up: true,  score: 90, pe: 26, rev: "+13%", wr: "✓", cap: "796B",  reasons: ["AI Chip Fab", "Monopoly", "CoWoS"] },
    { ticker: "AMD",  name: "AMD",           price: 158.00, change: "+2.1%", up: true,  score: 86, pe: 50, rev: "+2%",  wr: "✓", cap: "255B",  reasons: ["MI300X", "EPYC Server", "AI Challenger"] },
    { ticker: "ORCL", name: "Oracle",        price: 122.30, change: "+0.9%", up: true,  score: 84, pe: 33, rev: "+7%",  wr: "✓", cap: "336B",  reasons: ["OCI Cloud", "AI Database", "GPU Cluster"] },
  ],
};

function getResults(id: string) {
  return MOCK_RESULTS[id] ?? MOCK_RESULTS["dip"];
}

// ── Score Ring ──────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "var(--green)" : score >= 75 ? "var(--yellow)" : "var(--red)";
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

// ── Stock Row ───────────────────────────────────────────────
function StockRow({ s, rank, color }: { s: any; rank: number; color: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto auto auto auto", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", transition: "background .15s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        {/* Rank */}
        <div style={{ fontSize: 12, fontWeight: 800, color: rank <= 3 ? color : "var(--faint)", textAlign: "center" }}>#{rank}</div>

        {/* Ticker + name */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{s.ticker}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.name}</div>
        </div>

        {/* Price */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>${s.price.toLocaleString()}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: s.up ? "var(--green)" : "var(--red)" }}>{s.change}</div>
        </div>

        {/* P/E */}
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>{s.pe ? `P/E ${s.pe}` : "—"}</div>

        {/* Rev Growth */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", textAlign: "center" }}>{s.rev}</div>

        {/* Market cap */}
        <div style={{ fontSize: 11, color: "var(--faint)", textAlign: "right" }}>{s.cap}</div>

        {/* AI Score */}
        <ScoreRing score={s.score} />
      </div>

      {/* Expanded AI analysis */}
      {expanded && (
        <div style={{ background: "var(--bg-raised)", borderBottom: "1px solid var(--border)", padding: "14px 16px 14px 60px" }} className="fade-up">
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>📊 ปัจจัยที่ผ่านเกณฑ์ (เชิงสถิติ)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {s.reasons.map((r: string) => (
              <span key={r} style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "3px 10px" }}>✓ {r}</span>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--faint)", marginBottom: 8 }}>⚠️ ข้อมูลเชิงสถิติเท่านั้น ไม่ใช่คำแนะนำซื้อขาย</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📄 ดูข้อมูลเพิ่มเติม</button>
            <button style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>⭐ บันทึก Watchlist</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Loading animation ───────────────────────────────────────
function AILoader({ screener }: { screener: typeof SCREENERS[0] }) {
  const steps = [
    "ค้นหาหุ้นในฐานข้อมูล 5,000+ ตัว",
    "ดึงงบการเงินล่าสุด",
    "อ่าน Earnings Reports",
    "วิเคราะห์ข่าวและ Sentiment",
    "คำนวณ AI Score",
    "จัดอันดับและสรุปผล",
  ];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1));
      setProgress(p => Math.min(p + 17, 100));
    }, 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: 20, textAlign: "center" }}>
      <div style={{ fontSize: 52 }}>{screener.icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>AI กำลังค้นหาหุ้น...</div>
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

// ── Main ScreenerResults ────────────────────────────────────
export default function ScreenerResults({ screener, onBack }: { screener: typeof SCREENERS[0]; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setResults(getResults(screener.id));
      setLoading(false);
    }, 3800);
    return () => clearTimeout(t);
  }, [screener.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Back + Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button onClick={onBack}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--muted)", fontSize: 13, padding: "7px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          ← กลับ
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{screener.icon}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{screener.label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{screener.desc}</div>
          </div>
        </div>
        {!loading && (
          <div style={{ marginLeft: "auto", background: screener.glow, border: `1px solid ${screener.color}33`, borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: screener.color }}>
            พบ {results.length} ตัว
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <AILoader screener={screener} />
        </div>
      ) : (
        <>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>เรียงตาม:</span>
            {["AI Score", "Market Cap", "Revenue Growth", "P/E Ratio"].map((f, i) => (
              <button key={f}
                style={{ background: i === 0 ? screener.color : "var(--bg-card)", border: `1px solid ${i === 0 ? screener.color : "var(--border)"}`, color: i === 0 ? "#fff" : "var(--muted)", borderRadius: 8, fontSize: 12, fontWeight: i === 0 ? 700 : 400, padding: "5px 12px", cursor: "pointer" }}>
                {f}
              </button>
            ))}
            <button style={{ marginLeft: "auto", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--accent)", borderRadius: 8, fontSize: 12, fontWeight: 700, padding: "5px 14px", cursor: "pointer" }}>
              📄 Export PDF
            </button>
          </div>

          {/* Table header */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }} className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto auto auto auto", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              {["#", "บริษัท", "ราคา", "P/E", "Rev Growth", "Mkt Cap", "AI Score"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5, textAlign: h === "#" ? "center" : h === "ราคา" || h === "Mkt Cap" || h === "AI Score" ? "right" : "center" }}>{h}</div>
              ))}
            </div>
            {results.map((r, i) => <StockRow key={r.ticker} s={r} rank={i + 1} color={screener.color} />)}
          </div>

          {/* AI Summary */}
          <div style={{ background: `linear-gradient(135deg, var(--bg-card), ${screener.glow})`, border: `1px solid ${screener.color}22`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: screener.color, marginBottom: 8 }}>📊 สรุปข้อมูลเชิงสถิติ — {screener.label}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
              จากการกรองด้วยเกณฑ์เชิงสถิติ พบ {results.length} บริษัทที่ผ่านเกณฑ์ โดย <strong style={{ color: "var(--text)" }}>{results[0]?.ticker}</strong> มี AI Score สูงสุดที่ {results[0]?.score}/100
              ปัจจัยที่ผ่านเกณฑ์ ได้แก่ {results[0]?.reasons.join(", ")}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--faint)", background: "rgba(0,0,0,0.15)", borderRadius: 8, padding: "8px 12px" }}>
              ⚠️ ข้อมูลทั้งหมดเป็นการวิเคราะห์เชิงสถิติเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำในการลงทุน ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติมและตัดสินใจด้วยตนเอง
            </div>
          </div>
        </>
      )}
    </div>
  );
}
