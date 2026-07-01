"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "siamebiz@gmail.com";

const PLAN_COLORS: Record<string, string> = { free: "#64748b", pro: "#3B82F6", elite: "#A855F7" };
const PLAN_LABELS: Record<string, string> = { free: "Free", pro: "Pro", elite: "Elite" };

export default function AdminPage() {
  const [auth,    setAuth]    = useState(false);
  const [pass,    setPass]    = useState("");
  const [tab,     setTab]     = useState<"overview" | "users" | "payments">("overview");
  const [users,   setUsers]   = useState<any[]>([]);
  const [payments,setPayments]= useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [stats,   setStats]   = useState({ total: 0, pro: 0, elite: 0, free: 0, revenue: 0, today: 0 });
  const [msg,     setMsg]     = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!auth) return;
    loadData();
  }, [auth]);

  const loadData = async () => {
    setLoading(true);
    const { data: us } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: py } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    setUsers(us ?? []);
    setPayments(py ?? []);

    const total   = us?.length ?? 0;
    const pro     = us?.filter(u => u.plan === "pro").length ?? 0;
    const elite   = us?.filter(u => u.plan === "elite").length ?? 0;
    const free    = us?.filter(u => u.plan === "free").length ?? 0;
    const approvedPy = (py ?? []).filter(p => p.status === "approved");
    const revenue = approvedPy.reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    const todayStr = new Date().toISOString().slice(0, 10);
    const today   = approvedPy.filter(p => p.created_at?.slice(0, 10) === todayStr).reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    setStats({ total, pro, elite, free, revenue, today });
    setLoading(false);
  };

  const changePlan = async (userId: string, newPlan: string) => {
    if (!window.confirm(`เปลี่ยน plan เป็น "${PLAN_LABELS[newPlan]}" ?`)) return;
    await supabase.from("profiles").update({ plan: newPlan }).eq("id", userId);
    setMsg(`เปลี่ยนเป็น ${PLAN_LABELS[newPlan]} แล้ว`);
    loadData();
  };

  const approvePayment = async (payId: string, userId: string, plan: string) => {
    if (!window.confirm(`อนุมัติ Payment นี้และ upgrade user เป็น ${plan}?`)) return;
    await supabase.from("payments").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", payId);
    const basePlan = plan.replace("_annual", "");
    await supabase.from("profiles").update({ plan: basePlan }).eq("id", userId);
    setMsg("อนุมัติสำเร็จ");
    loadData();
  };

  const rejectPayment = async (payId: string) => {
    if (!window.confirm("ปฏิเสธ Payment นี้?")) return;
    await supabase.from("payments").update({ status: "rejected" }).eq("id", payId);
    setMsg("ปฏิเสธแล้ว");
    loadData();
  };

  const handleAuth = async () => {
    if (!pass) return;
    setAuthLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      if (res.ok) { setAuth(true); } else { setMsg("รหัสผิด"); }
    } catch { setMsg("เชื่อมต่อไม่ได้"); }
    finally { setAuthLoading(false); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = memberSearch === "" || u.display_name?.toLowerCase().includes(memberSearch.toLowerCase()) || u.email?.toLowerCase().includes(memberSearch.toLowerCase());
    const matchPlan   = memberFilter === "all" || u.plan === memberFilter;
    return matchSearch && matchPlan;
  });

  const pendingPayments  = payments.filter(p => p.status === "pending");
  const approvedPayments = payments.filter(p => p.status === "approved");

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#1E293B", border: "1px solid #2E3E55", borderRadius: 16, padding: 32, width: 320 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 4 }}>🔐 Admin</div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>USAXresearch Admin Panel</div>
          <input
            type="password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
            placeholder="รหัสผ่าน"
            style={{ width: "100%", background: "#263347", border: "1px solid #2E3E55", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
          />
          {msg && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{msg}</div>}
          <button
            onClick={handleAuth}
            disabled={authLoading}
            style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "#3B82F6", color: "#fff", fontWeight: 700, fontSize: 14, cursor: authLoading ? "wait" : "pointer", opacity: authLoading ? 0.7 : 1 }}>
            {authLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Users ทั้งหมด",  value: stats.total,            icon: "👥", color: "#3B82F6" },
    { label: "Pro Members",    value: stats.pro,              icon: "⚡", color: "#3B82F6" },
    { label: "Elite Members",  value: stats.elite,            icon: "💜", color: "#A855F7" },
    { label: "Free Users",     value: stats.free,             icon: "🆓", color: "#64748b" },
    { label: "Revenue รวม",    value: `฿${stats.revenue.toLocaleString()}`, icon: "💰", color: "#22C55E" },
    { label: "รายได้วันนี้",  value: `฿${stats.today.toLocaleString()}`,   icon: "📈", color: "#22C55E" },
  ];

  const TABS = ["overview", "users", "payments"] as const;
  const TAB_LABELS = { overview: "📊 Overview", users: "👥 Users", payments: "💳 Payments" };

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#fff", fontFamily: "-apple-system, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ borderBottom: "1px solid #2E3E55", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>🔐 USAXresearch Admin</div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/dashboard" style={{ padding: "7px 16px", borderRadius: 8, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3B82F6", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>🏠 Dashboard</a>
          <button onClick={loadData} style={{ padding: "7px 16px", borderRadius: 8, background: "#263347", border: "1px solid #2E3E55", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
            {loading ? "⟳..." : "⟳ Refresh"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ background: "#22c55e20", border: "1px solid #22c55e", padding: "10px 28px", color: "#22c55e", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
          ✅ {msg} <span style={{ cursor: "pointer" }} onClick={() => setMsg("")}>✕</span>
        </div>
      )}

      <div style={{ padding: "24px 28px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#1E293B", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: tab === t ? "#263347" : "transparent", color: tab === t ? "#fff" : "#64748b", fontWeight: tab === t ? 700 : 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
              {statCards.map((c, i) => (
                <div key={i} style={{ background: "#1E293B", border: "1px solid #2E3E55", borderRadius: 14, padding: "20px 16px" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 24, color: c.color, marginBottom: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{c.label}</div>
                </div>
              ))}
            </div>

            {pendingPayments.length > 0 && (
              <div style={{ background: "#f59e0b15", border: "1px solid #f59e0b40", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: 14, fontSize: 15 }}>⏳ Payments รอตรวจสอบ ({pendingPayments.length})</div>
                {pendingPayments.map(p => (
                  <div key={p.id} style={{ background: "#1E293B", borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{PLAN_LABELS[p.plan?.replace("_annual","")]?.toUpperCase() ?? p.plan}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>User: {p.user_id?.slice(0,12)}... · ฿{p.amount?.toLocaleString()} · {new Date(p.created_at).toLocaleDateString("th-TH")}</div>
                      {p.slip_url && <a href={p.slip_url} target="_blank" style={{ fontSize: 12, color: "#3B82F6" }}>📎 ดูสลิป</a>}
                      {p.ai_verified !== null && <span style={{ fontSize: 12, color: p.ai_verified ? "#22c55e" : "#ef4444", marginLeft: 8 }}>{p.ai_verified ? "✅ AI ผ่าน" : "⚠️ AI ไม่ผ่าน"}</span>}
                    </div>
                    <button onClick={() => approvePayment(p.id, p.user_id, p.plan)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>อนุมัติ</button>
                    <button onClick={() => rejectPayment(p.id)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>ปฏิเสธ</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input
                value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                placeholder="🔍 ค้นหาชื่อ / อีเมล"
                style={{ background: "#1E293B", border: "1px solid #2E3E55", borderRadius: 10, padding: "9px 14px", color: "#fff", fontSize: 13, minWidth: 220 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "free", "pro", "elite"].map(f => (
                  <button key={f} onClick={() => setMemberFilter(f)}
                    style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${memberFilter === f ? PLAN_COLORS[f] ?? "#3B82F6" : "#2E3E55"}`, background: memberFilter === f ? `${PLAN_COLORS[f] ?? "#3B82F6"}20` : "transparent", color: memberFilter === f ? PLAN_COLORS[f] ?? "#3B82F6" : "#64748b", fontWeight: memberFilter === f ? 700 : 500, fontSize: 12, cursor: "pointer" }}>
                    {f.toUpperCase()} {f !== "all" && `(${users.filter(u => u.plan === f).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>{filteredUsers.length} คน</div>

            <div style={{ display: "grid", gap: 12 }}>
              {filteredUsers.map(u => (
                <div key={u.id} style={{ background: "#1E293B", border: "1px solid #2E3E55", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{u.display_name ?? u.email ?? "Unknown"}</div>
                        <span style={{ padding: "2px 10px", borderRadius: 20, background: `${PLAN_COLORS[u.plan ?? "free"]}20`, color: PLAN_COLORS[u.plan ?? "free"], fontSize: 11, fontWeight: 700 }}>
                          {PLAN_LABELS[u.plan ?? "free"]}
                        </span>
                        {u.telegram_enabled && <span style={{ fontSize: 11, color: "#3B82F6" }}>📱 Telegram</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {u.email} · สมัคร {new Date(u.created_at).toLocaleDateString("th-TH")}
                        {u.trial_ends_at && <span style={{ marginLeft: 8, color: "#f59e0b" }}>⏱ Trial หมด {new Date(u.trial_ends_at).toLocaleDateString("th-TH")}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["free", "pro", "elite"].filter(p => p !== u.plan).map(p => (
                        <button key={p} onClick={() => changePlan(u.id, p)}
                          style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${PLAN_COLORS[p]}40`, background: `${PLAN_COLORS[p]}10`, color: PLAN_COLORS[p], fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          → {PLAN_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments */}
        {tab === "payments" && (
          <div>
            <div style={{ display: "grid", gap: 12 }}>
              {payments.map(p => (
                <div key={p.id} style={{ background: "#1E293B", border: `1px solid ${p.status === "pending" ? "#f59e0b40" : p.status === "approved" ? "#22c55e30" : "#ef444430"}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{p.plan?.toUpperCase()}</span>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.status === "pending" ? "#f59e0b20" : p.status === "approved" ? "#22c55e20" : "#ef444420", color: p.status === "pending" ? "#f59e0b" : p.status === "approved" ? "#22c55e" : "#ef4444" }}>
                        {p.status === "pending" ? "⏳ รอตรวจ" : p.status === "approved" ? "✅ อนุมัติ" : "❌ ปฏิเสธ"}
                      </span>
                      {p.ai_verified !== null && <span style={{ fontSize: 11, color: p.ai_verified ? "#22c55e" : "#f59e0b" }}>{p.ai_verified ? "🤖 ผ่าน" : "🤖 ไม่ผ่าน"}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      User: {p.user_id?.slice(0, 16)}... · <b style={{ color: "#3B82F6" }}>฿{p.amount?.toLocaleString()}</b> · {p.method === "promptpay" ? "📱 PromptPay" : "💳 บัตร"} · {new Date(p.created_at).toLocaleString("th-TH")}
                    </div>
                    {p.slip_url && <a href={p.slip_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#3B82F6", marginTop: 4, display: "inline-block" }}>📎 ดูสลิป</a>}
                  </div>
                  {p.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => approvePayment(p.id, p.user_id, p.plan)}
                        style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>อนุมัติ</button>
                      <button onClick={() => rejectPayment(p.id)}
                        style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>ปฏิเสธ</button>
                    </div>
                  )}
                </div>
              ))}
              {payments.length === 0 && <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: 40 }}>ยังไม่มีรายการชำระเงิน</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
