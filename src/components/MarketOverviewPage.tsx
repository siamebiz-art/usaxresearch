"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Globe, Activity } from "lucide-react";

const US_INDICES = [
  { label: "S&P 500",   value: "5,487.03", change: "+0.54%", up: true,  ytd: "+14.2%", path: "M0,36 L15,30 L30,34 L45,22 L60,25 L75,16 L90,8"  },
  { label: "NASDAQ",    value: "17,461.32", change: "+0.75%", up: true,  ytd: "+19.8%", path: "M0,36 L15,30 L30,26 L45,20 L60,16 L75,10 L90,5"  },
  { label: "DOW JONES", value: "38,868.04", change: "+0.31%", up: true,  ytd: "+4.8%",  path: "M0,32 L15,28 L30,32 L45,25 L60,28 L75,22 L90,15" },
  { label: "Russell 2000",value: "2,067.1", change: "-0.18%", up: false, ytd: "+2.1%",  path: "M0,24 L15,28 L30,26 L45,30 L60,27 L75,32 L90,28" },
  { label: "VIX",       value: "13.24",    change: "-2.10%", up: false, ytd: "-38.2%", path: "M0,12 L15,16 L30,14 L45,18 L60,16 L75,22 L90,28" },
  { label: "10Y Yield", value: "4.42%",    change: "+0.02",  up: true,  ytd: "+0.31%", path: "M0,20 L15,22 L30,18 L45,24 L60,20 L75,22 L90,18" },
];

const GLOBAL_INDICES = [
  { label: "Nikkei 225",  country: "🇯🇵", value: "38,646",  change: "+0.92%", up: true  },
  { label: "Hang Seng",   country: "🇭🇰", value: "18,207",  change: "-0.43%", up: false },
  { label: "Shanghai",    country: "🇨🇳", value: "3,108",   change: "+0.28%", up: true  },
  { label: "DAX",         country: "🇩🇪", value: "18,476",  change: "+0.61%", up: true  },
  { label: "FTSE 100",    country: "🇬🇧", value: "8,317",   change: "+0.35%", up: true  },
  { label: "CAC 40",      country: "🇫🇷", value: "7,945",   change: "+0.48%", up: true  },
  { label: "SET Index",   country: "🇹🇭", value: "1,337",   change: "-0.22%", up: false },
  { label: "KOSPI",       country: "🇰🇷", value: "2,712",   change: "+0.54%", up: true  },
  { label: "ASX 200",     country: "🇦🇺", value: "7,744",   change: "+0.41%", up: true  },
  { label: "Sensex",      country: "🇮🇳", value: "73,961",  change: "+0.63%", up: true  },
  { label: "TSX",         country: "🇨🇦", value: "22,045",  change: "+0.19%", up: true  },
  { label: "Bovespa",     country: "🇧🇷", value: "125,876", change: "-0.34%", up: false },
];

