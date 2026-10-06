"use client";
import { useState } from "react";
import { quickVerdict, type Tone } from "@/lib/quick-verdict";
import { Loader2, Search, TrendingUp, Percent, Coins, Landmark, Recycle, Tag, HandCoins, Users, Building2, AlertTriangle, ClipboardCheck } from "lucide-react";

type Lang = "th" | "en";

const PRESETS = ["AAPL", "NVDA", "MSFT", "GOOGL", "AMZN", "TSLA", "SPY"];

type Year = { year: string; revenue: number | null; netIncome: number | null; margin: number | null };
type Data = {
  ticker: string; name: string; currency: string; quoteType: string | null;
  business: { sector: string | null; industry: string | null; employees: number | null; country: string | null; website: string | null; summary: string | null };
  price: { price: number | null; changePct: number | null; marketCap: number | null; high52: number | null; low52: number | null; rangePos: number | null };
  growth: { revenueCagr: number | null; revenueGrowthYoy: number | null; earningsGrowthYoy: number | null; spanYears: number };
  profitability: { grossMargin: number | null; operatingMargin: number | null; netMargin: number | null; roe: number | null; roa: number | null };
  cashQuality: { fcf: number | null; operatingCashflow: number | null; netIncome: number | null; fcfToProfit: number | null };
  balance: { cash: number | null; debt: number | null; netCash: number | null; debtToEquity: number | null; currentRatio: number | null };
  valuation: { pe: number | null; forwardPe: number | null; priceToSales: number | null; priceToBook: number | null; peg: number | null; evToEbitda: number | null };
  dividend: { yield: number | null; payoutRatio: number | null; fiveYearAvgYield: number | null };
  analysts: { target: number | null; upsidePct: number | null; count: number | null; recommendation: string | null };
  years: Year[];
  checks: { key: string; value: number | null; unit: "pct" | "money" | "num"; rule: number; pass: boolean | null }[];
  market: { pe: number | null; peVsMarket: number | null };
  flags: { key: string; severity: "watch" | "warn"; detail: string }[];
  vsMarket1m: number | null;
  news: { title: string; publisher: string | null; date: string | null; url: string | null }[];
  ai: string;
};

