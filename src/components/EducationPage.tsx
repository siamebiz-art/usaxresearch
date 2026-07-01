"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Search } from "lucide-react";

type Category = "all"|"basic"|"technical"|"psychology"|"glossary";

type Article = {
  id: number; category: Exclude<Category,"all"|"glossary">;
  icon: string; title_th: string; title_en: string;
  body_th: string; body_en: string; readMin: number;
};

type GlossaryItem = {
  term: string; term_th: string; def_th: string; def_en: string;
};

const ARTICLES: Article[] = [
  {
    id:1, category:"basic", icon:"📊", readMin:5,
    title_th:"P/E Ratio คืออะไร และใช้อย่างไร",
    title_en:"What is P/E Ratio and How to Use It",
    body_th:`P/E Ratio (Price-to-Earnings) คืออัตราส่วนราคาหุ้นต่อกำไรต่อหุ้น เป็นตัวชี้วัดที่นักลงทุนใช้มากที่สุดในการประเมินว่าหุ้นแพงหรือถูก

**วิธีคำนวณ:**
P/E = ราคาหุ้น ÷ EPS (กำไรต่อหุ้น)

ตัวอย่าง: หุ้น AAPL ราคา $189 EPS $6.43 → P/E = 29.4x
แปลว่า: นักลงทุนยินดีจ่าย 29.4 เท่าของกำไรประจำปี

**P/E สูง vs ต่ำ:**
- P/E สูง (30x+) = ตลาดคาดการณ์การเติบโตสูง หรืออาจแพงเกินไป
- P/E ต่ำ (15x-) = หุ้น Value หรือธุรกิจมีปัญหา

**ข้อจำกัด:** ใช้เปรียบเทียบในกลุ่มอุตสาหกรรมเดียวกันเท่านั้น เทคโนโลยีมักมี P/E สูงกว่าธนาคาร`,
    body_en:`P/E Ratio (Price-to-Earnings) is the ratio of a stock's price to its earnings per share — the most widely used metric for evaluating whether a stock is cheap or expensive.

**Calculation:**
P/E = Stock Price ÷ EPS (Earnings Per Share)

Example: AAPL at $189 with EPS $6.43 → P/E = 29.4x
This means: investors pay 29.4x the annual earnings.

**High vs Low P/E:**
- High P/E (30x+) = market expects high growth, or stock may be overvalued
- Low P/E (15x-) = value stock, or business may have issues

**Limitation:** Only compare P/E within the same industry sector. Tech typically has higher P/E than banking.`,
  },
  {
    id:2, category:"basic", icon:"💵", readMin:4,
    title_th:"EPS คืออะไร ทำไมถึงสำคัญ",
    title_en:"What is EPS and Why It Matters",
    body_th:`EPS (Earnings Per Share) คือกำไรต่อหุ้น คำนวณจากกำไรสุทธิหารด้วยจำนวนหุ้นทั้งหมด

**สูตร:** EPS = กำไรสุทธิ ÷ จำนวนหุ้น

**Trailing EPS:** กำไรจริงย้อนหลัง 12 เดือน
**Forward EPS:** กำไรที่นักวิเคราะห์คาดการณ์

**EPS Beat = ดีสำหรับราคาหุ้น**
เมื่อบริษัทรายงาน EPS สูงกว่าที่นักวิเคราะห์คาด เรียกว่า "Beat" มักทำให้ราคาหุ้นขึ้น

**EPS Miss = ราคาอาจลง**
ตรงกันข้าม หาก EPS ต่ำกว่าคาด ราคาหุ้นมักร่วงลง แม้ว่ากำไรจะเป็นบวก`,
    body_en:`EPS (Earnings Per Share) is the net profit per share, calculated by dividing net income by total shares outstanding.

**Formula:** EPS = Net Income ÷ Shares Outstanding

**Trailing EPS:** Actual earnings from the past 12 months
**Forward EPS:** Analyst-estimated future earnings

**EPS Beat = Good for stock price**
When a company reports EPS above analyst estimates (a "beat"), the stock price usually rises.

**EPS Miss = Price may fall**
Conversely, if EPS misses estimates, the stock often drops even if earnings are positive.`,
  },
  {
    id:3, category:"basic", icon:"🏢", readMin:6,
    title_th:"Market Cap คืออะไร ต่างจาก Revenue อย่างไร",
    title_en:"Market Cap vs Revenue — What's the Difference",
    body_th:`Market Cap (Market Capitalization) = มูลค่าตลาดรวม = ราคาหุ้น × จำนวนหุ้นทั้งหมด

**ขนาดของบริษัท:**
- Mega Cap: $1T+ (AAPL, MSFT, NVDA)
- Large Cap: $10B–$1T
- Mid Cap: $2B–$10B
- Small Cap: $300M–$2B

**Revenue ≠ Market Cap**
Revenue คือรายได้จากการขาย ส่วน Market Cap คือสิ่งที่ตลาดประเมินมูลค่าบริษัททั้งหมด

ตัวอย่าง: NVDA Revenue $80B/ปี แต่ Market Cap $2.7T
แปลว่านักลงทุนจ่ายเกือบ 34x ของรายได้ประจำปี เพราะคาดการณ์การเติบโตสูงในอนาคต`,
    body_en:`Market Cap = Total Market Value = Stock Price × Total Shares Outstanding

**Company size categories:**
- Mega Cap: $1T+ (AAPL, MSFT, NVDA)
- Large Cap: $10B–$1T
- Mid Cap: $2B–$10B
- Small Cap: $300M–$2B

**Revenue ≠ Market Cap**
Revenue is income from sales, while Market Cap is what the entire market values the company at.

Example: NVDA Revenue $80B/year but Market Cap $2.7T
This means investors pay ~34x annual revenue because they expect very high future growth.`,
  },
  {
    id:4, category:"technical", icon:"📈", readMin:7,
    title_th:"Moving Average: SMA vs EMA คืออะไร",
    title_en:"Moving Average: SMA vs EMA Explained",
    body_th:`Moving Average (MA) คือเส้นค่าเฉลี่ยเคลื่อนที่ ใช้ดูแนวโน้มราคาหุ้น

**SMA (Simple Moving Average):** ค่าเฉลี่ยราคาปิดในช่วงเวลาที่กำหนด
- SMA 50 วัน = ค่าเฉลี่ย 50 วันล่าสุด
- SMA 200 วัน = แนวโน้มระยะยาว

**EMA (Exponential Moving Average):** ให้น้ำหนักวันล่าสุดมากกว่า ตอบสนองเร็วกว่า SMA

**Golden Cross (สัญญาณซื้อ):**
เมื่อ SMA 50 ตัดขึ้นเหนือ SMA 200 = สัญญาณบวกระยะยาว

**Death Cross (สัญญาณขาย):**
เมื่อ SMA 50 ตัดลงใต้ SMA 200 = สัญญาณลบระยะยาว

ข้อจำกัด: MA เป็น Lagging Indicator ตามหลังราคา ไม่ได้ทำนายอนาคต`,
    body_en:`Moving Average (MA) is an average of past prices used to identify stock trends.

**SMA (Simple Moving Average):** Average of closing prices over a set period
- 50-day SMA = Average of last 50 closing prices
- 200-day SMA = Long-term trend indicator

**EMA (Exponential Moving Average):** Weights recent days more heavily, responds faster than SMA

**Golden Cross (Buy Signal):**
When the 50-day SMA crosses above the 200-day SMA = long-term bullish signal

**Death Cross (Sell Signal):**
When the 50-day SMA crosses below the 200-day SMA = long-term bearish signal

Limitation: MA is a Lagging Indicator — it follows price, not predict it.`,
  },
  {
    id:5, category:"technical", icon:"🕯️", readMin:8,
    title_th:"RSI คืออะไร และอ่านค่าอย่างไร",
    title_en:"RSI — What Is It and How to Read It",
    body_th:`RSI (Relative Strength Index) คือดัชนีวัดความเร็วและขนาดของการเปลี่ยนแปลงราคา คิดค้นโดย J. Welles Wilder Jr.

**ค่า RSI อยู่ระหว่าง 0–100:**
- RSI > 70 = Overbought (ซื้อมาเกินไป) อาจปรับลง
- RSI < 30 = Oversold (ขายมาเกินไป) อาจฟื้นตัว
- RSI = 50 = จุดกึ่งกลาง ไม่มีแนวโน้มชัด

**Divergence:**
- Bullish Divergence: ราคาทำ Low ใหม่ แต่ RSI ไม่ทำ = สัญญาณกลับตัวขึ้น
- Bearish Divergence: ราคาทำ High ใหม่ แต่ RSI ไม่ทำ = สัญญาณกลับตัวลง

ข้อจำกัด: ในตลาด Trending แรง RSI อาจอยู่ Overbought นานมาก เช่น NVDA ปี 2023`,
    body_en:`RSI (Relative Strength Index) measures the speed and magnitude of price changes, developed by J. Welles Wilder Jr.

**RSI values range 0–100:**
- RSI > 70 = Overbought — may pull back
- RSI < 30 = Oversold — may recover
- RSI = 50 = Neutral, no clear trend

**Divergence:**
- Bullish Divergence: price makes new low but RSI doesn't = potential reversal up
- Bearish Divergence: price makes new high but RSI doesn't = potential reversal down

Limitation: In strong trending markets, RSI can stay Overbought for extended periods — e.g., NVDA in 2023.`,
  },
  {
    id:6, category:"psychology", icon:"🧠", readMin:5,
    title_th:"FOMO และ FUD: ศัตรูของนักลงทุน",
    title_en:"FOMO and FUD: The Investor's Worst Enemies",
    body_th:`**FOMO (Fear Of Missing Out)**
ความกลัวที่จะพลาดโอกาส ทำให้ซื้อหุ้นเมื่อราคาขึ้นแรงและดึงดูดความสนใจ ซึ่งมักเป็นจุดสูงสุด

อาการ: ซื้อเพราะเห็นคนอื่นกำไร ไม่ได้วิเคราะห์เอง ซื้อในราคาที่แพงเกินจริง

**FUD (Fear, Uncertainty, Doubt)**
ความกลัว ความไม่แน่ใจ และความสงสัย มักทำให้ขายหุ้นดีในราคาต่ำเกินไปเมื่อตลาดตื่นตระหนก

**วิธีแก้:**
- ตั้ง Investment Thesis ก่อนซื้อทุกครั้ง
- กำหนด Stop Loss และ Target Price ล่วงหน้า
- อ่านงบการเงิน ไม่ใช่ Social Media
- Zoom Out ดูภาพใหญ่เสมอ`,
    body_en:`**FOMO (Fear Of Missing Out)**
The fear of missing opportunities leads to buying stocks when prices surge and attract attention — which is often the peak.

Symptoms: buying because others are profiting, no independent analysis, overpaying for stocks.

**FUD (Fear, Uncertainty, Doubt)**
Fear, uncertainty, and doubt cause investors to sell good stocks at low prices during market panic.

**How to overcome:**
- Define your Investment Thesis before every buy
- Set Stop Loss and Target Price in advance
- Read financial statements, not social media
- Always zoom out to see the big picture`,
  },
  {
    id:7, category:"psychology", icon:"⚖️", readMin:4,
    title_th:"Dollar-Cost Averaging (DCA) คืออะไร",
    title_en:"What is Dollar-Cost Averaging (DCA)",
    body_th:`DCA คือการลงทุนเป็นจำนวนเงินเท่าๆ กันในช่วงเวลาที่สม่ำเสมอ ไม่ว่าราคาหุ้นจะอยู่ที่ระดับใด

**ตัวอย่าง:** ซื้อ NVDA $500 ทุกเดือน
- เดือน 1: ราคา $1,000 → ได้ 0.5 หุ้น
- เดือน 2: ราคา $800 → ได้ 0.625 หุ้น
- เดือน 3: ราคา $1,200 → ได้ 0.417 หุ้น

ผลลัพธ์: ซื้อหุ้นได้เฉลี่ยราคาต่ำกว่าการซื้อครั้งเดียว

**ข้อดี:**
- ลดความเสี่ยงการ Timing ผิดพลาด
- สร้างวินัยการลงทุนสม่ำเสมอ
- เหมาะสำหรับนักลงทุนระยะยาว

**ข้อจำกัด:** ไม่เหมาะกับหุ้นที่แย่ลงเรื่อยๆ`,
    body_en:`DCA is investing a fixed amount of money at regular intervals, regardless of stock price levels.

**Example:** Buy $500 of NVDA every month
- Month 1: $1,000 → get 0.5 shares
- Month 2: $800 → get 0.625 shares
- Month 3: $1,200 → get 0.417 shares

Result: average purchase price lower than buying all at once.

**Advantages:**
- Reduces risk of poor market timing
- Builds consistent investment discipline
- Ideal for long-term investors

**Limitation:** Not suitable for stocks in a sustained downtrend.`,
  },
];

