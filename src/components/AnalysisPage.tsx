"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Star, ChevronDown, ChevronUp } from "lucide-react";

type Rating = "buy"|"hold"|"sell";
type Report = {
  ticker: string; name: string; color: string; sector_th: string; sector_en: string;
  price: number; target: number; rating: Rating;
  score: number; upside: number;
  summary_th: string; summary_en: string;
  pros_th: string[]; pros_en: string[];
  cons_th: string[]; cons_en: string[];
  pe: number|null; rev: string; margin: string;
  analyst: string; date: string;
};

const REPORTS: Report[] = [
  {
    ticker:"NVDA", name:"NVIDIA Corporation", color:"#76B900", sector_th:"เซมิคอนดักเตอร์", sector_en:"Semiconductors",
    price:1089, target:1400, rating:"buy", score:97, upside:28.6,
    summary_th:"NVIDIA ครองตลาด AI GPU ด้วย H100/H200/Blackwell การเติบโตของ Data Center ยังไม่มีสัญญาณชะลอ คาดการณ์รายได้ FY2025 ที่ $120B+ จากความต้องการ AI Compute ที่พุ่งสูง",
    summary_en:"NVIDIA dominates the AI GPU market with H100/H200/Blackwell. Data Center growth shows no signs of slowing, with FY2025 revenue expected at $120B+ driven by surging AI compute demand.",
    pros_th:["AI GPU Monopoly 80%+ market share","Blackwell Architecture จะเพิ่ม ASP","Data Center รายได้โต 427% YoY","Gross Margin 78% สูงสุดในประวัติศาสตร์"],
    pros_en:["AI GPU monopoly 80%+ market share","Blackwell Architecture increases ASP","Data Center revenue up 427% YoY","78% gross margin — all-time high"],
    cons_th:["Valuation สูงที่ P/E 52x","ความเสี่ยงจากกฎระเบียบส่งออก AI ไปจีน","การแข่งขันจาก AMD MI300X และ Custom ASIC"],
    cons_en:["High valuation at P/E 52x","Export regulation risk for AI to China","Competition from AMD MI300X and custom ASICs"],
    pe:52, rev:"+122%", margin:"55%", analyst:"AI Research", date:"2026-06-28",
  },
  {
    ticker:"MSFT", name:"Microsoft Corporation", color:"#00A1F1", sector_th:"เทคโนโลยี", sector_en:"Technology",
    price:416, target:520, rating:"buy", score:94, upside:24.9,
    summary_th:"Microsoft เป็นผู้นำ AI Enterprise ที่แข็งแกร่งที่สุดด้วย Azure AI + Copilot ธุรกิจ Cloud เติบโต 17% YoY พร้อมการลงทุน OpenAI ที่สร้างความได้เปรียบแบบ Exclusive",
    summary_en:"Microsoft is the strongest AI Enterprise leader with Azure AI + Copilot. Cloud business grows 17% YoY, and OpenAI investment creates exclusive competitive advantages.",
    pros_th:["Azure Cloud เติบโต 17% YoY","Copilot AI เพิ่มรายได้ SaaS","Margin 43% ดีที่สุดในกลุ่ม","Dividend Growth 20+ ปี"],
    pros_en:["Azure Cloud up 17% YoY","Copilot AI boosts SaaS revenue","43% margin — best in class","20+ years dividend growth"],
    cons_th:["Valuation P/E 36x แพงกว่าค่าเฉลี่ย","Cloud Growth อาจชะลอในระยะกลาง"],
    cons_en:["P/E 36x above historical average","Cloud growth may moderate in mid-term"],
    pe:36, rev:"+17%", margin:"43%", analyst:"AI Research", date:"2026-06-27",
  },
  {
    ticker:"GOOG", name:"Alphabet Inc.", color:"#4285F4", sector_th:"เทคโนโลยี", sector_en:"Technology",
    price:167, target:210, rating:"buy", score:93, upside:25.7,
    summary_th:"Alphabet ยังเป็น Search Monopoly ที่ครองส่วนแบ่งตลาด 90%+ พร้อมการเพิ่มรายได้จาก AI Overview ใน Search และ Google Cloud ที่โต 28% YoY ราคาถูกกว่า Peers ที่ P/E 23x",
    summary_en:"Alphabet remains a Search monopoly with 90%+ market share, with additional revenue from AI Overviews in Search and Google Cloud growing 28% YoY. Cheaper than peers at P/E 23x.",
    pros_th:["Search Monopoly 90%+ ส่วนแบ่งตลาด","Google Cloud โต 28% YoY","P/E 23x ถูกกว่า Peers","AI Overview เพิ่ม Search Monetization"],
    pros_en:["Search monopoly 90%+ market share","Google Cloud up 28% YoY","P/E 23x cheaper than peers","AI Overviews boosting Search monetization"],
    cons_th:["ความเสี่ยง Antitrust จาก DOJ","YouTube แข่งขันกับ TikTok/Reels"],
    cons_en:["DOJ Antitrust risk","YouTube competes with TikTok/Reels"],
    pe:23, rev:"+15%", margin:"27%", analyst:"AI Research", date:"2026-06-25",
  },
  {
    ticker:"PYPL", name:"PayPal Holdings", color:"#003087", sector_th:"ฟินเทค", sector_en:"Fintech",
    price:63, target:90, rating:"buy", score:82, upside:42.9,
    summary_th:"PayPal อยู่ใน Turnaround ภายใต้ CEO ใหม่ที่เน้น Margin Expansion และ AI-powered Checkout ราคาถูกมากที่ P/E 14x เทียบกับ Fintech Peers ที่ P/E 30x+",
    summary_en:"PayPal in turnaround under new CEO focused on margin expansion and AI-powered checkout. Extremely cheap at P/E 14x vs fintech peers at P/E 30x+.",
    pros_th:["P/E 14x ถูกมากเมื่อเทียบ Peers","Buyback หุ้นเชิงรุก","Venmo Monetization ยังมีศักยภาพ","CEO ใหม่ Focus ที่ Margin"],
    pros_en:["P/E 14x extremely cheap vs peers","Aggressive share buybacks","Venmo monetization still has potential","New CEO focused on margins"],
    cons_th:["Competition จาก Apple Pay, Stripe","Revenue Growth ชะลอลงชั่วคราว"],
    cons_en:["Competition from Apple Pay, Stripe","Revenue growth temporarily slowing"],
    pe:14, rev:"+9%", margin:"15%", analyst:"AI Research", date:"2026-06-20",
  },
  {
    ticker:"TSLA", name:"Tesla Inc.", color:"#CC0000", sector_th:"ยานยนต์", sector_en:"Auto / EV",
    price:176, target:165, rating:"hold", score:71, upside:-6.3,
    summary_th:"Tesla เผชิญแรงกดดันด้าน Margin จากการแข่งขัน EV ที่รุนแรง โดยเฉพาะ BYD ในตลาดจีน อย่างไรก็ตาม Robotaxi และ FSD อาจเป็น Catalyst สำคัญในปลายปีนี้",
    summary_en:"Tesla faces margin pressure from intense EV competition, particularly BYD in China. However, Robotaxi and FSD may serve as significant catalysts later this year.",
    pros_th:["Robotaxi เป็น Catalyst ศักยภาพสูง","FSD Revenue แบบ SaaS","Energy Storage รายได้เพิ่มแรง"],
    pros_en:["Robotaxi is a high-potential catalyst","FSD as recurring SaaS revenue","Energy Storage revenue growing fast"],
    cons_th:["Margin ลดลงต่อเนื่องจาก Price War","BYD แย่งส่วนแบ่งในจีน","Delivery โต 0% YoY","Valuation P/E 55x ยังแพง"],
    cons_en:["Margins declining from price war","BYD taking China market share","Delivery flat at 0% YoY","P/E 55x still expensive"],
    pe:55, rev:"+3%", margin:"18%", analyst:"AI Research", date:"2026-06-22",
  },
  {
    ticker:"COIN", name:"Coinbase Global", color:"#1652F0", sector_th:"คริปโต", sector_en:"Crypto Exchange",
    price:201, target:145, rating:"sell", score:68, upside:-27.9,
    summary_th:"Coinbase ขึ้นมาแรงตามกระแส Crypto Cycle แต่ Valuation ตึงตัวมากที่ P/E 42x Revenue พึ่งพาความผันผวนของ Crypto เกินไป ความเสี่ยงจาก SEC ยังไม่หมด",
    summary_en:"Coinbase surged with the Crypto Cycle but valuation is stretched at P/E 42x. Revenue relies too heavily on crypto volatility and SEC regulatory risk persists.",
    pros_th:["ผู้นำ Crypto Exchange สหรัฐฯ","Bitcoin ETF Inflow หนุน Volume","Staking Revenue ไม่ขึ้นกับ Price"],
    pros_en:["Leading US crypto exchange","Bitcoin ETF inflows boost volume","Staking revenue non-correlated to price"],
    cons_th:["P/E 42x แพงในกลุ่ม High-Risk","Revenue ขึ้นกับ Crypto Volatility","ความเสี่ยง SEC Regulation ยังมี","หาก Bear Market จะกระทบหนัก"],
    cons_en:["P/E 42x expensive for high-risk asset","Revenue tied to crypto volatility","Ongoing SEC regulatory risk","Bear market exposure significant"],
    pe:42, rev:"+89%", margin:"20%", analyst:"AI Research", date:"2026-06-18",
  },
];

