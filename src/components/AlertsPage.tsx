"use client";
import { useState, useEffect } from "react";
import { Bell, Plus, X, TrendingUp, TrendingDown, Zap, Star, Check } from "lucide-react";

type AlertType = "price_above" | "price_below" | "score_above" | "score_below" | "earnings";
type AlertStatus = "active" | "triggered" | "paused";

type Alert = {
  id: number; ticker: string; type: AlertType;
  value: string; status: AlertStatus; created: string;
};

const TKR_CLR: Record<string, string> = {
  NVDA: "#76B900", AAPL: "#555", MSFT: "#00A1F1", TSLA: "#CC0000",
  AMZN: "#FF9900", META: "#0867FC", CRWD: "#C1121F", ZS: "#005DAA",
};

const INIT_ALERTS: Alert[] = [
  { id: 1, ticker: "NVDA", type: "price_above", value: "1200",  status: "active",    created: "2 วันที่แล้ว" },
  { id: 2, ticker: "TSLA", type: "price_below", value: "150",   status: "active",    created: "3 วันที่แล้ว" },
  { id: 3, ticker: "AAPL", type: "score_above", value: "90",    status: "active",    created: "5 วันที่แล้ว" },
  { id: 4, ticker: "CRWD", type: "earnings",    value: "—",     status: "triggered", created: "1 สัปดาห์ที่แล้ว" },
  { id: 5, ticker: "MSFT", type: "price_above", value: "450",   status: "triggered", created: "2 สัปดาห์ที่แล้ว" },
  { id: 6, ticker: "ZS",   type: "price_below", value: "170",   status: "paused",    created: "3 สัปดาห์ที่แล้ว" },
];

const ALERT_TYPES: { value: AlertType; label_th: string; label_en: string }[] = [
  { value: "price_above", label_th: "ราคาขึ้นถึง",      label_en: "Price rises to"     },
  { value: "price_below", label_th: "ราคาลงถึง",        label_en: "Price drops to"     },
  { value: "score_above", label_th: "AI Score เกิน",    label_en: "AI Score above"     },
  { value: "score_below", label_th: "AI Score ต่ำกว่า", label_en: "AI Score below"     },
  { value: "earnings",    label_th: "ก่อน Earnings",    label_en: "Before Earnings"    },
];

const POPULAR_TICKERS = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "META", "CRWD", "ZS"];

function typeIcon(type: AlertType) {
  if (type === "price_above") return <TrendingUp size={14} color="var(--green)" />;
  if (type === "price_below") return <TrendingDown size={14} color="var(--red)" />;
  if (type === "score_above") return <Star size={14} color="var(--accent)" />;
  if (type === "score_below") return <Star size={14} color="var(--faint)" />;
  return <Zap size={14} color="var(--orange)" />;
}

function typeLabel(type: AlertType, value: string, lang: string) {
  const TH = lang === "th";
  const t = ALERT_TYPES.find(a => a.value === type);
  const label = TH ? t?.label_th : t?.label_en;
  if (type === "earnings") return TH ? "แจ้งเตือนก่อน Earnings 1 วัน" : "Alert 1 day before Earnings";
  const unit = type.includes("score") ? "/100" : "$";
  return `${label} ${unit}${value}`;
}

function StatusBadge({ status, lang }: { status: AlertStatus; lang: string }) {
  const TH = lang === "th";
  const cfg = {
    active:    { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   label_th: "ใช้งาน",    label_en: "Active"    },
    triggered: { color: "#F97316", bg: "rgba(249,115,22,0.1)",  label_th: "แจ้งแล้ว",  label_en: "Triggered" },
    paused:    { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", label_th: "หยุดชั่วคราว",label_en: "Paused"   },
  };
  const c = cfg[status];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, borderRadius: 5, padding: "2px 8px" }}>
      {TH ? c.label_th : c.label_en}
    </span>
  );
}

const LS_ALERTS_KEY = "usax-ai-alerts-v1";

