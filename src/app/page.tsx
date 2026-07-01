"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Brain, TrendingUp, ShieldCheck, Sparkles, ChevronRight,
  Star, Zap, Globe, ArrowRight, Check, Crown,
} from "lucide-react";

const SCREENER_CARDS = [
  { color: "#22C55E", icon: "📉", label: "Pullback Stocks",    label_th: "หุ้นย่อตัวน่าสนใจ",    desc: "Buy quality at a discount" },
  { color: "#3B82F6", icon: "🚀", label: "High Growth",        label_th: "หุ้นเติบโตสูง",         desc: "Revenue growth >20% YoY" },
  { color: "#8B5CF6", icon: "💎", label: "Quality Stocks",     label_th: "หุ้นคุณภาพสูง",         desc: "Strong fundamentals + moat" },
  { color: "#F97316", icon: "📈", label: "Breakout",           label_th: "หุ้น Breakout",         desc: "Breaking key resistance" },
  { color: "#06B6D4", icon: "🤖", label: "AI Stocks",          label_th: "หุ้นธีม AI",             desc: "Pure-play AI infrastructure" },
  { color: "#2563EB", icon: "🛡️", label: "Cybersecurity",      label_th: "หุ้น Cybersecurity",     desc: "Rising security demand" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: <Sparkles size={20} color="#2563EB" />, title_th: "เลือกสไตล์การลงทุน",  title_en: "Choose your style",       desc_th: "เลือกจาก 10 สไตล์ เช่น หุ้นย่อตัว หุ้นเติบโต หุ้น AI",  desc_en: "Pick from 10 screener types" },
  { step: "02", icon: <Brain    size={20} color="#7C3AED" />, title_th: "AI วิเคราะห์ข้อมูล",  title_en: "AI analyzes the data",     desc_th: "AI ดึงข้อมูลทางการเงินและคัดกรองในทันที",                 desc_en: "AI pulls financial data and screens instantly" },
  { step: "03", icon: <TrendingUp size={20} color="#22C55E" />, title_th: "รับรายชื่อหุ้น",   title_en: "Get ranked results",       desc_th: "รับรายชื่อหุ้นพร้อม AI Score และเหตุผลที่ผ่านการคัดกรอง", desc_en: "Ranked stocks with AI Score and rationale" },
  { step: "04", icon: <Star     size={20} color="#EAB308" />, title_th: "ตัดสินใจด้วยตนเอง",  title_en: "Decide for yourself",      desc_th: "ข้อมูลช่วยประกอบการตัดสินใจ ไม่ใช่คำแนะนำซื้อขาย",      desc_en: "Data to inform your own investment decisions" },
];

const PLAN_FEATURES = {
  free:  ["5 screener runs / month", "Basic AI Score", "1 watchlist (5 stocks)", "Community access"],
  pro:   ["Unlimited screener runs", "Full AI Score + reasoning", "Unlimited watchlist", "AI News feed", "Earnings calendar", "Email alerts"],
  elite: ["Everything in Pro", "Portfolio analysis", "Economic calendar", "Priority AI responses", "API access (coming soon)", "Dedicated support"],
};

