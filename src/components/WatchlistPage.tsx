"use client";
import { useState, useEffect } from "react";
import { Plus, X, Bell, BellOff, Search, TrendingUp, TrendingDown, Star } from "lucide-react";

type WatchStock = {
  name: string;
  price: number;
  change: string;
  up: boolean;
  score: number;
  color: string;
  spark: string;
};

const DEFAULT_SPARK = "M0,20 L10,20 L20,20 L30,20 L40,20 L50,20 L60,20";

const STOCK_DB: Record<string, WatchStock> = {
  NVDA:  { name: "NVIDIA Corp.",      price: 1089.0, change: "+3.21%", up: true,  score: 97, color: "#76B900", spark: "M0,36 L10,30 L20,22 L30,16 L40,10 L50,6 L60,4"  },
  AAPL:  { name: "Apple Inc.",        price: 195.89, change: "+1.15%", up: true,  score: 85, color: "#555",    spark: "M0,28 L10,25 L20,23 L30,20 L40,18 L50,15 L60,12" },
  MSFT:  { name: "Microsoft Corp.",   price: 416.34, change: "+0.92%", up: true,  score: 90, color: "#00A1F1", spark: "M0,26 L10,23 L20,20 L30,17 L40,13 L50,10 L60,8"  },
  TSLA:  { name: "Tesla Inc.",        price: 176.42, change: "-1.10%", up: false, score: 71, color: "#CC0000", spark: "M0,12 L10,16 L20,20 L30,18 L40,24 L50,26 L60,28" },
  AMZN:  { name: "Amazon.com",        price: 184.25, change: "+1.34%", up: true,  score: 82, color: "#FF9900", spark: "M0,24 L10,21 L20,19 L30,16 L40,13 L50,10 L60,8"  },
  META:  { name: "Meta Platforms",    price: 493.60, change: "+1.82%", up: true,  score: 87, color: "#0867FC", spark: "M0,30 L10,25 L20,20 L30,16 L40,12 L50,9 L60,7"   },
  GOOGL: { name: "Alphabet Inc.",     price: 167.40, change: "+1.52%", up: true,  score: 93, color: "#4285F4", spark: "M0,28 L10,24 L20,20 L30,16 L40,12 L50,9 L60,6"   },
  CRWD:  { name: "CrowdStrike",       price: 330.50, change: "+2.40%", up: true,  score: 91, color: "#C1121F", spark: "M0,32 L10,26 L20,20 L30,15 L40,11 L50,8 L60,6"   },
  ZS:    { name: "Zscaler Inc.",      price: 187.00, change: "+2.50%", up: true,  score: 94, color: "#005DAA", spark: "M0,34 L10,28 L20,22 L30,16 L40,12 L50,8 L60,6"   },
  PLTR:  { name: "Palantir Tech.",    price: 23.40,  change: "+4.50%", up: true,  score: 85, color: "#000",    spark: "M0,30 L10,24 L20,18 L30,14 L40,10 L50,7 L60,5"   },
  COIN:  { name: "Coinbase Global",   price: 201.30, change: "-2.30%", up: false, score: 68, color: "#1652F0", spark: "M0,14 L10,18 L20,22 L30,20 L40,26 L50,24 L60,28" },
  AMD:   { name: "Advanced Micro Dev",price: 158.00, change: "+2.10%", up: true,  score: 86, color: "#ED1C24", spark: "M0,28 L10,24 L20,20 L30,16 L40,12 L50,9 L60,7"   },
  AVGO:  { name: "Broadcom Inc.",     price: 1687.0, change: "+2.50%", up: true,  score: 91, color: "#CC0000", spark: "M0,30 L10,24 L20,18 L30,14 L40,10 L50,7 L60,4"   },
  NET:   { name: "Cloudflare Inc.",   price: 96.35,  change: "+2.14%", up: true,  score: 90, color: "#F48120", spark: "M0,30 L10,24 L20,18 L30,14 L40,10 L50,7 L60,5"   },
  GOOG:  { name: "Alphabet Inc.",     price: 167.40, change: "+1.52%", up: true,  score: 93, color: "#4285F4", spark: "M0,28 L10,24 L20,20 L30,16 L40,12 L50,9 L60,6"   },
  BRKB:  { name: "Berkshire Hathaway",price: 406.10, change: "+0.30%", up: true,  score: 89, color: "#7F5539", spark: "M0,22 L10,20 L20,22 L30,18 L40,20 L50,18 L60,16" },
  PYPL:  { name: "PayPal Holdings",   price: 63.20,  change: "+2.10%", up: true,  score: 82, color: "#003087", spark: "M0,26 L10,22 L20,20 L30,17 L40,15 L50,13 L60,12"  },
  ADBE:  { name: "Adobe Inc.",        price: 414.00, change: "+0.90%", up: true,  score: 86, color: "#FF0000", spark: "M0,30 L10,26 L20,22 L30,18 L40,14 L50,12 L60,10"  },
  SQ:    { name: "Block Inc.",        price: 66.80,  change: "+1.50%", up: true,  score: 74, color: "#1B1B1B", spark: "M0,24 L10,21 L20,19 L30,16 L40,14 L50,12 L60,11"  },
  SNOW:  { name: "Snowflake Inc.",    price: 162.80, change: "+1.10%", up: true,  score: 83, color: "#29B5E8", spark: "M0,28 L10,24 L20,20 L30,17 L40,13 L50,11 L60,10"  },
  TSM:   { name: "TSMC",              price: 153.40, change: "+1.80%", up: true,  score: 90, color: "#1D4ED8", spark: "M0,28 L10,24 L20,20 L30,15 L40,11 L50,9 L60,8"    },
  ORCL:  { name: "Oracle Corp.",      price: 122.30, change: "+0.90%", up: true,  score: 84, color: "#C74634", spark: "M0,26 L10,23 L20,21 L30,18 L40,14 L50,12 L60,11"  },
  PANW:  { name: "Palo Alto Networks",price: 305.00, change: "+1.20%", up: true,  score: 88, color: "#00C0E8", spark: "M0,28 L10,25 L20,22 L30,18 L40,14 L50,10 L60,8"   },
  FTNT:  { name: "Fortinet Inc.",     price: 59.00,  change: "+0.90%", up: true,  score: 82, color: "#EE3124", spark: "M0,26 L10,24 L20,22 L30,19 L40,16 L50,14 L60,12"  },
  JNJ:   { name: "Johnson & Johnson", price: 155.00, change: "+0.50%", up: true,  score: 84, color: "#D51900", spark: "M0,24 L10,23 L20,21 L30,20 L40,18 L50,17 L60,16"  },
  KO:    { name: "Coca-Cola Co.",     price: 63.00,  change: "+0.30%", up: true,  score: 81, color: "#F40009", spark: "M0,22 L10,21 L20,20 L30,19 L40,18 L50,17 L60,16"  },
  PG:    { name: "Procter & Gamble",  price: 168.00, change: "+0.60%", up: true,  score: 83, color: "#003DA5", spark: "M0,26 L10,24 L20,22 L30,20 L40,18 L50,16 L60,14"  },
  ABBV:  { name: "AbbVie Inc.",       price: 178.00, change: "+1.20%", up: true,  score: 86, color: "#071D49", spark: "M0,28 L10,25 L20,22 L30,18 L40,15 L50,12 L60,10"  },
  ENPH:  { name: "Enphase Energy",    price: 118.00, change: "+2.10%", up: true,  score: 78, color: "#F37321", spark: "M0,30 L10,27 L20,23 L30,20 L40,17 L50,13 L60,10"  },
  UBER:  { name: "Uber Technologies", price: 75.00,  change: "+3.10%", up: true,  score: 80, color: "#000000", spark: "M0,32 L10,28 L20,23 L30,18 L40,14 L50,9 L60,6"    },
  V:     { name: "Visa Inc.",         price: 272.00, change: "+0.80%", up: true,  score: 88, color: "#1A1F71", spark: "M0,26 L10,24 L20,22 L30,19 L40,16 L50,13 L60,10"  },
  MA:    { name: "Mastercard Inc.",   price: 455.00, change: "+0.90%", up: true,  score: 87, color: "#EB001B", spark: "M0,27 L10,25 L20,22 L30,19 L40,15 L50,12 L60,9"   },
};

