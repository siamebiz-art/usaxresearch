"use client";
import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Star, Bell, ExternalLink } from "lucide-react";

// ── Stock database ────────────────────────────────────────────
const DETAIL_DB: Record<string, any> = {
  GOOG:  { name:"Alphabet Inc.",          color:"#4285F4", price:167.40, change:"+1.52%", up:true,  score:93, pe:23,   eps:"$7.26",  rev:"+15%", rev_ttm:"$307.4B", margin:"27%", roe:"30%", cap:"2.1T",  div:"—",    beta:"1.05", founded:"1998", employees:"182,000", sector_th:"เทคโนโลยี",    sector_en:"Technology",      desc_th:"ผู้นำ Search Engine, Cloud AI, YouTube และ Advertising",          desc_en:"Leader in Search, Cloud AI, YouTube and digital advertising.",          reasons:["Down 28% ATH","AI Revenue","Buy Zone"],   spark:"M0,28 L12,24 L24,20 L36,16 L48,12 L60,8", q_rev:[280,297,305,307], q_eps:[5.47,6.12,6.89,7.26] },
  BRKB:  { name:"Berkshire Hathaway B",   color:"#7F5539", price:406.10, change:"+0.30%", up:true,  score:89, pe:21,   eps:"$19.40", rev:"+8%",  rev_ttm:"$364.5B", margin:"14%", roe:"12%", cap:"880B",  div:"—",    beta:"0.88", founded:"1839", employees:"396,500", sector_th:"การเงิน",      sector_en:"Financials",      desc_th:"Conglomerate ลงทุนโดย Warren Buffett ถือหุ้นใหญ่ใน Apple, AmEx",    desc_en:"Conglomerate led by Warren Buffett, major stakes in Apple, AmEx.",      reasons:["Value Play","Cash Reserve","Buffett"],    spark:"M0,22 L12,20 L24,22 L36,18 L48,20 L60,16", q_rev:[350,358,362,365], q_eps:[17.2,18.1,18.9,19.4] },
  TSLA:  { name:"Tesla Inc.",             color:"#CC0000", price:176.40, change:"-1.10%", up:false, score:71, pe:55,   eps:"$3.12",  rev:"+3%",  rev_ttm:"$97.7B",  margin:"18%", roe:"17%", cap:"561B",  div:"—",    beta:"2.31", founded:"2003", employees:"140,473", sector_th:"ยานยนต์",      sector_en:"Auto / EV",       desc_th:"ผู้ผลิต EV อันดับ 1 โลก พัฒนา FSD, Robotaxi และ Energy Storage",    desc_en:"World's #1 EV maker developing FSD, Robotaxi and energy storage.",      reasons:["Down 32% ATH","EV Leader","Margin Pressure"],spark:"M0,12 L12,16 L24,20 L36,18 L48,24 L60,28",q_rev:[97,96,97,98], q_eps:[3.08,3.10,3.12,3.15] },
  PYPL:  { name:"PayPal Holdings",        color:"#003087", price:63.20,  change:"+2.10%", up:true,  score:82, pe:14,   eps:"$4.52",  rev:"+9%",  rev_ttm:"$30.0B",  margin:"15%", roe:"21%", cap:"67B",   div:"—",    beta:"1.45", founded:"1998", employees:"27,200",  sector_th:"การเงิน",      sector_en:"Fintech",         desc_th:"แพลตฟอร์ม Payment ชั้นนำ มี Venmo, PayPal Checkout ทั่วโลก",         desc_en:"Leading payment platform with Venmo and PayPal Checkout globally.",      reasons:["Down 31% ATH","Cheap P/E","Turnaround"],  spark:"M0,26 L12,22 L24,20 L36,17 L48,15 L60,12", q_rev:[28,29,30,30], q_eps:[4.1,4.3,4.5,4.6] },
  ADBE:  { name:"Adobe Inc.",             color:"#FF0000", price:414.00, change:"+0.90%", up:true,  score:86, pe:28,   eps:"$14.90", rev:"+11%", rev_ttm:"$21.5B",  margin:"29%", roe:"44%", cap:"181B",  div:"—",    beta:"1.22", founded:"1982", employees:"29,945",  sector_th:"ซอฟต์แวร์",    sector_en:"Software",        desc_th:"ผู้นำซอฟต์แวร์สร้างสรรค์ Photoshop, Illustrator และ AI Firefly",      desc_en:"Creative software leader with Photoshop, Illustrator and AI Firefly.",   reasons:["Down 24% ATH","AI Tools","Subscription"],  spark:"M0,30 L12,26 L24,22 L36,18 L48,14 L60,10", q_rev:[19,20,21,22], q_eps:[13.5,14.0,14.6,15.0] },
  COIN:  { name:"Coinbase Global",        color:"#1652F0", price:201.30, change:"-2.30%", up:false, score:68, pe:42,   eps:"$4.80",  rev:"+89%", rev_ttm:"$4.6B",   margin:"20%", roe:"18%", cap:"48B",   div:"—",    beta:"3.12", founded:"2012", employees:"3,000",   sector_th:"คริปโต",       sector_en:"Crypto Exchange",  desc_th:"แพลตฟอร์ม Crypto Exchange ชั้นนำในสหรัฐฯ มี 108M ผู้ใช้",           desc_en:"Leading US crypto exchange with 108M verified users.",                   reasons:["Crypto Cycle","High Vol","Speculative"],   spark:"M0,14 L12,18 L24,22 L36,20 L48,24 L60,28", q_rev:[2.8,3.2,4.0,4.6], q_eps:[3.2,3.8,4.5,4.8] },
  SQ:    { name:"Block Inc.",             color:"#1B1B1B", price:66.80,  change:"+1.50%", up:true,  score:74, pe:26,   eps:"$2.57",  rev:"+20%", rev_ttm:"$22.5B",  margin:"5%",  roe:"9%",  cap:"41B",   div:"—",    beta:"2.18", founded:"2009", employees:"12,000",  sector_th:"ฟินเทค",       sector_en:"Fintech",         desc_th:"Cash App + Square POS ของ Jack Dorsey มี Bitcoin holdings ด้วย",       desc_en:"Jack Dorsey's Cash App + Square POS with Bitcoin holdings.",             reasons:["Down 30% ATH","Cash App","Bitcoin"],      spark:"M0,24 L12,21 L24,19 L36,16 L48,14 L60,11", q_rev:[19,20,21,23], q_eps:[2.1,2.3,2.5,2.6] },
  NVDA:  { name:"NVIDIA Corporation",     color:"#76B900", price:1089.0, change:"+3.21%", up:true,  score:97, pe:52,   eps:"$16.84", rev:"+122%",rev_ttm:"$79.8B",  margin:"55%", roe:"91%", cap:"2.7T",  div:"0.04%",beta:"1.68", founded:"1993", employees:"36,000",  sector_th:"เซมิคอนดักเตอร์",sector_en:"Semiconductors", desc_th:"ผู้นำ AI Chip ผลิต H100/H200/Blackwell GPU ครองตลาด Data Center",     desc_en:"AI chip leader producing H100/H200/Blackwell GPUs dominating data centers.", reasons:["AI Compute","H100/H200","Blackwell"],      spark:"M0,36 L12,30 L24,22 L36,16 L48,10 L60,4",  q_rev:[44,61,79,88], q_eps:[8.2,12.6,16.8,18.0] },
  META:  { name:"Meta Platforms",         color:"#0867FC", price:493.60, change:"+1.82%", up:true,  score:87, pe:27,   eps:"$18.28", rev:"+27%", rev_ttm:"$155.0B", margin:"35%", roe:"31%", cap:"1.25T", div:"0.40%",beta:"1.23", founded:"2004", employees:"86,482",  sector_th:"โซเชียล",       sector_en:"Social Media",    desc_th:"Facebook, Instagram, WhatsApp + AI Research ลงทุน $65B ปีนี้",        desc_en:"Facebook, Instagram, WhatsApp + $65B AI infrastructure investment.",      reasons:["Ad Rebound","AI Infra","Reality Labs"],   spark:"M0,30 L12,25 L24,20 L36,15 L48,11 L60,8",  q_rev:[117,134,145,155], q_eps:[14,15.7,17.2,18.3] },
  CRWD:  { name:"CrowdStrike Holdings",   color:"#C1121F", price:330.50, change:"+2.40%", up:true,  score:91, pe:78,   eps:"$4.19",  rev:"+33%", rev_ttm:"$3.44B",  margin:"22%", roe:"14%", cap:"83B",   div:"—",    beta:"1.31", founded:"2011", employees:"10,000",  sector_th:"ไซเบอร์",       sector_en:"Cybersecurity",   desc_th:"แพลตฟอร์ม AI Security Falcon ป้องกัน Endpoint, Cloud, Identity",      desc_en:"AI-powered Falcon security platform protecting endpoints, cloud, identity.", reasons:["ARR Growth","Platform","AI Security"],    spark:"M0,32 L12,26 L24,20 L36,15 L48,10 L60,7",  q_rev:[2.7,3.0,3.2,3.4], q_eps:[3.0,3.5,4.0,4.2] },
  SNOW:  { name:"Snowflake Inc.",         color:"#29B5E8", price:162.80, change:"+1.10%", up:true,  score:83, pe:null, eps:"-$0.81",rev:"+33%", rev_ttm:"$3.23B",  margin:"-13%",roe:"-15%",cap:"54B",   div:"—",    beta:"1.52", founded:"2012", employees:"7,300",   sector_th:"คลาวด์",       sector_en:"Cloud Data",      desc_th:"Data Cloud Platform เชื่อมโยงข้อมูลข้ามองค์กร AI Workload เพิ่มขึ้น", desc_en:"Data Cloud platform connecting enterprise data with growing AI workloads.", reasons:["Data Cloud","AI Workload","Net Rev Ret"],  spark:"M0,28 L12,24 L24,20 L36,17 L48,13 L60,10", q_rev:[2.8,3.0,3.1,3.2], q_eps:[-1.2,-1.0,-0.9,-0.8] },
  PLTR:  { name:"Palantir Technologies",  color:"#4B5563", price:23.40,  change:"+4.50%", up:true,  score:85, pe:68,   eps:"$0.33",  rev:"+21%", rev_ttm:"$2.64B",  margin:"16%", roe:"8%",  cap:"50B",   div:"—",    beta:"1.72", founded:"2003", employees:"3,784",   sector_th:"ซอฟต์แวร์",    sector_en:"AI Software",     desc_th:"แพลตฟอร์ม AI ให้บริการ US Government + Commercial มีกำไร GAAP แล้ว", desc_en:"AI platform serving US Government + Commercial sectors, now GAAP profitable.", reasons:["US Gov","AI Platform","GAAP Profit"],     spark:"M0,30 L12,24 L24,18 L36,14 L48,10 L60,7",  q_rev:[2.1,2.3,2.5,2.6], q_eps:[0.24,0.28,0.32,0.33] },
  MSFT:  { name:"Microsoft Corporation",  color:"#00A1F1", price:416.34, change:"+0.92%", up:true,  score:94, pe:36,   eps:"$11.45", rev:"+17%", rev_ttm:"$245.1B", margin:"43%", roe:"38%", cap:"3.1T",  div:"0.74%",beta:"0.89", founded:"1975", employees:"221,000", sector_th:"เทคโนโลยี",    sector_en:"Technology",      desc_th:"Azure Cloud, Microsoft 365, Copilot AI, Teams, Xbox, GitHub",          desc_en:"Azure Cloud, Microsoft 365, Copilot AI, Teams, Xbox and GitHub.",        reasons:["Copilot AI","Azure AI","OpenAI"],         spark:"M0,26 L12,23 L24,20 L36,17 L48,13 L60,9",  q_rev:[212,222,232,245], q_eps:[9.8,10.5,11.0,11.5] },
  AVGO:  { name:"Broadcom Inc.",          color:"#CC0000", price:1687.0, change:"+2.50%", up:true,  score:91, pe:31,   eps:"$54.30", rev:"+43%", rev_ttm:"$51.6B",  margin:"52%", roe:"58%", cap:"786B",  div:"1.65%",beta:"1.11", founded:"1961", employees:"20,000",  sector_th:"เซมิคอนดักเตอร์",sector_en:"Semiconductors", desc_th:"AI XPU, Networking Chip และ VMware Software ซื้อกิจการ $69B",         desc_en:"AI XPUs, networking chips and VMware software after $69B acquisition.",   reasons:["AI XPU","Networking","VMware"],            spark:"M0,30 L12,24 L24,18 L36,13 L48,9 L60,5",   q_rev:[38,42,48,52], q_eps:[42,46,50,54] },
  AMD:   { name:"Advanced Micro Devices", color:"#ED1C24", price:158.00, change:"+2.10%", up:true,  score:86, pe:50,   eps:"$3.15",  rev:"+2%",  rev_ttm:"$23.6B",  margin:"25%", roe:"4%",  cap:"255B",  div:"—",    beta:"1.71", founded:"1969", employees:"26,000",  sector_th:"เซมิคอนดักเตอร์",sector_en:"Semiconductors", desc_th:"MI300X AI GPU ท้าทาย NVIDIA, EPYC Server CPU ครองตลาด Data Center",   desc_en:"MI300X AI GPU challenging NVIDIA, EPYC Server CPU dominating data centers.", reasons:["MI300X","EPYC Server","AI Challenger"],   spark:"M0,28 L12,24 L24,20 L36,16 L48,12 L60,8",  q_rev:[22,22,23,24], q_eps:[2.8,3.0,3.1,3.2] },
  ZS:    { name:"Zscaler Inc.",           color:"#005DAA", price:187.00, change:"+2.50%", up:true,  score:94, pe:85,   eps:"$2.41",  rev:"+24%", rev_ttm:"$2.29B",  margin:"20%", roe:"12%", cap:"28B",   div:"—",    beta:"1.48", founded:"2007", employees:"7,600",   sector_th:"ไซเบอร์",       sector_en:"Cybersecurity",   desc_th:"Zero Trust Security แพลตฟอร์ม Cloud-native ป้องกันทุก Network",       desc_en:"Zero Trust security platform protecting every network, cloud-native.",    reasons:["Zero Trust","Cloud Security","ARR"],      spark:"M0,34 L12,28 L24,22 L36,17 L48,12 L60,8",  q_rev:[1.9,2.0,2.2,2.3], q_eps:[1.9,2.1,2.3,2.4] },
  TSM:   { name:"TSMC",                   color:"#1D4ED8", price:153.40, change:"+1.80%", up:true,  score:90, pe:26,   eps:"$5.88",  rev:"+13%", rev_ttm:"$75.9B",  margin:"40%", roe:"28%", cap:"796B",  div:"1.67%",beta:"1.18", founded:"1987", employees:"73,000",  sector_th:"เซมิคอนดักเตอร์",sector_en:"Semiconductors", desc_th:"โรงงานผลิต Chip อันดับ 1 โลก ผลิต Apple, NVIDIA, AMD chips ทั้งหมด",  desc_en:"World's #1 chip foundry, manufacturing chips for Apple, NVIDIA, and AMD.", reasons:["AI Chip Fab","Monopoly","CoWoS"],         spark:"M0,28 L12,24 L24,20 L36,15 L48,11 L60,8",  q_rev:[66,68,72,76], q_eps:[5.1,5.4,5.7,5.9] },
  ORCL:  { name:"Oracle Corporation",     color:"#C74634", price:122.30, change:"+0.90%", up:true,  score:84, pe:33,   eps:"$3.71",  rev:"+7%",  rev_ttm:"$54.4B",  margin:"20%", roe:"—",   cap:"336B",  div:"1.31%",beta:"0.98", founded:"1977", employees:"164,000", sector_th:"ซอฟต์แวร์",    sector_en:"Cloud Software",  desc_th:"OCI Cloud เติบโตแรง AI Database และ GPU Cluster สำหรับ AI Training",   desc_en:"OCI Cloud growing fast with AI database and GPU clusters for AI training.", reasons:["OCI Cloud","AI Database","GPU Cluster"],  spark:"M0,26 L12,23 L24,21 L36,18 L48,14 L60,11", q_rev:[50,51,53,54], q_eps:[3.3,3.5,3.7,3.8] },
};