const T = {
  th: {
    title: "วิเคราะห์หุ้นสหรัฐ", sub: "พิมพ์ชื่อหุ้น กดวิเคราะห์ แล้วอ่านทุกหัวข้อที่ควรรู้ — ตัวเลขจริงทั้งหมด",
    ph: "เช่น AAPL", run: "วิเคราะห์", loading: "กำลังดึงข้อมูล…",
    notFound: "ไม่พบหุ้นตัวนี้ ลองตรวจตัวย่ออีกครั้ง", failed: "ดึงข้อมูลไม่ได้ ลองใหม่อีกครั้ง",
    noData: "ไม่มีข้อมูล", asOfNote: "ตัวเลขจาก Yahoo Finance · งบรายปีล่าสุดเท่าที่เปิดเผย",
    range52: "ช่วง 52 สัปดาห์", mktCap: "มูลค่าตลาด", employees: "พนักงาน", people: "คน",
    quickTitle: "สรุปสั้น", quickNote: "คำนวณจากตัวเลขในหน้านี้ · ไม่ใช่คำแนะนำให้ซื้อหรือขาย",
    quickLabels: ["ธุรกิจ", "ราคา", "ต้องทำอะไร"],
    aiTitle: "สรุปเป็นภาษาคน", aiNote: "เขียนโดย AI จากตัวเลขในหน้านี้เท่านั้น ไม่ได้เพิ่มข้อมูลจากที่อื่น",
    bizTitle: "บริษัททำอะไร",
    flagsTitle: "สัญญาณเตือนระหว่างถือ",
    newsTitle: "ข่าวล่าสุด",
    newsNote: "หัวข้อข่าวจาก Yahoo Finance · มีไว้ให้ไปหาอ่านเอง ไม่ได้คัดหรือตีความให้",
    vsMarketLabel: "ราคา 1 เดือนเทียบตลาดรวม",
    flagsNone: "ยังไม่พบสัญญาณว่าธุรกิจแย่ลงจากตัวเลขที่มี",
    flagsNote: "ตรวจจาก “ทิศทาง” ของตัวเลขย้อนหลังเท่าที่บริษัทเปิดเผย ไม่ใช่การทำนายอนาคต · พบสัญญาณไม่ได้แปลว่าต้องขาย แปลว่าควรหาคำอธิบายว่าทำไม",
    watch: "จับตา", warn: "ควรหาคำตอบ",
    flagNames: {
      revenueFalling: "รายได้ลดลงจากปีก่อน",
      revenueFalling2: "รายได้ลดลงสองปีติด",
      profitFalling: "กำไรลดลงจากปีก่อน",
      marginShrinking: "อัตรากำไรบางลงเรื่อยๆ",
      cashGap: "กำไรไม่กลายเป็นเงินสด",
      liquidity: "สภาพคล่องตึง",
      debtHeavy: "หนี้สูงเมื่อเทียบกับทุน",
      payoutTooHigh: "จ่ายปันผลเกินกำไรที่ทำได้",
      netLoss: "ปีล่าสุดขาดทุน",
      priceDrop: "ราคาตกแรงกว่าตลาดมาก",
    } as Record<string, string>,
    flagWhy: {
      revenueFalling: "ขายได้น้อยลง ถ้าเป็นชั่วคราวไม่เป็นไร แต่ต้องรู้ว่าเพราะอะไร",
      revenueFalling2: "ลดสองปีติดมักไม่ใช่เรื่องชั่วคราวแล้ว",
      profitFalling: "อาจมาจากต้นทุนขึ้น หรือขายได้น้อยลง",
      marginShrinking: "เก็บเงินได้น้อยลงจากทุกบาทที่ขาย มักแปลว่าแข่งขันหนักขึ้นหรือต้นทุนขึ้น",
      cashGap: "กำไรในงบสวยกว่าเงินสดที่เข้าจริง ต้องดูว่าไปค้างอยู่ที่ลูกหนี้หรือสินค้าคงคลัง",
      liquidity: "สินทรัพย์หมุนเวียนไม่พอคลุมหนี้ระยะสั้น ถ้าธุรกิจสะดุดจะตึงทันที",
      debtHeavy: "ดอกเบี้ยขึ้นหรือรายได้สะดุดจะกระทบแรงกว่าบริษัทที่หนี้น้อย",
      payoutTooHigh: "จ่ายปันผลมากกว่าที่หาได้ ถ้าทำต่อเนื่องมักต้องลดปันผลในที่สุด",
      netLoss: "ทั้งปีขาดทุน ต้องดูว่าเป็นค่าใช้จ่ายครั้งเดียวหรือธุรกิจมีปัญหาจริง",
      priceDrop: "งบการเงินออกแค่ไตรมาสละครั้ง แต่ราคาขยับทุกวัน ราคาที่ตกแรงกว่าตลาดมักแปลว่ามีข่าว — ดูหัวข้อข่าวด้านล่างว่าเกิดอะไรขึ้น",
    } as Record<string, string>,
    healthTitle: "ตรวจสุขภาพธุรกิจ",
    healthPassed: (n: number, all: number) => `ผ่าน ${n} จาก ${all} ข้อ`,
    healthNote: "ข้อนี้บอกว่า “ธุรกิจ” ดีแค่ไหน ไม่ได้บอกว่า “ราคา” ดีไหม — เกณฑ์ที่ใช้เป็นเกณฑ์ทั่วไปที่คนใช้กัน ไม่ใช่กฎตายตัว ปรับตามประเภทธุรกิจได้",
    rule: "เกณฑ์",
    pass: "ผ่าน", fail: "ไม่ผ่าน", unknown: "ไม่มีข้อมูล",
    checkNames: {
      growing: "รายได้โต", profitable: "มีกำไรดี", cashReal: "กำไรเป็นเงินสดจริง",
      debtOk: "หนี้ไม่ล้น", returns: "คืนทุนเก่ง",
    } as Record<string, string>,
    checkRules: {
      growing: "รายได้โตเฉลี่ยเร็วกว่าเงินเฟ้อ 3% ต่อปี",
      profitable: "กำไรสุทธิเกิน 10% ของรายได้",
      cashReal: "เงินสดอิสระเกิน 80% ของกำไรสุทธิ",
      debtOk: "เงินสดมากกว่าหนี้ หรือหนี้น้อยกว่าส่วนของผู้ถือหุ้น",
      returns: "ROE เกิน 15%",
    } as Record<string, string>,
    vsMarket: (v: string) => `แพงกว่าตลาดรวม ${v}`,
    vsMarketCheap: (v: string) => `ถูกกว่าตลาดรวม ${v}`,
    marketPe: (v: string) => `ตลาดรวมอยู่ที่ ${v}`,
    fundNote: "ตัวนี้เป็นกองทุน/ETF ไม่ใช่หุ้นรายตัว จึงไม่มีงบการเงินของบริษัทให้ดู หัวข้อด้านล่างส่วนใหญ่จะว่าง — ถ้าอยากดูผลย้อนหลังของกองทุน ใช้หน้าจำลองย้อนหลังแทน",
    cards: {
      growth: "โตไหม", profit: "กำไรดีไหม", cash: "กำไรเป็นเงินสดจริงไหม",
      balance: "ฐานะการเงินแข็งแรงไหม", returns: "ใช้ทุนเก่งไหม", value: "ราคาแพงหรือถูก",
      div: "ปันผล", analyst: "นักวิเคราะห์มองยังไง",
    },
    m: {
      cagr: "รายได้โตเฉลี่ยต่อปี", cagrHint: (n: number) => `คิดจาก ${n} ปีที่มีข้อมูล`,
      revYoy: "รายได้โตปีล่าสุด", epsYoy: "กำไรโตปีล่าสุด",
      gross: "กำไรขั้นต้น", grossHint: "เหลือเท่าไรหลังหักต้นทุนสินค้า",
      op: "กำไรจากการดำเนินงาน", net: "กำไรสุทธิ", netHint: "เหลือจริงหลังหักทุกอย่าง",
      fcf: "เงินสดอิสระ (12 เดือน)", ocf: "เงินสดจากการดำเนินงาน",
      fcfRatio: "คิดเป็นกี่ % ของกำไรสุทธิ", fcfHint: "ต่ำกว่า 100% มากๆ ติดต่อกันหลายปี = กำไรยังไม่กลายเป็นเงินสด",
      cash: "เงินสดในมือ", debt: "หนี้รวม", netCash: "เงินสดหักหนี้",
      de: "หนี้ต่อทุน", cr: "อัตราส่วนสภาพคล่อง", crHint: "ต่ำกว่า 1 = สินทรัพย์หมุนเวียนไม่พอคลุมหนี้ระยะสั้น",
      roe: "ROE ผลตอบแทนต่อส่วนผู้ถือหุ้น", roa: "ROA ผลตอบแทนต่อสินทรัพย์",
      pe: "P/E", peHint: "ราคาเป็นกี่เท่าของกำไรต่อหุ้น", fpe: "P/E ล่วงหน้า",
      ps: "P/S ต่อยอดขาย", pb: "P/B ต่อมูลค่าทางบัญชี", peg: "PEG", pegHint: "P/E เทียบกับการเติบโต",
      ev: "EV/EBITDA",
      dy: "ปันผลต่อปี", payout: "จ่ายจากกำไรกี่ %", avgY: "ปันผลเฉลี่ย 5 ปี",
      target: "ราคาเป้าหมายเฉลี่ย", upside: "ห่างจากราคาปัจจุบัน", count: "จำนวนนักวิเคราะห์", rec: "คำแนะนำรวม",
    },
    analystNote: "นี่คือความเห็นของนักวิเคราะห์คนอื่น ไม่ใช่การประเมินของเว็บนี้",
    chartTitle: "รายได้และกำไรสุทธิรายปี", revenue: "รายได้", netIncome: "กำไรสุทธิ",
    disclaimer: "ข้อมูลเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน ผลในอดีตไม่ได้รับประกันผลในอนาคต",
  },
  en: {
    title: "US Stock Analysis", sub: "Type a ticker, press analyze, read every topic worth knowing — all real figures",
    ph: "e.g. AAPL", run: "Analyze", loading: "Fetching data…",
    notFound: "Ticker not found — check the symbol", failed: "Could not fetch data, try again",
    noData: "no data", asOfNote: "Figures from Yahoo Finance · latest reported fiscal years",
    range52: "52-week range", mktCap: "Market cap", employees: "Employees", people: "",
    quickTitle: "In short", quickNote: "Computed from the figures on this page · not a recommendation to buy or sell",
    quickLabels: ["Business", "Price", "What to do"],
    aiTitle: "In plain words", aiNote: "Written by AI from the figures on this page only — nothing added from elsewhere",
    bizTitle: "What the company does",
    flagsTitle: "Warning signs while you hold",
    newsTitle: "Recent headlines",
    newsNote: "Headlines from Yahoo Finance · listed so you can go read them, not filtered or interpreted",
    vsMarketLabel: "1-month price vs the market",
    flagsNone: "No sign of deterioration in the figures available",
    flagsNote: "Read from the DIRECTION of reported figures, not a forecast · a flag does not mean sell, it means find out why",
    watch: "watch", warn: "look into it",
    flagNames: {
      revenueFalling: "Revenue fell versus last year",
      revenueFalling2: "Revenue fell two years running",
      profitFalling: "Profit fell versus last year",
      marginShrinking: "Margins keep thinning",
      cashGap: "Profit is not becoming cash",
      liquidity: "Liquidity is tight",
      debtHeavy: "Debt is high against equity",
      payoutTooHigh: "Dividend exceeds earnings",
      netLoss: "Latest year was a loss",
      priceDrop: "Price far behind the market",
    } as Record<string, string>,
    flagWhy: {
      revenueFalling: "Selling less — fine if temporary, but you should know why",
      revenueFalling2: "Two years running is usually not temporary",
      profitFalling: "Either costs rose or sales fell",
      marginShrinking: "Keeping less from every dollar sold — usually tougher competition or rising costs",
      cashGap: "Reported profit looks better than the cash arriving; check receivables and inventory",
      liquidity: "Current assets do not cover short-term debt; any stumble gets tight fast",
      debtHeavy: "Rate rises or a revenue stumble hit harder than at a low-debt company",
      payoutTooHigh: "Paying out more than it earns — usually ends in a dividend cut",
      netLoss: "A full-year loss — check whether it is a one-off charge or the business itself",
      priceDrop: "Statements come quarterly but the price moves daily; falling far behind the market usually means news — see the headlines below",
    } as Record<string, string>,
    healthTitle: "Business health check",
    healthPassed: (n: number, all: number) => `${n} of ${all} passed`,
    healthNote: "This says how good the BUSINESS is, not whether the PRICE is good — the thresholds are common rules of thumb, not laws, and sensible limits differ by industry",
    rule: "Rule",
    pass: "pass", fail: "fail", unknown: "no data",
    checkNames: {
      growing: "Revenue growing", profitable: "Healthy margins", cashReal: "Profit becomes cash",
      debtOk: "Debt under control", returns: "Uses capital well",
    } as Record<string, string>,
    checkRules: {
      growing: "revenue grows faster than 3% inflation per year",
      profitable: "net margin above 10% of revenue",
      cashReal: "free cash flow above 80% of net income",
      debtOk: "more cash than debt, or debt below equity",
      returns: "ROE above 15%",
    } as Record<string, string>,
    vsMarket: (v: string) => `${v} more expensive than the market`,
    vsMarketCheap: (v: string) => `${v} cheaper than the market`,
    marketPe: (v: string) => `the market is at ${v}`,
    fundNote: "This is a fund or ETF, not a single company, so there are no company financials to show and most cards below will be empty — use the backtest page for fund history instead",
    cards: {
      growth: "Is it growing?", profit: "Are the margins good?", cash: "Does profit become cash?",
      balance: "Is the balance sheet strong?", returns: "Does it use capital well?", value: "Cheap or expensive?",
      div: "Dividend", analyst: "What analysts think",
    },
    m: {
      cagr: "Revenue growth per year", cagrHint: (n: number) => `over the ${n} years available`,
      revYoy: "Revenue growth, latest year", epsYoy: "Earnings growth, latest year",
      gross: "Gross margin", grossHint: "left after the cost of goods",
      op: "Operating margin", net: "Net margin", netHint: "left after everything",
      fcf: "Free cash flow (TTM)", ocf: "Operating cash flow",
      fcfRatio: "as % of net income", fcfHint: "Far below 100% for years running means profit is not turning into cash",
      cash: "Cash on hand", debt: "Total debt", netCash: "Cash minus debt",
      de: "Debt to equity", cr: "Current ratio", crHint: "Below 1 means current assets do not cover short-term debt",
      roe: "ROE return on equity", roa: "ROA return on assets",
      pe: "P/E", peHint: "price as a multiple of earnings", fpe: "Forward P/E",
      ps: "P/S on sales", pb: "P/B on book value", peg: "PEG", pegHint: "P/E against growth",
      ev: "EV/EBITDA",
      dy: "Dividend yield", payout: "Paid out of profit", avgY: "5-year average yield",
      target: "Mean price target", upside: "vs today's price", count: "Analysts covering", rec: "Consensus",
    },
    analystNote: "This is other analysts' opinion, not this site's assessment",
    chartTitle: "Revenue and net income by year", revenue: "Revenue", netIncome: "Net income",
    disclaimer: "For education only, not investment advice. Past results do not guarantee future results.",
  },
};

