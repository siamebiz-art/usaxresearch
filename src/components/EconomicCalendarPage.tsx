"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Impact = "high" | "medium" | "low";
type EconEvent = {
  id: number; name_th: string; name_en: string;
  date: string; time: string; country: string; flag: string;
  impact: Impact; actual: string; forecast: string; previous: string;
  beat?: boolean;
};

const EVENTS: EconEvent[] = [
  { id:1,  name_th:"ดัชนีราคาผู้บริโภค (CPI)",        name_en:"CPI (MoM)",             date:"2026-07-10", time:"08:30", country:"US", flag:"🇺🇸", impact:"high",   actual:"",     forecast:"0.2%", previous:"0.3%"  },
  { id:2,  name_th:"อัตราดอกเบี้ย Fed",               name_en:"FOMC Rate Decision",     date:"2026-07-16", time:"14:00", country:"US", flag:"🇺🇸", impact:"high",   actual:"",     forecast:"5.25%",previous:"5.25%" },
  { id:3,  name_th:"ยอดค้าปลีก",                     name_en:"Retail Sales (MoM)",     date:"2026-07-16", time:"08:30", country:"US", flag:"🇺🇸", impact:"medium", actual:"",     forecast:"0.4%", previous:"0.1%"  },
  { id:4,  name_th:"GDP ไตรมาส 2 (เบื้องต้น)",       name_en:"GDP Growth Rate Q2",     date:"2026-07-25", time:"08:30", country:"US", flag:"🇺🇸", impact:"high",   actual:"",     forecast:"2.1%", previous:"1.3%"  },
  { id:5,  name_th:"ผู้ขอรับสวัสดิการว่างงาน",       name_en:"Initial Jobless Claims", date:"2026-07-04", time:"08:30", country:"US", flag:"🇺🇸", impact:"medium", actual:"222K", forecast:"225K", previous:"234K", beat:true  },
  { id:6,  name_th:"Core PCE Inflation",              name_en:"Core PCE Price Index",   date:"2026-06-28", time:"08:30", country:"US", flag:"🇺🇸", impact:"high",   actual:"2.6%", forecast:"2.7%", previous:"2.8%", beat:true  },
  { id:7,  name_th:"อัตราการจ้างงานนอกภาคเกษตร",    name_en:"Non-Farm Payrolls",      date:"2026-07-05", time:"08:30", country:"US", flag:"🇺🇸", impact:"high",   actual:"272K", forecast:"185K", previous:"165K", beat:true  },
  { id:8,  name_th:"อัตราว่างงาน",                   name_en:"Unemployment Rate",      date:"2026-07-05", time:"08:30", country:"US", flag:"🇺🇸", impact:"high",   actual:"4.0%", forecast:"3.9%", previous:"3.9%", beat:false },
  { id:9,  name_th:"ดัชนีความเชื่อมั่นผู้บริโภค",   name_en:"Consumer Confidence",    date:"2026-07-23", time:"10:00", country:"US", flag:"🇺🇸", impact:"medium", actual:"",     forecast:"102.3",previous:"97.0"  },
  { id:10, name_th:"ดัชนี PMI ภาคการผลิต",          name_en:"Manufacturing PMI",      date:"2026-07-22", time:"09:45", country:"US", flag:"🇺🇸", impact:"medium", actual:"",     forecast:"51.2", previous:"51.3"  },
  { id:11, name_th:"CPI ยุโรป",                      name_en:"Euro Area CPI (YoY)",    date:"2026-07-18", time:"05:00", country:"EU", flag:"🇪🇺", impact:"high",   actual:"",     forecast:"2.4%", previous:"2.6%"  },
  { id:12, name_th:"อัตราดอกเบี้ย ECB",             name_en:"ECB Rate Decision",      date:"2026-07-18", time:"08:15", country:"EU", flag:"🇪🇺", impact:"high",   actual:"",     forecast:"3.75%",previous:"4.0%"  },
  { id:13, name_th:"ดัชนีราคาผู้บริโภคญี่ปุ่น",     name_en:"Japan CPI (YoY)",        date:"2026-07-19", time:"19:30", country:"JP", flag:"🇯🇵", impact:"medium", actual:"",     forecast:"2.8%", previous:"2.5%"  },
  { id:14, name_th:"GDP จีน ไตรมาส 2",              name_en:"China GDP Growth",       date:"2026-07-15", time:"22:00", country:"CN", flag:"🇨🇳", impact:"high",   actual:"",     forecast:"4.9%", previous:"5.3%"  },
];

