// Which day of the month should a monthly DCA buy on? $500 arrives at the start of each month and
// must be spent inside that month. Dip rules decide on a CLOSED bar and buy at the NEXT close.
import fs from "node:fs";
type Bar = { d: string; c: number };
const load = (s: string): Bar[] => JSON.parse(fs.readFileSync(new URL(`./data/${s}.json`, import.meta.url), "utf8"));

function rsi2(b: Bar[]) { const o = new Array(b.length).fill(NaN); let ag = 0, al = 0; for (let i = 1; i < b.length; i++) { const ch = b[i].c - b[i - 1].c, g = Math.max(ch, 0), l = Math.max(-ch, 0); if (i <= 2) { ag += g / 2; al += l / 2; } else { ag = (ag + g) / 2; al = (al + l) / 2; } if (i >= 2) o[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al); } return o; }

export type Pick = (m: number[], b: Bar[], ctx: { rsi: number[] }) => number;
const nextIn = (m: number[], t: number) => { const k = m.indexOf(t); return k + 1 < m.length ? m[k + 1] : m[m.length - 1]; };
const dip = (pct: number): Pick => (m, b) => { const ref = b[m[0] - 1]?.c ?? b[m[0]].c; for (const t of m) if (b[t].c <= ref * (1 - pct / 100)) return nextIn(m, t); return m[m.length - 1]; };
export const STRATS: Record<string, { name: string; pick: Pick; real: boolean }> = {
  day1:   { name: "วันทำการแรกของเดือน", pick: m => m[0], real: true },
  day10:  { name: "วันทำการที่ 10", pick: m => m[Math.min(9, m.length - 1)], real: true },
  last:   { name: "วันทำการสุดท้าย", pick: m => m[m.length - 1], real: true },
  dip1:   { name: "รอย่อ 1% จากต้นเดือน (ไม่ย่อ = ซื้อวันสุดท้าย)", pick: dip(1), real: true },
  dip2:   { name: "รอย่อ 2% จากต้นเดือน (ไม่ย่อ = ซื้อวันสุดท้าย)", pick: dip(2), real: true },
  rsi:    { name: "รอ RSI 2 ต่ำกว่า 10 (ไม่เกิด = ซื้อวันสุดท้าย)", pick: (m, b, x) => { for (const t of m) if (x.rsi[t] < 10) return nextIn(m, t); return m[m.length - 1]; }, real: true },
  best:   { name: "ซื้อวันที่ถูกที่สุดของเดือนพอดี (รู้อนาคต)", pick: (m, b) => m.reduce((a, t) => b[t].c < b[a].c ? t : a), real: false },
  worst:  { name: "ซื้อวันที่แพงที่สุดของเดือนพอดี (โชคร้ายสุด)", pick: (m, b) => m.reduce((a, t) => b[t].c > b[a].c ? t : a), real: false },
};

export function months(b: Bar[]) { const M: number[][] = []; let cur = ""; b.forEach((x, i) => { const k = x.d.slice(0, 7); if (k !== cur) { M.push([]); cur = k; } M[M.length - 1].push(i); }); return M; }

/** value at the end of month range [m0, m1] (inclusive), valued at the close of month m1's last bar */
export function dca(b: Bar[], M: number[][], m0: number, m1: number, pick: Pick, ctx: { rsi: number[] }, amt = 500) {
  let sh = 0;
  for (let k = m0; k <= m1; k++) { const t = pick(M[k], b, ctx); if (!M[k].includes(t)) throw new Error("bought outside the month"); sh += amt / b[t].c; }
  const lastBar = M[m1][M[m1].length - 1];
  return sh * b[lastBar].c;
}

if (process.argv[1].endsWith("dca.ts")) {
  const out: any = {};
  for (const sym of ["SPY", "QQQ"]) {
    const b = load(sym), M = months(b), ctx = { rsi: rsi2(b) };
    const m0 = 1, m1 = M.length - 2; // skip the partial first and current months
    const base = dca(b, M, m0, m1, STRATS.day1.pick, ctx);
    // every fixed trading day of the month 1..19
    const byDay = Array.from({ length: 19 }, (_, k) => (dca(b, M, m0, m1, m => m[Math.min(k, m.length - 1)], ctx) / base - 1) * 100);
    const H = 120; // rolling 10-year windows
    const res: any = { from: b[M[m0][0]].d, to: b[M[m1].at(-1)!].d, months: m1 - m0 + 1, invested: (m1 - m0 + 1) * 500, base, byDay, strats: {} };
    for (const [k, s] of Object.entries(STRATS)) {
      const full = dca(b, M, m0, m1, s.pick, ctx);
      const diffs: number[] = [];
      for (let a = m0; a + H - 1 <= m1; a++) diffs.push((dca(b, M, a, a + H - 1, s.pick, ctx) / dca(b, M, a, a + H - 1, STRATS.day1.pick, ctx) - 1) * 100);
      diffs.sort((x, y) => x - y);
      res.strats[k] = { name: s.name, real: s.real, final: full, diffPct: (full / base - 1) * 100, roll: { n: diffs.length, beat: diffs.filter(x => x > 0).length, median: diffs[diffs.length >> 1], min: diffs[0], max: diffs.at(-1) } };
    }
    out[sym] = res;
    console.log(`\n== ${sym} ${res.from}..${res.to} · ${res.months} months · invested $${res.invested.toLocaleString()} · day-1 DCA ends $${Math.round(base).toLocaleString()}`);
    for (const [k, r] of Object.entries<any>(res.strats)) console.log(` ${k.padEnd(6)} ${String(Math.round(r.final)).padStart(9)}  ${(r.diffPct >= 0 ? "+" : "") + r.diffPct.toFixed(2)}%  | 10y windows: beat day-1 ${r.roll.beat}/${r.roll.n}, median ${r.roll.median.toFixed(2)}%, range ${r.roll.min.toFixed(2)}..${r.roll.max.toFixed(2)}%`);
    console.log(` fixed day 1..19 vs day 1: ${byDay.map(x => x.toFixed(1)).join(" ")}`);
  }
  fs.writeFileSync("results.json", JSON.stringify(out, null, 1));
}
