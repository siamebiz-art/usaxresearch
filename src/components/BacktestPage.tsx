"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Info, Trophy, Table2 } from "lucide-react";
import { simulate, rolling, rollingHigh, type Bar, type Result, type RollingRun } from "@/lib/backtest";

type Lang = "th" | "en";

const PRESETS = ["SPY", "QQQ", "VOO", "AAPL", "MSFT", "NVDA"];
const DIPS = [5, 10, 15, 20, 30];
const HORIZONS = [5, 10, 15];
const LOOKBACK = 252; // ≈ 1 trading year

const usd = (v: number) => "$" + Math.round(v).toLocaleString("en-US");
const usdShort = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${Math.round(v)}`;
const pct = (v: number, digits = 1) => `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;

const T = {
  th: {
    title: "จำลองย้อนหลัง: DCA ทุกสิ้นเดือน vs ซื้อตอนย่อ",
    sub: "ใส่เงินเท่ากันทุกเดือน แล้วดูว่าวิธีไหนเหลือเงินมากกว่า ด้วยราคาจริงย้อนหลัง (รวมปันผล)",
    ticker: "หุ้น / กองทุน ETF",
    start: "เริ่มปี",
    monthly: "เงินต่อเดือน (USD)",
    dip: "ซื้อเมื่อราคาต่ำกว่าจุดสูงสุดใน 1 ปี",
    cash: "เงินที่รอซื้อได้ดอกเบี้ย (%/ปี)",
    run: "จำลอง",
    loading: "กำลังโหลดราคาย้อนหลัง…",
    dca: "DCA ทุกสิ้นเดือน",
    dipName: (d: number) => `ซื้อตอนย่อ ${d}%`,
    invested: "เงินที่ใส่ไป",
    final: "มูลค่าสุดท้าย",
    profit: "กำไร",
    irr: "ผลตอบแทนต่อปี",
    buys: "จำนวนครั้งที่ซื้อ",
    avgCost: "ต้นทุนเฉลี่ยต่อหน่วย",
    cashLeft: "เงินสดที่ยังไม่ได้ซื้อ",
    wait: "รอซื้อนานสุด",
    days: "วัน",
    interest: "ดอกเบี้ยจากเงินที่รอ",
    winner: (w: string, diff: string) => `${w} ได้เงินมากกว่า ${diff}`,
    tie: "ผลเท่ากัน",
    period: (a: string, b: string, m: number, inv: string) => `${a} → ${b} · ${m} เดือน · ใส่เงินรวม ${inv}`,
    chart: "มูลค่าพอร์ตตลอดช่วง",
    rollTitle: "ถ้าเริ่มคนละเดือน ผลยังเหมือนเดิมไหม?",
    rollSub: (h: number) => `จำลองซ้ำโดยเริ่มทุกสิ้นเดือนที่มีข้อมูลต่อไปอีก ${h} ปี`,
    horizon: "ถือ",
    years: "ปี",
    rollWin: (w: number, n: number) => `ซื้อตอนย่อชนะ ${w} จาก ${n} ครั้ง`,
    median: "ซื้อตอนย่อ เทียบ DCA (ค่ากลาง)",
    worst: "กรณีแย่สุด",
    best: "กรณีดีสุด",
    rollNone: "ข้อมูลไม่พอสำหรับช่วงนี้",
    rollAxis: "เดือนที่เริ่ม",
    rollDipWins: "ซื้อตอนย่อชนะ",
    rollDcaWins: "DCA ชนะ",
    table: "ดูเป็นตาราง (สิ้นปี)",
    year: "ปี",
    rules: "กติกาการจำลอง",
    rulesList: [
      "ทั้งสองวิธีได้เงินเท่ากัน วันเดียวกัน คือวันทำการสุดท้ายของทุกเดือน",
      "DCA ซื้อทันทีด้วยราคาปิดของวันนั้น",
      "ซื้อตอนย่อ เก็บเงินไว้ก่อน จนกว่าราคาปิดต่ำกว่าจุดสูงสุดใน 1 ปีที่ผ่านมาตามที่ตั้งไว้ แล้วซื้อด้วยเงินทั้งหมดที่ราคาปิดของวันทำการถัดไป (เพราะรู้ราคาปิดได้หลังตลาดปิดเท่านั้น)",
      "ระหว่างที่ราคายังต่ำอยู่ เงินเดือนใหม่ที่เข้ามาจะซื้อทันที",
      "ใช้ราคาที่ปรับปันผลและการแตกหุ้นแล้ว (ปันผลนำไปลงทุนต่อ) · ไม่คิดค่าธรรมเนียมและภาษี · ซื้อเศษหุ้นได้",
      "มูลค่าสุดท้ายนับรวมเงินสดที่ยังไม่ได้ซื้อด้วย",
    ],
    disclaimer: "ผลในอดีตไม่ได้รับประกันผลในอนาคต ข้อมูลนี้ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน",
    error: "โหลดข้อมูลไม่ได้ ลองตรวจชื่อหุ้นอีกครั้ง",
    dipCash: "เงินสดรอซื้อ",
  },
  en: {
    title: "Backtest: Monthly DCA vs Buy the Dip",
    sub: "Same money every month — which approach ends with more? Real historical prices, dividends included.",
    ticker: "Stock / ETF",
    start: "Start year",
    monthly: "Monthly amount (USD)",
    dip: "Buy when price is below its 1-year high by",
    cash: "Interest on waiting cash (%/yr)",
    run: "Run",
    loading: "Loading price history…",
    dca: "Monthly DCA",
    dipName: (d: number) => `Buy the ${d}% dip`,
    invested: "Money put in",
    final: "Final value",
    profit: "Profit",
    irr: "Annual return",
    buys: "Number of buys",
    avgCost: "Average cost per share",
    cashLeft: "Cash not yet invested",
    wait: "Longest wait to buy",
    days: "days",
    interest: "Interest on waiting cash",
    winner: (w: string, diff: string) => `${w} ended with ${diff} more`,
    tie: "Same result",
    period: (a: string, b: string, m: number, inv: string) => `${a} → ${b} · ${m} months · ${inv} put in`,
    chart: "Portfolio value over time",
    rollTitle: "Does it hold for other start dates?",
    rollSub: (h: number) => `Re-run from every month-end that has ${h} more years of data`,
    horizon: "Hold",
    years: "years",
    rollWin: (w: number, n: number) => `Buy the dip won ${w} of ${n} runs`,
    median: "Dip vs DCA (median)",
    worst: "Worst case",
    best: "Best case",
    rollNone: "Not enough history for this horizon",
    rollAxis: "Start month",
    rollDipWins: "Dip wins",
    rollDcaWins: "DCA wins",
    table: "Show as table (year end)",
    year: "Year",
    rules: "How the simulation works",
    rulesList: [
      "Both get the same money on the same day: the last trading day of each month.",
      "DCA buys right away at that day's close.",
      "Buy the dip holds the cash until a close is the chosen % below its 1-year high, then spends all of it at the next trading day's close (you only know a close after the market shuts).",
      "While the price stays that low, each new month's money is invested as it arrives.",
      "Prices are adjusted for dividends and splits (dividends reinvested) · no fees or taxes · fractional shares.",
      "Final value includes any cash still waiting.",
    ],
    disclaimer: "Past results do not guarantee future results. For education only — not investment advice.",
    error: "Couldn't load data — check the ticker.",
    dipCash: "Waiting cash",
  },
};

