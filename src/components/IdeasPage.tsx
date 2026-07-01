"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

type Theme = {
  id: string; icon: string;
  title_th: string; title_en: string;
  desc_th: string; desc_en: string;
  color: string; gradFrom: string; gradTo: string;
  perf: string; up: boolean;
  stocks: { ticker: string; color: string; score: number; reason_th: string; reason_en: string }[];
  risk: "low"|"medium"|"high";
};

const THEMES: Theme[] = [
  {
    id:"ai_infra", icon:"🤖", title_th:"AI Infrastructure", title_en:"AI Infrastructure",
    desc_th:"บริษัทที่สร้างโครงสร้างพื้นฐาน AI: GPU, Cloud, Data Centers",
    desc_en:"Companies building AI infrastructure: GPUs, Cloud, Data Centers",
    color:"#3B82F6", gradFrom:"#1E3A8A", gradTo:"#1D4ED8", perf:"+38.4%", up:true, risk:"high",
    stocks:[
      { ticker:"NVDA", color:"#76B900", score:97, reason_th:"GPU Monopoly สำหรับ AI Training", reason_en:"GPU monopoly for AI Training" },
      { ticker:"AMD",  color:"#ED1C24", score:86, reason_th:"MI300X GPU ทางเลือก NVIDIA",     reason_en:"MI300X GPU NVIDIA alternative" },
      { ticker:"MSFT", color:"#00A1F1", score:94, reason_th:"Azure AI Cloud + OpenAI",          reason_en:"Azure AI Cloud + OpenAI" },
      { ticker:"AVGO", color:"#CC0000", score:91, reason_th:"AI XPU + Networking Chips",        reason_en:"AI XPU + Networking Chips" },
    ],
  },
  {
    id:"cybersec", icon:"🛡️", title_th:"Cybersecurity", title_en:"Cybersecurity",
    desc_th:"ความปลอดภัยทางไซเบอร์ยิ่งสำคัญในยุค AI และ Cloud",
    desc_en:"Cybersecurity critical in the AI and Cloud era",
    color:"#C1121F", gradFrom:"#7F1D1D", gradTo:"#991B1B", perf:"+22.1%", up:true, risk:"medium",
    stocks:[
      { ticker:"CRWD", color:"#C1121F", score:91, reason_th:"AI-Powered Falcon Platform",  reason_en:"AI-Powered Falcon Platform" },
      { ticker:"ZS",   color:"#005DAA", score:94, reason_th:"Zero Trust Cloud Security",   reason_en:"Zero Trust Cloud Security" },
      { ticker:"PANW", color:"#00A1E0", score:88, reason_th:"Security Platform Leader",    reason_en:"Security Platform Leader" },
      { ticker:"FTNT", color:"#EE3124", score:82, reason_th:"Network Security + SASE",     reason_en:"Network Security + SASE" },
    ],
  },
  {
    id:"dividend", icon:"💰", title_th:"Dividend Growth", title_en:"Dividend Growth",
    desc_th:"หุ้นปันผลเติบโตที่จ่ายสม่ำเสมอและเพิ่มขึ้นทุกปี",
    desc_en:"Dividend growth stocks with consistent and increasing payouts",
    color:"#10B981", gradFrom:"#064E3B", gradTo:"#065F46", perf:"+12.3%", up:true, risk:"low",
    stocks:[
      { ticker:"MSFT", color:"#00A1F1", score:94, reason_th:"Dividend ขึ้นทุกปี 20+ ปี",  reason_en:"20+ years consecutive dividend growth" },
      { ticker:"AAPL", color:"#555",    score:87, reason_th:"Buyback + Dividend ต่อเนื่อง",reason_en:"Consistent buyback + dividend" },
      { ticker:"JPM",  color:"#003087", score:85, reason_th:"Yield 2.4% + Earnings แข็งแกร่ง",reason_en:"2.4% yield + strong earnings" },
      { ticker:"AVGO", color:"#CC0000", score:91, reason_th:"Dividend ขึ้น 14% ล่าสุด",   reason_en:"Latest dividend up 14%" },
    ],
  },
  {
    id:"value_dip", icon:"📉", title_th:"Value in Dip", title_en:"Value in Dip",
    desc_th:"หุ้นคุณภาพสูงที่ราคาลดลงจาก All-Time High เกิน 25%",
    desc_en:"High-quality stocks down 25%+ from All-Time High",
    color:"#8B5CF6", gradFrom:"#4C1D95", gradTo:"#5B21B6", perf:"+18.7%", up:true, risk:"medium",
    stocks:[
      { ticker:"GOOG", color:"#4285F4", score:93, reason_th:"Down 28% ATH, AI Revenue เพิ่ม", reason_en:"Down 28% ATH, AI Revenue rising" },
      { ticker:"PYPL", color:"#003087", score:82, reason_th:"Down 79% ATH, P/E 14x ถูกมาก",   reason_en:"Down 79% ATH, P/E 14x extremely cheap" },
      { ticker:"TSLA", color:"#CC0000", score:71, reason_th:"Down 52% ATH, Robotaxi catalyst",  reason_en:"Down 52% ATH, Robotaxi catalyst" },
      { ticker:"SQ",   color:"#1B1B1B", score:74, reason_th:"Down 81% ATH, Cash App growth",   reason_en:"Down 81% ATH, Cash App growth" },
    ],
  },
  {
    id:"cloud", icon:"☁️", title_th:"Cloud & SaaS", title_en:"Cloud & SaaS",
    desc_th:"ผู้ให้บริการ Cloud และ Software-as-a-Service ที่เติบโตแรง",
    desc_en:"Cloud and SaaS providers with strong growth trajectories",
    color:"#06B6D4", gradFrom:"#164E63", gradTo:"#155E75", perf:"+25.6%", up:true, risk:"medium",
    stocks:[
      { ticker:"MSFT", color:"#00A1F1", score:94, reason_th:"Azure #2 Cloud + Copilot AI",   reason_en:"Azure #2 Cloud + Copilot AI" },
      { ticker:"AMZN", color:"#FF9900", score:88, reason_th:"AWS #1 Cloud + Gen AI Layer",    reason_en:"AWS #1 Cloud + Gen AI Layer" },
      { ticker:"SNOW", color:"#29B5E8", score:83, reason_th:"Data Cloud + AI Workload surge", reason_en:"Data Cloud + AI Workload surge" },
      { ticker:"ORCL", color:"#C74634", score:84, reason_th:"OCI Cloud เติบโตแซง AWS",       reason_en:"OCI Cloud outpacing AWS growth" },
    ],
  },
  {
    id:"fintech", icon:"💳", title_th:"Fintech & Payments", title_en:"Fintech & Payments",
    desc_th:"บริษัทการเงินดิจิทัลและระบบการชำระเงินสมัยใหม่",
    desc_en:"Digital finance and modern payment infrastructure companies",
    color:"#F97316", gradFrom:"#7C2D12", gradTo:"#9A3412", perf:"+8.2%", up:true, risk:"medium",
    stocks:[
      { ticker:"PYPL", color:"#003087", score:82, reason_th:"Turnaround + New Leadership",  reason_en:"Turnaround + New Leadership" },
      { ticker:"SQ",   color:"#1B1B1B", score:74, reason_th:"Cash App MAU เพิ่มต่อเนื่อง", reason_en:"Cash App MAU growing consistently" },
      { ticker:"COIN", color:"#1652F0", score:68, reason_th:"Crypto Cycle + ETF approval",  reason_en:"Crypto Cycle + ETF approval" },
      { ticker:"JPM",  color:"#003087", score:85, reason_th:"Digital Banking Leader",       reason_en:"Digital Banking Leader" },
    ],
  },
];

