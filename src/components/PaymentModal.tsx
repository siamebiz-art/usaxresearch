"use client";
import { useState, useRef } from "react";

const PROMPTPAY_NUMBER = "0863738484";

const PLANS = {
  pro: {
    label: "Pro",
    price: 299,
    price_annual: 2990,
    color: "#3B82F6",
    features: [
      "🔓 Screener ไม่จำกัด ทุก 10 สไตล์",
      "🤖 AI Analysis ทุกหุ้น (Claude AI)",
      "📊 AI Score เชิงสถิติ",
      "📩 Telegram Alert แจ้งเตือน",
      "📋 Watchlist ไม่จำกัด",
      "📰 AI News Summary",
      "📈 Compare หุ้น 2-4 ตัว",
    ],
  },
  elite: {
    label: "Elite",
    price: 799,
    price_annual: 7990,
    color: "#A855F7",
    features: [
      "⚡ ทุกอย่างใน Pro",
      "💼 Portfolio AI Analysis",
      "📄 PDF Report รายงานเชิงลึก",
      "🔔 Priority Alerts",
      "📊 Sector Rotation Tracker",
      "🎯 Earnings Calendar + AI สรุป",
      "💬 Priority Support",
    ],
  },
};

type Plan = "pro" | "elite";
type PayMethod = "card" | "promptpay";

interface Props {
  open: boolean;
  onClose: () => void;
  userId?: string;
  email?: string;
  initialPlan?: Plan;
}

