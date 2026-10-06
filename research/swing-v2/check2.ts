import { run as run1 } from "../swing-v1/sim.ts";
import { run as run2, STRATEGIES } from "./sim2.ts";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const ALL = ["NVDA","MSFT","AAPL","GOOGL","AMZN","META","TSLA","AVGO","PLTR","AMD","INTC","CSCO","IBM","BA","DIS","NKE","PYPL","PFE","VZ","XOM"];
for (const [s, e, syms] of [["2010-01-01", "2018-12-31", ALL], ["2019-01-01", "2026-12-31", ALL.slice(0, 10)]] as const) {
  const base = { syms: [...syms], start: s, end: e, initial: 10000, monthly: 500, costPct: 0.1 };
  const a = run1({ ...base, mode: { kind: "signal" } }), b = run2({ ...base, strat: STRATEGIES.v1, mode: { kind: "signal" } });
  ok(Math.abs(a.final - b.final) < 1e-6 && a.trades === b.trades, `v1 signal ${s}: sim ${a.final.toFixed(2)} (${a.trades}) == sim2 ${b.final.toFixed(2)} (${b.trades})`);
  const ar = run1({ ...base, mode: { kind: "random", p: 0.02, seed: 1000 } }), br = run2({ ...base, strat: STRATEGIES.v1, mode: { kind: "random", p: 0.02, seed: 1000 }, lcg: true });
  ok(Math.abs(ar.final - br.final) < 1e-6, `v1 random ${s}: ${ar.final.toFixed(2)} == ${br.final.toFixed(2)}`);
  const ah = run1({ ...base, mode: { kind: "buyhold" } }), bh = run2({ ...base, strat: STRATEGIES.v1, mode: { kind: "buyhold" } });
  ok(Math.abs(ah.final - bh.final) < 1e-6, `buy&hold ${s}: ${ah.final.toFixed(2)} == ${bh.final.toFixed(2)}`);
}
