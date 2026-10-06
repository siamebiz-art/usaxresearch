// "สรุปสั้น" for the /stock page: three lines a reader can act on without reading the cards.
// Computed from figures the API already returns — no AI, and never a buy/sell call
// (a public page that tells people to buy or sell needs an SEC Thailand licence).

export type Tone = "good" | "warn" | "bad" | "neutral";
export type Line = { tone: Tone; text: string; detail?: string };
export type Verdict = { business: Line; price: Line; action: Line };

type Input = {
  checks: { pass: boolean | null }[];
  valuation: { pe: number | null };
  market: { peVsMarket: number | null };
  flags: { key: string; severity: "watch" | "warn" }[];
};

const L = {
  th: {
    bizStrong: "ธุรกิจแข็งแรง", bizOk: "ธุรกิจพอใช้", bizWeak: "ธุรกิจน่ากังวล", bizUnknown: "ข้อมูลธุรกิจไม่พอให้สรุป",
    passed: (n: number, all: number) => `ผ่านเกณฑ์สุขภาพ ${n} จาก ${all} ข้อ`,
    loss: "ยังขาดทุน เทียบราคากับกำไรไม่ได้", priceUnknown: "ไม่มีข้อมูลเทียบราคากับตลาด",
    pricey: (p: number) => `ราคาแพงกว่าตลาด ${p}%`, cheap: (p: number) => `ราคาถูกกว่าตลาด ${p}%`, fair: "ราคาใกล้เคียงตลาด",
    priceyWhy: "ธุรกิจต้องโตเร็วกว่าตลาดต่อเนื่องหลายปี ถึงจะคุ้มกับราคานี้",
    cheapWhy: "ตลาดคาดว่ากำไรจะโตช้าหรือมีความเสี่ยง ต้องดูว่าเพราะอะไร",
    fairWhy: "เทียบจาก P/E กับตลาดรวม (SPY)",
    check: (names: string) => `เช็กเรื่อง: ${names}`, checkWhy: "อ่านข่าวล่าสุดด้านล่าง ว่าเป็นเรื่องชั่วคราวหรือปัญหาจริง",
    weakAct: "ดูหัวข้อ “ตรวจสุขภาพธุรกิจ” ว่าไม่ผ่านข้อไหน", weakWhy: "ยังไม่พบสัญญาณว่าแย่ลง แต่พื้นฐานไม่ผ่านหลายข้อ",
    none: "ยังไม่ต้องทำอะไร", noneWhy: "ไม่พบสัญญาณเตือน · เช็กใหม่เมื่องบไตรมาสหน้าออก",
    more: (n: number) => ` และอีก ${n} เรื่อง`,
  },
  en: {
    bizStrong: "Strong business", bizOk: "Average business", bizWeak: "Weak business", bizUnknown: "Not enough data on the business",
    passed: (n: number, all: number) => `passes ${n} of ${all} health checks`,
    loss: "Loss-making, price can't be compared with earnings", priceUnknown: "No data to compare the price with the market",
    pricey: (p: number) => `${p}% pricier than the market`, cheap: (p: number) => `${p}% cheaper than the market`, fair: "Priced close to the market",
    priceyWhy: "The business has to outgrow the market for years to justify this price",
    cheapWhy: "The market expects slow growth or extra risk — find out why",
    fairWhy: "P/E compared with the whole market (SPY)",
    check: (names: string) => `Check: ${names}`, checkWhy: "Read the headlines below — temporary, or a real problem?",
    weakAct: "See which health checks fail", weakWhy: "No sign of decline, but the basics fail several checks",
    none: "Nothing to do for now", noneWhy: "No warning signs · check again when next quarter's results are out",
    more: (n: number) => ` and ${n} more`,
  },
};

/** Within ±15% of the market's P/E counts as "close to the market". */
export const FAIR_BAND = 0.15;

export function quickVerdict(d: Input, lang: "th" | "en", flagName: (key: string) => string): Verdict {
  const t = L[lang];
  const known = d.checks.filter(c => c.pass !== null), passed = known.filter(c => c.pass).length;
  const passedText = t.passed(passed, d.checks.length);
  const business: Line =
    known.length < 3 ? { tone: "neutral", text: t.bizUnknown, detail: passedText }
    : passed >= 4 ? { tone: "good", text: t.bizStrong, detail: passedText }
    : passed >= 2 ? { tone: "warn", text: t.bizOk, detail: passedText }
    : { tone: "bad", text: t.bizWeak, detail: passedText };

  const pv = d.market.peVsMarket;
  const price: Line =
    d.valuation.pe === null || d.valuation.pe <= 0 ? { tone: "neutral", text: t.loss }
    : pv === null ? { tone: "neutral", text: t.priceUnknown }
    : pv > FAIR_BAND ? { tone: "warn", text: t.pricey(Math.round(pv * 100)), detail: t.priceyWhy }
    : pv < -FAIR_BAND ? { tone: "neutral", text: t.cheap(Math.round(-pv * 100)), detail: t.cheapWhy }
    : { tone: "neutral", text: t.fair, detail: t.fairWhy };

  // Most serious flags first; name at most two so the line stays one line.
  const flags = [...d.flags].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "warn" ? -1 : 1));
  const action: Line =
    flags.length ? {
      tone: flags[0].severity === "warn" ? "bad" : "warn",
      text: t.check(flags.slice(0, 2).map(f => flagName(f.key)).join(", ") + (flags.length > 2 ? t.more(flags.length - 2) : "")),
      detail: t.checkWhy,
    }
    : business.tone === "bad" ? { tone: "warn", text: t.weakAct, detail: t.weakWhy }
    : { tone: "good", text: t.none, detail: t.noneWhy };

  return { business, price, action };
}