// ── Size-aware container for SVG charts ─────────────────────────
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(max: number, count = 4) {
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(v);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
  return out;
}

// ── Portfolio value line chart ──────────────────────────────────
function ValueChart({ r, t, dipLabel }: { r: Result; t: typeof T.th; dipLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const s = r.series;
  const H = 280, padL = 52, padR = 12, padT = 12, padB = 26;
  const W = Math.max(width, 280);
  const maxV = Math.max(...s.map(p => Math.max(p.dca, p.dip, p.invested)));
  const ticks = niceTicks(maxV);
  const top = ticks[ticks.length - 1];
  const x = (i: number) => padL + (i / Math.max(1, s.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / top) * (H - padT - padB);
  const path = (k: "dca" | "dip" | "invested") => s.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join("");

  const firstYear = +s[0].d.slice(0, 4), lastYear = +s[s.length - 1].d.slice(0, 4);
  const span = lastYear - firstYear;
  const yearStep = span > 24 ? 5 : span > 12 ? 4 : span > 6 ? 2 : 1;
  const yearTicks = s.map((p, i) => ({ i, y: +p.d.slice(0, 4), m: p.d.slice(5, 7) }))
    .filter(p => p.m === "01" && (p.y - firstYear) % yearStep === 0);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - padL) / (W - padL - padR)) * (s.length - 1));
    setHover(Math.min(s.length - 1, Math.max(0, i)));
  };
  const h = hover != null ? s[hover] : null;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      {width > 0 && (
        <svg width={W} height={H} style={{ display: "block", touchAction: "pan-y" }}
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}
          role="img" aria-label={t.chart}>
          {ticks.map(v => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth={1} />
              <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">{usdShort(v)}</text>
            </g>
          ))}
          {yearTicks.map(p => (
            <text key={p.i} x={x(p.i)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--muted)">{p.y}</text>
          ))}
          <path d={path("invested")} fill="none" stroke="var(--faint)" strokeWidth={1.5} strokeDasharray="4 4" />
          <path d={path("dca")} fill="none" stroke="var(--bt-dca)" strokeWidth={2} strokeLinejoin="round" />
          <path d={path("dip")} fill="none" stroke="var(--bt-dip)" strokeWidth={2} strokeLinejoin="round" />
          {h && hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--border2)" strokeWidth={1} />
              {(["dca", "dip"] as const).map(k => (
                <circle key={k} cx={x(hover)} cy={y(h[k])} r={4.5} fill={`var(--bt-${k})`} stroke="var(--bg-card)" strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>
      )}
      {h && hover != null && (
        <div style={{
          position: "absolute", top: 8, pointerEvents: "none",
          ...(x(hover) > W / 2 ? { right: W - x(hover) + 12 } : { left: x(hover) + 12 }),
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
          boxShadow: "var(--shadow-md)", padding: "8px 11px", fontSize: 12, minWidth: 170,
        }}>
          <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>{h.d}</div>
          {[
            { c: "var(--bt-dca)", l: t.dca, v: h.dca },
            { c: "var(--bt-dip)", l: dipLabel, v: h.dip },
            { c: "var(--faint)", l: t.invested, v: h.invested },
          ].map(row => (
            <div key={row.l} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--muted)", lineHeight: 1.7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: row.c, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{row.l}</span>
              <span style={{ color: "var(--text)", fontWeight: 700 }}>{usd(row.v)}</span>
            </div>
          ))}
          {h.dipCash > 0 && (
            <div style={{ color: "var(--muted)", marginTop: 3, paddingTop: 4, borderTop: "1px solid var(--border)" }}>
              {t.dipCash}: <b style={{ color: "var(--text)" }}>{usd(h.dipCash)}</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Rolling start-date comparison ───────────────────────────────
function RollingChart({ runs, t }: { runs: RollingRun[]; t: typeof T.th }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 180, padL = 44, padR = 8, padT = 10, padB = 24;
  const W = Math.max(width, 280);
  const m = Math.max(1, ...runs.map(r => Math.abs(r.diffPct)));
  const lim = Math.ceil(m / 5) * 5;
  const y = (v: number) => padT + ((lim - v) / (2 * lim)) * (H - padT - padB);
  const bw = (W - padL - padR) / runs.length;
  const firstYear = +runs[0].start.slice(0, 4), lastYear = +runs[runs.length - 1].start.slice(0, 4);
  const yearStep = lastYear - firstYear > 16 ? 5 : lastYear - firstYear > 8 ? 2 : 1;
  const h = hover != null ? runs[hover] : null;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      {width > 0 && (
        <svg width={W} height={H} style={{ display: "block", touchAction: "pan-y" }}
          onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); setHover(Math.min(runs.length - 1, Math.max(0, Math.floor((e.clientX - r.left - padL) / bw)))); }}
          onPointerLeave={() => setHover(null)} role="img" aria-label={t.rollTitle}>
          {[lim, lim / 2, 0, -lim / 2, -lim].map(v => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke={v === 0 ? "var(--border2)" : "var(--border)"} strokeWidth={1} />
              <text x={padL - 6} y={y(v) + 4} textAnchor="end" fontSize={10.5} fill="var(--muted)">{v > 0 ? "+" : ""}{v}%</text>
            </g>
          ))}
          {runs.map((r, i) => {
            const y0 = y(0), y1 = y(r.diffPct);
            return (
              <rect key={r.start} x={padL + i * bw + (bw > 3 ? 0.5 : 0)} width={Math.max(0.8, bw - (bw > 3 ? 1 : 0))}
                y={Math.min(y0, y1)} height={Math.max(0.5, Math.abs(y1 - y0))}
                fill={r.diffPct > 0 ? "var(--bt-dip)" : "var(--bt-dca)"} opacity={hover == null || hover === i ? 1 : 0.45} />
            );
          })}
          {runs.map((r, i) => ({ r, i })).filter(({ r, i }) => r.start.slice(5, 7) === "01" && (+r.start.slice(0, 4) - firstYear) % yearStep === 0 && i < runs.length - 3)
            .map(({ r, i }) => <text key={r.start} x={padL + i * bw} y={H - 7} fontSize={10.5} fill="var(--muted)" textAnchor="middle">{r.start.slice(0, 4)}</text>)}
        </svg>
      )}
      {h && hover != null && (
        <div style={{
          position: "absolute", top: 4, pointerEvents: "none",
          ...(padL + hover * bw > W / 2 ? { right: W - (padL + hover * bw) + 10 } : { left: padL + hover * bw + 10 }),
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
          boxShadow: "var(--shadow-md)", padding: "7px 10px", fontSize: 12, minWidth: 160,
        }}>
          <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t.rollAxis}: {h.start.slice(0, 7)}</div>
          <div style={{ color: "var(--muted)" }}>DCA <b style={{ color: "var(--text)" }}>{usd(h.dca)}</b></div>
          <div style={{ color: "var(--muted)" }}>Dip <b style={{ color: "var(--text)" }}>{usd(h.dip)}</b></div>
          <div style={{ color: "var(--muted)", marginTop: 2 }}>{h.diffPct > 0 ? t.rollDipWins : t.rollDcaWins} <b style={{ color: "var(--text)" }}>{pct(Math.abs(h.diffPct))}</b></div>
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow)", padding: 18 };
const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6, display: "block" };
const input: React.CSSProperties = { width: "100%", height: 40, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", padding: "0 12px", fontSize: 14, fontWeight: 600 };

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      height: 34, padding: "0 12px", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer",
      border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
      background: on ? "rgba(37,99,235,0.1)" : "var(--bg-card)", color: on ? "var(--accent)" : "var(--muted)",
    }}>{children}</button>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function BacktestPage({ lang }: { lang: string }) {
  const L: Lang = lang === "en" ? "en" : "th";
  const t = T[L];

  const [tickerInput, setTickerInput] = useState("SPY");
  const [ticker, setTicker] = useState("SPY");
  const [data, setData] = useState<{ ticker: string; bars: Bar[]; name: string } | null>(null);
  const [failed, setFailed] = useState("");
  const [startYear, setStartYear] = useState(2006);
  const [monthly, setMonthly] = useState(500);
  const [dipPct, setDipPct] = useState(10);
  const [cashRate, setCashRate] = useState(0);
  const [horizon, setHorizon] = useState(10);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/history?ticker=${encodeURIComponent(ticker)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(j => {
        if (!alive) return;
        const b: Bar[] = j.dates.map((d: string, i: number) => ({ d, p: j.prices[i] }));
        setData({ ticker, bars: b, name: j.name ?? ticker });
      })
      .catch(() => { if (alive) setFailed(ticker); });
    return () => { alive = false; };
  }, [ticker]);

  const error = failed === ticker ? t.error : "";
  const loading = !error && data?.ticker !== ticker;
  const bars = data?.ticker === ticker ? data.bars : null;
  const name = data?.name ?? "";

  const firstYear = bars ? +bars[Math.min(bars.length - 1, LOOKBACK)].d.slice(0, 4) + 1 : 2000;
  const lastYear = bars ? +bars[bars.length - 1].d.slice(0, 4) - 1 : new Date().getFullYear() - 1;
  const years = Array.from({ length: Math.max(0, lastYear - firstYear + 1) }, (_, i) => firstYear + i);
  const effStart = Math.min(Math.max(startYear, firstYear), lastYear);

  const hi = useMemo(() => bars ? rollingHigh(bars, LOOKBACK) : null, [bars]);

  const result = useMemo(() => {
    if (!bars || !hi || monthly <= 0) return null;
    const start = bars.findIndex(b => b.d >= `${effStart}-01-01`);
    if (start < 0) return null;
    return simulate(bars, { monthly, dipPct, lookbackDays: LOOKBACK, cashRatePct: cashRate, start, end: bars.length - 1 }, hi);
  }, [bars, hi, effStart, monthly, dipPct, cashRate]);

  const runs = useMemo(() => bars && monthly > 0 ? rolling(bars, { monthly, dipPct, lookbackDays: LOOKBACK, cashRatePct: cashRate }, horizon) : [],
    [bars, monthly, dipPct, cashRate, horizon]);

  const dipLabel = t.dipName(dipPct);
  const diff = result ? result.dip.value - result.dca.value : 0;
  const diffPct = result ? (result.dip.value / result.dca.value - 1) * 100 : 0;
  const dipWon = diff > 0.5, dcaWon = diff < -0.5;

  const sortedRuns = runs.map(r => r.diffPct).sort((a, b) => a - b);
  const wins = runs.filter(r => r.diffPct > 0).length;

  const yearEnd = result ? result.series.filter((p, i, a) => i === a.length - 1 || p.d.slice(0, 4) !== a[i + 1].d.slice(0, 4)) : [];

  const legs = result ? [
    { key: "dca" as const, name: t.dca, leg: result.dca, won: dcaWon },
    { key: "dip" as const, name: dipLabel, leg: result.dip, won: dipWon },
  ] : [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4px 0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1.3 }}>{t.title}</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>{t.sub}</p>
      </div>

      {/* Controls */}
      <div style={{ ...card, display: "grid", gap: 16 }}>
        <div>
          <span style={label}>{t.ticker}</span>
          <form onSubmit={e => { e.preventDefault(); const v = tickerInput.trim().toUpperCase(); if (v) setTicker(v); }}
            style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={tickerInput} onChange={e => setTickerInput(e.target.value.toUpperCase())} style={{ ...input, flex: 1, minWidth: 0 }} maxLength={12} aria-label={t.ticker} />
            <button type="submit" style={{ height: 40, padding: "0 16px", borderRadius: 10, border: "none", background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>{t.run}</button>
          </form>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PRESETS.map(p => <Chip key={p} on={ticker === p} onClick={() => { setTickerInput(p); setTicker(p); }}>{p}</Chip>)}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <label>
            <span style={label}>{t.start}</span>
            <select value={effStart} onChange={e => setStartYear(+e.target.value)} style={input} disabled={!bars}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label>
            <span style={label}>{t.monthly}</span>
            <input type="number" min={1} step={50} value={monthly} onChange={e => setMonthly(Math.max(0, +e.target.value))} style={input} />
          </label>
          <label>
            <span style={label}>{t.cash}</span>
            <input type="number" min={0} max={20} step={0.5} value={cashRate} onChange={e => setCashRate(Math.min(20, Math.max(0, +e.target.value)))} style={input} />
          </label>
        </div>
        <div>
          <span style={label}>{t.dip}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DIPS.map(d => <Chip key={d} on={dipPct === d} onClick={() => setDipPct(d)}>{d}%</Chip>)}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 14 }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> {t.loading}
        </div>
      )}
      {error && !loading && <div style={{ ...card, color: "var(--red)", fontSize: 14, fontWeight: 600 }}>{error}</div>}

      {result && !loading && (
        <>
          {/* Headline */}
          <div style={{ ...card, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-raised)", color: dipWon ? "var(--bt-dip)" : "var(--bt-dca)" }}>
              <Trophy size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{ticker}{name && name !== ticker ? ` · ${name}` : ""}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", lineHeight: 1.35, marginTop: 2 }}>
                {dipWon || dcaWon ? t.winner(dipWon ? dipLabel : t.dca, `${usd(Math.abs(diff))} (${Math.abs(diffPct).toFixed(1)}%)`) : t.tie}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{t.period(result.firstDate, result.lastDate, result.months, usd(result.invested))}</div>
            </div>
          </div>

          {/* Two strategy cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {legs.map(({ key, name: n, leg, won }) => {
              const rows: [string, string][] = [
                [t.profit, `${usd(leg.value - result.invested)} (${pct((leg.value / result.invested - 1) * 100, 0)})`],
                [t.irr, Number.isFinite(leg.irr) ? pct(leg.irr * 100, 2) : "–"],
                [t.buys, leg.buys.toLocaleString("en-US")],
                [t.avgCost, leg.avgCost ? `$${leg.avgCost.toFixed(2)}` : "–"],
              ];
              if (key === "dip") {
                rows.push([t.cashLeft, usd(leg.cash)]);
                rows.push([t.wait, `${result.dip.longestWaitDays.toLocaleString("en-US")} ${t.days}`]);
                if (cashRate > 0) rows.push([t.interest, usd(result.dip.interest)]);
              }
              return (
                <div key={key} style={{ ...card, borderTop: `3px solid var(--bt-${key})` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 99, background: `var(--bt-${key})` }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", flex: 1 }}>{n}</span>
                    {won && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", background: "var(--bg-raised)", borderRadius: 99, padding: "3px 9px" }}>🏆</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>{t.final}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{usd(leg.value)}</div>
                  <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {rows.map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                        <span style={{ color: "var(--muted)" }}>{k}</span>
                        <span style={{ color: "var(--text)", fontWeight: 700, textAlign: "right" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Value chart */}
          <div style={card}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginRight: "auto" }}>{t.chart}</div>
              {[{ c: "var(--bt-dca)", l: t.dca, dash: false }, { c: "var(--bt-dip)", l: dipLabel, dash: false }, { c: "var(--faint)", l: t.invested, dash: true }].map(x => (
                <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                  <svg width={18} height={8}><line x1={0} x2={18} y1={4} y2={4} stroke={x.c} strokeWidth={2} strokeDasharray={x.dash ? "4 3" : undefined} /></svg>
                  {x.l}
                </span>
              ))}
            </div>
            <ValueChart r={result} t={t} dipLabel={dipLabel} />
            <button type="button" onClick={() => setShowTable(v => !v)} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
              <Table2 size={14} /> {t.table}
            </button>
            {showTable && (
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ color: "var(--muted)", textAlign: "right" }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600 }}>{t.year}</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>{t.invested}</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>{t.dca}</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>{dipLabel}</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>{t.dipCash}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearEnd.map(p => (
                      <tr key={p.d} style={{ borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text)" }}>
                        <td style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600 }}>{p.d.slice(0, 4)}</td>
                        <td style={{ padding: "6px 8px" }}>{usd(p.invested)}</td>
                        <td style={{ padding: "6px 8px" }}>{usd(p.dca)}</td>
                        <td style={{ padding: "6px 8px" }}>{usd(p.dip)}</td>
                        <td style={{ padding: "6px 8px" }}>{usd(p.dipCash)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rolling */}
          <div style={card}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
              <div style={{ marginRight: "auto", minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{t.rollTitle}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{t.rollSub(horizon)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{t.horizon}</span>
                {HORIZONS.map(hz => <Chip key={hz} on={horizon === hz} onClick={() => setHorizon(hz)}>{hz} {t.years}</Chip>)}
              </div>
            </div>
            {runs.length ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
                  {[
                    { k: t.rollWin(wins, runs.length), v: `${Math.round((wins / runs.length) * 100)}%` },
                    { k: t.median, v: pct(sortedRuns[Math.floor(sortedRuns.length / 2)]) },
                    { k: t.worst, v: pct(sortedRuns[0]) },
                    { k: t.best, v: pct(sortedRuns[sortedRuns.length - 1]) },
                  ].map(s => (
                    <div key={s.k} style={{ background: "var(--bg-raised)", borderRadius: 12, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{s.k}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--bt-dip)" }} />{t.rollDipWins}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--bt-dca)" }} />{t.rollDcaWins}</span>
                </div>
                <RollingChart runs={runs} t={t} />
              </>
            ) : <div style={{ fontSize: 13, color: "var(--muted)" }}>{t.rollNone}</div>}
          </div>

          {/* Rules */}
          <div style={{ ...card, background: "var(--bg-raised)", boxShadow: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              <Info size={16} /> {t.rules}
            </div>
            <ul style={{ paddingLeft: 20, display: "grid", gap: 5, fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>
              {t.rulesList.map(x => <li key={x}>{x}</li>)}
            </ul>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>{t.disclaimer}</div>
          </div>
        </>
      )}
    </div>
  );
}
