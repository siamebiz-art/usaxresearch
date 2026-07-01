"use client";
import { useState, useEffect } from "react";
import { Plus, X, TrendingUp, TrendingDown, Briefcase } from "lucide-react";
import { loadUserPortfolio, saveUserPortfolio, type PortfolioPosition } from "@/lib/user-data";

type Position = PortfolioPosition;

const SECTOR_COLORS: Record<string, string> = {
  "Technology":    "#3B82F6",
  "Semiconductors":"#8B5CF6",
  "Cybersecurity": "#C1121F",
  "Financials":    "#06B6D4",
  "Consumer":      "#F97316",
  "Healthcare":    "#10B981",
  "Energy":        "#EAB308",
};

const INIT_POSITIONS: Position[] = [
  { id:1, ticker:"NVDA", name:"NVIDIA Corporation",    color:"#76B900", shares:10,  avgCost:650.00,  price:1089.00, sector:"Semiconductors" },
  { id:2, ticker:"MSFT", name:"Microsoft Corporation", color:"#00A1F1", shares:15,  avgCost:310.00,  price:416.34,  sector:"Technology"     },
  { id:3, ticker:"AAPL", name:"Apple Inc.",            color:"#555",    shares:20,  avgCost:155.00,  price:189.30,  sector:"Technology"     },
  { id:4, ticker:"META", name:"Meta Platforms",        color:"#0867FC", shares:8,   avgCost:280.00,  price:493.60,  sector:"Technology"     },
  { id:5, ticker:"CRWD", name:"CrowdStrike Holdings",  color:"#C1121F", shares:12,  avgCost:180.00,  price:330.50,  sector:"Cybersecurity"  },
  { id:6, ticker:"JPM",  name:"JPMorgan Chase",        color:"#003087", shares:25,  avgCost:140.00,  price:197.60,  sector:"Financials"     },
];

const TICKER_LIST = [
  { ticker:"TSLA", name:"Tesla Inc.",               color:"#CC0000", price:176.40, sector:"Consumer"     },
  { ticker:"AMZN", name:"Amazon.com Inc.",           color:"#FF9900", price:182.30, sector:"Consumer"     },
  { ticker:"GOOG", name:"Alphabet Inc.",             color:"#4285F4", price:167.40, sector:"Technology"   },
  { ticker:"AMD",  name:"Advanced Micro Devices",    color:"#ED1C24", price:158.00, sector:"Semiconductors"},
  { ticker:"ZS",   name:"Zscaler Inc.",              color:"#005DAA", price:187.00, sector:"Cybersecurity" },
];

const LS_PORTFOLIO_KEY = "usax-portfolio-v1";