const ALL_TICKERS = Object.keys(STOCK_DB);

function getScoreColor(s: number) {
  return s >= 90 ? "#22C55E" : s >= 80 ? "#3B82F6" : s >= 70 ? "#EAB308" : "#EF4444";
}

function ScoreRing({ score, size = 38 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color }}>{score}</div>
    </div>
  );
}

function StockLogo({ ticker, size = 36 }: { ticker: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const r = Math.round(size * 0.26);
  if (failed) {
    const bg = STOCK_DB[ticker]?.color ?? "#64748B";
    return (
      <div style={{ width: size, height: size, borderRadius: r, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.3), fontWeight: 900, color: "#fff", flexShrink: 0 }}>
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

function MiniSpark({ path, up }: { path: string; up: boolean }) {
  return (
    <svg width={60} height={32} style={{ flexShrink: 0 }}>
      <path d={path} fill="none" stroke={up ? "#22C55E" : "#EF4444"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DEFAULT_LIST    = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "CRWD", "ZS"];
const DEFAULT_ALERTS  = ["NVDA", "AAPL"];
const LS_LIST_KEY     = "usax-watchlist-v1";
const LS_ALERTS_KEY   = "usax-watchlist-alerts-v1";

function normalizeTicker(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeTickerList(value: unknown) {
  const source = Array.isArray(value) ? value : [];
  return [...new Set(source.map(normalizeTicker).filter(Boolean))];
}

function readTickerList(key: string, fallback: string[] = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const next = normalizeTickerList(parsed);
    return next.length ? next : fallback;
  } catch {
    return fallback;
  }
}

function getStockInfo(ticker: string): WatchStock {
  return STOCK_DB[ticker] ?? {
    name: ticker,
    price: 0,
    change: "-",
    up: true,
    score: 75,
    color: "#64748B",
    spark: DEFAULT_SPARK,
  };
}

export default function WatchlistPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [list,    setListRaw]    = useState<string[]>(DEFAULT_LIST);
  const [alerts,  setAlertsRaw]  = useState<Set<string>>(new Set(DEFAULT_ALERTS));
  const [query,   setQuery]      = useState("");
  const [focused, setFocused]    = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadSavedWatchlist = () => {
      setListRaw(readTickerList(LS_LIST_KEY, DEFAULT_LIST));
      setAlertsRaw(new Set(readTickerList(LS_ALERTS_KEY, DEFAULT_ALERTS)));
    };
    const timer = window.setTimeout(loadSavedWatchlist, 0);
    window.addEventListener("usax-watchlist-updated", loadSavedWatchlist);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("usax-watchlist-updated", loadSavedWatchlist);
    };
  }, []);

  const setList = (updater: (prev: string[]) => string[]) => {
    setListRaw(prev => {
      const next = normalizeTickerList(updater(prev));
      try { localStorage.setItem(LS_LIST_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const setAlerts = (updater: (prev: Set<string>) => Set<string>) => {
    setAlertsRaw(prev => {
      const next = new Set(normalizeTickerList([...updater(prev)]));
      try { localStorage.setItem(LS_ALERTS_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const normalizedQuery = query.trim().toUpperCase();
  const suggestions = normalizedQuery
    ? ALL_TICKERS.filter(t => !list.includes(t) && (t.includes(normalizedQuery) || STOCK_DB[t]?.name.toLowerCase().includes(query.toLowerCase())))
    : [];
  const stocks = Array.isArray(list)
    ? normalizeTickerList(list).map(t => ({ ticker: t, ...getStockInfo(t) }))
    : [];
  const best   = stocks.length ? stocks.reduce((a, b) => ((a.score ?? 0) > (b.score ?? 0) ? a : b)) : null;

  const addStock = (t: string) => {
    const ticker = normalizeTicker(t);
    if (ticker && !list.includes(ticker)) setList(p => [...p, ticker]);
    setQuery("");
    setFocused(false);
  };
  const removeStock = (t: string) => setList(p => p.filter(x => x !== normalizeTicker(t)));
  const toggleAlert = (t: string) => setAlerts(p => {
    const ticker = normalizeTicker(t);
    const n = new Set(p);
    if (n.has(ticker)) {
      n.delete(ticker);
    } else {
      n.add(ticker);
    }
    return n;
  });

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
            {TH ? "AI Watchlist" : "AI Watchlist"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {TH ? `ติดตาม ${stocks.length} หุ้น • อัปเดตทุก 15 นาที` : `Tracking ${stocks.length} stocks • Updated every 15 min`}
          </p>
        </div>
        {/* Add stock input */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-card)", border: "1.5px solid var(--accent)", borderRadius: 11, padding: "8px 14px" }}>
            <Search size={14} color="var(--accent)" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder={TH ? "เพิ่มหุ้น..." : "Add stock..."}
              style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text)", width: 130 }}
            />
            <Plus size={14} color="var(--accent)" />
          </div>
          {focused && query && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 8, zIndex: 100, minWidth: 220, boxShadow: "var(--shadow-md)" }}>
              {suggestions.slice(0, 6).map(t => (
                <div key={t} onClick={() => addStock(t)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <StockLogo ticker={t} size={28} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{t}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{STOCK_DB[t]?.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {focused && normalizedQuery && suggestions.length === 0 && !list.includes(normalizedQuery) && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 8, zIndex: 100, minWidth: 220, boxShadow: "var(--shadow-md)" }}>
              <div onMouseDown={e => e.preventDefault()} onClick={() => addStock(normalizedQuery)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}>
                <StockLogo ticker={normalizedQuery} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{normalizedQuery}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{TH ? "เพิ่ม ticker นี้" : "Add this ticker"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 44px 70px 44px 44px", gap: 8, padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
          {[TH ? "หุ้น" : "Stock", TH ? "ราคา" : "Price", TH ? "เปลี่ยน" : "Change", TH ? "คะแนน" : "Score", "7D Chart", TH ? "แจ้ง" : "Alert", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5, textAlign: i >= 1 ? "center" : "left" }}>
              {h}
            </div>
          ))}
        </div>

        {stocks.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--faint)" }}>
            <Star size={36} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>
              {TH ? "ยังไม่มีหุ้นใน Watchlist" : "No stocks in your watchlist"}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{TH ? "ค้นหาและเพิ่มหุ้นด้านบน" : "Search and add stocks above"}</div>
          </div>
        ) : (
          stocks.map((s, idx) => (
            <div key={s.ticker}
              style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 44px 70px 44px 44px", gap: 8, alignItems: "center", padding: "13px 18px", borderBottom: idx < stocks.length - 1 ? "1px solid var(--border)" : "none", transition: "background .12s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {/* Ticker */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StockLogo ticker={s.ticker} size={36} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{s.ticker}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                </div>
              </div>
              {/* Price */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>${(s.price ?? 0).toLocaleString()}</div>
              </div>
              {/* Change */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                {s.up ? <TrendingUp size={12} color="var(--green)" /> : <TrendingDown size={12} color="var(--red)" />}
                <span style={{ fontSize: 12, fontWeight: 700, color: s.up ? "var(--green)" : "var(--red)" }}>{s.change ?? "—"}</span>
              </div>
              {/* Score */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ScoreRing score={s.score ?? 0} />
              </div>
              {/* Sparkline */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <MiniSpark path={s.spark ?? "M0,20 L60,20"} up={s.up ?? false} />
              </div>
              {/* Alert toggle */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={() => toggleAlert(s.ticker)}
                  title={alerts.has(s.ticker) ? (TH ? "ปิดแจ้งเตือน" : "Disable alert") : (TH ? "เปิดแจ้งเตือน" : "Enable alert")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: alerts.has(s.ticker) ? "var(--accent)" : "var(--faint)", padding: 4, display: "flex" }}>
                  {alerts.has(s.ticker) ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
              </div>
              {/* Remove */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={() => removeStock(s.ticker)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--faint)", padding: 4, display: "flex" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--faint)")}>
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Top Pick from Watchlist */}
      {best && (
        <div style={{ background: `linear-gradient(135deg, var(--bg-card), rgba(34,197,94,0.06))`, border: "1px solid rgba(34,197,94,0.2)", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            ⭐ {TH ? "AI Top Pick จาก Watchlist ของคุณ" : "AI Top Pick from Your Watchlist"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <StockLogo ticker={best.ticker} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "var(--text)" }}>{best.ticker} — {best.name ?? ""}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                {TH ? `AI Score สูงสุดใน Watchlist ที่ ${best.score ?? 0}/100` : `Highest AI Score in your watchlist at ${best.score ?? 0}/100`}
              </div>
            </div>
            <ScoreRing score={best.score ?? 0} size={52} />
          </div>
          <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 12 }}>
            ⚠️ {TH ? "ข้อมูลเชิงสถิติเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน" : "Statistical data only — not investment advice"}
          </div>
        </div>
      )}
    </div>
  );
}
