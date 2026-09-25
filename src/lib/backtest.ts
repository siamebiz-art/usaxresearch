// ── DCA vs Buy-the-Dip backtest engine ─────────────────────────
// Pure functions, no I/O — runs in the browser and in scripts/verify-backtest.ts
// (`node scripts/verify-backtest.ts SPY` — run it after any change here).
//
// Rules (both strategies get exactly the same money on the same days):
//  • On the last trading day of every month, `monthly` dollars arrive as cash.
//  • DCA  : spends all cash at that day's close.
//  • Dip  : keeps the cash until a close is at least `dipPct` below the highest
//           close of the previous `lookbackDays` trading days. It then spends all
//           cash at the NEXT trading day's close (you only know a close after it
//           happens — buying at the signal close would be a free peek).
//           While the dip lasts, new monthly money is spent as soon as it arrives.
//  • Waiting cash earns `cashRatePct` a year (0 = nothing), no fees, no taxes, fractional shares allowed.
//  • Prices are Yahoo "adjusted close", so dividends count as reinvested for both.

export type Bar = { d: string; p: number }; // d = YYYY-MM-DD, p = adjusted close

export type Options = {
  monthly: number;
  dipPct: number;        // e.g. 10 for 10%
  lookbackDays: number;  // 252 ≈ 1 year
  cashRatePct?: number;  // interest on dip cash while it waits, e.g. 4 for 4%/yr
  start: number;         // index into bars (inclusive)
  end: number;           // index into bars (inclusive)
};

export type Leg = {
  shares: number;
  cash: number;
  value: number;
  buys: number;
  avgCost: number;       // dollars spent / shares bought (0 if none)
};

export type Point = { d: string; invested: number; dca: number; dip: number; dipCash: number };

export type Result = {
  months: number;
  invested: number;
  dca: Leg & { irr: number };
  dip: Leg & { irr: number; longestWaitDays: number; monthsWithIdleCash: number; interest: number; buyDates: string[] };
  series: Point[];       // one point per month-end + the final day
  firstDate: string;
  lastDate: string;
};

export function isMonthEnd(bars: Bar[], i: number) {
  return i + 1 < bars.length && bars[i + 1].d.slice(0, 7) !== bars[i].d.slice(0, 7);
}

/** hi[i] = highest close of bars[i-lookback+1 .. i] */
export function rollingHigh(bars: Bar[], lookback: number) {
  const hi = new Float64Array(bars.length);
  const dq: number[] = [];
  let head = 0;
  for (let i = 0; i < bars.length; i++) {
    while (dq.length > head && bars[dq[dq.length - 1]].p <= bars[i].p) dq.pop();
    dq.push(i);
    if (dq.length > head && dq[head] <= i - lookback) head++;
    hi[i] = bars[dq[head]].p;
  }
  return hi;
}