export default function PortfolioPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [positions, setPositionsRaw] = useState<Position[]>(INIT_POSITIONS);
  const [showForm, setShowForm]      = useState(false);
  const [form, setForm]              = useState({ ticker: "TSLA", shares: "", avgCost: "" });
  const [tab, setTab]                = useState<"holdings"|"allocation">("holdings");

  useEffect(() => {
    const loadLocalPortfolio = () => {
      try {
        const s = localStorage.getItem(LS_PORTFOLIO_KEY);
        if (s) setPositionsRaw(JSON.parse(s));
      } catch {}
    };
    const loadCloudPortfolio = async () => {
      const cloud = await loadUserPortfolio();
      if (!cloud) return;
      setPositionsRaw(cloud);
      try { localStorage.setItem(LS_PORTFOLIO_KEY, JSON.stringify(cloud)); } catch {}
    };
    const timer = window.setTimeout(loadLocalPortfolio, 0);
    loadCloudPortfolio();
    return () => window.clearTimeout(timer);
  }, []);

  const setPositions = (updater: (prev: Position[]) => Position[]) => {
    setPositionsRaw(prev => {
      const next = updater(prev);
      try { localStorage.setItem(LS_PORTFOLIO_KEY, JSON.stringify(next)); } catch {}
      void saveUserPortfolio(next);
      return next;
    });
  };

  const totalCost  = positions.reduce((s, p) => s + p.shares * p.avgCost, 0);
  const totalValue = positions.reduce((s, p) => s + p.shares * p.price,   0);
  const totalPnL   = totalValue - totalCost;
  const pnlPct     = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const up         = totalPnL >= 0;

  const sectorMap: Record<string, number> = {};
  positions.forEach(p => {
    sectorMap[p.sector] = (sectorMap[p.sector] ?? 0) + p.shares * p.price;
  });
  const sectors = Object.entries(sectorMap)
    .map(([s, v]) => ({ sector: s, value: v, pct: (v / totalValue) * 100 }))
    .sort((a, b) => b.value - a.value);

  const addPosition = () => {
    const tpl = TICKER_LIST.find(t => t.ticker === form.ticker);
    if (!tpl || !form.shares || !form.avgCost) return;
    setPositions(p => [...p, {
      id: Date.now(), ticker: tpl.ticker, name: tpl.name, color: tpl.color,
      shares: +form.shares, avgCost: +form.avgCost, price: tpl.price, sector: tpl.sector,
    }]);
    setForm({ ticker: "TSLA", shares: "", avgCost: "" });
    setShowForm(false);
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"var(--text)", margin:0 }}>
            {TH ? "Portfolio Analysis" : "Portfolio Analysis"}
          </h1>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>
            {TH ? `${positions.length} หลักทรัพย์ · ข้อมูลจำลองเพื่อการศึกษา` : `${positions.length} positions · Demo data`}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ display:"flex", alignItems:"center", gap:7, background:"var(--accent)", border:"none", borderRadius:11, padding:"10px 18px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          <Plus size={15}/>{TH ? "เพิ่มหุ้น" : "Add Position"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ background:"var(--bg-card)", border:"1.5px solid var(--accent)", borderRadius:16, padding:"18px 20px", marginBottom:16 }} className="fade-up">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:12, alignItems:"end" }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>{TH?"หุ้น":"Stock"}</label>
              <select value={form.ticker} onChange={e=>setForm(p=>({...p,ticker:e.target.value}))}
                style={{ width:"100%", background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:9, padding:"9px 12px", color:"var(--text)", fontSize:13, outline:"none", cursor:"pointer" }}>
                {TICKER_LIST.map(t=><option key={t.ticker} value={t.ticker}>{t.ticker} — {t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>{TH?"จำนวนหุ้น":"Shares"}</label>
              <input type="number" value={form.shares} onChange={e=>setForm(p=>({...p,shares:e.target.value}))} placeholder="10"
                style={{ width:"100%", background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:9, padding:"9px 12px", color:"var(--text)", fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>{TH?"ราคาซื้อเฉลี่ย ($)":"Avg Cost ($)"}</label>
              <input type="number" value={form.avgCost} onChange={e=>setForm(p=>({...p,avgCost:e.target.value}))} placeholder="150.00"
                style={{ width:"100%", background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:9, padding:"9px 12px", color:"var(--text)", fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            <button onClick={addPosition}
              style={{ background:"var(--accent)", border:"none", borderRadius:9, padding:"10px 20px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              {TH?"เพิ่ม":"Add"}
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        {[
          { label_th:"มูลค่าพอร์ต",    label_en:"Portfolio Value", value:`$${fmt(totalValue)}`,           color:"var(--text)"  },
          { label_th:"ต้นทุนรวม",      label_en:"Total Cost",      value:`$${fmt(totalCost)}`,            color:"var(--muted)" },
          { label_th:"กำไร/ขาดทุน",   label_en:"Total P&L",       value:`${up?"+":"-"}$${fmt(Math.abs(totalPnL))}`, color:up?"var(--green)":"var(--red)" },
          { label_th:"เปอร์เซ็นต์",    label_en:"P&L %",           value:`${up?"+":""}${pnlPct.toFixed(2)}%`,        color:up?"var(--green)":"var(--red)" },
        ].map(m=>(
          <div key={m.label_en} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"14px 16px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--faint)", textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>
              {TH?m.label_th:m.label_en}
            </div>
            <div style={{ fontSize:20, fontWeight:900, color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:"var(--bg-raised)", borderRadius:11, padding:3, width:"fit-content", marginBottom:14 }}>
        {(["holdings","allocation"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:"7px 18px", borderRadius:8, border:"none", background:tab===t?"var(--bg-card)":"transparent", color:tab===t?"var(--text)":"var(--muted)", fontWeight:tab===t?700:400, fontSize:13, cursor:"pointer", boxShadow:tab===t?"var(--shadow)":"none" }}>
            {t==="holdings"?(TH?"รายการหุ้น":"Holdings"):(TH?"การจัดสรร":"Allocation")}
          </button>
        ))}
      </div>

      {/* Holdings table */}
      {tab==="holdings" && (
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 70px 80px 80px 100px 110px 40px", gap:8, padding:"10px 16px", borderBottom:"1px solid var(--border)" }}>
            {[TH?"หุ้น":"Stock", TH?"หุ้นที่ถือ":"Shares", TH?"ต้นทุน":"Avg Cost", TH?"ราคาปัจจุบัน":"Price", TH?"มูลค่า":"Value", "P&L", ""].map((h,i)=>(
              <div key={i} style={{ fontSize:10, fontWeight:700, color:"var(--faint)", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</div>
            ))}
          </div>
          {positions.map((p, idx)=>{
            const val  = p.shares * p.price;
            const cost = p.shares * p.avgCost;
            const pnl  = val - cost;
            const pct  = ((pnl/cost)*100).toFixed(2);
            const pu   = pnl >= 0;
            return (
              <div key={p.id}
                style={{ display:"grid", gridTemplateColumns:"1fr 70px 80px 80px 100px 110px 40px", gap:8, alignItems:"center", padding:"13px 16px", borderBottom:idx<positions.length-1?"1px solid var(--border)":"none", transition:"background .12s" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-raised)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#fff", flexShrink:0 }}>
                    {p.ticker.slice(0,4)}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:"var(--text)" }}>{p.ticker}</div>
                    <div style={{ fontSize:10, color:"var(--muted)", maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:"var(--text)", fontWeight:600 }}>{p.shares}</div>
                <div style={{ fontSize:13, color:"var(--muted)" }}>${fmt(p.avgCost)}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>${fmt(p.price)}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>${fmt(val)}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:pu?"var(--green)":"var(--red)" }}>{pu?"+":""}{fmt(pnl)}</div>
                  <div style={{ fontSize:10, color:pu?"var(--green)":"var(--red)" }}>{pu?"+":""}{pct}%</div>
                </div>
                <button onClick={()=>setPositions(ps=>ps.filter(x=>x.id!==p.id))}
                  style={{ background:"none", border:"1px solid var(--border)", borderRadius:7, padding:5, color:"var(--faint)", cursor:"pointer", display:"flex" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="var(--red)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="var(--faint)")}>
                  <X size={13}/>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Allocation */}
      {tab==="allocation" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {sectors.map(s=>(
            <div key={s.sector} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:13, padding:"14px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:12, height:12, borderRadius:3, background:SECTOR_COLORS[s.sector]??"#64748B", flexShrink:0 }}/>
                  <span style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{s.sector}</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>${fmt(s.value)}</span>
                  <span style={{ fontSize:12, color:"var(--muted)", marginLeft:8 }}>{s.pct.toFixed(1)}%</span>
                </div>
              </div>
              <div style={{ height:7, background:"var(--bg-raised)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${s.pct}%`, background:SECTOR_COLORS[s.sector]??"#64748B", borderRadius:99, transition:"width .5s ease" }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop:16, fontSize:11, color:"var(--faint)" }}>
        ⚠️ {TH?"ข้อมูลพอร์ตเป็นตัวอย่างเพื่อการศึกษาเท่านั้น ราคาอาจล่าช้า ไม่ถือเป็นคำแนะนำการลงทุน":"Portfolio data is for educational purposes only. Prices may be delayed. Not investment advice."}
      </div>
    </div>
  );
}
