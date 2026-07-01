"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Edit2, Plus, RefreshCw, Save, X } from "lucide-react";
import { loadUserPortfolio, loadUserWatchlist, saveUserPortfolio, type PortfolioPosition } from "@/lib/user-data";

type Position = PortfolioPosition;
type TickerTemplate = {
  ticker: string;
  name: string;
  color: string;
  price: number;
  sector: string;
};
type SyncState = "loading" | "synced" | "saving" | "local" | "error";
type FormState = {
  ticker: string;
  shares: string;
  avgCost: string;
  price: string;
};

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3B82F6",
  Semiconductors: "#8B5CF6",
  Cybersecurity: "#C1121F",
  Financials: "#06B6D4",
  Consumer: "#F97316",
  Healthcare: "#10B981",
  Energy: "#EAB308",
};

const INIT_POSITIONS: Position[] = [
  { id: 1, ticker: "NVDA", name: "NVIDIA Corporation", color: "#76B900", shares: 10, avgCost: 650, price: 1089, sector: "Semiconductors" },
  { id: 2, ticker: "MSFT", name: "Microsoft Corporation", color: "#00A1F1", shares: 15, avgCost: 310, price: 416.34, sector: "Technology" },
  { id: 3, ticker: "AAPL", name: "Apple Inc.", color: "#555", shares: 20, avgCost: 155, price: 189.3, sector: "Technology" },
  { id: 4, ticker: "META", name: "Meta Platforms", color: "#0867FC", shares: 8, avgCost: 280, price: 493.6, sector: "Technology" },
  { id: 5, ticker: "CRWD", name: "CrowdStrike Holdings", color: "#C1121F", shares: 12, avgCost: 180, price: 330.5, sector: "Cybersecurity" },
  { id: 6, ticker: "JPM", name: "JPMorgan Chase", color: "#003087", shares: 25, avgCost: 140, price: 197.6, sector: "Financials" },
];

const TICKER_LIST = [
  ...INIT_POSITIONS.map(({ ticker, name, color, price, sector }) => ({ ticker, name, color, price, sector })),
  { ticker: "TSLA", name: "Tesla Inc.", color: "#CC0000", price: 176.4, sector: "Consumer" },
  { ticker: "AMZN", name: "Amazon.com Inc.", color: "#FF9900", price: 182.3, sector: "Consumer" },
  { ticker: "GOOG", name: "Alphabet Inc.", color: "#4285F4", price: 167.4, sector: "Technology" },
  { ticker: "GOOGL", name: "Alphabet Inc.", color: "#34A853", price: 166.9, sector: "Technology" },
  { ticker: "AMD", name: "Advanced Micro Devices", color: "#ED1C24", price: 158, sector: "Semiconductors" },
  { ticker: "AVGO", name: "Broadcom Inc.", color: "#CC092F", price: 1405, sector: "Semiconductors" },
  { ticker: "TSM", name: "Taiwan Semiconductor", color: "#B00020", price: 151.5, sector: "Semiconductors" },
  { ticker: "ZS", name: "Zscaler Inc.", color: "#005DAA", price: 187, sector: "Cybersecurity" },
  { ticker: "PANW", name: "Palo Alto Networks", color: "#FA582D", price: 312, sector: "Cybersecurity" },
  { ticker: "FTNT", name: "Fortinet Inc.", color: "#EE3124", price: 59.4, sector: "Cybersecurity" },
  { ticker: "PLTR", name: "Palantir Technologies", color: "#111827", price: 24.2, sector: "Technology" },
  { ticker: "ORCL", name: "Oracle Corporation", color: "#C74634", price: 122.1, sector: "Technology" },
  { ticker: "SNOW", name: "Snowflake Inc.", color: "#29B5E8", price: 137.4, sector: "Technology" },
  { ticker: "NET", name: "Cloudflare Inc.", color: "#F48120", price: 78.5, sector: "Technology" },
  { ticker: "UBER", name: "Uber Technologies", color: "#000", price: 66.9, sector: "Consumer" },
  { ticker: "COIN", name: "Coinbase Global", color: "#0052FF", price: 237, sector: "Financials" },
  { ticker: "PYPL", name: "PayPal Holdings", color: "#003087", price: 63.2, sector: "Financials" },
  { ticker: "V", name: "Visa Inc.", color: "#1A1F71", price: 276.4, sector: "Financials" },
  { ticker: "MA", name: "Mastercard Inc.", color: "#EB001B", price: 456.8, sector: "Financials" },
  { ticker: "JNJ", name: "Johnson & Johnson", color: "#D71920", price: 146.6, sector: "Healthcare" },
  { ticker: "ABBV", name: "AbbVie Inc.", color: "#071D49", price: 165.8, sector: "Healthcare" },
  { ticker: "KO", name: "Coca-Cola Company", color: "#F40009", price: 62.7, sector: "Consumer" },
  { ticker: "PG", name: "Procter & Gamble", color: "#003DA5", price: 166.1, sector: "Consumer" },
  { ticker: "XOM", name: "Exxon Mobil", color: "#D71920", price: 113.5, sector: "Energy" },
] satisfies TickerTemplate[];