const IMPACT_CFG = {
  high:   { color:"#EF4444", bg:"rgba(239,68,68,0.1)",   label_th:"สูง",    label_en:"High"   },
  medium: { color:"#F97316", bg:"rgba(249,115,22,0.1)",  label_th:"กลาง",   label_en:"Medium" },
  low:    { color:"#94A3B8", bg:"rgba(148,163,184,0.1)", label_th:"ต่ำ",    label_en:"Low"    },
};

function ImpactBadge({ impact, lang }: { impact: Impact; lang: string }) {
  const c = IMPACT_CFG[impact];
  return (
    <span style={{ fontSize:10, fontWeight:700, color:c.color, background:c.bg, borderRadius:5, padding:"2px 8px" }}>
      {lang==="th"?c.label_th:c.label_en}
    </span>
  );
}

const COUNTRIES = ["All","US","EU","JP","CN"];

export default function EconomicCalendarPage({ lang }: { lang: string }) {
  const TH = lang==="th";
  const [filter,   setFilter]  = useState<Impact|"all">("all");
  const [country,  setCountry] = useState("All");
  const [showPast, setShowPast]= useState(false);

  const today = "2026-06-30";
  const filtered = EVENTS.filter(e=>{
    if(filter!=="all" && e.impact!==filter) return false;
    if(country!=="All" && e.country!==country) return false;
    if(!showPast && e.date<today) return false;
    return true;
  }).sort((a,b)=>a.date.localeCompare(b.date));

  const upcoming = EVENTS.filter(e=>e.date>=today && e.impact==="high").slice(0,3);

  return (
    <div className="fade-up">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--text)", margin:0 }}>
          {TH?"ปฏิทินเศรษฐกิจ":"Economic Calendar"}
        </h1>
        <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>
          {TH?"ตัวชี้วัดเศรษฐกิจสำคัญที่ส่งผลต่อตลาดหุ้นสหรัฐฯ":"Key economic indicators affecting US equity markets"}
        </p>
      </div>

      {/* Upcoming high-impact */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
        {upcoming.map(e=>(
          <div key={e.id} style={{ background:"var(--bg-card)", border:"1.5px solid rgba(239,68,68,0.25)", borderRadius:14, padding:"14px 16px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#EF4444", textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>
              {e.flag} {TH?"ใกล้มาถึง — High Impact":"Upcoming — High Impact"}
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:"var(--text)", marginBottom:4 }}>
              {TH?e.name_th:e.name_en}
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>{e.date} · {e.time} ET</div>
            <div style={{ display:"flex", gap:16, marginTop:10 }}>
              <div>
                <div style={{ fontSize:9, color:"var(--faint)", fontWeight:600, textTransform:"uppercase" }}>{TH?"คาดการณ์":"Forecast"}</div>
                <div style={{ fontSize:14, fontWeight:800, color:"var(--accent)" }}>{e.forecast}</div>
              </div>
              <div>
                <div style={{ fontSize:9, color:"var(--faint)", fontWeight:600, textTransform:"uppercase" }}>{TH?"ครั้งก่อน":"Previous"}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"var(--muted)" }}>{e.previous}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6 }}>
          {(["all","high","medium","low"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"5px 14px", borderRadius:99, border:`1.5px solid ${filter===f?(f==="all"?"var(--accent)":IMPACT_CFG[f]?.color??"var(--accent)"):"var(--border)"}`, background:filter===f?(f==="all"?"var(--accent)":IMPACT_CFG[f]?.bg??"transparent"):"var(--bg-card)", color:filter===f?(f==="all"?"#fff":(IMPACT_CFG[f]?.color??"var(--text)")):"var(--muted)", fontSize:12, fontWeight:filter===f?700:400, cursor:"pointer" }}>
              {f==="all"?(TH?"ทั้งหมด":"All"):(TH?IMPACT_CFG[f].label_th:IMPACT_CFG[f].label_en)}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {COUNTRIES.map(c=>(
            <button key={c} onClick={()=>setCountry(c)}
              style={{ padding:"5px 12px", borderRadius:99, border:`1.5px solid ${country===c?"var(--accent)":"var(--border)"}`, background:country===c?"var(--accent)":"var(--bg-card)", color:country===c?"#fff":"var(--muted)", fontSize:12, fontWeight:country===c?700:400, cursor:"pointer" }}>
              {c}
            </button>
          ))}
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--muted)", cursor:"pointer", marginLeft:"auto" }}>
          <input type="checkbox" checked={showPast} onChange={e=>setShowPast(e.target.checked)}/>
          {TH?"รวมข้อมูลที่ผ่านมา":"Show past events"}
        </label>
      </div>

      {/* Events table */}
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"90px 1fr 80px 90px 90px 90px 90px", gap:8, padding:"10px 16px", borderBottom:"1px solid var(--border)" }}>
          {[TH?"วันที่":"Date",TH?"เหตุการณ์":"Event",TH?"ผลกระทบ":"Impact",TH?"จริง":"Actual",TH?"คาดการณ์":"Forecast",TH?"ครั้งก่อน":"Previous",""].map((h,i)=>(
            <div key={i} style={{ fontSize:10, fontWeight:700, color:"var(--faint)", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</div>
          ))}
        </div>
        {filtered.length===0?(
          <div style={{ padding:"40px", textAlign:"center", color:"var(--faint)", fontSize:13 }}>
            {TH?"ไม่พบเหตุการณ์ที่ตรงกับตัวกรอง":"No events match the current filters"}
          </div>
        ):filtered.map((e,idx)=>{
          const isPast = e.date<today;
          const hasActual = e.actual!=="";
          return (
            <div key={e.id}
              style={{ display:"grid", gridTemplateColumns:"90px 1fr 80px 90px 90px 90px 90px", gap:8, alignItems:"center", padding:"13px 16px", borderBottom:idx<filtered.length-1?"1px solid var(--border)":"none", opacity:isPast?0.7:1, transition:"background .12s" }}
              onMouseEnter={el=>(el.currentTarget.style.background="var(--bg-raised)")}
              onMouseLeave={el=>(el.currentTarget.style.background="transparent")}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:isPast?"var(--muted)":"var(--text)" }}>{e.date.slice(5)}</div>
                <div style={{ fontSize:10, color:"var(--faint)" }}>{e.time} ET</div>
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:14 }}>{e.flag}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{TH?e.name_th:e.name_en}</span>
                </div>
              </div>
              <ImpactBadge impact={e.impact} lang={lang}/>
              <div style={{ fontSize:13, fontWeight:800, color:e.beat===true?"var(--green)":e.beat===false?"var(--red)":"var(--faint)" }}>
                {hasActual?(
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {e.actual}
                    {e.beat===true&&<TrendingUp size={12}/>}
                    {e.beat===false&&<TrendingDown size={12}/>}
                    {e.beat===undefined&&<Minus size={12}/>}
                  </span>
                ):"—"}
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--accent)" }}>{e.forecast}</div>
              <div style={{ fontSize:12, color:"var(--muted)" }}>{e.previous}</div>
              <div>
                {isPast&&hasActual&&(
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background:e.beat===true?"rgba(34,197,94,0.1)":e.beat===false?"rgba(239,68,68,0.1)":"rgba(148,163,184,0.1)", color:e.beat===true?"var(--green)":e.beat===false?"var(--red)":"var(--muted)" }}>
                    {e.beat===true?(TH?"ดีกว่าคาด":"Beat"):e.beat===false?(TH?"แย่กว่าคาด":"Miss"):(TH?"ตามคาด":"In-line")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:14, fontSize:11, color:"var(--faint)" }}>
        ⚠️ {TH?"วันที่และการคาดการณ์อาจเปลี่ยนแปลง ข้อมูลเพื่อการศึกษาเท่านั้น":"Dates and forecasts subject to change. For educational purposes only."}
      </div>
    </div>
  );
}
