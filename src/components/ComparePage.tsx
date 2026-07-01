"use client";
import { useState } from "react";
import { Search, Plus, X, TrendingUp, TrendingDown } from "lucide-react";

const STOCK_DB: Record<string, { name: string; price: number; change: string; up: boolean; score: number; pe: number | null; rev: string; cap: string; sector: string; sector_en: string; eps: string; roe: string; margin: string; spark: string; color: string; reasons: string[] }> = {
  NVDA:  { name: "NVIDIA Corporation",        price: 1089,   change: "+3.2%",  up: true,  score: 97, pe: 52,   rev: "+122%", cap: "2.7T",  sector: "เทคโนโลยี",    sector_en: "Technology",  eps: "$16.84", roe: "91%", margin: "55%", spark: "M0,36 L12,30 L24,22 L36,16 L48,10 L60,6", color: "#76B900", reasons: ["AI Demand", "Data Center", "Dominant"] },
  MSFT:  { name: "Microsoft Corporation",     price: 416,    change: "+1.1%",  up: true,  score: 94, pe: 36,   rev: "+17%",  cap: "3.1T",  sector: "เทคโนโลยี",    sector_en: "Technology",  eps: "$11.45", roe: "38%", margin: "43%", spark: "M0,32 L12,28 L24,24 L36,20 L48,16 L60,12", color: "#00A1F1", reasons: ["Copilot AI", "Azure", "OpenAI"] },
  AAPL:  { name: "Apple Inc.",                price: 195,    change: "+1.2%",  up: true,  score: 85, pe: 28,   rev: "+5%",   cap: "3.0T",  sector: "เทคโนโลยี",    sector_en: "Technology",  eps: "$6.97",  roe: "147%",margin: "29%", spark: "M0,28 L12,25 L24,23 L36,20 L48,18 L60,14", color: "#555555", reasons: ["Services Growth", "iPhone Loyalty", "AI Features"] },
  GOOGL: { name: "Alphabet Inc.",             price: 167,    change: "+1.5%",  up: true,  score: 90, pe: 23,   rev: "+15%",  cap: "2.1T",  sector: "เทคโนโลยี",    sector_en: "Technology",  eps: "$7.26",  roe: "30%", margin: "27%", spark: "M0,30 L12,26 L24,22 L36,18 L48,13 L60,10", color: "#4285F4", reasons: ["AI Revenue", "YouTube", "Cloud"] },
  META:  { name: "Meta Platforms",            price: 493,    change: "+1.8%",  up: true,  score: 87, pe: 27,   rev: "+27%",  cap: "1.25T", sector: "เทคโนโลยี",    sector_en: "Technology",  eps: "$18.28", roe: "31%", margin: "35%", spark: "M0,34 L12,28 L24,22 L36,18 L48,14 L60,10", color: "#0867FC", reasons: ["Ad Rebound", "AI Infra", "Threads"] },
  AMZN:  { name: "Amazon.com Inc.",           price: 184,    change: "+1.3%",  up: true,  score: 82, pe: 50,   rev: "+13%",  cap: "1.93T", sector: "ผู้บริโภค",    sector_en: "Consumer",    eps: "$3.56",  roe: "22%", margin: "7%",  spark: "M0,28 L12,24 L24,22 L36,18 L48,15 L60,11", color: "#FF9900", reasons: ["AWS Growth", "Ad Revenue", "Logistics"] },
  TSLA:  { name: "Tesla Inc.",                price: 176,    change: "-1.1%",  up: false, score: 71, pe: 55,   rev: "+3%",   cap: "561B",  sector: "ยานยนต์",      sector_en: "Auto",        eps: "$3.12",  roe: "17%", margin: "18%", spark: "M0,14 L12,18 L24,22 L36,20 L48,25 L60,28", color: "#CC0000", reasons: ["Robotaxi", "EV Leader", "FSD Revenue"] },
  CRWD:  { name: "CrowdStrike Holdings",      price: 330,    change: "+2.4%",  up: true,  score: 91, pe: 78,   rev: "+33%",  cap: "83B",   sector: "ไซเบอร์",     sector_en: "Cybersecurity", eps: "$4.19", roe: "14%", margin: "22%", spark: "M0,32 L12,26 L24,20 L36,16 L48,12 L60,8", color: "#C1121F", reasons: ["ARR Growth", "Platform", "AI Security"] },
  ZS:    { name: "Zscaler Inc.",              price: 187,    change: "+2.5%",  up: true,  score: 94, pe: 85,   rev: "+24%",  cap: "28B",   sector: "ไซเบอร์",     sector_en: "Cybersecurity", eps: "$2.41", roe: "12%", margin: "20%", spark: "M0,34 L12,28 L24,22 L36,17 L48,12 L60,8", color: "#005DAA", reasons: ["Zero Trust", "Cloud Security", "ARR"] },
  PLTR:  { name: "Palantir Technologies",     price: 23,     change: "+4.5%",  up: true,  score: 85, pe: 68,   rev: "+21%",  cap: "50B",   sector: "ซอฟต์แวร์",    sector_en: "Software",    eps: "$0.33",  roe: "8%",  margin: "16%", spark: "M0,30 L12,24 L24,20 L36,16 L48,12 L60,8", color: "#000000", reasons: ["US Gov", "AI Platform", "GAAP Profit"] },
};

