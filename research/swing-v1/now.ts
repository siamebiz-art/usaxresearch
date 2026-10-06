import fs from "node:fs";
import { ind, evaluate, RULES } from "./sim.ts";
const spy = ind("SPY"), mi = spy.b.length - 1;
const rows = ["NVDA","MSFT","AAPL","GOOGL","AMZN","META","TSLA","AVGO","PLTR","AMD"].map(s => {
  const x = ind(s), i = x.b.length - 1, e = evaluate(x, i, spy, mi)!;
  const b = x.b[i], prev = x.b[i - 1], A = x.atr[i];
  // how many signals fired in the last 10 days (for "เคยเข้าเงื่อนไข")
  let last = null as string | null; for (let k = i; k > i - 30; k--) { const ee = evaluate(x, k, spy, spy.idx.get(x.b[k].d)!); if (ee?.signal) { last = x.b[k].d; break; } }
  const entry = b.c, stop = e.stop, risk = entry - stop, target = entry + RULES.rr * risk;
  const status = !e.checks[0].ok || !e.checks[1].ok ? "wait" : e.signal ? "signal" : e.checks[2].ok ? "watch" : "wait";
  return { s, d: b.d, close: +b.c.toFixed(2), chg: +((b.c / prev.c - 1) * 100).toFixed(2), atr: +A.toFixed(2), status, lastSignal: last,
    checks: e.checks, stop: +stop.toFixed(2), target: +target.toFixed(2), riskPct: +(risk / entry * 100).toFixed(1), depthAtr: +e.depthAtr.toFixed(1), hi20: +e.hi20.toFixed(2),
    spark: x.b.slice(i - 59).map(z => +z.c.toFixed(2)), s50: +x.s50[i].toFixed(2), s200: +x.s200[i].toFixed(2) };
});
fs.writeFileSync("now.json", JSON.stringify({ asOf: spy.b[mi].d, rows }, null, 1));
for (const r of rows) console.log(r.s, r.d, r.close, r.status, "last signal", r.lastSignal, r.checks.map(c => (c.ok ? "+" : "-") + c.key).join(" "));
