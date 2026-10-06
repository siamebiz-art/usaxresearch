import fs from "node:fs";
import { run, RULES } from "./sim.ts";
const MAG = ["NVDA","MSFT","AAPL","GOOGL","AMZN","META","TSLA","AVGO","PLTR","AMD"];
const LAG = ["INTC","CSCO","IBM","BA","DIS","NKE","PYPL","PFE","VZ","XOM"];
const U = { all: [...MAG, ...LAG], mag: MAG, lag: LAG } as Record<string, string[]>;
const P = { first: ["2010-01-01", "2018-12-31"], second: ["2019-01-01", "2026-12-31"] } as Record<string, string[]>;
const cost = +(process.env.COST ?? 0.1), cashRate = +(process.env.CASH ?? 0);
const base = { initial: 10000, monthly: 500, costPct: cost, cashRatePct: cashRate };
const pick = (r: any) => ({ final: Math.round(r.final), contributed: r.contributed, irr: +(r.irr * 100).toFixed(2), maxDD: +(r.maxDD * 100).toFixed(1), exposure: +(r.exposure * 100).toFixed(0), avgInvested: +(r.avgInvested * 100).toFixed(0), trades: r.trades, winRate: +(r.winRate * 100).toFixed(1), avgWinPct: +r.avgWinPct.toFixed(2), avgLossPct: +r.avgLossPct.toFixed(2), avgR: +r.avgR.toFixed(3), reasons: r.reasons });
const out: any = { rules: RULES, cost, cashRate, results: {} };
for (const [uk, syms] of Object.entries(U)) for (const [pk, [s, e]] of Object.entries(P)) {
  const o = { ...base, syms, start: s, end: e };
  const sig = run({ ...o, mode: { kind: "signal" } });
  const p = sig.signalDays / sig.filterDays;
  const rnd = Array.from({ length: 20 }, (_, i) => run({ ...o, mode: { kind: "random", p, seed: 1000 + i } }));
  rnd.sort((a, b) => a.final - b.final);
  const res = {
    signal: pick(sig),
    randomMedian: pick(rnd[10]), randomWorst: Math.round(rnd[0].final), randomBest: Math.round(rnd[19].final),
    randomBeatenBySignal: rnd.filter(r => r.final < sig.final).length,
    buyhold: pick(run({ ...o, mode: { kind: "buyhold" } })),
    dca: pick(run({ ...o, mode: { kind: "dca" } })),
    spy: pick(run({ ...o, syms: ["SPY"], mode: { kind: "buyhold" } })),
    p: +p.toFixed(4),
  };
  out.results[`${uk}/${pk}`] = res;
  const f = (x: any) => `${String(x.final).padStart(8)} ${String(x.irr).padStart(6)}%/y dd ${String(x.maxDD).padStart(5)}%`;
  console.log(`\n== ${uk} ${pk} (${s}..${e})  contributed ${sig.contributed}`);
  console.log(` signal   ${f(res.signal)} trades ${res.signal.trades} win ${res.signal.winRate}% avgR ${res.signal.avgR} exp ${res.signal.exposure}% avgInvested ${res.signal.avgInvested}% | b&h invested ${res.buyhold.avgInvested}%`);
  console.log(` random   ${f(res.randomMedian)} (worst ${res.randomWorst} best ${res.randomBest}) signal beat ${res.randomBeatenBySignal}/20 random runs`);
  console.log(` buyhold  ${f(res.buyhold)}`);
  console.log(` dca      ${f(res.dca)}`);
  console.log(` SPY b&h  ${f(res.spy)}`);
}
fs.writeFileSync(`results_c${cost}_cash${cashRate}.json`, JSON.stringify(out, null, 1));