export default function LandingPage() {
  const [lang, setLang] = useState<"th" | "en">("th");

  const T = {
    th: {
      hero_title:   "คัดหุ้นสหรัฐฯ ด้วย AI\nในคลิกเดียว",
      hero_sub:     "เลือกสไตล์การลงทุนที่คุณต้องการ ไม่ว่าจะเป็นหุ้นย่อตัว หุ้นเติบโตสูง หุ้น AI หรือหุ้นคุณภาพ แล้วให้ AI วิเคราะห์ คัดกรอง และสรุปเหตุผลให้ทันที",
      cta_start:    "เริ่มคัดหุ้นด้วย AI",
      cta_demo:     "ดูตัวอย่าง Dashboard",
      badge:        "สำหรับนักลงทุนไทยในหุ้นสหรัฐฯ",
      problem_title:"ปัญหาที่นักลงทุนในหุ้นสหรัฐฯ เจอทุกวัน",
      p1_title:     "ข้อมูลมหาศาล ไม่รู้จะเริ่มดูจากตรงไหน",
      p1_desc:      "หุ้นสหรัฐฯ มีมากกว่า 8,000 ตัว การจะเลือกด้วยตนเองต้องใช้เวลาหลายชั่วโมงต่อวัน",
      p2_title:     "ข้อมูล Financial แบบ Real-Time เข้าถึงยาก",
      p2_desc:      "Bloomberg, FactSet มีแต่คนระดับ Institutional ที่เข้าถึงได้ นักลงทุนทั่วไปเสียเปรียบ",
      p3_title:     "ไม่รู้จะ Research อย่างไรให้ถูกต้อง",
      p3_desc:      "PE Ratio ดีแค่ไหน? Revenue Growth โอเคไหม? ต้องดูหลายมิติพร้อมกัน ซับซ้อนมาก",
      feature_title:"เลือกสไตล์การลงทุน 10 แบบ — AI คัดหุ้นให้ทันที",
      feature_sub:  "แต่ละสไตล์มี Logic ที่แตกต่างกัน AI จะค้นหาหุ้นที่ตรงกับเกณฑ์และให้คะแนน AI Score",
      how_title:    "ใช้งานง่ายใน 4 ขั้นตอน",
      price_title:  "ราคาที่คุ้มค่า เริ่มต้นฟรี",
      price_sub:    "เริ่มต้นใช้ฟรีได้เลย ไม่ต้องใส่บัตรเครดิต",
      disclaimer:   "ข้อมูลทั้งหมดเพื่อวัตถุประสงค์ทางสถิติเท่านั้น ไม่ใช่คำแนะนำการลงทุน",
      nav_login:    "เข้าสู่ระบบ",
      nav_features: "ฟีเจอร์",
      nav_pricing:  "ราคา",
      free_label:   "ฟรี",
      pro_label:    "Pro",
      elite_label:  "Elite",
      mo:           "/เดือน",
      get_free:     "เริ่มใช้ฟรี",
      get_pro:      "เลือก Pro",
      get_elite:    "เลือก Elite",
      most_popular: "ยอดนิยม",
      stat1:        "หุ้นสหรัฐฯ ในฐานข้อมูล",
      stat2:        "Screener สไตล์",
      stat3:        "อัพเดตทุกวันเปิดตลาด",
    },
    en: {
      hero_title:   "Screen US Stocks with AI\nin One Click",
      hero_sub:     "Choose your investment style — Pullback, High Growth, AI Stocks, or Quality — then let AI analyze, screen, and explain results instantly.",
      cta_start:    "Start AI Screening",
      cta_demo:     "View Dashboard Demo",
      badge:        "Built for Thai investors in US stocks",
      problem_title:"Problems every US stock investor faces daily",
      p1_title:     "Overwhelming data, no idea where to start",
      p1_desc:      "With 8,000+ US stocks, manual screening takes hours every day and is nearly impossible to do well.",
      p2_title:     "Real-time financial data is hard to access",
      p2_desc:      "Bloomberg and FactSet are for institutional investors. Retail investors are at a massive disadvantage.",
      p3_title:     "Not sure how to research stocks properly",
      p3_desc:      "Is the PE ratio good? Is revenue growth OK? Analyzing multiple dimensions simultaneously is complex.",
      feature_title:"10 investment styles — AI screens instantly",
      feature_sub:  "Each style has unique logic. AI finds stocks meeting the criteria and assigns an AI Score.",
      how_title:    "Simple in 4 steps",
      price_title:  "Transparent pricing. Free to start.",
      price_sub:    "Start for free, no credit card required.",
      disclaimer:   "All data is for statistical purposes only and does not constitute investment advice.",
      nav_login:    "Sign In",
      nav_features: "Features",
      nav_pricing:  "Pricing",
      free_label:   "Free",
      pro_label:    "Pro",
      elite_label:  "Elite",
      mo:           "/month",
      get_free:     "Get Started Free",
      get_pro:      "Choose Pro",
      get_elite:    "Choose Elite",
      most_popular: "Most Popular",
      stat1:        "US Stocks in Database",
      stat2:        "Screener Styles",
      stat3:        "Updated every market day",
    },
  };
  const t = T[lang];

  const navStyle: React.CSSProperties = {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid #E2E8F0", padding: "0 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #2563EB, #06B6D4)",
    color: "#fff", border: "none", borderRadius: 12, padding: "13px 26px",
    fontSize: 15, fontWeight: 800, cursor: "pointer", textDecoration: "none",
  };
  const btnSecondary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "transparent", color: "#2563EB",
    border: "2px solid #2563EB", borderRadius: 12, padding: "11px 24px",
    fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16,
    padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", color: "#0F172A", fontFamily: "var(--font-geist-sans, Inter, sans-serif)" }}>

      {/* Navbar */}
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #2563EB, #06B6D4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff" }}>U</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", letterSpacing: -0.3 }}>USAX</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#64748B", marginTop: -2 }}>research</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#features" style={{ fontSize: 13.5, fontWeight: 600, color: "#64748B", textDecoration: "none" }}>{t.nav_features}</a>
          <a href="#pricing"  style={{ fontSize: 13.5, fontWeight: 600, color: "#64748B", textDecoration: "none" }}>{t.nav_pricing}</a>
          <button onClick={() => setLang(lang === "th" ? "en" : "th")}
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#64748B" }}>
            {lang === "th" ? "EN" : "TH"}
          </button>
          <Link href="/dashboard" style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)", color: "#fff", border: "none", borderRadius: 9, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
            {t.nav_login}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px 64px", textAlign: "center" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 99, padding: "5px 16px", fontSize: 12.5, fontWeight: 700, color: "#2563EB", marginBottom: 28 }}>
          <Globe size={13} /> {t.badge}
        </div>

        <h1 style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, color: "#0F172A", marginBottom: 22, whiteSpace: "pre-line" }}>
          {t.hero_title}
        </h1>

        <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "#64748B", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 38px", fontWeight: 400 }}>
          {t.hero_sub}
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={btnPrimary}>
            <Brain size={17} /> {t.cta_start}
          </Link>
          <Link href="/dashboard" style={btnSecondary}>
            {t.cta_demo} <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 60, flexWrap: "wrap" }}>
          {[
            { value: "8,000+", label: t.stat1 },
            { value: "10",     label: t.stat2 },
            { value: "Daily",  label: t.stat3 },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#2563EB", letterSpacing: -1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem section */}
      <section style={{ background: "#fff", padding: "72px 32px", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, textAlign: "center", marginBottom: 48, letterSpacing: -0.5 }}>
            {t.problem_title}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { icon: "😵", title: t.p1_title, desc: t.p1_desc },
              { icon: "💸", title: t.p2_title, desc: t.p2_desc },
              { icon: "🔍", title: t.p3_title, desc: t.p3_desc },
            ].map(p => (
              <div key={p.title} style={{ ...cardStyle, background: "#FFF8F5", border: "1px solid #FED7C3" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Screeners */}
      <section id="features" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, letterSpacing: -0.5, marginBottom: 12 }}>{t.feature_title}</h2>
            <p style={{ fontSize: 14.5, color: "#64748B", maxWidth: 540, margin: "0 auto" }}>{t.feature_sub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {SCREENER_CARDS.map(sc => (
              <div key={sc.label}
                style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: "20px 16px", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: sc.color }} />
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${sc.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>
                  {sc.icon}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                  {lang === "th" ? sc.label_th : sc.label}
                </div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>{sc.desc}</div>
              </div>
            ))}
            <div style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 16, padding: "20px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ fontSize: 22 }}>✨</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>+ 4 {lang === "th" ? "สไตล์อีก" : "more styles"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{lang === "th" ? "ดูทั้งหมด" : "View all"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#fff", padding: "80px 32px", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, textAlign: "center", marginBottom: 52, letterSpacing: -0.5 }}>
            {t.how_title}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ textAlign: "center", padding: "20px 16px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 16, background: "#F1F5F9", marginBottom: 14 }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 1.5, marginBottom: 8 }}>STEP {step.step}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>
                  {lang === "th" ? step.title_th : step.title_en}
                </div>
                <div style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.65 }}>
                  {lang === "th" ? step.desc_th : step.desc_en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, letterSpacing: -0.5, marginBottom: 10 }}>{t.price_title}</h2>
            <p style={{ fontSize: 14, color: "#64748B" }}>{t.price_sub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {([
              { key: "free",  label: t.free_label,  price: lang === "th" ? "ฟรี" : "Free",    sub: "",           btn: t.get_free,  highlight: false, color: "#64748B" },
              { key: "pro",   label: t.pro_label,   price: lang === "th" ? "฿299" : "$9",      sub: t.mo,         btn: t.get_pro,   highlight: true,  color: "#2563EB" },
              { key: "elite", label: t.elite_label, price: lang === "th" ? "฿799" : "$25",     sub: t.mo,         btn: t.get_elite, highlight: false, color: "#7C3AED" },
            ] as const).map(plan => (
              <div key={plan.key} style={{ background: "#fff", border: plan.highlight ? "2px solid #2563EB" : "1px solid #E2E8F0", borderRadius: 18, padding: "28px 24px", position: "relative", boxShadow: plan.highlight ? "0 4px 24px rgba(37,99,235,0.12)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#2563EB", color: "#fff", borderRadius: 99, padding: "3px 14px", fontSize: 11, fontWeight: 800 }}>
                    {t.most_popular}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  {plan.key === "elite" ? <Crown size={16} color={plan.color} /> : plan.key === "pro" ? <Zap size={16} color={plan.color} /> : <Star size={16} color={plan.color} />}
                  <div style={{ fontSize: 15, fontWeight: 900, color: plan.color }}>{plan.label}</div>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#0F172A" }}>{plan.price}</span>
                  {plan.sub && <span style={{ fontSize: 13, color: "#64748B" }}>{plan.sub}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                  {PLAN_FEATURES[plan.key].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#374151" }}>
                      <Check size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/dashboard"
                  style={{ display: "block", textAlign: "center", background: plan.highlight ? "linear-gradient(135deg, #2563EB, #06B6D4)" : "transparent", color: plan.highlight ? "#fff" : plan.color, border: plan.highlight ? "none" : `2px solid ${plan.color}`, borderRadius: 11, padding: "11px 0", fontWeight: 800, fontSize: 14, cursor: "pointer", textDecoration: "none" }}>
                  {plan.btn}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", padding: "60px 32px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, color: "#fff", marginBottom: 14 }}>
            {lang === "th" ? "เริ่มคัดหุ้นด้วย AI วันนี้" : "Start AI Stock Screening Today"}
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 30, lineHeight: 1.7 }}>
            {lang === "th" ? "สมัครฟรี ไม่ต้องใส่บัตรเครดิต เริ่มใช้ได้เลยทันที" : "Sign up free — no credit card required. Start immediately."}
          </p>
          <Link href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#2563EB", border: "none", borderRadius: 12, padding: "14px 30px", fontSize: 16, fontWeight: 800, cursor: "pointer", textDecoration: "none" }}>
            {lang === "th" ? "เริ่มใช้งานฟรี" : "Get Started Free"} <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0F172A", color: "#94A3B8", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #2563EB, #06B6D4)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>U</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>USAXresearch</div>
          </div>
          <div style={{ fontSize: 11.5, lineHeight: 1.7, marginBottom: 16 }}>
            <ShieldCheck size={12} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
            {t.disclaimer}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 12 }}>
            <a href="/disclaimer" style={{ color: "#64748B", textDecoration: "none" }}>Disclaimer</a>
            <a href="/dashboard"  style={{ color: "#64748B", textDecoration: "none" }}>Dashboard</a>
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 16 }}>
            © 2024 USAXresearch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
