import fs from "node:fs";
const b = JSON.parse(fs.readFileSync("data_syn/S3.json", "utf8"));
// martingale check
let m = 0, n = 0; for (let i = 0; i + 20 < b.length; i++) { m += b[i + 20].c / b[i].c - 1; n++; } console.log("mean 20d return", (m / n * 100).toFixed(3) + "%");
let m1 = 0; for (let i = 1; i < b.length; i++) m1 += b[i].c / b[i - 1].c - 1; console.log("mean 1d return", (m1 / (b.length - 1) * 100).toFixed(4) + "%");
// open vs prev close, high/low consistency
let gap = 0; for (let i = 1; i < b.length; i++) gap += Math.abs(b[i].o - b[i - 1].c); console.log("total |open-prevclose|", gap);
// isolated exits: enter every day at open with stop = open*(1-3%) target = open*(1+6%), 20d time exit
let R = 0, k = 0; for (let i = 1; i + 25 < b.length; i++) { const e = b[i].o, s = e * 0.97, t = e * 1.06; let r = null; let j = i; for (; j < i + 20; j++) { if (b[j].l <= s) { r = -1; break; } if (b[j].h >= t) { r = 2; break; } } if (r == null) r = (b[j].o - e) / (e - s); R += r; k++; }
console.log("isolated avg R", (R / k).toFixed(4), "n", k);