export default function PaymentModal({ open, onClose, userId, email, initialPlan = "pro" }: Props) {
  const [plan,      setPlan]      = useState<Plan>(initialPlan);
  const [billing,   setBilling]   = useState<"monthly" | "annual">("monthly");
  const [method,    setMethod]    = useState<PayMethod>("card");
  const [step,      setStep]      = useState<"select" | "pay" | "slip" | "done">("select");
  const [slipFile,  setSlipFile]  = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [aiResult,  setAiResult]  = useState<any>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const planData = PLANS[plan];
  const amount   = billing === "annual" ? planData.price_annual : planData.price;

  const handleStripeCheckout = async () => {
    if (!userId || !email) { setError("กรุณา login ก่อน"); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, plan: billing === "annual" ? `${plan}_annual` : plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "เกิดข้อผิดพลาด");
    } catch { setError("ไม่สามารถเชื่อมต่อได้"); }
    setLoading(false);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSlipFile(f);
    const reader = new FileReader();
    reader.onload = ev => setSlipPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleVerifySlip = async () => {
    if (!slipFile || !slipPreview) return;
    setLoading(true); setError("");
    try {
      const base64 = slipPreview.split(",")[1];
      const res = await fetch("/api/payment/verify-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: slipFile.type, expectedAmount: amount }),
      });
      const data = await res.json();
      if (data.success) setAiResult(data.result);
      else setError(data.error ?? "ตรวจสลิปไม่สำเร็จ");
    } catch { setError("ตรวจสลิปไม่สำเร็จ"); }
    setLoading(false);
  };

  const handleSubmitSlip = async () => {
    if (!userId) { setError("กรุณา login ก่อน"); return; }
    setLoading(true); setError("");
    try {
      let slipUrl: string | null = null;
      if (slipFile) {
        const fd = new FormData();
        fd.append("file", slipFile);
        const uploadRes = await fetch("/api/payment/upload-slip", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        slipUrl = uploadData.url ?? null;
      }
      const res = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: billing === "annual" ? `${plan}_annual` : plan, amount, method: "promptpay", slipUrl, aiResult }),
      });
      const data = await res.json();
      if (data.success) setStep("done");
      else setError(data.error ?? "ส่งสลิปไม่สำเร็จ");
    } catch { setError("ส่งสลิปไม่สำเร็จ"); }
    setLoading(false);
  };

  if (!open) return null;

  const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" };
  const modal:   React.CSSProperties = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", position: "relative" };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text)" }}>⚡ Upgrade Plan</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>ปลดล็อกการวิเคราะห์หุ้น US เชิงลึก</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--faint)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {step === "select" && (
          <>
            {/* Billing Toggle */}
            <div style={{ display: "flex", background: "var(--bg)", borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
              {(["monthly", "annual"] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: "none", background: billing === b ? "var(--bg-raised)" : "transparent", color: billing === b ? "var(--text)" : "var(--muted)", fontWeight: billing === b ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all .2s" }}>
                  {b === "monthly" ? "รายเดือน" : "รายปี (ประหยัด 2 เดือน)"}
                </button>
              ))}
            </div>

            {/* Plan Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, p]) => (
                <div key={key} onClick={() => setPlan(key)}
                  style={{ border: `2px solid ${plan === key ? p.color : "var(--border)"}`, borderRadius: 14, padding: 16, cursor: "pointer", background: plan === key ? `${p.color}10` : "var(--bg)", transition: "all .2s" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: plan === key ? p.color : "var(--text)", marginBottom: 6 }}>{p.label}</div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: plan === key ? p.color : "var(--text)" }}>
                    ฿{billing === "annual" ? p.price_annual.toLocaleString() : p.price}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>/{billing === "annual" ? "ปี" : "เดือน"}</div>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4, lineHeight: 1.5 }}>{f}</div>
                  ))}
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>วิธีชำระเงิน</div>
              <div style={{ display: "flex", gap: 10 }}>
                {(["card", "promptpay"] as const).map(m => (
                  <button key={m} onClick={() => setMethod(m)}
                    style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `2px solid ${method === m ? planData.color : "var(--border)"}`, background: method === m ? `${planData.color}10` : "var(--bg)", color: method === m ? planData.color : "var(--muted)", fontWeight: method === m ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all .2s" }}>
                    {m === "card" ? "💳 บัตรเครดิต" : "📱 PromptPay QR"}
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ background: "#ef444420", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button onClick={() => method === "card" ? handleStripeCheckout() : setStep("pay")}
              disabled={loading}
              style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: planData.color, color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "กำลังดำเนินการ..." : `ชำระ ฿${amount.toLocaleString()} — ${method === "card" ? "บัตรเครดิต" : "PromptPay"}`}
            </button>
          </>
        )}

        {step === "pay" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>สแกน QR ชำระเงิน ฿{amount.toLocaleString()}</div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, display: "inline-block", marginBottom: 16 }}>
              <img
                src={`https://promptpay.io/${PROMPTPAY_NUMBER}/${amount}.png`}
                alt="PromptPay QR"
                style={{ width: 200, height: 200 }}
              />
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>พร้อมเพย์หมายเลข: <b style={{ color: "var(--text)" }}>{PROMPTPAY_NUMBER}</b></div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>ยอด: <b style={{ color: planData.color, fontSize: 16 }}>฿{amount.toLocaleString()}</b></div>
            <button onClick={() => setStep("slip")}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: planData.color, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              ชำระแล้ว → แนบสลิป
            </button>
            <button onClick={() => setStep("select")}
              style={{ width: "100%", padding: "10px 0", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontWeight: 500, fontSize: 13, cursor: "pointer", marginTop: 10 }}>
              ← กลับ
            </button>
          </div>
        )}

        {step === "slip" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>📎 แนบสลิปโอนเงิน</div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed var(--border)", borderRadius: 14, padding: 24, textAlign: "center", cursor: "pointer", marginBottom: 16, background: slipPreview ? "transparent" : "var(--bg)" }}>
              {slipPreview
                ? <img src={slipPreview} alt="slip" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8 }} />
                : <><div style={{ fontSize: 36, marginBottom: 10 }}>📸</div><div style={{ color: "var(--muted)", fontSize: 13 }}>คลิกเพื่อเลือกสลิป</div></>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleSlipChange} />

            {aiResult && (
              <div style={{ background: aiResult.valid ? "#22c55e20" : "#ef444420", border: `1px solid ${aiResult.valid ? "#22c55e" : "#ef4444"}`, borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
                <b style={{ color: aiResult.valid ? "#22c55e" : "#ef4444" }}>{aiResult.valid ? "✅ สลิปผ่านการตรวจ" : "❌ สลิปไม่ผ่าน"}</b>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>{aiResult.message}</div>
              </div>
            )}

            {error && <div style={{ background: "#ef444420", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}

            {slipFile && !aiResult && (
              <button onClick={handleVerifySlip} disabled={loading}
                style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "var(--bg-raised)", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", marginBottom: 10 }}>
                {loading ? "กำลังตรวจสลิป..." : "🤖 ตรวจสลิปด้วย AI"}
              </button>
            )}

            <button onClick={handleSubmitSlip} disabled={loading || !slipFile}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: planData.color, color: "#fff", fontWeight: 800, fontSize: 14, cursor: loading || !slipFile ? "not-allowed" : "pointer", opacity: loading || !slipFile ? 0.6 : 1 }}>
              {loading ? "กำลังส่ง..." : "ส่งสลิปรอตรวจสอบ"}
            </button>
            <div style={{ fontSize: 12, color: "var(--faint)", textAlign: "center", marginTop: 10 }}>Admin จะอนุมัติภายใน 1-2 ชั่วโมง</div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>ส่งสลิปสำเร็จ!</div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Admin กำลังตรวจสอบ จะอนุมัติภายใน 1-2 ชั่วโมง<br/>หลังอนุมัติ แผน {PLANS[plan].label} จะเปิดใช้งานทันที</div>
            <button onClick={onClose}
              style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: planData.color, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