const POPULAR = ["NVDA", "MSFT", "AAPL", "GOOGL", "META", "AMZN", "TSLA", "CRWD", "ZS", "PLTR"];

function getScoreColor(s: number) {
  if (s >= 95) return "#10B981";
  if (s >= 90) return "#22C55E";
  if (s >= 80) return "#3B82F6";
  if (s >= 70) return "#EAB308";
  return "#EF4444";
}

function ScoreBar({ score }: { score: number }) {
  const color = getScoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: "var(--bg-raised)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99, transition: "width .6s ease" }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

function MiniSpark({ path, up }: { path: string; up: boolean }) {
  return (
    <svg width={60} height={36} style={{ flexShrink: 0 }}>
      <path d={path} fill="none" stroke={up ? "#22C55E" : "#EF4444"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Lang = "th" | "en";

const METRICS = (lang: Lang) => [
  { key: "score",  label: lang === "th" ? "AI Score"    : "AI Score",      suffix: "/100" },
  { key: "price",  label: lang === "th" ? "ราคา"        : "Price",         suffix: "" },
  { key: "change", label: lang === "th" ? "เปลี่ยน"    : "Change",        suffix: "" },
  { key: "cap",    label: lang === "th" ? "Market Cap"  : "Market Cap",    suffix: "" },
  { key: "pe",     label: "P/E Ratio",                                      suffix: "" },
  { key: "rev",    label: lang === "th" ? "Rev Growth"  : "Rev Growth",    suffix: "" },
  { key: "eps",    label: "EPS",                                             suffix: "" },
  { key: "roe",    label: "ROE",                                             suffix: "" },
  { key: "margin", label: lang === "th" ? "กำไรสุทธิ"  : "Net Margin",    suffix: "" },
  { key: "sector", label: lang === "th" ? "กลุ่มธุรกิจ" : "Sector",       suffix: "" },
];

export default function ComparePage({ lang }: { lang: string }) {
  const L = lang as Lang;
  const [selected, setSelected] = useState<string[]>(["NVDA", "MSFT"]);
  const [query,    setQuery]    = useState("");
  const [focused,  setFocused]  = useState(false);

  const filtered = query.trim()
    ? POPULAR.filter(t => t.includes(query.toUpperCase()) || STOCK_DB[t]?.name.toLowerCase().includes(query.toLowerCase()))
    : POPULAR;

  const addStock = (ticker: string) => {
    if (!selected.includes(ticker) && selected.length < 4) {
      setSelected(p => [...p, ticker]);
    }
    setQuery("");
    setFocused(false);
  };

  const removeStock = (ticker: string) => setSelected(p => p.filter(t => t !== ticker));

  const stocks = selected.map(t => ({ ticker: t, ...STOCK_DB[t] })).filter(Boolean);

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
          {L === "th" ? "เปรียบเทียบหุ้น" : "Compare Stocks"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>
          {L === "th" ? "เปรียบเทียบหุ้นสูงสุด 4 ตัวพร้อม AI Score และข้อมูลพื้นฐาน" : "Compare up to 4 stocks with AI Score and fundamentals"}
        </p>
      </div>

      {/* Stock Selector */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px", marginBottom: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {stocks.map(s => (
            <div key={s.ticker} style={{ display: "flex", alignItems: "center", gap: 8, background: `${s.color}18`, border: `1.5px solid ${s.color}40`, borderRadius: 11, padding: "6px 12px" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff" }}>
                {s.ticker.slice(0, 4)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{s.ticker}</span>
              <button onClick={() => removeStock(s.ticker)}
                style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", padding: 2, display: "flex" }}>
                <X size={13} />
              </button>
            </div>
          ))}
          {selected.length < 4 && (
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--bg-raised)", border: "1.5px dashed var(--border2)", borderRadius: 11, padding: "6px 14px", cursor: "text" }}
                onClick={() => setFocused(true)}>
                <Plus size={13} color="var(--muted)" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder={L === "th" ? "เพิ่มหุ้น..." : "Add stock..."}
                  style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text)", width: 100 }}
                />
              </div>
              {focused && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 8, zIndex: 100, minWidth: 200, boxShadow: "var(--shadow-md)" }}>
                  {filtered.filter(t => !selected.includes(t)).slice(0, 6).map(t => (
                    <div key={t} onClick={() => addStock(t)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: STOCK_DB[t]?.color ?? "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff" }}>
                        {t.slice(0, 4)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{t}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{STOCK_DB[t]?.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--faint)" }}>
          {L === "th" ? `เลือก ${selected.length}/4 หุ้น` : `${selected.length}/4 stocks selected`}
        </div>
      </div>

      {/* Sparklines Row */}
      {stocks.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${stocks.length}, 1fr)`, gap: 14, marginBottom: 14 }}>
          {stocks.map(s => (
            <div key={s.ticker} style={{ background: "var(--bg-card)", border: `1.5px solid ${s.color}44`, borderRadius: 16, padding: "18px 18px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                  {s.ticker.slice(0, 4)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{s.ticker}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{s.name}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>${s.price.toLocaleString()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.up ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 3 }}>
                    {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{s.change}
                  </div>
                </div>
                <MiniSpark path={s.spark} up={s.up} />
              </div>
              <ScoreBar score={s.score} />
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {stocks.length > 1 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${stocks.length}, 1fr)`, borderBottom: "1px solid var(--border)" }}>
            <div style={{ padding: "12px 18px", fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase" }}>
              {L === "th" ? "ตัวชี้วัด" : "Metric"}
            </div>
            {stocks.map(s => (
              <div key={s.ticker} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: "var(--text)", borderLeft: "1px solid var(--border)", textAlign: "center" }}>
                {s.ticker}
              </div>
            ))}
          </div>
          {METRICS(L).map(({ key, label, suffix }) => {
            const values = stocks.map(s => {
              const v = key === "sector" && L === "en" ? s.sector_en : (s as any)[key];
              return v ?? "—";
            });
            const isScore = key === "score";
            const maxScore = isScore ? Math.max(...values.map(Number)) : null;
            return (
              <div key={key} style={{ display: "grid", gridTemplateColumns: `180px repeat(${stocks.length}, 1fr)`, borderBottom: "1px solid var(--border)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ padding: "13px 18px", fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
                {stocks.map((s, i) => {
                  const v = key === "sector" && L === "en" ? s.sector_en : (s as any)[key];
                  const isMax = isScore && Number(v) === maxScore;
                  const color = key === "score" ? getScoreColor(Number(v))
                    : key === "change" ? (s.up ? "var(--green)" : "var(--red)") : "var(--text)";
                  return (
                    <div key={s.ticker} style={{ padding: "13px 16px", fontSize: 13, fontWeight: key === "score" ? 900 : 600, color, textAlign: "center", borderLeft: "1px solid var(--border)", background: isMax ? `${getScoreColor(Number(v))}0f` : "transparent" }}>
                      {v ?? "—"}{suffix}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Summary */}
      {stocks.length > 1 && (
        <div style={{ marginTop: 14, background: "linear-gradient(135deg, var(--bg-card), rgba(37,99,235,0.06))", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}>
            🤖 {L === "th" ? "AI วิเคราะห์เปรียบเทียบ (สถิติ)" : "AI Comparison Analysis (Statistical)"}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
            {(() => {
              const best = stocks.reduce((a, b) => a.score > b.score ? a : b);
              const worst = stocks.reduce((a, b) => a.score < b.score ? a : b);
              return L === "th"
                ? `จากการวิเคราะห์เชิงสถิติ ${best.ticker} มี AI Score สูงสุด (${best.score}/100) ด้วย ${best.reasons.join(", ")} ขณะที่ ${worst.ticker} มีคะแนนต่ำกว่าที่ ${worst.score}/100`
                : `Statistically, ${best.ticker} leads with AI Score ${best.score}/100 based on ${best.reasons.join(", ")}. ${worst.ticker} scores lower at ${worst.score}/100.`;
            })()}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--faint)" }}>
            ⚠️ {L === "th" ? "ข้อมูลเชิงสถิติเท่านั้น ไม่ใช่คำแนะนำการลงทุน" : "Statistical data only — not investment advice"}
          </div>
        </div>
      )}

      {stocks.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--faint)" }}>
          <Search size={40} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--muted)" }}>
            {L === "th" ? "ค้นหาและเพิ่มหุ้นที่ต้องการเปรียบเทียบ" : "Search and add stocks to compare"}
          </div>
        </div>
      )}
    </div>
  );
}
