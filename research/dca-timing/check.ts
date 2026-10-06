import { dca, months, STRATS } from "./dca.ts";
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
// flat price: every rule must give exactly invested
const flat = Array.from({ length: 300 }, (_, i) => ({ d: new Date(Date.UTC(2020, 0, 1) + i * 864e5).toISOString().slice(0, 10), c: 50 }));
const M = months(flat), ctx = { rsi: flat.map(() => 50) };
for (const [k, s] of Object.entries(STRATS)) ok(Math.abs(dca(flat, M, 0, M.length - 1, s.pick, ctx) - 500 * M.length) < 1e-6, `flat price ${k}`);
// rising every day: earliest day must win, best == day1, worst == last
const up = flat.map((x, i) => ({ ...x, c: 50 * Math.pow(1.001, i) })), Mu = months(up);
const v = (k: string) => dca(up, Mu, 1, Mu.length - 1, STRATS[k].pick, ctx);
ok(Math.abs(v("best") - v("day1")) < 1e-9 && Math.abs(v("worst") - v("last")) < 1e-9 && v("day1") > v("day10") && v("day10") > v("last"), "rising prices: day1 = best > day10 > last = worst");
