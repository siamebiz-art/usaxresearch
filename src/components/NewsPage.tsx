"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TKR_CLR: Record<string, string> = {
  NVDA: "#76B900", TSLA: "#CC0000", FED: "#475569", MSFT: "#00A1F1",
  AAPL: "#555",    META: "#0867FC", AMZN: "#FF9900", GOOGL: "#4285F4",
  AMD:  "#ED1C24", CRWD: "#C1121F", NET:  "#F48120", PLTR: "#000",
  COIN: "#1652F0", JPM:  "#003087", BTC:  "#F7931A",
};

type Sentiment = "positive" | "negative" | "neutral";

type NewsItem = {
  id: number; co: string; color: string;
  headline_th: string; headline_en: string;
  body_th: string; body_en: string;
  time: string; source: string; s: Sentiment;
  tag: string;
};

const NEWS: NewsItem[] = [
  { id: 1,  co: "NVDA", color: "#76B900", s: "positive", time: "2h",  source: "Bloomberg",  tag: "AI",
    headline_th: "NVIDIA รายงานผลดีกว่าคาด รายได้พุ่ง 262% จาก AI Demand",
    headline_en: "NVIDIA beats estimates; revenue surges 262% on record AI demand",
    body_th: "NVIDIA รายงาน EPS ที่ $5.16 สูงกว่าคาดที่ $4.60 รายได้ Data Center พุ่ง 427% เป็น $22.6B",
    body_en: "NVIDIA reported EPS of $5.16 vs $4.60 estimate. Data Center revenue surged 427% to $22.6B." },
  { id: 2,  co: "TSLA", color: "#CC0000", s: "positive", time: "4h",  source: "Reuters",     tag: "Tech",
    headline_th: "Tesla เปิดตัว Robotaxi รูปแบบใหม่ นักวิเคราะห์มอง Game Changer",
    headline_en: "Tesla unveils next-gen Robotaxi; analysts see it as a market game changer",
    body_th: "Elon Musk เปิดเผยรูปแบบ Robotaxi ใหม่ มีเป้าหมายเปิดตัวเชิงพาณิชย์ ส.ค. 2024",
    body_en: "Elon Musk revealed the new Robotaxi design, targeting commercial launch in August 2024." },
  { id: 3,  co: "FED",  color: "#475569", s: "positive", time: "6h",  source: "WSJ",         tag: "Macro",
    headline_th: "Fed ส่งสัญญาณลดดอกเบี้ยปลายปีนี้ ตลาดหุ้นตอบรับบวก",
    headline_en: "Fed signals rate cut by year-end; equity markets respond positively",
    body_th: "Jerome Powell กล่าวว่าสหรัฐฯ มีความคืบหน้าในการลดเงินเฟ้อ เปิดทางลด rate ปลายปี",
    body_en: "Jerome Powell stated the US has made progress on inflation, opening the door to a rate cut." },
  { id: 4,  co: "MSFT", color: "#00A1F1", s: "positive", time: "8h",  source: "CNBC",        tag: "AI",
    headline_th: "Microsoft-OpenAI ลงทุนร่วม $100B ใน AI Data Centers ทั่วโลก",
    headline_en: "Microsoft & OpenAI commit $100B to global AI data center expansion",
    body_th: "โครงการ Stargate ขยายไปยังยุโรปและเอเชีย เพิ่มกำลังการคำนวณสำหรับ AI ขนาดใหญ่",
    body_en: "Project Stargate expands to Europe and Asia, increasing compute capacity for large-scale AI." },
  { id: 5,  co: "AAPL", color: "#555",    s: "neutral",  time: "10h", source: "FT",          tag: "Tech",
    headline_th: "Apple เปิดตัว Apple Intelligence ฟีเจอร์ AI บน iPhone 16",
    headline_en: "Apple unveils Apple Intelligence AI features for iPhone 16 lineup",
    body_th: "Apple ประกาศ AI features ใหม่บน iPhone 16 รวมถึง Siri ที่ฉลาดขึ้น และ Image Playground",
    body_en: "Apple announced new AI features for iPhone 16 including smarter Siri and Image Playground." },
  { id: 6,  co: "META", color: "#0867FC", s: "positive", time: "12h", source: "TechCrunch",  tag: "AI",
    headline_th: "Meta Llama 4 เปิดตัวทำลายสถิติ Benchmark ในทุกด้าน",
    headline_en: "Meta Llama 4 launches, breaks benchmark records across the board",
    body_th: "Llama 4 ทำคะแนน MMLU และ HumanEval สูงกว่า GPT-4o และ Claude 3.5 Sonnet",
    body_en: "Llama 4 scored higher than GPT-4o and Claude 3.5 Sonnet on MMLU and HumanEval benchmarks." },
  { id: 7,  co: "AMZN", color: "#FF9900", s: "positive", time: "14h", source: "Bloomberg",   tag: "Tech",
    headline_th: "AWS รายได้โต 17% สูงสุดในรอบ 5 ไตรมาส หนุน Amazon Cloud",
    headline_en: "AWS revenue grows 17%, highest in 5 quarters, boosting Amazon Cloud outlook",
    body_th: "AWS ทำรายได้ $25B ใน Q1 2024 โต 17% YoY กำไรจาก Cloud Segment พุ่ง 84%",
    body_en: "AWS generated $25B revenue in Q1 2024, up 17% YoY. Cloud segment profit surged 84%." },
  { id: 8,  co: "AMD",  color: "#ED1C24", s: "positive", time: "1d",  source: "Reuters",     tag: "AI",
    headline_th: "AMD MI300X ชิป AI จองเต็มหมดแล้ว รายได้ Data Center คาด $4B ปีนี้",
    headline_en: "AMD MI300X AI chips fully booked; Data Center revenue expected at $4B this year",
    body_th: "AMD MI300X ได้รับออร์เดอร์จาก Microsoft, Meta, Oracle เต็มกำลังการผลิตปี 2024",
    body_en: "AMD MI300X received orders from Microsoft, Meta, Oracle at full production capacity for 2024." },
  { id: 9,  co: "COIN", color: "#1652F0", s: "negative", time: "1d",  source: "CoinDesk",    tag: "Crypto",
    headline_th: "Coinbase เจอ SEC สอบสวนเพิ่มเติม หุ้นร่วง 5% ในชั่วโมงเดียว",
    headline_en: "Coinbase faces additional SEC investigation; stock drops 5% within an hour",
    body_th: "SEC ขยายขอบเขตการสอบสวน Coinbase ในประเด็นการจดทะเบียน Securities",
    body_en: "The SEC expanded its investigation scope into Coinbase over unregistered securities issues." },
  { id: 10, co: "BTC",  color: "#F7931A", s: "positive", time: "2d",  source: "Reuters",     tag: "Crypto",
    headline_th: "Bitcoin ETF Spot ทำสถิติ Inflow สูงสุดรายสัปดาห์ที่ $1.8B",
    headline_en: "Bitcoin Spot ETF sets record weekly inflow of $1.8B",
    body_th: "BlackRock IBIT และ Fidelity FBTC รับเงินลงทุนรวมกัน $1.8B ในสัปดาห์เดียว",
    body_en: "BlackRock IBIT and Fidelity FBTC received combined $1.8B in investments in a single week." },
];

