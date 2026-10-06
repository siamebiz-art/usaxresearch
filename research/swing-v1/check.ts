import fs from "node:fs";
import { run, load } from "./sim.ts";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const syn = process.env.SWING_DATA === "data_syn";
if (!syn) {
  // 1. buy&hold one ticker, no deposits, no cost = adjusted price ratio
  const b = load("MSFT"); const s = b.find(x => x.d >= "2012-01-01")!, e = b.find(x => x.d >= "2020-01-01")!;
  const r = run({ syms: ["MSFT"], start: s.d, end: e.d, initial: 10000, monthly: 0, costPct: 0, mode: { kind: "buyhold" } });
  ok(Math.abs(r.final / 10000 - e.c / s.c) < 1e-9, `buy&hold MSFT ratio ${(r.final / 10000).toFixed(4)} vs ${(e.c / s.c).toFixed(4)}`);
}
// 2. exit prices: stop exits ≈ −1R, target exits ≈ +2R (cost 0)
const r = run({ syms: syn ? Array.from({ length: 20 }, (_, i) => "S" + i) : ["NVDA","MSFT","AAPL","GOOGL","AMZN","META","TSLA","AVGO","PLTR","AMD","INTC","CSCO","IBM","BA","DIS","NKE","PYPL","PFE","VZ","XOM"], start: "2010-01-01", end: "2026-12-31", initial: 10000, monthly: 0, costPct: 0, mode: { kind: "signal" } });
const st = r.tradeList.filter(t => t.reason === "stop"), tg = r.tradeList.filter(t => t.reason === "target");
ok(st.every(t => Math.abs(t.R + 1) < 1e-9), `all ${st.length} stop exits are exactly −1R`);
ok(tg.every(t => Math.abs(t.R - 2) < 1e-9), `all ${tg.length} target exits are exactly +2R`);
ok(r.tradeList.filter(t => t.reason === "stop-gap").every(t => t.R <= -1 + 1e-9), `gap stops are worse than −1R`);
ok(r.tradeList.every(t => t.entryD > "2010-01-01"), "entries after start");
const avgR = r.tradeList.reduce((s, t) => s + t.R, 0) / r.tradeList.length;
console.log(`${syn ? "SYNTHETIC zero-drift" : "real"}: trades ${r.trades} avgR ${avgR.toFixed(3)} win ${(r.winRate * 100).toFixed(1)}% final ${r.final.toFixed(0)} reasons ${JSON.stringify(r.reasons)}`);
