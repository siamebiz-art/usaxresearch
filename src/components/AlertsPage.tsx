"use client";
import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Pause, Play, Plus, RefreshCw, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import {
  createUserAlert,
  deleteUserAlert,
  loadUserAlerts,
  readLocalAlerts,
  updateUserAlertStatus,
  type UserAlert,
  type UserAlertType,
} from "@/lib/user-alerts";

const POPULAR_TICKERS = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "META", "CRWD", "ZS", "AMD", "GOOG"];

function conditionLabel(type: UserAlertType, value: number, lang: string) {
  const price = `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (type === "price_above") return lang === "th" ? `ราคาขึ้นถึง ${price}` : `Price rises to ${price}`;
  return lang === "th" ? `ราคาลงถึง ${price}` : `Price drops to ${price}`;
}

function statusLabel(status: UserAlert["status"], lang: string) {
  if (status === "triggered") return lang === "th" ? "แจ้งแล้ว" : "Triggered";
  if (status === "paused") return lang === "th" ? "พักไว้" : "Paused";
  return lang === "th" ? "ใช้งาน" : "Active";
}

function statusColor(status: UserAlert["status"]) {
  if (status === "triggered") return "#F97316";
  if (status === "paused") return "var(--faint)";
  return "var(--green)";
}

export default function AlertsPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [tab, setTab] = useState<"active" | "triggered">("active");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: "NVDA", type: "price_above" as UserAlertType, target: "" });
  const [syncState, setSyncState] = useState<"loading" | "synced" | "local" | "error">("loading");
  const [saved, setSaved] = useState(false);

  const refreshAlerts = async () => {
    setSyncState("loading");
    const cloud = await loadUserAlerts();
    if (cloud) {
      setAlerts(cloud);
      setSyncState("synced");
      return;
    }
    setAlerts(readLocalAlerts());
    setSyncState("local");
  };

  useEffect(() => {
    refreshAlerts();
    window.addEventListener("usax-alerts-updated", refreshAlerts);
    return () => window.removeEventListener("usax-alerts-updated", refreshAlerts);
  }, []);

  const activeAlerts = useMemo(() => alerts.filter((alert) => alert.status === "active" || alert.status === "paused"), [alerts]);
  const triggeredAlerts = useMemo(() => alerts.filter((alert) => alert.status === "triggered"), [alerts]);
  const displayAlerts = tab === "active" ? activeAlerts : triggeredAlerts;

  const createAlert = async () => {
    const target = Number(form.target);
    if (!Number.isFinite(target) || target <= 0) return;
    setSyncState("loading");
    const result = await createUserAlert({ ticker: form.ticker, type: form.type, target_value: target });
    if (!result.ok) {
      setSyncState("error");
      return;
    }
    setForm({ ticker: "NVDA", type: "price_above", target: "" });
    setShowForm(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
    await refreshAlerts();
  };

  const togglePause = async (alert: UserAlert) => {
    await updateUserAlertStatus(alert.id, alert.status === "paused" ? "active" : "paused");
    await refreshAlerts();
  };

  const removeAlert = async (id: string) => {
    await deleteUserAlert(id);
    await refreshAlerts();
  };

  const syncLabel =
    syncState === "loading"
      ? TH ? "กำลังโหลด" : "Loading"
      : syncState === "synced"
        ? TH ? "บันทึกบนคลาวด์" : "Cloud synced"
        : syncState === "local"
          ? TH ? "โหมดเครื่องนี้" : "Local mode"
          : TH ? "ซิงก์มีปัญหา" : "Sync issue";

  return (
    <div className="fade-up">
      <div className="page-header-wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>AI Alerts</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {TH ? `แจ้งเตือนราคาจริง ${activeAlerts.length} รายการ` : `${activeAlerts.length} active price alerts`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid var(--border)", borderRadius: 999, padding: "8px 12px", color: syncState === "error" ? "var(--red)" : "var(--green)", fontSize: 12, fontWeight: 700 }}>
            {syncState === "loading" ? <RefreshCw size={13} /> : <Check size={13} />}
            {syncLabel}
          </div>
          <button onClick={() => setShowForm((next) => !next)}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--accent)", border: "none", borderRadius: 11, padding: "10px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? (TH ? "ยกเลิก" : "Cancel") : TH ? "สร้างแจ้งเตือน" : "New Alert"}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--accent)", borderRadius: 12, padding: "18px 20px", marginBottom: 18 }} className="fade-up">
          <div className="alert-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{TH ? "หุ้น" : "Stock"}</label>
              <select value={form.ticker} onChange={(event) => setForm((prev) => ({ ...prev, ticker: event.target.value }))}
                style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none" }}>
                {POPULAR_TICKERS.map((ticker) => <option key={ticker} value={ticker}>{ticker}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{TH ? "เงื่อนไข" : "Condition"}</label>
              <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as UserAlertType }))}
                style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none" }}>
                <option value="price_above">{TH ? "ราคาขึ้นถึง" : "Price rises to"}</option>
                <option value="price_below">{TH ? "ราคาลงถึง" : "Price drops to"}</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>{TH ? "ราคาเป้าหมาย ($)" : "Target price ($)"}</label>
              <input type="number" min="0" step="0.01" value={form.target} onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value }))} placeholder="200.00"
                style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={createAlert}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: saved ? "var(--green)" : "var(--accent)", border: "none", borderRadius: 8, padding: "10px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {saved ? <Check size={14} /> : <Bell size={14} />}
              {saved ? (TH ? "บันทึกแล้ว" : "Saved") : TH ? "บันทึก" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 4, background: "var(--bg-raised)", borderRadius: 8, padding: 3, width: "fit-content", marginBottom: 14 }}>
        {(["active", "triggered"] as const).map((nextTab) => (
          <button key={nextTab} onClick={() => setTab(nextTab)}
            style={{ padding: "7px 18px", borderRadius: 6, border: "none", background: tab === nextTab ? "var(--bg-card)" : "transparent", color: tab === nextTab ? "var(--text)" : "var(--muted)", fontWeight: tab === nextTab ? 700 : 400, fontSize: 13, cursor: "pointer", boxShadow: tab === nextTab ? "var(--shadow)" : "none" }}>
            {nextTab === "active" ? (TH ? "กำลังใช้งาน" : "Active") : TH ? "แจ้งแล้ว" : "Triggered"}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {displayAlerts.length === 0 ? (
          <div style={{ padding: "42px 20px", textAlign: "center", color: "var(--muted)" }}>
            <Bell size={34} style={{ marginBottom: 12, color: "var(--faint)" }} />
            <div style={{ fontSize: 15, fontWeight: 800 }}>{TH ? "ยังไม่มีแจ้งเตือน" : "No alerts yet"}</div>
            <div style={{ fontSize: 12, marginTop: 5 }}>{TH ? "สร้างแจ้งเตือนราคาเพื่อให้ระบบตรวจให้อัตโนมัติ" : "Create a price alert and the cron checker will monitor it."}</div>
          </div>
        ) : (
          displayAlerts.map((alert, index) => (
            <div key={alert.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "center", padding: "14px 18px", borderBottom: index < displayAlerts.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: alert.type === "price_above" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {alert.type === "price_above" ? <TrendingUp size={18} color="var(--green)" /> : <TrendingDown size={18} color="var(--red)" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "var(--text)" }}>{alert.ticker}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: statusColor(alert.status), background: `${statusColor(alert.status)}18`, borderRadius: 6, padding: "2px 8px" }}>{statusLabel(alert.status, lang)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{conditionLabel(alert.type, alert.target_value, lang)}</div>
                  {alert.last_price ? <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{TH ? "ราคาล่าสุด" : "Last price"} ${alert.last_price.toFixed(2)}</div> : null}
                </div>
              </div>
              {alert.status !== "triggered" && (
                <button onClick={() => togglePause(alert)} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: 8, color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                  {alert.status === "paused" ? <Play size={14} /> : <Pause size={14} />}
                </button>
              )}
              <button onClick={() => removeAlert(alert.id)} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: 8, color: "var(--muted)", cursor: "pointer", display: "flex" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: "var(--faint)", lineHeight: 1.7 }}>
        {TH ? "ระบบตรวจราคาโดย Cron ตามรอบที่ตั้งไว้บน Vercel ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน" : "Alerts are checked by the Vercel cron schedule. Educational data only, not investment advice."}
      </div>
    </div>
  );
}
