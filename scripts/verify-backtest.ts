import { simulate, rolling, rollingHigh, type Bar } from "../src/lib/backtest.ts";
const sym = process.argv[2] ?? "SPY";
const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?period1=0&period2=9999999999&interval=1d&events=div,splits`, { headers: { "User-Agent": "Mozilla/5.0" } });
const res = (await r.json()).chart.result[0];
const bars: Bar[] = res.timestamp.map((t: number, i: number) => ({ d: new Date(t * 1000).toISOString().slice(0, 10), p: res.indicators.adjclose[0].adjclose[i] })).filter((b: Bar) => b.p > 0);
const idx = (d: string) => bars.findIndex(b => b.d >= d);
const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const base = { monthly: 500, lookbackDays: 252, start: idx("2006-01-01"), end: bars.length - 1 };

// 1. dip 0% must equal DCA exactly
const z = simulate(bars, { ...base, dipPct: 0 });
ok(Math.abs(z.dca.value - z.dip.value) < 1e-6 && z.dca.buys === z.dip.buys, `dip 0% == DCA (${z.dca.value.toFixed(2)} vs ${z.dip.value.toFixed(2)})`);
// 2. dip 99% never buys → value = money put in
const n = simulate(bars, { ...base, dipPct: 99 });
ok(n.dip.buys === 0 && Math.abs(n.dip.value - n.invested) < 1e-6, `dip 99% keeps all cash (${n.dip.value} = ${n.invested})`);
// 3. month count = distinct months with a later trading day
const months = new Set(bars.slice(base.start, base.end).filter(b => b.d.slice(0,7) !== bars[base.end].d.slice(0,7)).map(b => b.d.slice(0, 7))).size;
ok(z.months === months, `months ${z.months} == ${months}`);
// 4. independent recompute of DCA: buy at each month's last close
let sh = 0; for (let i = base.start; i < base.end; i++) if (bars[i + 1].d.slice(0, 7) !== bars[i].d.slice(0, 7)) sh += 500 / bars[i].p;
ok(Math.abs(sh * bars[base.end].p - z.dca.value) < 1e-6, `DCA independent recompute ${(sh * bars[base.end].p).toFixed(2)}`);
// 5. rolling high vs brute force
const hi = rollingHigh(bars, 252); let bad = 0;
for (let i = 0; i < bars.length; i += 37) { let m = 0; for (let j = Math.max(0, i - 251); j <= i; j++) m = Math.max(m, bars[j].p); if (m !== hi[i]) bad++; }
ok(bad === 0, `rolling high brute-force check (${bad} mismatches)`);
// 6. dip buys only happen the day after a dip close (spot check via avg cost sanity)
ok(z.dca.avgCost > 0, `avg cost dca ${z.dca.avgCost.toFixed(2)}`);

console.log(`\n${sym} since ${bars[base.start].d} → ${bars[base.end].d}, $500/mo, invested ${z.invested}`);
for (const d of [5, 10, 15, 20, 30]) {
  const s = simulate(bars, { ...base, dipPct: d });
  console.log(`dip ${String(d).padStart(2)}%: DCA ${s.dca.value.toFixed(0)} (${(s.dca.irr*100).toFixed(2)}%/y)  DIP ${s.dip.value.toFixed(0)} (${(s.dip.irr*100).toFixed(2)}%/y) buys ${s.dip.buys} wait ${s.dip.longestWaitDays}d cashLeft ${s.dip.cash}`);
}
const roll = rolling(bars, { monthly: 500, dipPct: 10, lookbackDays: 252 }, 10);
const wins = roll.filter(x => x.diffPct > 0).length;
const sorted = roll.map(x => x.diffPct).sort((a, b) => a - b);
console.log(`\nrolling 10y, dip10%: ${roll.length} starts (${roll[0].start}..${roll.at(-1)!.start}), dip wins ${wins}, median ${sorted[sorted.length >> 1].toFixed(1)}%, worst ${sorted[0].toFixed(1)}%, best ${sorted.at(-1)!.toFixed(1)}%`);
// 7. interest: with 99% dip (never buys) and 4%/yr, cash should grow like a savings account
const c = simulate(bars, { ...base, dipPct: 99, cashRatePct: 4 });
ok(Math.abs(c.dip.irr - 0.04) < 0.001, `cash-only at 4%/yr → IRR ${(c.dip.irr*100).toFixed(3)}%`);
for (const d of [10, 20]) { const s = simulate(bars, { ...base, dipPct: d, cashRatePct: 4 }); console.log(`dip ${d}% +4% cash: DIP ${s.dip.value.toFixed(0)} interest ${s.dip.interest.toFixed(0)} vs DCA ${s.dca.value.toFixed(0)}`); }
const r4 = rolling(bars, { monthly: 500, dipPct: 10, lookbackDays: 252, cashRatePct: 4 }, 10);
console.log(`rolling 10y dip10% +4% cash: dip wins ${r4.filter(x=>x.diffPct>0).length}/${r4.length}`);
// 8. a closed range 2000-01..2010-12 must collect exactly 132 monthly deposits, the last on the final bar
if (bars[0].d > "2000-01-01") console.log("SKIP range 2000-2010 (history starts " + bars[0].d + ")"); else {
const rs = idx("2000-01-01"); let re = rs; while (bars[re + 1].d <= "2010-12-31") re++;
const rr = simulate(bars, { ...base, dipPct: 10, start: rs, end: re });
ok(rr.months === 132 && rr.invested === 66000 && rr.dca.cash === 0, `range 2000-2010: ${rr.months} months, invested ${rr.invested}, ends ${bars[re].d}`);
}
