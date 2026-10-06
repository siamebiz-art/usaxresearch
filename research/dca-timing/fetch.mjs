import fs from "node:fs";
fs.mkdirSync("data", { recursive: true });
for (const s of ["SPY", "QQQ"]) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${s}?period1=0&period2=${Math.floor(Date.now() / 1000)}&interval=1d&events=div,splits`, { headers: { "User-Agent": "Mozilla/5.0" } });
  const res = (await r.json()).chart.result[0], a = res.indicators.adjclose[0].adjclose;
  const rows = res.timestamp.map((t, i) => ({ d: new Date(t * 1000).toISOString().slice(0, 10), c: a[i] })).filter(x => x.c > 0);
  fs.writeFileSync(`data/${s}.json`, JSON.stringify(rows)); console.log(s, rows.length, rows[0].d, rows.at(-1).d);
}
