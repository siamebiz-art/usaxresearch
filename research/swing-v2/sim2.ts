// Swing Assistant — phase 1.5: several rule families on one portfolio engine.
// Same accounting as ../swing-v1/sim.ts (next-open fills, stop-first, gap fills at the open),
// generalised to pluggable entries and exits. `node check2.ts` proves v1 reproduces sim.ts exactly.
import { ind as ind1, evaluate, RULES as V1, type Bar, type Ind } from "../swing-v1/sim.ts";

export type Ind2 = Ind & { s5: number[]; rsi2: number[]; hi50prev: number[] };
const cache = new Map<string, Ind2>();
export function ind(sym: string): Ind2 {
  if (cache.has(sym)) return cache.get(sym)!;
  const x = ind1(sym) as Ind2, b = x.b, n = b.length;
  x.s5 = new Array(n).fill(NaN); x.rsi2 = new Array(n).fill(NaN); x.hi50prev = new Array(n).fill(NaN);
  let s = 0; for (let i = 0; i < n; i++) { s += b[i].c; if (i >= 5) s -= b[i - 5].c; if (i >= 4) x.s5[i] = s / 5; }
  // Wilder RSI, period 2
  let ag = 0, al = 0;
  for (let i = 1; i < n; i++) {
    const ch = b[i].c - b[i - 1].c, g = Math.max(ch, 0), l = Math.max(-ch, 0);
    if (i <= 2) { ag += g / 2; al += l / 2; } else { ag = (ag * 1 + g) / 2; al = (al * 1 + l) / 2; }
    if (i >= 2) x.rsi2[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  for (let i = 50; i < n; i++) { let m = -Infinity; for (let k = i - 50; k < i; k++) m = Math.max(m, b[k].h); x.hi50prev[i] = m; }
  cache.set(sym, x); return x;
}

export type Entry = { stop: number; rank: number };
export type Strategy = {
  key: string; name: string;
  /** market + trend + liquidity: the days on which the random control may also enter */
  filters(x: Ind2, i: number, spy: Ind2, mi: number): boolean;
  signal(x: Ind2, i: number, spy: Ind2, mi: number): Entry | null;
  /** initial stop for a random-control entry on the same bar */
  baseStop(x: Ind2, i: number): number;
  exit: { rr?: number; trailAtr?: number; smaExit?: boolean; maxHold: number };
};

const okBase = (x: Ind2, i: number, spy: Ind2, mi: number) => i >= 220 && mi >= 200 && x.atr[i] > 0;
const market = (spy: Ind2, mi: number) => spy.b[mi].c > spy.s200[mi];
const liquid = (x: Ind2, i: number) => x.dv20[i] >= V1.minDollarVol;
const fullTrend = (x: Ind2, i: number) => x.b[i].c > x.s200[i] && x.s50[i] > x.s200[i] && x.s200[i] > x.s200[i - 20];
const stopOk = (c: number, stop: number) => c > stop && (c - stop) / c <= V1.maxStopPct;

export const STRATEGIES: Record<string, Strategy> = {
  v1: {
    key: "v1", name: "รุ่นแรก: ย่อแล้วฟื้น + เป้า 2 เท่า",
    filters: (x, i, spy, mi) => { const e = evaluate(x, i, spy, mi); return !!e?.filters; },
    signal: (x, i, spy, mi) => { const e = evaluate(x, i, spy, mi); return e?.signal ? { stop: e.stop, rank: e.depthAtr } : null; },
    baseStop: (x, i) => { let lo = Infinity; for (let k = i - 4; k <= i; k++) lo = Math.min(lo, x.b[k].l); return lo - V1.stopBufAtr * x.atr[i]; },
    exit: { rr: V1.rr, maxHold: V1.maxHoldDays },
  },
  rsi2: {
    key: "rsi2", name: "ย่อสั้นแรงในขาขึ้น (RSI 2)",
    filters: (x, i, spy, mi) => okBase(x, i, spy, mi) && market(spy, mi) && x.b[i].c > x.s200[i] && liquid(x, i),
    signal(x, i, spy, mi) { if (!this.filters(x, i, spy, mi) || !(x.rsi2[i] < 10)) return null; const stop = this.baseStop(x, i); return stopOk(x.b[i].c, stop) ? { stop, rank: -x.rsi2[i] } : null; },
    baseStop: (x, i) => x.b[i].c - 3 * x.atr[i],
    exit: { smaExit: true, maxHold: 10 },
  },
  breakout: {
    key: "breakout", name: "ทะลุจุดสูง 50 วัน + จุดออกเลื่อนตาม",
    filters: (x, i, spy, mi) => okBase(x, i, spy, mi) && market(spy, mi) && fullTrend(x, i) && liquid(x, i),
    signal(x, i, spy, mi) { if (!this.filters(x, i, spy, mi) || !(x.b[i].c > x.hi50prev[i])) return null; const stop = this.baseStop(x, i); return stopOk(x.b[i].c, stop) ? { stop, rank: x.b[i].c / x.s200[i] } : null; },
    baseStop: (x, i) => x.b[i].c - 3 * x.atr[i],
    exit: { trailAtr: 3, maxHold: 60 },
  },
  v1trail: {
    key: "v1trail", name: "ย่อแล้วฟื้น + จุดออกเลื่อนตาม",
    filters: (x, i, spy, mi) => { const e = evaluate(x, i, spy, mi); return !!e?.filters; },
    signal: (x, i, spy, mi) => { const e = evaluate(x, i, spy, mi); return e?.signal ? { stop: e.stop, rank: e.depthAtr } : null; },
    baseStop: (x, i) => { let lo = Infinity; for (let k = i - 4; k <= i; k++) lo = Math.min(lo, x.b[k].l); return lo - V1.stopBufAtr * x.atr[i]; },
    exit: { trailAtr: 3, maxHold: 60 },
  },
};

export type Mode = { kind: "signal" } | { kind: "random"; p: number; seed: number } | { kind: "buyhold" };
export type RunOpts = { strat: Strategy; syms: string[]; start: string; end: string; initial: number; monthly: number; costPct: number; mode: Mode; lcg?: boolean;
  /** take EVERY entry at a fixed $1,000 (no position cap, no cash limit): path-independent per-trade statistics */
  unlimited?: boolean };

/** mulberry32 — the v1 control used a plain LCG; `lcg: true` reproduces it for the regression check. */
function rng(seed: number, lcg = false) {
  let s = seed >>> 0;
  if (lcg) return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const T = (d: string) => Date.parse(d + "T00:00:00Z");
function irr(fl: { t: number; v: number }[]) { const t0 = fl[0].t; const f = (r: number) => fl.reduce((s, x) => s + x.v / Math.pow(1 + r, (x.t - t0) / 31557600000), 0); let lo = -0.99, hi = 5; if (f(lo) * f(hi) > 0) return NaN; for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; }

export function run(o: RunOpts) {
  const S = o.strat, spy = ind("SPY"), X = o.syms.map(s => ({ s, x: ind(s) }));
  const cal = spy.b.map(b => b.d).filter(d => d >= o.start && d <= o.end);
  const c = o.costPct / 100, rand = o.mode.kind === "random" ? rng(o.mode.seed, o.lcg) : () => 0;
  let cash = o.initial; const flows = [{ t: T(cal[0]), v: -o.initial }];
  let units = o.initial, nav = 1, peakNav = 1, maxDD = 0, filterDays = 0, signalDays = 0, investedFracSum = 0;
  type Pos = { sym: string; sh: number; entry: number; stop: number; stop0: number; target: number; d0: string; held: number; exitNext: boolean; enteredToday: boolean; maxC: number };
  let pos: Pos[] = []; let pending: { sym: string; stop: number; sigClose: number; atr: number; rank: number }[] = [];
  const hold = new Map<string, number>();
  const trades: { R: number; pnl: number; ret: number; reason: string; days: number }[] = [];
  const bar = (sym: string, d: string) => { const x = ind(sym), i = x.idx.get(d); return i == null ? null : { x, i, b: x.b[i] }; };
  const lastPrice = (sym: string, d: string) => { const x = ind(sym); let i = x.idx.get(d); if (i == null) { let j = x.b.length - 1; while (j >= 0 && x.b[j].d > d) j--; i = j; } return i >= 0 ? x.b[i].c : 0; };
  const equity = (d: string) => cash + pos.reduce((s, p) => s + p.sh * lastPrice(p.sym, d), 0) + [...hold].reduce((s, [k, sh]) => s + sh * lastPrice(k, d), 0);
  const close = (p: Pos, px: number, reason: string) => { const fill = px * (1 - c); cash += p.sh * fill; trades.push({ R: (fill - p.entry) / (p.entry - p.stop0), pnl: p.sh * (fill - p.entry), ret: fill / p.entry - 1, reason, days: p.held }); };
  const basketBuy = (amt: number, d: string) => { const live = o.syms.filter(s => bar(s, d)); if (!live.length) return; for (const s of live) hold.set(s, (hold.get(s) ?? 0) + amt / live.length / (bar(s, d)!.b.c * (1 + c))); cash -= amt; };

  for (let k = 0; k < cal.length; k++) {
    const d = cal[k], isMonthEnd = k + 1 < cal.length ? cal[k + 1].slice(0, 7) !== d.slice(0, 7) : false;
    const eqPrev = equity(k > 0 ? cal[k - 1] : d);
    if (o.mode.kind !== "buyhold") {
      for (const p of [...pos]) if (p.exitNext) { const r = bar(p.sym, d); if (r) { close(p, r.b.o, "time"); pos = pos.filter(q => q !== p); } }
      pending.sort((a, b) => b.rank - a.rank);
      for (const q of pending) {
        if (!o.unlimited && pos.length >= V1.maxPositions) break;
        const r = bar(q.sym, d); if (!r) continue; const op = r.b.o;
        if (op > q.sigClose + V1.gapSkipAtr * q.atr || op <= q.stop) continue;
        const fill = op * (1 + c), riskPer = fill - q.stop;
        let sh = o.unlimited ? 1000 / fill : Math.min((V1.riskPct * eqPrev) / riskPer, (V1.maxPosPct * eqPrev) / fill, cash / fill);
        if (!(sh * fill >= 1)) continue;
        cash -= sh * fill;
        pos.push({ sym: q.sym, sh, entry: fill, stop: q.stop, stop0: q.stop, target: S.exit.rr ? fill + S.exit.rr * riskPer : Infinity, d0: d, held: 0, exitNext: false, enteredToday: true, maxC: op });
      }
      pending = [];
      for (const p of [...pos]) {
        const r = bar(p.sym, d); if (!r) continue; const b = r.b;
        let ex: [number, string] | null = null;
        if (!p.enteredToday && b.o <= p.stop) ex = [b.o, "stop-gap"];
        else if (!p.enteredToday && b.o >= p.target) ex = [b.o, "target-gap"];
        else if (b.l <= p.stop) ex = [p.stop, "stop"];
        else if (b.h >= p.target) ex = [p.target, "target"];
        if (ex) { close(p, ex[0], ex[1]); pos = pos.filter(q => q !== p); continue; }
        p.held++; p.enteredToday = false;
        if (S.exit.trailAtr) { p.maxC = Math.max(p.maxC, b.c); p.stop = Math.max(p.stop, p.maxC - S.exit.trailAtr * r.x.atr[r.i]); }
        if (S.exit.smaExit && b.c > r.x.s5[r.i]) p.exitNext = true;
        if (p.held >= S.exit.maxHold) p.exitNext = true;
      }
    }
    if (isMonthEnd && k > 0) { cash += o.monthly; flows.push({ t: T(d), v: -o.monthly }); units += o.monthly / nav; }
    if (o.mode.kind === "buyhold") { if (k === 0) basketBuy(cash, d); else if (isMonthEnd) basketBuy(o.monthly, d); }
    else {
      const mi = spy.idx.get(d)!;
      for (const { s, x } of X) {
        if (pos.some(p => p.sym === s)) continue;
        const i = x.idx.get(d); if (i == null || i < 220) continue;
        const f = S.filters(x, i, spy, mi); if (f) filterDays++;
        const e = S.signal(x, i, spy, mi); if (e) signalDays++;
        if (o.mode.kind === "signal") { if (e) pending.push({ sym: s, stop: e.stop, sigClose: x.b[i].c, atr: x.atr[i], rank: e.rank }); }
        else if (f) { const stop = S.baseStop(x, i); if (stopOk(x.b[i].c, stop) && rand() < o.mode.p) pending.push({ sym: s, stop, sigClose: x.b[i].c, atr: x.atr[i], rank: rand() }); }
      }
    }
    const eq = equity(d);
    investedFracSum += eq > 0 ? 1 - cash / eq : 0;
    nav = eq / units; peakNav = Math.max(peakNav, nav); maxDD = Math.max(maxDD, 1 - nav / peakNav);
  }
  const endD = cal[cal.length - 1];
  for (const p of pos) close(p, lastPrice(p.sym, endD), "open-at-end");
  pos = [];
  const final = equity(endD), real = trades.filter(t => t.reason !== "open-at-end");
  const avg = (a: number[]) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const wins = real.filter(t => t.pnl > 0), losses = real.filter(t => t.pnl <= 0);
  return {
    final, contributed: -flows.reduce((s, f) => s + f.v, 0), irr: irr([...flows, { t: T(endD), v: final }]), maxDD,
    avgInvested: investedFracSum / cal.length, trades: real.length, winRate: real.length ? wins.length / real.length : 0,
    avgWin: avg(wins.map(t => t.ret)) * 100, avgLoss: avg(losses.map(t => t.ret)) * 100, avgR: avg(real.map(t => t.R)),
    avgDays: avg(real.map(t => t.days)), filterDays, signalDays,
    reasons: real.reduce((m, t) => (m[t.reason] = (m[t.reason] ?? 0) + 1, m), {} as Record<string, number>),
  };
}