const RISK_CFG = {
  low:    { color:"#22C55E", bg:"rgba(34,197,94,0.1)",   label_th:"ความเสี่ยงต่ำ",  label_en:"Low Risk"    },
  medium: { color:"#EAB308", bg:"rgba(234,179,8,0.1)",   label_th:"ความเสี่ยงปาน",  label_en:"Medium Risk" },
  high:   { color:"#EF4444", bg:"rgba(239,68,68,0.1)",   label_th:"ความเสี่ยงสูง",  label_en:"High Risk"   },
};

function ScoreRing({ score, size=36 }: { score: number; size?: number }) {
  const color = score>=90?"#22C55E":score>=80?"#3B82F6":score>=70?"#EAB308":"#EF4444";
  const r=(size-6)/2; const circ=2*Math.PI*r; const dash=(score/100)*circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color }}>{score}</div>
    </div>
  );
}

export default function IdeasPage({ lang }: { lang: string }) {
  const TH = lang==="th";
  const [selected, setSelected] = useState<string|null>(null);

  const theme = selected ? THEMES.find(t=>t.id===selected) : null;

  if (theme) {
    const risk = RISK_CFG[theme.risk];
    return (
      <div className="fade-up">
        <button onClick={()=>setSelected(null)}
          style={{ display:"flex", alignItems:"center", gap:7, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, color:"var(--muted)", fontSize:13, padding:"7px 14px", cursor:"pointer", marginBottom:20 }}>
          ← {TH?"กลับ":"Back"}
        </button>

        <div style={{ background:`linear-gradient(150deg, ${theme.gradFrom}, ${theme.gradTo})`, borderRadius:20, padding:"28px 26px", marginBottom:18 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>{theme.icon}</div>
          <div style={{ fontSize:24, fontWeight:900, color:"#fff", marginBottom:6 }}>{TH?theme.title_th:theme.title_en}</div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginBottom:14 }}>{TH?theme.desc_th:theme.desc_en}</div>
          <div style={{ display:"flex", gap:12 }}>
            <span style={{ fontSize:13, fontWeight:800, color:theme.up?"#4ADE80":"#F87171", background:"rgba(0,0,0,0.25)", borderRadius:8, padding:"5px 12px" }}>
              {theme.up?"↑":"↓"} {theme.perf} {TH?"ปีนี้":"YTD"}
            </span>
            <span style={{ fontSize:12, fontWeight:700, color:risk.color, background:risk.bg, borderRadius:8, padding:"5px 12px" }}>
              {TH?risk.label_th:risk.label_en}
            </span>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {theme.stocks.map((s,i)=>(
            <div key={s.ticker} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:15, fontWeight:900, color:"var(--faint)", width:24, textAlign:"center" }}>#{i+1}</div>
              <div style={{ width:42, height:42, borderRadius:12, background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0 }}>{s.ticker.slice(0,4)}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:"var(--text)" }}>{s.ticker}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{TH?s.reason_th:s.reason_en}</div>
              </div>
              <ScoreRing score={s.score}/>
            </div>
          ))}
        </div>

        <div style={{ marginTop:16, fontSize:11, color:"var(--faint)" }}>
          ⚠️ {TH?"แนวคิดการลงทุนเพื่อการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน":"Investment ideas for educational purposes only — not investment advice."}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--text)", margin:0 }}>
          {TH?"แนวคิดการลงทุน":"Investment Ideas"}
        </h1>
        <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>
          {TH?"กลุ่มหุ้นตาม Thematic — คลิกเพื่อดูรายชื่อหุ้นในกลุ่ม":"Thematic stock groups — click to view stocks in each theme"}
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {THEMES.map(t=>{
          const risk = RISK_CFG[t.risk];
          return (
            <div key={t.id} onClick={()=>setSelected(t.id)}
              style={{ background:`linear-gradient(150deg, ${t.gradFrom}, ${t.gradTo})`, borderRadius:18, padding:"22px 20px", cursor:"pointer", transition:"transform .14s, box-shadow .14s", position:"relative", overflow:"hidden" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.35)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{t.icon}</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff", marginBottom:6 }}>{TH?t.title_th:t.title_en}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", lineHeight:1.5, marginBottom:14, minHeight:34 }}>{TH?t.desc_th:t.desc_en}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:0.5 }}>YTD</div>
                  <div style={{ fontSize:18, fontWeight:900, color:t.up?"#4ADE80":"#F87171" }}>{t.perf}</div>
                </div>
                <div style={{ display:"flex", gap:6, flexDirection:"column", alignItems:"flex-end" }}>
                  <span style={{ fontSize:10, fontWeight:700, color:risk.color, background:"rgba(0,0,0,0.3)", borderRadius:5, padding:"2px 8px" }}>
                    {TH?risk.label_th:risk.label_en}
                  </span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>{t.stocks.length} {TH?"หุ้น":"stocks"}</span>
                </div>
              </div>
              <div style={{ position:"absolute", right:-20, top:-20, width:80, height:80, borderRadius:99, background:"rgba(255,255,255,0.05)" }}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}