const money = (v: number | null, cur = "USD") => {
  if (v === null || v === undefined) return null;
  const a = Math.abs(v), sign = v < 0 ? "-" : "";
  const s = cur === "USD" ? "$" : "";
  if (a >= 1e12) return `${sign}${s}${(a / 1e12).toFixed(2)}T`;
  if (a >= 1e9) return `${sign}${s}${(a / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `${sign}${s}${(a / 1e6).toFixed(0)}M`;
  return `${sign}${s}${a.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};
const pctOf = (v: number | null, d = 1) => v === null || v === undefined ? null : `${(v * 100).toFixed(d)}%`;
const num = (v: number | null, d = 2) => v === null || v === undefined ? null : v.toFixed(d);

function Metric({ label, value, hint, tone, t }:
  { label: string; value: string | null; hint?: string; tone?: "good" | "bad"; t: typeof T.th }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2, lineHeight: 1.45 }}>{hint}</div>}
      </div>
      <div style={{
        fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
        color: value === null ? "var(--faint)" : tone === "good" ? "var(--pos, #16a34a)" : tone === "bad" ? "var(--neg, #dc2626)" : "var(--text)",
      }}>{value ?? t.noData}</div>
    </div>
  );
}

function Card({ icon, title, children, note }: { icon: React.ReactNode; title: string; children: React.ReactNode; note?: string }) {
  return (
    <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 6px", fontSize: 14.5, color: "var(--text)" }}>
        <span style={{ color: "var(--faint)", display: "flex" }}>{icon}</span>{title}
      </h3>
      {children}
      {note && <p style={{ margin: "9px 0 0", fontSize: 11.5, color: "var(--faint)", lineHeight: 1.5 }}>{note}</p>}
    </section>
  );
}