const ALL_TAGS = ["All", "AI", "Tech", "Macro", "Crypto"];

function SentimentBadge({ s, lang }: { s: Sentiment; lang: string }) {
  const TH = lang === "th";
  const cfg = {
    positive: { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   icon: <TrendingUp size={10} />,   label_th: "บวก",   label_en: "Positive" },
    negative: { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   icon: <TrendingDown size={10} />, label_th: "ลบ",    label_en: "Negative" },
    neutral:  { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", icon: <Minus size={10} />,        label_th: "กลาง",  label_en: "Neutral"  },
  };
  const c = cfg[s];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, borderRadius: 5, padding: "2px 7px" }}>
      {c.icon}{TH ? c.label_th : c.label_en}
    </span>
  );
}

export default function NewsPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [tag,      setTag]      = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = tag === "All" ? NEWS : NEWS.filter(n => n.tag === tag);

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
          {TH ? "ข่าวสารตลาด" : "Market News"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          {TH ? "ข่าวหุ้นและตลาดที่คัดกรองด้วย AI พร้อม Sentiment Analysis" : "AI-curated stock & market news with sentiment analysis"}
        </p>
      </div>

      {/* Tag filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {ALL_TAGS.map(t => (
          <button key={t} onClick={() => setTag(t)}
            style={{ padding: "6px 16px", borderRadius: 99, border: `1.5px solid ${tag === t ? "var(--accent)" : "var(--border)"}`, background: tag === t ? "var(--accent)" : "var(--bg-card)", color: tag === t ? "#fff" : "var(--muted)", fontWeight: tag === t ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
            {t === "All" ? (TH ? "ทั้งหมด" : "All") : t}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--faint)", alignSelf: "center" }}>
          {filtered.length} {TH ? "ข่าว" : "articles"}
        </span>
      </div>

      {/* News list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((n, idx) => (
          <div key={n.id}
            onClick={() => setExpanded(expanded === n.id ? null : n.id)}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "box-shadow .14s" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px" }}>
              {/* Company badge */}
              <div style={{ width: 44, height: 44, borderRadius: 12, background: n.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                {n.co.slice(0, 4)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                  {idx === 0 && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#EF4444", background: "rgba(239,68,68,0.1)", borderRadius: 4, padding: "2px 6px", letterSpacing: 0.5, textTransform: "uppercase" }}>
                      {TH ? "ล่าสุด" : "BREAKING"}
                    </span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "rgba(37,99,235,0.08)", borderRadius: 4, padding: "2px 6px" }}>{n.tag}</span>
                  <SentimentBadge s={n.s} lang={lang} />
                  <span style={{ fontSize: 10, color: "var(--faint)", marginLeft: "auto" }}>
                    {n.source} · {n.time} {TH ? "ที่แล้ว" : "ago"}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
                  {TH ? n.headline_th : n.headline_en}
                </div>
                {expanded === n.id && (
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 8 }} className="fade-up">
                    {TH ? n.body_th : n.body_en}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: "var(--faint)" }}>
        ⚠️ {TH ? "ข้อมูลข่าวสารเพื่อการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน" : "News for educational purposes only — not investment advice."}
      </div>
    </div>
  );
}