const GLOSSARY: GlossaryItem[] = [
  { term:"ATH",           term_th:"All-Time High",          def_th:"ราคาสูงสุดในประวัติศาสตร์ของหุ้น",                                            def_en:"The highest price a stock has ever reached in its history" },
  { term:"Bull Market",   term_th:"ตลาดกระทิง",             def_th:"ภาวะตลาดที่ราคาหุ้นโดยรวมปรับขึ้นเกิน 20% จากจุดต่ำสุด",                    def_en:"Market condition where prices rise 20%+ from recent lows" },
  { term:"Bear Market",   term_th:"ตลาดหมี",                def_th:"ภาวะตลาดที่ราคาหุ้นโดยรวมลดลงเกิน 20% จากจุดสูงสุด",                        def_en:"Market condition where prices fall 20%+ from recent highs" },
  { term:"EPS",           term_th:"กำไรต่อหุ้น",           def_th:"กำไรสุทธิหารด้วยจำนวนหุ้นทั้งหมด",                                           def_en:"Net income divided by total shares outstanding" },
  { term:"P/E Ratio",     term_th:"อัตราส่วนราคาต่อกำไร",  def_th:"ราคาหุ้นหารด้วย EPS ใช้ประเมินว่าหุ้นแพงหรือถูก",                           def_en:"Stock price divided by EPS, used to assess valuation" },
  { term:"Market Cap",    term_th:"มูลค่าตลาด",             def_th:"ราคาหุ้นคูณด้วยจำนวนหุ้นทั้งหมด บอกขนาดบริษัท",                             def_en:"Stock price × total shares; indicates company size" },
  { term:"Dividend",      term_th:"เงินปันผล",              def_th:"เงินที่บริษัทแบ่งกำไรให้ผู้ถือหุ้น มักจ่ายรายไตรมาส",                       def_en:"Cash distributed to shareholders, typically quarterly" },
  { term:"Short Selling", term_th:"การขายชอร์ต",            def_th:"กู้หุ้นมาขายก่อน แล้วซื้อคืนทีหลังเมื่อราคาลง เพื่อทำกำไรจากการลง",        def_en:"Borrowing shares to sell, buying back later at lower prices" },
  { term:"IPO",           term_th:"การเสนอขายหุ้น IPO",    def_th:"Initial Public Offering การนำบริษัทเข้าตลาดหลักทรัพย์เป็นครั้งแรก",          def_en:"Initial Public Offering — first time a company sells shares publicly" },
  { term:"Hedge",         term_th:"การป้องกันความเสี่ยง",   def_th:"การใช้ตราสารอื่น (เช่น Option) เพื่อลดความเสี่ยงของพอร์ตลงทุน",             def_en:"Using instruments like options to reduce portfolio risk" },
  { term:"Beta",          term_th:"ค่าเบต้า",               def_th:"ความผันผวนของหุ้นเทียบกับตลาด Beta>1 ผันผวนมากกว่า Beta<1 ผันผวนน้อยกว่า", def_en:"Stock volatility vs market. Beta>1 more volatile; Beta<1 less volatile" },
  { term:"ROE",           term_th:"ผลตอบแทนส่วนทุน",       def_th:"กำไรสุทธิหารด้วยส่วนทุนของผู้ถือหุ้น บอกว่าบริษัทใช้ทุนได้มีประสิทธิภาพแค่ไหน", def_en:"Net income ÷ shareholder equity; measures how efficiently capital is used" },
  { term:"EBITDA",        term_th:"กำไรก่อนหักดอกเบี้ย ภาษี ค่าเสื่อม", def_th:"กำไรก่อนหัก Interest Tax Depreciation Amortization ใช้เปรียบเทียบธุรกิจ", def_en:"Earnings before Interest, Taxes, Depreciation & Amortization — used for comparison" },
  { term:"Free Cash Flow",term_th:"กระแสเงินสดอิสระ",      def_th:"เงินสดที่เหลือหลังหักค่าใช้จ่ายและการลงทุน สำคัญกว่า Net Income ในหลายกรณี", def_en:"Cash remaining after expenses and capex — often more important than net income" },
  { term:"ARR",           term_th:"รายได้ประจำปีแบบต่อเนื่อง", def_th:"Annual Recurring Revenue รายได้ SaaS ที่คาดว่าจะได้รับต่อปี",             def_en:"Annual Recurring Revenue — expected yearly SaaS income" },
];

