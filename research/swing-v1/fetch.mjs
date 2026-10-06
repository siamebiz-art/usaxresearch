import fs from "node:fs";
fs.mkdirSync("data", { recursive: true });
const T = ["SPY","NVDA","MSFT","AAPL","GOOGL","AMZN","META","TSLA","AVGO","PLTR","AMD","INTC","CSCO","IBM","BA","DIS","NKE","PYPL","PFE","VZ","XOM"];
for (const s of T) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${s}?period1=1104537600&period2=${Math.floor(Date.now()/1000)}&interval=1d&events=div,splits`, { headers: { "User-Agent": "Mozilla/5.0" } });
  const res = (await r.json()).chart.result[0];
  const q = res.indicators.quote[0], a = res.indicators.adjclose[0].adjclose;
  const rows = [];
  res.timestamp.forEach((t, i) => {
    if ([q.open[i], q.high[i], q.low[i], q.close[i], a[i]].some(v => v == null || !(v > 0))) return;
    const f = a[i] / q.close[i]; // dividend adjustment (splits already applied by Yahoo)
    rows.push({ d: new Date(t * 1000).toISOString().slice(0, 10), o: q.open[i] * f, h: q.high[i] * f, l: q.low[i] * f, c: a[i], v: q.volume[i] ?? 0, rc: q.close[i] });
  });
  // sanity: OHLC ordering
  const bad = rows.filter(b => b.h < Math.max(b.o, b.c) - 1e-6 || b.l > Math.min(b.o, b.c) + 1e-6).length;
  fs.writeFileSync(`data/${s}.json`, JSON.stringify(rows));
  console.log(s, rows.length, rows[0].d, rows.at(-1).d, "badOHLC", bad, "dropped", res.timestamp.length - rows.length);
}