function YearBars({ years, t, cur }: { years: Year[]; t: typeof T.th; cur: string }) {
  const vals = years.flatMap(y => [y.revenue ?? 0, y.netIncome ?? 0]);
  const max = Math.max(1, ...vals.map(Math.abs));
  return (
    <div>
      <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--muted)", marginBottom: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: "var(--bt-dca, #2563eb)" }} />{t.revenue}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: "var(--bt-dip, #16a34a)" }} />{t.netIncome}</span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        {years.map(y => (
          <div key={y.year} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", justifyContent: "center", height: 92 }}>
              {[{ v: y.revenue, c: "var(--bt-dca, #2563eb)" }, { v: y.netIncome, c: "var(--bt-dip, #16a34a)" }].map((b, i) => (
                <div key={i} title={money(b.v, cur) ?? t.noData}
                  style={{ width: "42%", maxWidth: 30, height: `${Math.max(2, (Math.abs(b.v ?? 0) / max) * 92)}px`, background: b.c, borderRadius: "4px 4px 0 0" }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>{y.year}</div>
            <div style={{ fontSize: 11, color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>{money(y.revenue, cur) ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TONE: Record<Tone, string> = {
  good: "var(--pos, #16a34a)", warn: "var(--warn, #d97706)", bad: "var(--neg, #dc2626)", neutral: "var(--faint)",
};

function QuickVerdict({ data, lang, t }: { data: Data; lang: Lang; t: typeof T.th }) {
  const v = quickVerdict(data, lang, k => t.flagNames[k] ?? k);
  const lines = [v.business, v.price, v.action];
  return (
    <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 14.5, color: "var(--text)" }}>{t.quickTitle}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{t.quickLabels[i]}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15.5, fontWeight: 800, color: "var(--text)", lineHeight: 1.35 }}>
                <span aria-hidden style={{ width: 9, height: 9, borderRadius: 99, flexShrink: 0, background: TONE[l.tone] }} />{l.text}
              </div>
              {l.detail && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>{l.detail}</div>}
            </div>
          </div>
        ))}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--faint)" }}>{t.quickNote}</p>
    </section>
  );
}

export default function StockPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [ticker, setTicker] = useState("AAPL");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(symbol?: string) {
    const s = (symbol ?? ticker).trim().toUpperCase();
    if (!s) return;
    setTicker(s); setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/stock/${encodeURIComponent(s)}?lang=${lang}`);
      if (res.status === 404) { setData(null); setError(t.notFound); return; }
      if (!res.ok) { setData(null); setError(t.failed); return; }
      setData(await res.json());
    } catch {
      setData(null); setError(t.failed);
    } finally {
      setLoading(false);
    }
  }

  const input: React.CSSProperties = {
    height: 44, padding: "0 14px", borderRadius: 11, border: "1px solid var(--border)",
    background: "var(--bg)", color: "var(--text)", fontSize: 16, fontWeight: 700, letterSpacing: 0.5,
    width: 150, textTransform: "uppercase",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, margin: "0 0 4px", color: "var(--text)" }}>{t.title}</h1>
      <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: 13.5 }}>{t.sub}</p>

      <form onSubmit={e => { e.preventDefault(); run(); }} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder={t.ph} style={input} aria-label={t.ph} />
        <button type="submit" disabled={loading} style={{
          height: 44, padding: "0 20px", borderRadius: 11, border: "none", background: "var(--accent, #2563eb)",
          color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", gap: 7, opacity: loading ? 0.7 : 1,
        }}>
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}{loading ? t.loading : t.run}
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        {PRESETS.map(p => (
          <button key={p} type="button" onClick={() => run(p)} style={{
            height: 30, padding: "0 11px", borderRadius: 99, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
            border: "1px solid var(--border)", background: p === data?.ticker ? "var(--bg-card)" : "transparent",
            color: p === data?.ticker ? "var(--text)" : "var(--muted)",
          }}>{p}</button>
        ))}
      </div>

      {error && <p style={{ color: "var(--neg, #dc2626)", fontSize: 14 }}>{error}</p>}

      {data && (
        <>
          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline" }}>
              <h2 style={{ margin: 0, fontSize: 19, color: "var(--text)" }}>{data.name}</h2>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{data.ticker}</span>
              <span style={{ fontSize: 12.5, color: "var(--faint)" }}>
                {[data.business.sector, data.business.industry].filter(Boolean).join(" · ")}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 22, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                {money(data.price.price, data.currency) ?? t.noData}
              </span>
              {data.price.changePct !== null && (
                <span style={{ fontSize: 14, fontWeight: 700, color: data.price.changePct >= 0 ? "var(--pos, #16a34a)" : "var(--neg, #dc2626)" }}>
                  {data.price.changePct >= 0 ? "+" : ""}{(data.price.changePct * 100).toFixed(2)}%
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginTop: 12, fontSize: 12.5, color: "var(--muted)" }}>
              <span>{t.mktCap} <b style={{ color: "var(--text)" }}>{money(data.price.marketCap, data.currency) ?? t.noData}</b></span>
              {data.business.employees !== null && <span>{t.employees} <b style={{ color: "var(--text)" }}>{data.business.employees.toLocaleString("en-US")}</b> {t.people}</span>}
              {data.business.country && <span>{data.business.country}</span>}
            </div>

            {data.price.rangePos !== null && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>{t.range52}</div>
                <div style={{ position: "relative", height: 6, borderRadius: 99, background: "var(--border)" }}>
                  <div style={{ position: "absolute", left: `${Math.min(100, Math.max(0, data.price.rangePos * 100))}%`, top: -4, width: 3, height: 14, borderRadius: 2, background: "var(--accent, #2563eb)", transform: "translateX(-50%)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--faint)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                  <span>{money(data.price.low52, data.currency)}</span><span>{money(data.price.high52, data.currency)}</span>
                </div>
              </div>
            )}
          </section>

          {(!data.quoteType || data.quoteType === "EQUITY") && <QuickVerdict data={data} lang={lang} t={t} />}

          {data.quoteType && data.quoteType !== "EQUITY" && (
            <p style={{ margin: "0 0 14px", padding: "10px 13px", borderRadius: 11, fontSize: 13, lineHeight: 1.6,
              background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              {t.fundNote} <a href="/backtest" style={{ color: "var(--accent, #2563eb)" }}>/backtest</a>
            </p>
          )}

          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px", fontSize: 14.5, color: "var(--text)" }}>
              <span style={{ color: "var(--faint)", display: "flex" }}><AlertTriangle size={16} /></span>{t.flagsTitle}
              <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 700, color: data.flags.length ? "var(--neg, #dc2626)" : "var(--pos, #16a34a)" }}>
                {data.flags.length ? data.flags.length : ""}
              </span>
            </h3>
            {data.flags.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--pos, #16a34a)", fontWeight: 600 }}>{t.flagsNone}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.flags.map(f => (
                  <div key={f.key} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{
                      flexShrink: 0, marginTop: 1, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      color: f.severity === "warn" ? "var(--neg, #dc2626)" : "var(--text)",
                      border: `1px solid ${f.severity === "warn" ? "var(--neg, #dc2626)" : "var(--border2, var(--border))"}`,
                    }}>{f.severity === "warn" ? t.warn : t.watch}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>
                        {t.flagNames[f.key] ?? f.key} <span style={{ fontWeight: 400, color: "var(--muted)" }}>· {f.detail}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 2 }}>{t.flagWhy[f.key] ?? ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {data.vsMarket1m !== null && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>{t.vsMarketLabel}</span>
                <b style={{ fontVariantNumeric: "tabular-nums", color: data.vsMarket1m >= 0 ? "var(--pos, #16a34a)" : "var(--neg, #dc2626)" }}>
                  {data.vsMarket1m >= 0 ? "+" : ""}{data.vsMarket1m.toFixed(1)}
                </b>
              </div>
            )}
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--faint)", lineHeight: 1.55 }}>{t.flagsNote}</p>

            {data.news.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t.newsTitle}</div>
                {data.news.map((n, i) => (
                  <a key={i} href={n.url ?? "#"} target="_blank" rel="noopener noreferrer"
                    style={{ display: "block", padding: "6px 0", borderBottom: i < data.news.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none" }}>
                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{n.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>
                      {[n.publisher, n.date].filter(Boolean).join(" · ")}
                    </div>
                  </a>
                ))}
                <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "var(--faint)" }}>{t.newsNote}</p>
              </div>
            )}
          </section>

          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 4px", fontSize: 14.5, color: "var(--text)" }}>
              <span style={{ color: "var(--faint)", display: "flex" }}><ClipboardCheck size={16} /></span>{t.healthTitle}
              <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>
                {t.healthPassed(data.checks.filter(c => c.pass === true).length, data.checks.length)}
              </span>
            </h3>
            {data.checks.map(c => {
              const v = c.value === null ? null
                : c.unit === "pct" ? pctOf(c.value) : c.unit === "money" ? money(c.value, data.currency) : num(c.value);
              return (
                <div key={c.key} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ flexShrink: 0, width: 16, textAlign: "center", fontWeight: 800,
                    color: c.pass === null ? "var(--faint)" : c.pass ? "var(--pos, #16a34a)" : "var(--neg, #dc2626)" }}>
                    {c.pass === null ? "–" : c.pass ? "✓" : "✗"}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: "var(--text)" }}>{t.checkNames[c.key] ?? c.key}</div>
                    <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>{t.rule}: {t.checkRules[c.key] ?? ""}</div>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
                    color: v === null ? "var(--faint)" : "var(--text)" }}>{v ?? t.unknown}</div>
                </div>
              );
            })}
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--faint)", lineHeight: 1.55 }}>{t.healthNote}</p>
          </section>

          {data.ai && (
            <Card icon={<Building2 size={16} />} title={t.aiTitle} note={t.aiNote}>
              {data.ai.split(/\n{2,}/).filter(Boolean).map((p, i) => (
                <p key={i} style={{ margin: i ? "10px 0 0" : 0, fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>{p}</p>
              ))}
            </Card>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 12, marginTop: 14 }}>
            <Card icon={<TrendingUp size={16} />} title={t.cards.growth}>
              <Metric t={t} label={t.m.cagr} hint={data.growth.spanYears > 0 ? t.m.cagrHint(data.growth.spanYears) : undefined}
                value={pctOf(data.growth.revenueCagr)} tone={data.growth.revenueCagr === null ? undefined : data.growth.revenueCagr > 0 ? "good" : "bad"} />
              <Metric t={t} label={t.m.revYoy} value={pctOf(data.growth.revenueGrowthYoy)}
                tone={data.growth.revenueGrowthYoy === null ? undefined : data.growth.revenueGrowthYoy > 0 ? "good" : "bad"} />
              <Metric t={t} label={t.m.epsYoy} value={pctOf(data.growth.earningsGrowthYoy)}
                tone={data.growth.earningsGrowthYoy === null ? undefined : data.growth.earningsGrowthYoy > 0 ? "good" : "bad"} />
            </Card>

            <Card icon={<Percent size={16} />} title={t.cards.profit}>
              <Metric t={t} label={t.m.gross} hint={t.m.grossHint} value={pctOf(data.profitability.grossMargin)} />
              <Metric t={t} label={t.m.op} value={pctOf(data.profitability.operatingMargin)} />
              <Metric t={t} label={t.m.net} hint={t.m.netHint} value={pctOf(data.profitability.netMargin)} />
            </Card>

            <Card icon={<Recycle size={16} />} title={t.cards.cash} note={t.m.fcfHint}>
              <Metric t={t} label={t.m.fcf} value={money(data.cashQuality.fcf, data.currency)} />
              <Metric t={t} label={t.m.ocf} value={money(data.cashQuality.operatingCashflow, data.currency)} />
              <Metric t={t} label={t.m.fcfRatio} value={pctOf(data.cashQuality.fcfToProfit, 0)}
                tone={data.cashQuality.fcfToProfit === null ? undefined : data.cashQuality.fcfToProfit >= 0.8 ? "good" : "bad"} />
            </Card>

            <Card icon={<Landmark size={16} />} title={t.cards.balance}>
              <Metric t={t} label={t.m.cash} value={money(data.balance.cash, data.currency)} />
              <Metric t={t} label={t.m.debt} value={money(data.balance.debt, data.currency)} />
              <Metric t={t} label={t.m.netCash} value={money(data.balance.netCash, data.currency)}
                tone={data.balance.netCash === null ? undefined : data.balance.netCash >= 0 ? "good" : "bad"} />
              <Metric t={t} label={t.m.de} value={num(data.balance.debtToEquity, 1)} />
              <Metric t={t} label={t.m.cr} hint={t.m.crHint} value={num(data.balance.currentRatio)}
                tone={data.balance.currentRatio === null ? undefined : data.balance.currentRatio >= 1 ? "good" : "bad"} />
            </Card>

            <Card icon={<Coins size={16} />} title={t.cards.returns}>
              <Metric t={t} label={t.m.roe} value={pctOf(data.profitability.roe)} />
              <Metric t={t} label={t.m.roa} value={pctOf(data.profitability.roa)} />
            </Card>

            <Card icon={<Tag size={16} />} title={t.cards.value}>
              <Metric t={t} label={t.m.pe}
                hint={data.market.pe === null ? t.m.peHint
                  : `${t.marketPe(data.market.pe.toFixed(1))}${data.market.peVsMarket === null ? ""
                    : " · " + (data.market.peVsMarket >= 0
                      ? t.vsMarket(`${(data.market.peVsMarket * 100).toFixed(0)}%`)
                      : t.vsMarketCheap(`${(-data.market.peVsMarket * 100).toFixed(0)}%`))}`}
                value={num(data.valuation.pe, 1)}
                tone={data.market.peVsMarket === null ? undefined : data.market.peVsMarket > 0.3 ? "bad" : data.market.peVsMarket < -0.2 ? "good" : undefined} />
              <Metric t={t} label={t.m.fpe} value={num(data.valuation.forwardPe, 1)} />
              <Metric t={t} label={t.m.ps} value={num(data.valuation.priceToSales, 1)} />
              <Metric t={t} label={t.m.pb} value={num(data.valuation.priceToBook, 1)} />
              <Metric t={t} label={t.m.peg} hint={t.m.pegHint} value={num(data.valuation.peg)} />
              <Metric t={t} label={t.m.ev} value={num(data.valuation.evToEbitda, 1)} />
            </Card>

            <Card icon={<HandCoins size={16} />} title={t.cards.div}>
              <Metric t={t} label={t.m.dy} value={pctOf(data.dividend.yield, 2)} />
              <Metric t={t} label={t.m.payout} value={pctOf(data.dividend.payoutRatio, 0)} />
              <Metric t={t} label={t.m.avgY} value={data.dividend.fiveYearAvgYield === null ? null : `${data.dividend.fiveYearAvgYield.toFixed(2)}%`} />
            </Card>

            <Card icon={<Users size={16} />} title={t.cards.analyst} note={t.analystNote}>
              <Metric t={t} label={t.m.target} value={money(data.analysts.target, data.currency)} />
              <Metric t={t} label={t.m.upside} value={pctOf(data.analysts.upsidePct)}
                tone={data.analysts.upsidePct === null ? undefined : data.analysts.upsidePct >= 0 ? "good" : "bad"} />
              <Metric t={t} label={t.m.count} value={data.analysts.count === null ? null : String(data.analysts.count)} />
              <Metric t={t} label={t.m.rec} value={data.analysts.recommendation} />
            </Card>
          </div>

          {data.years.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <Card icon={<TrendingUp size={16} />} title={t.chartTitle}>
                <YearBars years={data.years} t={t} cur={data.currency} />
              </Card>
            </div>
          )}

          {data.business.summary && (
            <div style={{ marginTop: 14 }}>
              <Card icon={<Building2 size={16} />} title={t.bizTitle}>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "var(--muted)" }}>{data.business.summary}</p>
                {data.business.website && (
                  <a href={data.business.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 12.5, color: "var(--accent, #2563eb)" }}>
                    {data.business.website}
                  </a>
                )}
              </Card>
            </div>
          )}

          <p style={{ margin: "16px 0 0", fontSize: 11.5, color: "var(--faint)", lineHeight: 1.6 }}>
            {t.asOfNote}<br />{t.disclaimer}
          </p>
        </>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 1s linear infinite}`}</style>
    </div>
  );
}