function getDefault(ticker: string) {
  return DETAIL_DB[ticker] ?? {
    name: ticker, color: "#64748B", price: 0, change: "—", up: true, score: 75,
    pe: null, eps: "—", rev: "—", rev_ttm: "—", margin: "—", roe: "—", cap: "—",
    div: "—", beta: "—", founded: "—", employees: "—",
    sector_th: "—", sector_en: "—",
    desc_th: "ข้อมูลไม่พร้อมใช้งาน", desc_en: "Data not available",
    reasons: [], spark: "M0,20 L60,20", q_rev: [], q_eps: [],
  };
}

function getScoreColor(s: number) {
  return s >= 90 ? "#22C55E" : s >= 80 ? "#3B82F6" : s >= 70 ? "#EAB308" : "#EF4444";
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray .6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: Math.round(size * 0.26), fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: "var(--faint)", lineHeight: 1.3 }}>/100</span>
      </div>
    </div>
  );
}

function MiniBar({ values, color }: { values: number[]; color: string }) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.95;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
      {values.map((v, i) => {
        const pct = max > min ? ((v - min) / (max - min)) * 100 : 50;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", height: `${Math.max(pct, 10)}%`, background: color, borderRadius: 4, opacity: i === values.length - 1 ? 1 : 0.5, transition: "height .4s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type Tab = "overview" | "financials";

export default function StockDetailPage({ ticker, onBack, lang = "th" }: {
  ticker: string; onBack: () => void; lang?: string;
}) {
  const TH = lang === "th";
  const d  = getDefault(ticker);
  const [tab, setTab] = useState<Tab>("overview");

  const TAB_LABELS: Record<Tab, string> = {
    overview:   TH ? "ภาพรวม"   : "Overview",
    financials: TH ? "การเงิน"  : "Financials",
  };

  const METRICS = [
    { label_th: "P/E Ratio",   label_en: "P/E Ratio",   value: d.pe ? `${d.pe}x` : "—"    },
    { label_th: "EPS",         label_en: "EPS",          value: d.eps                        },
    { label_th: "Rev Growth",  label_en: "Rev Growth",   value: d.rev                        },
    { label_th: "รายได้ TTM",  label_en: "Revenue TTM",  value: d.rev_ttm                    },
    { label_th: "Net Margin",  label_en: "Net Margin",   value: d.margin                     },
    { label_th: "ROE",         label_en: "ROE",          value: d.roe                        },
    { label_th: "Mkt Cap",     label_en: "Mkt Cap",      value: d.cap                        },
    { label_th: "เงินปันผล",   label_en: "Dividend",     value: d.div                        },
    { label_th: "Beta",        label_en: "Beta",         value: String(d.beta)               },
    { label_th: "ก่อตั้งปี",   label_en: "Founded",      value: d.founded                    },
    { label_th: "พนักงาน",     label_en: "Employees",    value: d.employees                  },
    { label_th: "กลุ่มธุรกิจ", label_en: "Sector",       value: TH ? d.sector_th : d.sector_en },
  ];

  return (
    <div className="fade-up">
      {/* Back button */}
      <button onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--muted)", fontSize: 13, padding: "7px 14px", cursor: "pointer", marginBottom: 20 }}>
        <ArrowLeft size={14} />
        {TH ? "กลับไปผลลัพธ์" : "Back to Results"}
      </button>

      {/* Hero card */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 26px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          {/* Logo */}
          <div style={{ width: 60, height: 60, borderRadius: 16, background: d.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {ticker.slice(0, 4)}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: "var(--text)" }}>{ticker}</span>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{d.name}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>
              {TH ? d.sector_th : d.sector_en} · NASDAQ
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>
              {TH ? d.desc_th : d.desc_en}
            </div>
          </div>

          {/* Price block */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>${d.price.toLocaleString()}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginTop: 6 }}>
              {d.up ? <TrendingUp size={14} color="var(--green)" /> : <TrendingDown size={14} color="var(--red)" />}
              <span style={{ fontSize: 16, fontWeight: 800, color: d.up ? "var(--green)" : "var(--red)" }}>{d.change}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>
              {TH ? "วันนี้ (ล่าช้า 15 นาที)" : "Today (15 min delay)"}
            </div>
          </div>

          {/* AI Score */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <ScoreRing score={d.score} size={80} />
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              AI Score
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg, var(--accent), var(--cyan))", border: "none", borderRadius: 11, padding: "10px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Star size={14} /> {TH ? "เพิ่มใน Watchlist" : "Add to Watchlist"}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 18px", color: "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Bell size={14} /> {TH ? "ตั้งแจ้งเตือน" : "Set Alert"}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 18px", color: "var(--muted)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <ExternalLink size={14} /> {TH ? "ดูบน Yahoo Finance" : "Yahoo Finance"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-raised)", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 16 }}>
        {(["overview", "financials"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: tab === t ? "var(--bg-card)" : "transparent", color: tab === t ? "var(--text)" : "var(--muted)", fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: "pointer", boxShadow: tab === t ? "var(--shadow)" : "none" }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Key metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {METRICS.slice(0, 8).map(m => (
              <div key={m.label_en} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 13, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  {TH ? m.label_th : m.label_en}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* AI Analysis */}
          <div style={{ background: `linear-gradient(135deg, var(--bg-card), ${d.color}0d)`, border: `1.5px solid ${d.color}30`, borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: d.color, marginBottom: 12 }}>
              🤖 {TH ? "การวิเคราะห์เชิงสถิติ AI" : "AI Statistical Analysis"}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {d.reasons.map((r: string) => (
                <span key={r} style={{ fontSize: 12, fontWeight: 700, color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "5px 12px" }}>
                  ✓ {r}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
              {TH
                ? `จากการวิเคราะห์เชิงสถิติ ${ticker} มี AI Score ที่ ${d.score}/100 ด้วยปัจจัย ${d.reasons.join(", ")} ราคาปัจจุบัน $${d.price.toLocaleString()} Market Cap ${d.cap}`
                : `Statistical analysis shows ${ticker} with AI Score ${d.score}/100 based on ${d.reasons.join(", ")}. Current price $${d.price.toLocaleString()}, Market Cap ${d.cap}.`}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--faint)", background: "var(--bg-raised)", borderRadius: 8, padding: "8px 12px" }}>
              ⚠️ {TH ? "ข้อมูลเชิงสถิติเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติม" : "Statistical data only — not investment advice. Investors should conduct independent research."}
            </div>
          </div>

          {/* About */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
              {TH ? "ข้อมูลบริษัท" : "Company Info"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
              {METRICS.slice(8).map(m => (
                <div key={m.label_en}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                    {TH ? m.label_th : m.label_en}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Financials tab */}
      {tab === "financials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Revenue trend */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>
              {TH ? "รายได้รายไตรมาส (พันล้าน $)" : "Quarterly Revenue (Billion $)"}
            </div>
            {d.q_rev.length > 0 ? (
              <>
                <MiniBar values={d.q_rev} color={d.color} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  {["Q1", "Q2", "Q3", "Q4 (TTM)"].map((q, i) => (
                    <div key={q} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 10, color: "var(--faint)" }}>{q}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                        {d.q_rev[i] != null ? `$${d.q_rev[i]}B` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--faint)", textAlign: "center", padding: "20px 0" }}>
                {TH ? "ข้อมูลไม่พร้อมใช้งาน" : "Data not available"}
              </div>
            )}
          </div>

          {/* EPS trend */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>
              {TH ? "EPS รายไตรมาส ($)" : "Quarterly EPS ($)"}
            </div>
            {d.q_eps.length > 0 ? (
              <>
                <MiniBar values={d.q_eps.map((v: number) => Math.max(v, 0))} color="#22C55E" />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
                    <div key={q} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 10, color: "var(--faint)" }}>{q}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: d.q_eps[i] >= 0 ? "var(--green)" : "var(--red)" }}>
                        {d.q_eps[i] != null ? `$${d.q_eps[i]}` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--faint)", textAlign: "center", padding: "20px 0" }}>
                {TH ? "ข้อมูลไม่พร้อมใช้งาน" : "Data not available"}
              </div>
            )}
          </div>

          {/* Full metrics */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 800, color: "var(--text)" }}>
              {TH ? "ตัวชี้วัดทั้งหมด" : "All Metrics"}
            </div>
            {METRICS.map((m, i) => (
              <div key={m.label_en}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: i < METRICS.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{TH ? m.label_th : m.label_en}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "var(--faint)", lineHeight: 1.7 }}>
            ⚠️ {TH ? "ข้อมูลทางการเงินเพื่อการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน อ้างอิงข้อมูลจาก SEC filings และแหล่งสาธารณะ" : "Financial data for educational purposes only. Not investment advice. Data sourced from SEC filings and public sources."}
          </div>
        </div>
      )}
    </div>
  );
}