export default function AlertsPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [alerts,    setAlertsRaw] = useState<Alert[]>(INIT_ALERTS);
  const [tab,       setTab]       = useState<"active" | "triggered">("active");
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ ticker: "NVDA", type: "price_above" as AlertType, value: "" });
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_ALERTS_KEY);
      if (s) setAlertsRaw(JSON.parse(s));
    } catch {}
  }, []);

  const setAlerts = (updater: (prev: Alert[]) => Alert[]) => {
    setAlertsRaw(prev => {
      const next = updater(prev);
      try { localStorage.setItem(LS_ALERTS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const activeAlerts    = alerts.filter(a => a.status === "active" || a.status === "paused");
  const triggeredAlerts = alerts.filter(a => a.status === "triggered");
  const displayAlerts   = tab === "active" ? activeAlerts : triggeredAlerts;

  const removeAlert = (id: number) => setAlerts(p => p.filter(a => a.id !== id));
  const togglePause = (id: number) => setAlerts(p => p.map(a => a.id === id
    ? { ...a, status: a.status === "active" ? "paused" : "active" as AlertStatus }
    : a));

  const createAlert = () => {
    if (!form.value && form.type !== "earnings") return;
    const newAlert: Alert = {
      id: Date.now(), ticker: form.ticker, type: form.type,
      value: form.value || "—", status: "active",
      created: TH ? "เพิ่งสร้าง" : "Just now",
    };
    setAlerts(p => [newAlert, ...p]);
    setForm({ ticker: "NVDA", type: "price_above", value: "" });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
            {TH ? "AI Alerts" : "AI Alerts"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {TH ? `แจ้งเตือนอัตโนมัติ ${activeAlerts.length} รายการ` : `${activeAlerts.length} active alerts`}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--accent)", border: "none", borderRadius: 11, padding: "10px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} />
          {TH ? "สร้างการแจ้งเตือน" : "New Alert"}
        </button>
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--accent)", borderRadius: 16, padding: "20px 22px", marginBottom: 18 }} className="fade-up">
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>
            {TH ? "สร้างการแจ้งเตือนใหม่" : "Create New Alert"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr auto", gap: 12, alignItems: "end" }}>
            {/* Ticker */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                {TH ? "หุ้น" : "Stock"}
              </label>
              <select value={form.ticker} onChange={e => setForm(p => ({ ...p, ticker: e.target.value }))}
                style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer" }}>
                {POPULAR_TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Type */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                {TH ? "เงื่อนไข" : "Condition"}
              </label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as AlertType }))}
                style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer" }}>
                {ALERT_TYPES.map(a => (
                  <option key={a.value} value={a.value}>{TH ? a.label_th : a.label_en}</option>
                ))}
              </select>
            </div>
            {/* Value */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                {form.type === "earnings" ? "—" : (form.type.includes("score") ? "Score (0-100)" : (TH ? "ราคา ($)" : "Price ($)"))}
              </label>
              <input
                value={form.value}
                onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                placeholder={form.type === "earnings" ? "—" : form.type.includes("score") ? "90" : "1200"}
                disabled={form.type === "earnings"}
                type="number"
                style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box", opacity: form.type === "earnings" ? 0.5 : 1 }}
              />
            </div>
            {/* Submit */}
            <button onClick={createAlert}
              style={{ background: saved ? "var(--emerald)" : "var(--accent)", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              {saved ? <Check size={14} /> : <Bell size={14} />}
              {saved ? (TH ? "บันทึกแล้ว" : "Saved!") : (TH ? "บันทึก" : "Save")}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-raised)", borderRadius: 11, padding: 3, width: "fit-content", marginBottom: 16 }}>
        {(["active", "triggered"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: tab === t ? "var(--bg-card)" : "transparent", color: tab === t ? "var(--text)" : "var(--muted)", fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: "pointer", boxShadow: tab === t ? "var(--shadow)" : "none" }}>
            {t === "active"
              ? (TH ? `ใช้งาน (${activeAlerts.length})` : `Active (${activeAlerts.length})`)
              : (TH ? `แจ้งแล้ว (${triggeredAlerts.length})` : `Triggered (${triggeredAlerts.length})`)}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {displayAlerts.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--faint)" }}>
            <Bell size={36} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>
              {TH ? "ยังไม่มีการแจ้งเตือน" : "No alerts here"}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {TH ? "สร้างการแจ้งเตือนใหม่ด้านบน" : "Create a new alert above"}
            </div>
          </div>
        ) : (
          displayAlerts.map((a, idx) => (
            <div key={a.id}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: idx < displayAlerts.length - 1 ? "1px solid var(--border)" : "none", transition: "background .12s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {/* Type icon */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {typeIcon(a.type)}
              </div>
              {/* Ticker badge */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: TKR_CLR[a.ticker] ?? "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                {a.ticker.slice(0, 4)}
              </div>
              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  {a.ticker} — {typeLabel(a.type, a.value, lang)}
                </div>
                <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>
                  {TH ? "สร้างเมื่อ" : "Created"} {a.created}
                </div>
              </div>
              {/* Status */}
              <StatusBadge status={a.status} lang={lang} />
              {/* Actions */}
              <div style={{ display: "flex", gap: 6 }}>
                {a.status !== "triggered" && (
                  <button onClick={() => togglePause(a.id)} title={a.status === "active" ? (TH ? "หยุดชั่วคราว" : "Pause") : (TH ? "เปิดใช้งาน" : "Resume")}
                    style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "var(--muted)", cursor: "pointer", fontWeight: 600 }}>
                    {a.status === "active" ? (TH ? "หยุด" : "Pause") : (TH ? "เปิด" : "Resume")}
                  </button>
                )}
                <button onClick={() => removeAlert(a.id)}
                  style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px", color: "var(--faint)", cursor: "pointer", display: "flex" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--faint)")}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: "var(--faint)" }}>
        ⚠️ {TH ? "การแจ้งเตือนขึ้นอยู่กับข้อมูลล่าช้า ไม่ใช่ Real-time (Plan ฟรี)" : "Alerts based on delayed data, not real-time (Free Plan)"}
      </div>
    </div>
  );
}