const LS_PORTFOLIO_KEY = "usax-portfolio-v1";
const LS_WATCHLIST_KEY = "usax-watchlist-v1";
const EMPTY_FORM: FormState = { ticker: "NVDA", shares: "", avgCost: "", price: "" };

function parsePositive(value: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function normalizeTicker(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeTickerList(value: unknown) {
  const source = Array.isArray(value) ? value : [];
  return [...new Set(source.map(normalizeTicker).filter(Boolean))];
}

function StockLogo({ ticker, color, size = 34 }: { ticker: string; color: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.24);

  if (failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: radius, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.26), fontWeight: 900, color: "#fff", flexShrink: 0 }}>
        {ticker.slice(0, 4)}
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", background: "#fff", flexShrink: 0, border: "1px solid rgba(15,23,42,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={`https://assets.parqet.com/logos/symbol/${encodeURIComponent(ticker)}?format=jpg`}
        alt={`${ticker} logo`}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function readLocalWatchlist() {
  try {
    const stored = localStorage.getItem(LS_WATCHLIST_KEY);
    if (!stored) return [];
    return normalizeTickerList(JSON.parse(stored));
  } catch {
    return [];
  }
}

function getTickerTemplate(ticker: string): TickerTemplate {
  const normalized = normalizeTicker(ticker);
  return TICKER_LIST.find((item) => item.ticker === normalized) ?? {
    ticker: normalized,
    name: normalized,
    color: "#64748B",
    price: 0,
    sector: "Technology",
  };
}

export default function PortfolioPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [positions, setPositionsRaw] = useState<Position[]>(INIT_POSITIONS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [tab, setTab] = useState<"holdings" | "allocation">("holdings");
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>([]);

  useEffect(() => {
    const loadLocalPortfolio = () => {
      try {
        const stored = localStorage.getItem(LS_PORTFOLIO_KEY);
        if (stored) setPositionsRaw(JSON.parse(stored));
      } catch {
        setSyncState("local");
      }
    };

    const loadCloudPortfolio = async () => {
      const cloud = await loadUserPortfolio();
      if (!cloud) {
        setSyncState("local");
        return;
      }

      setPositionsRaw(cloud);
      setSyncState("synced");
      try {
        localStorage.setItem(LS_PORTFOLIO_KEY, JSON.stringify(cloud));
      } catch {}
    };

    const timer = window.setTimeout(loadLocalPortfolio, 0);
    void loadCloudPortfolio();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadLocalWatchlist = () => setWatchlistTickers(readLocalWatchlist());
    const loadCloudWatchlist = async () => {
      const cloud = await loadUserWatchlist();
      if (!cloud) return;
      setWatchlistTickers(cloud.tickers);
      try {
        localStorage.setItem(LS_WATCHLIST_KEY, JSON.stringify(cloud.tickers));
      } catch {}
    };

    const timer = window.setTimeout(loadLocalWatchlist, 0);
    void loadCloudWatchlist();
    window.addEventListener("usax-watchlist-updated", loadLocalWatchlist);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("usax-watchlist-updated", loadLocalWatchlist);
    };
  }, []);

  const persistPositions = (next: Position[]) => {
    try {
      localStorage.setItem(LS_PORTFOLIO_KEY, JSON.stringify(next));
    } catch {}

    setSyncState("saving");
    void saveUserPortfolio(next)
      .then((result) => {
        if (!result?.ok) {
          setSyncState("error");
          return;
        }
        setSyncState(result.synced ? "synced" : "local");
        setLastSavedAt(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      })
      .catch(() => setSyncState("error"));
  };

  const setPositions = (updater: (prev: Position[]) => Position[]) => {
    setPositionsRaw((prev) => {
      const next = updater(prev);
      persistPositions(next);
      return next;
    });
  };

  const totalCost = positions.reduce((sum, p) => sum + p.shares * p.avgCost, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.shares * p.price, 0);
  const totalPnL = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const up = totalPnL >= 0;

  const sectors = useMemo(() => {
    if (totalValue <= 0) return [];

    const sectorMap: Record<string, number> = {};
    positions.forEach((position) => {
      sectorMap[position.sector] = (sectorMap[position.sector] ?? 0) + position.shares * position.price;
    });

    return Object.entries(sectorMap)
      .map(([sector, value]) => ({ sector, value, pct: (value / totalValue) * 100 }))
      .sort((a, b) => b.value - a.value);
  }, [positions, totalValue]);

  const availableTickers = useMemo(() => {
    const source = watchlistTickers.length ? watchlistTickers : TICKER_LIST.map((item) => item.ticker);
    const positionTickers = positions.map((position) => position.ticker);
    return normalizeTickerList([...source, ...positionTickers]).map(getTickerTemplate);
  }, [positions, watchlistTickers]);
  const selectedTicker = availableTickers.find((item) => item.ticker === form.ticker) ?? availableTickers[0] ?? TICKER_LIST[0];
  const isEditing = editingId !== null;

  const resetForm = () => {
    const firstTicker = availableTickers[0] ?? TICKER_LIST[0];
    setForm({ ticker: firstTicker.ticker, shares: "", avgCost: "", price: firstTicker.price > 0 ? String(firstTicker.price) : "" });
    setEditingId(null);
    setFormError("");
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const cancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const startEdit = (position: Position) => {
    setForm({
      ticker: position.ticker,
      shares: String(position.shares),
      avgCost: String(position.avgCost),
      price: String(position.price),
    });
    setEditingId(position.id);
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitPosition = () => {
    const shares = parsePositive(form.shares);
    const avgCost = parsePositive(form.avgCost);
    const price = parsePositive(form.price || String(selectedTicker.price));

    if (!selectedTicker || !shares || !avgCost || !price) {
      setFormError(TH ? "กรุณากรอกจำนวนหุ้น ต้นทุน และราคาปัจจุบันให้ถูกต้อง" : "Enter valid shares, average cost, and current price.");
      return;
    }

    const duplicate = positions.some((position) => position.ticker === selectedTicker.ticker && position.id !== editingId);
    if (duplicate) {
      setFormError(TH ? "มีหุ้นตัวนี้อยู่แล้ว ให้แก้ไขรายการเดิมแทน" : "This ticker already exists. Edit the existing position instead.");
      return;
    }

    const nextPosition: Position = {
      id: editingId ?? Date.now(),
      ticker: selectedTicker.ticker,
      name: selectedTicker.name,
      color: selectedTicker.color,
      sector: selectedTicker.sector,
      shares,
      avgCost,
      price,
    };

    setPositions((prev) => (isEditing ? prev.map((position) => (position.id === editingId ? nextPosition : position)) : [...prev, nextPosition]));
    resetForm();
    setShowForm(false);
  };

  const deletePosition = (id: number) => {
    setPositions((prev) => prev.filter((position) => position.id !== id));
    if (editingId === id) cancelForm();
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const syncLabel = {
    loading: TH ? "กำลังโหลด" : "Loading",
    saving: TH ? "กำลังบันทึก" : "Saving",
    synced: TH ? "บันทึกแล้ว" : "Synced",
    local: TH ? "บันทึกในเครื่อง" : "Local",
    error: TH ? "Sync มีปัญหา" : "Sync issue",
  }[syncState];
  const syncColor = syncState === "synced" ? "var(--green)" : syncState === "error" ? "var(--red)" : "var(--muted)";

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>Portfolio Analysis</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {TH ? `${positions.length} รายการ | จัดการพอร์ตและติดตามผลตอบแทน` : `${positions.length} positions | Manage holdings and track performance`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid var(--border)", borderRadius: 999, padding: "8px 12px", color: syncColor, fontSize: 12, fontWeight: 700 }}>
            {syncState === "saving" || syncState === "loading" ? <RefreshCw size={13} /> : <Check size={13} />}
            {syncLabel}{lastSavedAt ? ` ${lastSavedAt}` : ""}
          </div>
          <button
            onClick={showForm ? cancelForm : openAddForm}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 16px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? (TH ? "ยกเลิก" : "Cancel") : TH ? "เพิ่มหุ้น" : "Add Position"}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--accent)", borderRadius: 8, padding: "18px 20px", marginBottom: 16 }} className="fade-up">
          <div className="portfolio-form-grid" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1.2fr) repeat(3, minmax(120px, 1fr)) auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{TH ? "หุ้น" : "Stock"}</label>
              <select
                value={form.ticker}
                onChange={(event) => {
                  const nextTicker = availableTickers.find((item) => item.ticker === event.target.value) ?? availableTickers[0] ?? TICKER_LIST[0];
                  setForm((prev) => ({ ...prev, ticker: nextTicker.ticker, price: nextTicker.price > 0 ? String(nextTicker.price) : prev.price }));
                }}
                style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer" }}
              >
                {availableTickers.map((ticker) => (
                  <option key={ticker.ticker} value={ticker.ticker}>{ticker.ticker} - {ticker.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{TH ? "จำนวนหุ้น" : "Shares"}</label>
              <input type="number" min="0" step="0.0001" value={form.shares} onChange={(event) => setForm((prev) => ({ ...prev, shares: event.target.value }))} placeholder="10" style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{TH ? "ต้นทุนเฉลี่ย ($)" : "Avg Cost ($)"}</label>
              <input type="number" min="0" step="0.01" value={form.avgCost} onChange={(event) => setForm((prev) => ({ ...prev, avgCost: event.target.value }))} placeholder="150.00" style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{TH ? "ราคาปัจจุบัน ($)" : "Current Price ($)"}</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} placeholder={String(selectedTicker.price)} style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={submitPosition} style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {isEditing ? <Save size={14} /> : <Plus size={14} />}
              {isEditing ? (TH ? "บันทึก" : "Save") : TH ? "เพิ่ม" : "Add"}
            </button>
          </div>
          {formError && <div style={{ marginTop: 10, color: "var(--red)", fontSize: 12, fontWeight: 700 }}>{formError}</div>}
        </div>
      )}

      <div className="portfolio-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { label_th: "มูลค่าพอร์ต", label_en: "Portfolio Value", value: `$${fmt(totalValue)}`, color: "var(--text)" },
          { label_th: "ต้นทุนรวม", label_en: "Total Cost", value: `$${fmt(totalCost)}`, color: "var(--muted)" },
          { label_th: "กำไร/ขาดทุน", label_en: "Total P&L", value: `${up ? "+" : "-"}$${fmt(Math.abs(totalPnL))}`, color: up ? "var(--green)" : "var(--red)" },
          { label_th: "เปอร์เซ็นต์", label_en: "P&L %", value: `${up ? "+" : ""}${pnlPct.toFixed(2)}%`, color: up ? "var(--green)" : "var(--red)" },
        ].map((metric) => (
          <div key={metric.label_en} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0, marginBottom: 6 }}>{TH ? metric.label_th : metric.label_en}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: metric.color }}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, background: "var(--bg-raised)", borderRadius: 8, padding: 3, width: "fit-content", marginBottom: 14 }}>
        {(["holdings", "allocation"] as const).map((nextTab) => (
          <button key={nextTab} onClick={() => setTab(nextTab)} style={{ padding: "7px 18px", borderRadius: 6, border: "none", background: tab === nextTab ? "var(--bg-card)" : "transparent", color: tab === nextTab ? "var(--text)" : "var(--muted)", fontWeight: tab === nextTab ? 700 : 400, fontSize: 13, cursor: "pointer", boxShadow: tab === nextTab ? "var(--shadow)" : "none" }}>
            {nextTab === "holdings" ? (TH ? "รายการหุ้น" : "Holdings") : TH ? "การจัดสรร" : "Allocation"}
          </button>
        ))}
      </div>

      {tab === "holdings" && (
        <div className="responsive-table-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <div className="portfolio-holdings-row" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 70px 90px 90px 110px 115px 76px", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
            {[
              TH ? "หุ้น" : "Stock",
              TH ? "จำนวน" : "Shares",
              TH ? "ต้นทุน" : "Avg Cost",
              TH ? "ราคา" : "Price",
              TH ? "มูลค่า" : "Value",
              "P&L",
              "",
            ].map((heading, index) => (
              <div key={index} style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0 }}>{heading}</div>
            ))}
          </div>
          {positions.length === 0 ? (
            <div style={{ padding: "28px 18px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              {TH ? "ยังไม่มีรายการในพอร์ต กดเพิ่มหุ้นเพื่อเริ่มใช้งาน" : "No positions yet. Add a stock to start tracking your portfolio."}
            </div>
          ) : (
            positions.map((position, index) => {
              const value = position.shares * position.price;
              const cost = position.shares * position.avgCost;
              const pnl = value - cost;
              const pct = cost > 0 ? (pnl / cost) * 100 : 0;
              const positionUp = pnl >= 0;

              return (
                <div key={position.id} className="portfolio-holdings-row" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 70px 90px 90px 110px 115px 76px", gap: 8, alignItems: "center", padding: "13px 16px", borderBottom: index < positions.length - 1 ? "1px solid var(--border)" : "none", transition: "background .12s" }} onMouseEnter={(event) => (event.currentTarget.style.background = "var(--bg-raised)")} onMouseLeave={(event) => (event.currentTarget.style.background = "transparent")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <StockLogo ticker={position.ticker} color={position.color} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{position.ticker}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{position.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{position.shares}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>${fmt(position.avgCost)}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>${fmt(position.price)}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>${fmt(value)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: positionUp ? "var(--green)" : "var(--red)" }}>{positionUp ? "+" : ""}{fmt(pnl)}</div>
                    <div style={{ fontSize: 10, color: positionUp ? "var(--green)" : "var(--red)" }}>{positionUp ? "+" : ""}{pct.toFixed(2)}%</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button aria-label={`Edit ${position.ticker}`} onClick={() => startEdit(position)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: 5, color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                      <Edit2 size={13} />
                    </button>
                    <button aria-label={`Delete ${position.ticker}`} onClick={() => deletePosition(position.id)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: 5, color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "allocation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sectors.length === 0 ? (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px 18px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              {TH ? "ยังไม่มีข้อมูลสำหรับคำนวณสัดส่วนพอร์ต" : "No allocation data to show yet."}
            </div>
          ) : (
            sectors.map((sector) => (
              <div key={sector.sector} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: SECTOR_COLORS[sector.sector] ?? "#64748B", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{sector.sector}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>${fmt(sector.value)}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{sector.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ height: 7, background: "var(--bg-raised)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${sector.pct}%`, background: SECTOR_COLORS[sector.sector] ?? "#64748B", borderRadius: 99, transition: "width .5s ease" }} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 11, color: "var(--faint)" }}>
        {TH ? "ข้อมูลพอร์ตใช้เพื่อการศึกษา ราคาสามารถแก้ไขเองได้และอาจไม่ใช่ราคา real-time" : "Portfolio data is for educational purposes. Prices are editable and may not be real time."}
      </div>
    </div>
  );
}
