import fs from "node:fs";
import { run, STRATEGIES } from "./sim2.ts";
const MAG = ["NVDA","MSFT","AAPL","GOOGL","AMZN","META","TSLA","AVGO","PLTR","AMD"];
const LAG = ["INTC","CSCO","IBM","BA","DIS","NKE","PYPL","PFE","VZ","XOM"];
const U: Record<string, string[]> = { all: [...MAG, ...LAG], mag: MAG, lag: LAG };
const P: Record<string, [string, string]> = { first: ["2010-01-01", "2018-12-31"], second: ["2019-01-01", "2026-12-31"] };
const keys = (process.env.STRATS ?? "rsi2,breakout,v1trail,v1").split(",");
const N = 20, NT = 10;
const out: any = {};
const t0 = Date.now();
for (const sk of keys) {
  const strat = STRATEGIES[sk]; out[sk] = { name: strat.name, scen: {} };
  for (const [uk, syms] of Object.entries(U)) for (const [pk, [s, e]] of Object.entries(P)) {
    const base = { strat, syms, start: s, end: e, initial: 10000, monthly: 500 };
    const r: any = {};
    for (const cost of [0.1, 0.25]) {
      if (cost === 0.25 && uk !== "all") continue;
      const sig = run({ ...base, costPct: cost, mode: { kind: "signal" } });
      const p = sig.signalDays / Math.max(1, sig.filterDays);
      const rnd = Array.from({ length: N }, (_, i) => run({ ...base, costPct: cost, mode: { kind: "random", p, seed: 5000 + i } })).sort((a, b) => a.final - b.final);
      const spy = run({ ...base, syms: ["SPY"], costPct: cost, mode: { kind: "buyhold" } });
      const bh = run({ ...base, costPct: cost, mode: { kind: "buyhold" } });
      const row: any = {
        sig: { final: sig.final, irr: sig.irr, dd: sig.maxDD, trades: sig.trades, win: sig.winRate, avgWin: sig.avgWin, avgLoss: sig.avgLoss, avgR: sig.avgR, inv: sig.avgInvested, days: sig.avgDays },
        rnd: { median: rnd[N / 2].final, worst: rnd[0].final, best: rnd[N - 1].final, medIrr: rnd[N / 2].irr, medDD: rnd[N / 2].maxDD },
        beat: rnd.filter(x => x.final < sig.final).length,
        spy: { final: spy.final, irr: spy.irr, dd: spy.maxDD }, bh: { final: bh.final, irr: bh.irr, dd: bh.maxDD }, contributed: sig.contributed,
      };
      if (cost === 0.1) {
        const ts = run({ ...base, costPct: cost, mode: { kind: "signal" }, unlimited: true });
        const tr = Array.from({ length: NT }, (_, i) => run({ ...base, costPct: cost, mode: { kind: "random", p, seed: 9000 + i }, unlimited: true }).avgR).sort((a, b) => a - b);
        row.tradeLevel = { sigR: ts.avgR, sigN: ts.trades, rndMedR: tr[NT / 2], rndMinR: tr[0], rndMaxR: tr[NT - 1], beat: tr.filter(x => x < ts.avgR).length, of: NT };
      }
      r[cost] = row;
    }
    out[sk].scen[`${uk}/${pk}`] = r;
    const a = r[0.1];
    console.log(`${sk.padEnd(8)} ${uk}/${pk.padEnd(6)} sig ${Math.round(a.sig.final)} (${(a.sig.irr * 100).toFixed(1)}%/y dd ${(a.sig.dd * 100).toFixed(0)}%) rndMed ${Math.round(a.rnd.median)} beat ${a.beat}/20 | trade-level R ${a.tradeLevel.sigR.toFixed(3)} vs rnd ${a.tradeLevel.rndMedR.toFixed(3)} beat ${a.tradeLevel.beat}/${NT} | b&h ${Math.round(a.bh.final)} spy ${Math.round(a.spy.final)}${r[0.25] ? ` | c.25 sig irr/dd ${(r[0.25].sig.irr / r[0.25].sig.dd).toFixed(2)} spy ${(r[0.25].spy.irr / r[0.25].spy.dd).toFixed(2)} beat ${r[0.25].beat}/20` : ""}  [${((Date.now() - t0) / 1000).toFixed(0)}s]`);
  }
}
fs.writeFileSync(`results2_${keys.join("-")}.json`, JSON.stringify(out, null, 1));