const SECTORS = [
  { label: "Technology",        label_th: "เทคโนโลยี",     change: "+1.82%", up: true,  color: "#3B82F6", bg: "rgba(59,130,246,0.1)"  },
  { label: "Communication",     label_th: "สื่อสาร",        change: "+1.24%", up: true,  color: "#8B5CF6", bg: "rgba(139,92,246,0.1)"  },
  { label: "Consumer Discret.", label_th: "ผู้บริโภค",      change: "+0.91%", up: true,  color: "#F97316", bg: "rgba(249,115,22,0.1)"  },
  { label: "Health Care",       label_th: "สุขภาพ",         change: "+0.53%", up: true,  color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  { label: "Financials",        label_th: "การเงิน",        change: "+0.42%", up: true,  color: "#06B6D4", bg: "rgba(6,182,212,0.1)"   },
  { label: "Industrials",       label_th: "อุตสาหกรรม",     change: "+0.31%", up: true,  color: "#14B8A6", bg: "rgba(20,184,166,0.1)"  },
  { label: "Real Estate",       label_th: "อสังหาริมทรัพย์", change: "-0.12%", up: false, color: "#EAB308", bg: "rgba(234,179,8,0.1)"   },
  { label: "Consumer Staples",  label_th: "สินค้าจำเป็น",   change: "-0.23%", up: false, color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
  { label: "Utilities",         label_th: "สาธารณูปโภค",    change: "-0.38%", up: false, color: "#64748B", bg: "rgba(100,116,139,0.1)" },
  { label: "Materials",         label_th: "วัสดุ",          change: "-0.44%", up: false, color: "#A16207", bg: "rgba(161,98,7,0.1)"    },
  { label: "Energy",            label_th: "พลังงาน",        change: "-0.61%", up: false, color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
];

const STATIC_COMMODITIES = [
  { label: "Gold",   value: "$2,329", change: "+0.31%", up: true,  live: false },
  { label: "Oil WTI",value: "$78.4",  change: "-0.52%", up: false, live: false },
  { label: "Silver", value: "$27.8",  change: "+0.44%", up: true,  live: false },
  { label: "DXY",    value: "104.8",  change: "-0.19%", up: false, live: false },
];

function MiniSpark({ path, up }: { path: string; up: boolean }) {
  return (
    <svg width={90} height={42}>
      <path d={path} fill="none" stroke={up ? "#22C55E" : "#EF4444"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TABS = ["us", "global", "sectors"] as const;
type Tab = typeof TABS[number];

type CryptoPrice = { label: string; value: string; change: string; up: boolean; live: boolean };

export default function MarketOverviewPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [tab, setTab] = useState<Tab>("us");
  const [crypto, setCrypto] = useState<CryptoPrice[]>([
    { label: "BTC", value: "$67,420", change: "+1.21%", up: true,  live: false },
    { label: "ETH", value: "$3,845",  change: "+0.93%", up: true,  live: false },
  ]);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true")
      .then(r => r.json())
      .then(d => {
        const fmt = (n: number) => n >= 1000
          ? "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 })
          : "$" + n.toFixed(2);
        const fmtChg = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
        setCrypto([
          { label: "BTC", value: fmt(d.bitcoin.usd), change: fmtChg(d.bitcoin.usd_24h_change), up: d.bitcoin.usd_24h_change >= 0, live: true },
          { label: "ETH", value: fmt(d.ethereum.usd), change: fmtChg(d.ethereum.usd_24h_change), up: d.ethereum.usd_24h_change >= 0, live: true },
        ]);
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const usHour = (now.getUTCHours() - 4 + 24) % 24;
  const isOpen = usHour >= 9 && usHour < 16;

  const TAB_LABELS: Record<Tab, string> = {
    us:      TH ? "ตลาดสหรัฐฯ" : "US Markets",
    global:  TH ? "ตลาดโลก"   : "Global",
    sectors: TH ? "กลุ่มอุตสาหกรรม" : "Sectors",
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
            {TH ? "Market Overview" : "Market Overview"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: isOpen ? "#22C55E" : "#EF4444", boxShadow: isOpen ? "0 0 6px #22C55E" : "none" }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {TH
                ? (isOpen ? "NYSE/NASDAQ เปิดทำการ" : "NYSE/NASDAQ ปิดทำการ")
                : (isOpen ? "NYSE/NASDAQ Open" : "NYSE/NASDAQ Closed")}
            </span>
          </div>
        </div>
        {/* Commodities strip */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[...STATIC_COMMODITIES, ...crypto].map(c => (
            <div key={c.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>
                {c.label}{c.live && <span style={{ color: "#22C55E", marginLeft: 2 }}>●</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{c.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.up ? "var(--green)" : "var(--red)" }}>{c.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-raised)", borderRadius: 12, padding: 4, marginBottom: 18, width: "fit-content" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: tab === t ? "var(--bg-card)" : "transparent", color: tab === t ? "var(--text)" : "var(--muted)", fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: "pointer", boxShadow: tab === t ? "var(--shadow)" : "none", transition: "all .15s" }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* US Markets */}
      {tab === "us" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {US_INDICES.map(idx => (
            <div key={idx.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>{idx.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginTop: 4 }}>{idx.value}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    {idx.up ? <TrendingUp size={13} color="var(--green)" /> : <TrendingDown size={13} color="var(--red)" />}
                    <span style={{ fontSize: 14, fontWeight: 800, color: idx.up ? "var(--green)" : "var(--red)" }}>{idx.change}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>
                    {TH ? "YTD" : "YTD"} {idx.ytd}
                  </div>
                </div>
              </div>
              <MiniSpark path={idx.path} up={idx.up} />
            </div>
          ))}
        </div>
      )}

      {/* Global */}
      {tab === "global" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {GLOBAL_INDICES.map(idx => (
            <div key={idx.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{idx.country}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{idx.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text)", marginTop: 2 }}>{idx.value}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {idx.up ? <TrendingUp size={12} color="var(--green)" /> : <TrendingDown size={12} color="var(--red)" />}
                <span style={{ fontSize: 12, fontWeight: 700, color: idx.up ? "var(--green)" : "var(--red)" }}>{idx.change}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sectors */}
      {tab === "sectors" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
            {TH ? "ผลตอบแทนวันนี้แยกตามกลุ่มอุตสาหกรรม S&P 500" : "Today's S&P 500 sector performance"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[...SECTORS].sort((a, b) => parseFloat(b.change) - parseFloat(a.change)).map(s => (
              <div key={s.label}
                style={{ background: s.bg, border: `1.5px solid ${s.color}30`, borderRadius: 14, padding: "16px 16px 14px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -10, top: -10, width: 60, height: 60, borderRadius: 99, background: s.color, opacity: 0.08 }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 4 }}>
                  {TH ? s.label_th : s.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {s.up ? <TrendingUp size={14} color={s.color} /> : <TrendingDown size={14} color={s.color} />}
                  <span style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.change}</span>
                </div>
                <div style={{ marginTop: 8, height: 5, background: "rgba(0,0,0,0.1)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: s.up ? `${Math.min(parseFloat(s.change) * 40, 100)}%` : "0%", background: s.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: 20, fontSize: 11, color: "var(--faint)", lineHeight: 1.7, padding: "0 2px" }}>
        ⚠️ {TH ? "ข้อมูลตลาดล่าช้า 15 นาที เพื่อการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน" : "Market data delayed 15 min. For educational purposes only — not investment advice."}
      </div>
    </div>
  );
}