/** Annualised money-weighted return from dated cash flows (negative = money in). */
export function irr(flows: { t: number; v: number }[]) {
  if (flows.length < 2) return 0;
  const t0 = flows[0].t;
  const npv = (r: number) => flows.reduce((s, f) => s + f.v / Math.pow(1 + r, (f.t - t0) / 31557600000), 0);
  let lo = -0.99, hi = 10;
  if (npv(lo) * npv(hi) > 0) return NaN;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

const ts = (d: string) => Date.parse(d + "T00:00:00Z");

export function simulate(bars: Bar[], o: Options, hi = rollingHigh(bars, o.lookbackDays)): Result {
  let dcaSh = 0, dcaCash = 0, dcaSpent = 0, dcaBuys = 0;
  let dipSh = 0, dipCash = 0, dipSpent = 0, dipBuys = 0;
  let invested = 0, months = 0;
  let waitStart = -1, longestWait = 0, idleMonths = 0, interest = 0;
  const buyDates: string[] = [];
  const dailyRate = (o.cashRatePct ?? 0) / 100;
  const flows: { t: number; v: number }[] = [];
  const series: Point[] = [];

  for (let i = o.start; i <= o.end; i++) {
    const p = bars[i].p;
    // The newest bar has no next bar, so an unfinished month never counts as a month-end.
    const monthEnd = isMonthEnd(bars, i);

    if (dipCash > 0 && dailyRate > 0 && i > o.start) {
      const gain = dipCash * (Math.pow(1 + dailyRate, (ts(bars[i].d) - ts(bars[i - 1].d)) / 31557600000) - 1);
      dipCash += gain; interest += gain;
    }

    if (monthEnd) {
      dcaCash += o.monthly;
      dipCash += o.monthly;
      invested += o.monthly;
      months++;
      flows.push({ t: ts(bars[i].d), v: -o.monthly });
    }

    if (dcaCash > 0) {
      dcaSh += dcaCash / p; dcaSpent += dcaCash; dcaCash = 0; dcaBuys++;
    }

    // Signal from yesterday's close vs yesterday's rolling high → fill at today's close.
    const inDip = i > 0 && bars[i - 1].p <= hi[i - 1] * (1 - o.dipPct / 100);
    if (dipCash > 0 && inDip) {
      dipSh += dipCash / p; dipSpent += dipCash; dipCash = 0; dipBuys++; buyDates.push(bars[i].d);
    }

    if (dipCash > 0) {
      if (waitStart < 0) waitStart = i;
    } else if (waitStart >= 0) {
      longestWait = Math.max(longestWait, (ts(bars[i].d) - ts(bars[waitStart].d)) / 86400000);
      waitStart = -1;
    }

    if (monthEnd || i === o.end) {
      if (monthEnd && dipCash > o.monthly) idleMonths++; // older money still waiting
      series.push({ d: bars[i].d, invested, dca: dcaSh * p + dcaCash, dip: dipSh * p + dipCash, dipCash });
    }
  }
  if (waitStart >= 0) longestWait = Math.max(longestWait, (ts(bars[o.end].d) - ts(bars[waitStart].d)) / 86400000);

  const last = bars[o.end];
  const dcaValue = dcaSh * last.p + dcaCash;
  const dipValue = dipSh * last.p + dipCash;
  const endT = ts(last.d);

  return {
    months,
    invested,
    firstDate: bars[o.start].d,
    lastDate: last.d,
    series,
    dca: {
      shares: dcaSh, cash: dcaCash, value: dcaValue, buys: dcaBuys,
      avgCost: dcaSh > 0 ? dcaSpent / dcaSh : 0,
      irr: irr([...flows, { t: endT, v: dcaValue }]),
    },
    dip: {
      shares: dipSh, cash: dipCash, value: dipValue, buys: dipBuys,
      avgCost: dipSh > 0 ? dipSpent / dipSh : 0,
      irr: irr([...flows, { t: endT, v: dipValue }]),
      longestWaitDays: Math.round(longestWait),
      monthsWithIdleCash: idleMonths,
      interest,
      buyDates,
    },
  };
}

export type RollingRun = { start: string; dca: number; dip: number; diffPct: number };

/**
 * Same comparison started from every month-end that has `years` of data after it —
 * shows whether the headline result depends on a lucky start date.
 */
export function rolling(bars: Bar[], o: Omit<Options, "start" | "end">, years: number, fromIdx = 0): RollingRun[] {
  const hi = rollingHigh(bars, o.lookbackDays);
  const out: RollingRun[] = [];
  const minStart = Math.max(fromIdx, o.lookbackDays);
  for (let s = minStart; s < bars.length; s++) {
    if (!isMonthEnd(bars, s)) continue;
    const endDate = new Date(ts(bars[s].d));
    endDate.setUTCFullYear(endDate.getUTCFullYear() + years);
    const target = endDate.toISOString().slice(0, 10);
    let e = s;
    while (e + 1 < bars.length && bars[e + 1].d <= target) e++;
    if (bars[e].d < target && e === bars.length - 1) break; // not enough data left
    const r = simulate(bars, { ...o, start: s, end: e }, hi);
    out.push({ start: bars[s].d, dca: r.dca.value, dip: r.dip.value, diffPct: (r.dip.value / r.dca.value - 1) * 100 });
  }
  return out;
}