const CAT_LABELS: Record<Category, { th:string; en:string; icon:string }> = {
  all:        { th:"ทั้งหมด",       en:"All",          icon:"📚" },
  basic:      { th:"พื้นฐาน",      en:"Fundamentals", icon:"📊" },
  technical:  { th:"เทคนิคัล",     en:"Technical",    icon:"📈" },
  psychology: { th:"จิตวิทยา",     en:"Psychology",   icon:"🧠" },
  glossary:   { th:"ศัพท์",        en:"Glossary",     icon:"📖" },
};

export default function EducationPage({ lang }: { lang: string }) {
  const TH = lang==="th";
  const [cat, setCat]       = useState<Category>("all");
  const [expanded, setExp]  = useState<number|null>(null);
  const [query, setQuery]   = useState("");

  const articles = cat==="glossary" ? [] :
    ARTICLES.filter(a=> (cat==="all"||a.category===cat) &&
      (query===""||((TH?a.title_th:a.title_en).toLowerCase().includes(query.toLowerCase()))));

  const glossary = cat==="all"||cat==="glossary"
    ? GLOSSARY.filter(g=> query===""||g.term.toLowerCase().includes(query.toLowerCase())||g.term_th.includes(query))
    : [];

  return (
    <div className="fade-up">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--text)", margin:0 }}>
          {TH?"คู่มือนักลงทุน":"Investor Education"}
        </h1>
        <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>
          {TH?"เรียนรู้การลงทุนหุ้นสหรัฐฯ สำหรับนักลงทุนไทย":"Learn US stock investing — tailored for Thai investors"}
        </p>
      </div>

      {/* Search + Tabs */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--faint)", pointerEvents:"none" }}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={TH?"ค้นหาบทความ หรือ ศัพท์...":"Search articles or terms..."}
            style={{ width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"9px 12px 9px 34px", color:"var(--text)", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div style={{ display:"flex", gap:4, background:"var(--bg-raised)", borderRadius:11, padding:3 }}>
          {(Object.keys(CAT_LABELS) as Category[]).map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{ padding:"6px 14px", borderRadius:8, border:"none", background:cat===c?"var(--bg-card)":"transparent", color:cat===c?"var(--text)":"var(--muted)", fontWeight:cat===c?700:400, fontSize:12, cursor:"pointer", boxShadow:cat===c?"var(--shadow)":"none", whiteSpace:"nowrap" }}>
              {CAT_LABELS[c].icon} {TH?CAT_LABELS[c].th:CAT_LABELS[c].en}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      {articles.length>0 && (
        <div style={{ marginBottom:20 }}>
          {cat==="all"&&<div style={{ fontSize:11, fontWeight:700, color:"var(--faint)", textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>{TH?"บทความ":"Articles"}</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {articles.map(a=>(
              <div key={a.id} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
                <div onClick={()=>setExp(expanded===a.id?null:a.id)}
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", cursor:"pointer", transition:"background .12s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-raised)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <span style={{ fontSize:24, flexShrink:0 }}>{a.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{TH?a.title_th:a.title_en}</div>
                    <div style={{ fontSize:11, color:"var(--faint)", marginTop:3 }}>
                      {CAT_LABELS[a.category].icon} {TH?CAT_LABELS[a.category].th:CAT_LABELS[a.category].en} · {a.readMin} {TH?"นาที":"min read"}
                    </div>
                  </div>
                  <div style={{ color:"var(--faint)", flexShrink:0 }}>{expanded===a.id?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</div>
                </div>
                {expanded===a.id&&(
                  <div style={{ padding:"0 18px 18px 58px", borderTop:"1px solid var(--border)", paddingTop:14 }} className="fade-up">
                    <div style={{ fontSize:13, color:"var(--muted)", lineHeight:2, whiteSpace:"pre-line" }}>
                      {TH?a.body_th:a.body_en}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Glossary */}
      {glossary.length>0&&(
        <div>
          {cat==="all"&&<div style={{ fontSize:11, fontWeight:700, color:"var(--faint)", textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>{TH?"ศัพท์การลงทุน":"Glossary"}</div>}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
            {glossary.map((g,i)=>(
              <div key={g.term}
                style={{ display:"grid", gridTemplateColumns:"120px 1fr", gap:14, padding:"13px 18px", borderBottom:i<glossary.length-1?"1px solid var(--border)":"none", transition:"background .12s" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-raised)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:"var(--accent)" }}>{g.term}</div>
                  <div style={{ fontSize:10, color:"var(--faint)", marginTop:1 }}>{g.term_th}</div>
                </div>
                <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.7 }}>
                  {TH?g.def_th:g.def_en}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {articles.length===0&&glossary.length===0&&(
        <div style={{ textAlign:"center", padding:"60px 24px", color:"var(--faint)" }}>
          <BookOpen size={36} style={{ marginBottom:12 }}/>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--muted)" }}>{TH?"ไม่พบผลลัพธ์":"No results found"}</div>
        </div>
      )}
    </div>
  );
}
