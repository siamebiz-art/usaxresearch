// zero-drift random walk with realistic daily vol (~2%), OHLC from intraday path
import fs from "node:fs";
fs.mkdirSync("data_syn", { recursive: true });
const spy = JSON.parse(fs.readFileSync("data/SPY.json", "utf8"));
let seed = 116; const r = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
for (const name of ["SPY", ...Array.from({ length: 20 }, (_, i) => "S" + i)]) {
  let p = 100; const out = [];
  for (const { d } of spy) {
    const o = p; let h = o, l = o, x = o;
    for (let k = 0; k < 64; k++) { x *= Math.exp(0.02 / Math.sqrt(64) * g() - 0.5 * 0.0004 / 64); h = Math.max(h, x); l = Math.min(l, x); }
    // remove drift: geometric mean-zero -> subtract half variance
    out.push({ d, o, h, l, c: x, v: 5e6 }); p = x;
  }
  fs.writeFileSync(`data_syn/${name}.json`, JSON.stringify(out));
}
