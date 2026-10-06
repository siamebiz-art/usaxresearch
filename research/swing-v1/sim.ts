// Swing Assistant — strategy v1 ("pullback in uptrend, then recovery") portfolio backtest.
// Daily bars, dividend-adjusted OHLC from Yahoo. Signals use CLOSED bars only; fills at NEXT open.
import fs from "node:fs";

export type Bar = { d: string; o: number; h: number; l: number; c: number; v: number };
export const RULES = {
  version: "swing-v1.0",
  sma: [20, 50, 200], atrN: 14, hiN: 20, pbN: 5,
  minDepthAtr: 2.0,         // pulled back ≥ 2 ATR from the 20-day high
  stopBufAtr: 0.25,         // stop = lowest low of last 5 days − 0.25 ATR
  rr: 2.0,                  // target = fill + 2 × (fill − stop)
  maxStopPct: 0.10,         // skip if stop is more than 10% below entry
  gapSkipAtr: 0.5,          // skip if next open is > close + 0.5 ATR ("ราคาเลยโซน")
  maxHoldDays: 20,          // time exit: sell at next open after 20 trading days
  minDollarVol: 20e6,
  riskPct: 0.01, maxPosPct: 0.20, maxPositions: 5,
};

export function load(sym: string): Bar[] { return JSON.parse(fs.readFileSync(new URL(`./${process.env.SWING_DATA ?? "data"}/${sym}.json`, import.meta.url), "utf8")); }

function sma(x: number[], n: number) { const o = new Array(x.length).fill(NaN); let s = 0; for (let i = 0; i < x.length; i++) { s += x[i]; if (i >= n) s -= x[i - n]; if (i >= n - 1) o[i] = s / n; } return o; }
function atr(b: Bar[], n: number) { const o = new Array(b.length).fill(NaN); let a = NaN; for (let i = 1; i < b.length; i++) { const tr = Math.max(b[i].h - b[i].l, Math.abs(b[i].h - b[i - 1].c), Math.abs(b[i].l - b[i - 1].c)); a = i <= n ? (i === 1 ? tr : (a * (i - 1) + tr) / i) : (a * (n - 1) + tr) / n; if (i >= n) o[i] = a; } return o; }

export type Ind = { b: Bar[]; idx: Map<string, number>; s20: number[]; s50: number[]; s200: number[]; atr: number[]; dv20: number[] };
export function indicators(b: Bar[]): Ind {
  const c = b.map(x => x.c);
  return { b, idx: new Map(b.map((x, i) => [x.d, i])), s20: sma(c, 20), s50: sma(c, 50), s200: sma(c, 200), atr: atr(b, RULES.atrN), dv20: sma(b.map(x => x.c * x.v), 20) };
}

export type Check = { key: string; ok: boolean; detail: string };
export type Eval = { filters: boolean; signal: boolean; checks: Check[]; stop: number; depthAtr: number; pbLow: number; hi20: number };

/** Evaluate the v1 rules on the CLOSED bar i of ticker x, with market (SPY) bar mi. */
export function evaluate(x: Ind, i: number, spy: Ind, mi: number): Eval | null {
  const b = x.b;
  if (i < 220 || mi < 200 || !(x.atr[i] > 0)) return null;
  const A = x.atr[i], bar = b[i];
  let hi20 = -Infinity; for (let k = i - RULES.hiN + 1; k <= i; k++) hi20 = Math.max(hi20, b[k].h);
  let pbLow = Infinity; for (let k = i - RULES.pbN + 1; k <= i; k++) pbLow = Math.min(pbLow, b[k].l);
  const depthAtr = (hi20 - pbLow) / A;
  const stop = pbLow - RULES.stopBufAtr * A;
  const market = spy.b[mi].c > spy.s200[mi];
  const trend = bar.c > x.s200[i] && x.s50[i] > x.s200[i] && x.s200[i] > x.s200[i - 20];
  const liquid = x.dv20[i] >= RULES.minDollarVol;
  const pullback = depthAtr >= RULES.minDepthAtr && pbLow > x.s200[i];
  const recover = bar.c > b[i - 1].h && bar.c > bar.o;
  const riskOk = (bar.c - stop) / bar.c <= RULES.maxStopPct && bar.c > stop;
  const checks: Check[] = [
    { key: "market", ok: market, detail: `SPY ${spy.b[mi].c.toFixed(2)} vs เส้น 200 วัน ${spy.s200[mi].toFixed(2)}` },
    { key: "trend", ok: trend, detail: `ราคา ${bar.c.toFixed(2)} · เส้น 50 วัน ${x.s50[i].toFixed(2)} · เส้น 200 วัน ${x.s200[i].toFixed(2)}` },
    { key: "pullback", ok: pullback, detail: `ย่อจากจุดสูง 20 วัน ${hi20.toFixed(2)} ลงมา ${depthAtr.toFixed(1)} เท่าของการแกว่งปกติ (ต้อง ≥ ${RULES.minDepthAtr})` },
    { key: "recover", ok: recover, detail: `ปิด ${bar.c.toFixed(2)} vs จุดสูงเมื่อวาน ${b[i - 1].h.toFixed(2)}` },
    { key: "liquid", ok: liquid, detail: `ซื้อขายเฉลี่ย $${(x.dv20[i] / 1e6).toFixed(0)}M/วัน` },
    { key: "risk", ok: riskOk, detail: `จุดออก ${stop.toFixed(2)} ห่าง ${((bar.c - stop) / bar.c * 100).toFixed(1)}% (ต้อง ≤ ${RULES.maxStopPct * 100}%)` },
  ];
  const filters = market && trend && liquid;
  return { filters, signal: filters && pullback && recover && riskOk, checks, stop, depthAtr, pbLow, hi20 };
}