const RATING_CFG: Record<Rating, { color:string; bg:string; label_th:string; label_en:string }> = {
  buy:  { color:"#22C55E", bg:"rgba(34,197,94,0.1)",  label_th:"ซื้อ",  label_en:"BUY"  },
  hold: { color:"#EAB308", bg:"rgba(234,179,8,0.1)",  label_th:"ถือ",  label_en:"HOLD" },
  sell: { color:"#EF4444", bg:"rgba(239,68,68,0.1)",  label_th:"ขาย",  label_en:"SELL" },
};

function ScoreRing({ score, size=42 }:{ score:number; size?:number }) {
  const color = score>=90?"#22C55E":score>=80?"#3B82F6":score>=70?"#EAB308":"#EF4444";
  const r=(size-6)/2; const circ=2*Math.PI*r; const dash=(score/100)*circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color }}>{score}</div>
    </div>
  );
}

export default function AnalysisPage({ lang }: { lang: string }) {
  const TH = lang==="th";
  const [ratingFilter, setRatingFilter] = useState<Rating|"all">("all");
  const [expanded, setExpanded] = useState<string|null>(null);

  const filtered = ratingFilter==="all" ? REPORTS : REPORTS.filter(r=>r.rating===ratingFilter);
  const counts = { buy:REPORTS.filter(r=>r.rating==="buy").length, hold:REPORTS.filter(r=>r.rating==="hold").length, sell:REPORTS.filter(r=>r.rating==="sell").length };

  return (
    <div className="fade-up">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--text)", margin:0 }}>
          {TH?"รายงานวิเคราะห์หุ้น":"Stock Analysis Reports"}
        </h1>
        <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>
          {TH?"วิเคราะห์เชิงสถิติ — ไม่ถือเป็นคำแนะนำการลงทุน":"Statistical analysis — not investment advice"}
        </p>
      </div>

      {/* Summary stat */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        {(["buy","hold","sell"] as Rating[]).map(r=>{
          const c = RATING_CFG[r];
          return (
            <div key={r} onClick={()=>setRatingFilter(ratingFilter===r?"all":r)}
              style={{ background:ratingFilter===r?c.bg:"var(--bg-card)", border:`1.5px solid ${ratingFilter===r?c.color:"var(--border)"}`, borderRadius:13, padding:"14px 18px", cursor:"pointer", transition:"all .14s" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"var(--faint)", textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{TH?c.label_th:c.label_en}</div>
              <div style={{ fontSize:28, fontWeight:900, color:c.color }}>{counts[r]}</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>{TH?"หุ้น":"stocks"}</div>
            </div>
          );
        })}
      </div>

      {/* Report cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(r=>{
          const rc = RATING_CFG[r.rating];
          const isUp = r.upside >= 0;
          const open = expanded === r.ticker;
          return (
            <div key={r.ticker} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
              {/* Summary row */}
              <div onClick={()=>setExpanded(open?null:r.ticker)}
                style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 90px 90px 44px 36px", gap:10, alignItems:"center", padding:"16px 18px", cursor:"pointer", transition:"background .12s" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-raised)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:r.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#fff", flexShrink:0 }}>{r.ticker.slice(0,4)}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>{r.ticker}</div>
                    <div style={{ fontSize:11, color:"var(--muted)" }}>{TH?r.sector_th:r.sector_en}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>${r.price}</div>
                  <div style={{ fontSize:10, color:"var(--faint)" }}>{TH?"ราคาปัจจุบัน":"Current"}</div>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--accent)" }}>${r.target}</div>
                  <div style={{ fontSize:10, color:"var(--faint)" }}>{TH?"เป้าหมาย":"Target"}</div>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:isUp?"var(--green)":"var(--red)", display:"flex", alignItems:"center", gap:3 }}>
                    {isUp?<TrendingUp size={12}/>:<TrendingDown size={12}/>}
                    {isUp?"+":""}{r.upside.toFixed(1)}%
                  </div>
                  <div style={{ fontSize:10, color:"var(--faint)" }}>{TH?"Upside":"Upside"}</div>
                </div>
                <span style={{ fontSize:12, fontWeight:800, color:rc.color, background:rc.bg, borderRadius:7, padding:"5px 12px", textAlign:"center" }}>
                  {TH?rc.label_th:rc.label_en}
                </span>
                <ScoreRing score={r.score} size={40}/>
                <div style={{ color:"var(--faint)", display:"flex" }}>
                  {open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
                </div>
              </div>

              {/* Detail panel */}
              {open && (
                <div style={{ borderTop:"1px solid var(--border)", padding:"18px 20px", background:"var(--bg-raised)" }} className="fade-up">
                  <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.8, marginBottom:16 }}>
                    {TH?r.summary_th:r.summary_en}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#22C55E", textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>
                        ✅ {TH?"ปัจจัยสนับสนุน":"Strengths"}
                      </div>
                      {(TH?r.pros_th:r.pros_en).map((p,i)=>(
                        <div key={i} style={{ fontSize:12, color:"var(--text)", marginBottom:5, display:"flex", gap:7 }}>
                          <span style={{ color:"#22C55E", flexShrink:0 }}>•</span>{p}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#EF4444", textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>
                        ⚠️ {TH?"ความเสี่ยง":"Risks"}
                      </div>
                      {(TH?r.cons_th:r.cons_en).map((c,i)=>(
                        <div key={i} style={{ fontSize:12, color:"var(--text)", marginBottom:5, display:"flex", gap:7 }}>
                          <span style={{ color:"#EF4444", flexShrink:0 }}>•</span>{c}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:16, fontSize:11, color:"var(--faint)" }}>
                    <span>P/E {r.pe??'N/A'}x</span>
                    <span>{TH?"Rev Growth":"Rev"} {r.rev}</span>
                    <span>{TH?"Net Margin":"Margin"} {r.margin}</span>
                    <span style={{ marginLeft:"auto" }}>{TH?"อัปเดต":"Updated"} {r.date} · {r.analyst}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:16, fontSize:11, color:"var(--faint)", lineHeight:1.7 }}>
        ⚠️ {TH?"การวิเคราะห์เชิงสถิติเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติมก่อนตัดสินใจลงทุน":"Statistical analysis only — not investment advice. Investors should conduct independent research before making investment decisions."}
      </div>
    </div>
  );
}