export type Trade = { sym: string; entryD: string; exitD: string; entry: number; exit: number; stop: number; target: number; shares: number; pnl: number; R: number; days: number; reason: string };
export type Mode = { kind: "signal" } | { kind: "random"; p: number; seed: number } | { kind: "buyhold" } | { kind: "dca" };
export type RunOpts = { syms: string[]; start: string; end: string; initial: number; monthly: number; costPct: number; cashRatePct?: number; mode: Mode };

function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; }; }
const T = (d: string) => Date.parse(d + "T00:00:00Z");
function irr(fl: { t: number; v: number }[]) { const t0 = fl[0].t; const f = (r: number) => fl.reduce((s, x) => s + x.v / Math.pow(1 + r, (x.t - t0) / 31557600000), 0); let lo = -0.99, hi = 5; if (f(lo) * f(hi) > 0) return NaN; for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; }

const cache = new Map<string, Ind>();
export function ind(sym: string) { if (!cache.has(sym)) cache.set(sym, indicators(load(sym))); return cache.get(sym)!; }

export function run(o: RunOpts) {
  const spy = ind("SPY");
  const X = o.syms.map(s => ({ s, x: ind(s) }));
  const cal = spy.b.map(b => b.d).filter(d => d >= o.start && d <= o.end);
  const c = o.costPct / 100, rand = o.mode.kind === "random" ? rng(o.mode.seed) : () => 0;
  let cash = o.initial; const flows = [{ t: T(cal[0]), v: -o.initial }];
  let investedFracSum = 0;
  let units = o.initial, nav = 1, peakNav = 1, maxDD = 0, investedDays = 0, filterDays = 0, signalDays = 0;
  type Pos = { sym: string; sh: number; entry: number; stop: number; target: number; d0: string; held: number; exitNext: boolean; enteredToday: boolean };
  let pos: Pos[] = []; let pending: { sym: string; stop: number; sigClose: number; atr: number; rank: number }[] = [];
  const hold = new Map<string, number>(); // buy&hold / dca shares
  let dcaLeft = 0; const dcaChunk = o.initial / 12; if (o.mode.kind === "dca") dcaLeft = o.initial;
  const trades: Trade[] = [];
  const price = (sym: string, d: string, k: keyof Bar = "c") => { const x = ind(sym); const i = x.idx.get(d); return i == null ? null : (x.b[i][k] as number); };
  const lastPrice = (sym: string, d: string) => { const x = ind(sym); let i = x.idx.get(d); if (i == null) { /* fall back to latest earlier bar */ let j = x.b.length - 1; while (j >= 0 && x.b[j].d > d) j--; i = j; } return i >= 0 ? x.b[i].c : 0; };
  const equity = (d: string) => cash + pos.reduce((s, p) => s + p.sh * lastPrice(p.sym, d), 0) + [...hold].reduce((s, [k, sh]) => s + sh * lastPrice(k, d), 0);
  const close = (p: Pos, px: number, d: string, reason: string) => {
    const fill = px * (1 - c); cash += p.sh * fill;
    trades.push({ sym: p.sym, entryD: p.d0, exitD: d, entry: p.entry, exit: fill, stop: p.stop, target: p.target, shares: p.sh, pnl: p.sh * (fill - p.entry), R: (fill - p.entry) / (p.entry - p.stop), days: p.held, reason });
  };
  const listed = (sym: string, d: string) => { const x = ind(sym); return x.b[0].d <= d; };
  const basketBuy = (amt: number, d: string) => { const live = o.syms.filter(s => price(s, d) != null && listed(s, d)); if (!live.length) return; for (const s of live) { const px = price(s, d)! * (1 + c); hold.set(s, (hold.get(s) ?? 0) + amt / live.length / px); } cash -= amt; };

  for (let k = 0; k < cal.length; k++) {
    const d = cal[k], isMonthEnd = k + 1 < cal.length ? cal[k + 1].slice(0, 7) !== d.slice(0, 7) : false;
    if (k > 0 && o.cashRatePct) cash *= Math.pow(1 + o.cashRatePct / 100, (T(d) - T(cal[k - 1])) / 31557600000);
    const eqPrev = equity(k > 0 ? cal[k - 1] : d);

    if (o.mode.kind === "signal" || o.mode.kind === "random") {
      // 1. open: time exits, then new entries
      for (const p of [...pos]) if (p.exitNext) { const px = price(p.sym, d, "o"); if (px != null) { close(p, px, d, "time"); pos = pos.filter(q => q !== p); } }
      pending.sort((a, b) => b.rank - a.rank);
      for (const q of pending) {
        if (pos.length >= RULES.maxPositions) break;
        const op = price(q.sym, d, "o"); if (op == null) continue;
        if (op > q.sigClose + RULES.gapSkipAtr * q.atr || op <= q.stop) continue; // ran away / already broken
        const fill = op * (1 + c), riskPer = fill - q.stop;
        let sh = (RULES.riskPct * eqPrev) / riskPer;
        sh = Math.min(sh, (RULES.maxPosPct * eqPrev) / fill, cash / fill);
        if (!(sh * fill >= 1)) continue;
        cash -= sh * fill;
        pos.push({ sym: q.sym, sh, entry: fill, stop: q.stop, target: fill + RULES.rr * riskPer, d0: d, held: 0, exitNext: false, enteredToday: true });
      }
      pending = [];
      // 2. intrabar stops / targets (stop assumed first when both are touched)
      for (const p of [...pos]) {
        const x = ind(p.sym), i = x.idx.get(d); if (i == null) continue; const b = x.b[i];
        let ex: [number, string] | null = null;
        if (!p.enteredToday && b.o <= p.stop) ex = [b.o, "stop-gap"];
        else if (!p.enteredToday && b.o >= p.target) ex = [b.o, "target-gap"];
        else if (b.l <= p.stop) ex = [p.stop, "stop"];
        else if (b.h >= p.target) ex = [p.target, "target"];
        if (ex) { close(p, ex[0], d, ex[1]); pos = pos.filter(q => q !== p); continue; }
        p.held++; p.enteredToday = false; if (p.held >= RULES.maxHoldDays) p.exitNext = true;
      }
    }
    // 3. close: deposits
    if (isMonthEnd && k > 0) { cash += o.monthly; flows.push({ t: T(d), v: -o.monthly }); units += o.monthly / nav; }
    if (o.mode.kind === "buyhold") { if (k === 0) basketBuy(cash, d); else if (isMonthEnd) basketBuy(o.monthly, d); }
    if (o.mode.kind === "dca") { if (isMonthEnd || k === 0) { const amt = Math.min(dcaLeft, dcaChunk); dcaLeft -= amt; basketBuy(amt + (k > 0 ? o.monthly : 0), d); } }
    // 4. signals on today's closed bar → orders for tomorrow's open
    if (o.mode.kind === "signal" || o.mode.kind === "random") {
      const mi = spy.idx.get(d)!;
      for (const { s, x } of X) {
        if (pos.some(p => p.sym === s)) continue;
        const i = x.idx.get(d); if (i == null) continue;
        const e = evaluate(x, i, spy, mi); if (!e) continue;
        if (e.filters) filterDays++;
        if (e.signal) signalDays++;
        const take = o.mode.kind === "signal" ? e.signal : (e.filters && x.b[i].c > e.stop && (x.b[i].c - e.stop) / x.b[i].c <= RULES.maxStopPct && rand() < o.mode.p);
        if (take) pending.push({ sym: s, stop: e.stop, sigClose: x.b[i].c, atr: x.atr[i], rank: o.mode.kind === "signal" ? e.depthAtr : rand() });
      }
    }
    const eq = equity(d);
    investedFracSum += eq > 0 ? 1 - cash / eq : 0;
    nav = eq / units; peakNav = Math.max(peakNav, nav); maxDD = Math.max(maxDD, 1 - nav / peakNav);
    if (pos.length || hold.size) investedDays++;
  }
  const endD = cal[cal.length - 1];
  for (const p of pos) close(p, lastPrice(p.sym, endD), endD, "open-at-end"); pos = [];
  const final = equity(endD);
  const contributed = -flows.reduce((s, f) => s + f.v, 0);
  const real = trades.filter(t => t.reason !== "open-at-end");
  const wins = real.filter(t => t.pnl > 0), losses = real.filter(t => t.pnl <= 0);
  const avg = (a: number[]) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  return {
    final, contributed, irr: irr([...flows, { t: T(endD), v: final }]), maxDD, exposure: investedDays / cal.length, avgInvested: investedFracSum / cal.length,
    trades: real.length, winRate: real.length ? wins.length / real.length : 0,
    avgWinPct: avg(wins.map(t => t.exit / t.entry - 1)) * 100, avgLossPct: avg(losses.map(t => t.exit / t.entry - 1)) * 100,
    avgR: avg(real.map(t => t.R)), filterDays, signalDays, tradeList: trades,
    reasons: real.reduce((m, t) => (m[t.reason] = (m[t.reason] ?? 0) + 1, m), {} as Record<string, number>),
  };
}
