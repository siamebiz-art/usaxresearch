import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Cron: Daily US Market Brief — ส่งทุกเช้า 08:00 ICT (01:00 UTC)
// วิ่งเฉพาะ user plan pro/elite ที่เปิด telegram_enabled
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  if (!token) return NextResponse.json({ error: "No telegram token" }, { status: 500 });

  // ดึงข้อมูล US Market จาก FMP
  let marketData = "";
  try {
    const fmpKey = process.env.FMP_API_KEY!;
    const quotes = ["SPY", "QQQ", "VIX", "DXY"];
    const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/${quotes.join(",")}?apikey=${fmpKey}`);
    const data: any[] = await res.json();

    const fmt = (d: any) => {
      if (!d) return "";
      const sign  = d.changesPercentage >= 0 ? "📈" : "📉";
      const color = d.changesPercentage >= 0 ? "+" : "";
      return `${sign} ${d.symbol}: ${d.price?.toFixed(2)} (${color}${d.changesPercentage?.toFixed(2)}%)`;
    };

    const spyData  = data.find(d => d.symbol === "SPY");
    const qqqData  = data.find(d => d.symbol === "QQQ");
    const vixData  = data.find(d => d.symbol === "VIX");

    marketData = `S&P500 (SPY): $${spyData?.price?.toFixed(2)} (${spyData?.changesPercentage?.toFixed(2)}%)\nNASDAQ (QQQ): $${qqqData?.price?.toFixed(2)} (${qqqData?.changesPercentage?.toFixed(2)}%)\nVIX: ${vixData?.price?.toFixed(2)} (${vixData?.changesPercentage?.toFixed(2)}%)`;
  } catch {}

  // ดึงข่าวสำคัญ
  let newsContext = "";
  try {
    const fmpKey = process.env.FMP_API_KEY!;
    const res = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?limit=5&apikey=${fmpKey}`);
    const news: any[] = await res.json();
    newsContext = news.map(n => `- ${n.title}`).join("\n");
  } catch {}

  // สร้าง AI Market Brief ผ่าน Claude
  let brief = "";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `คุณเป็น AI วิเคราะห์ตลาดหุ้น US เชิงสถิติ ห้ามแนะนำซื้อหรือขายหุ้นโดยตรง

ข้อมูลตลาดวันนี้:
${marketData || "(ไม่มีข้อมูล)"}

ข่าวสำคัญ:
${newsContext || "(ไม่มีข้อมูล)"}

เขียน Market Brief เป็นภาษาไทย 3-4 บรรทัด สรุปภาวะตลาด ประเด็นสำคัญ และแนวโน้มเชิงสถิติที่น่าจับตา ห้ามใช้คำว่า "ซื้อ" หรือ "ขาย" หรือ "แนะนำ" ให้ข้อมูลเชิงสถิติและสังเกตการณ์เท่านั้น`
        }]
      }),
    });
    const data = await res.json();
    brief = data.content?.[0]?.text?.trim() ?? "";
  } catch {}

  const today = new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://usaxresearch.com";

  const spyLine  = marketData.split("\n")[0] ?? "";
  const qqqLine  = marketData.split("\n")[1] ?? "";
  const vixLine  = marketData.split("\n")[2] ?? "";

  const message = [
    `📊 <b>USAXresearch — Daily Market Brief</b>`,
    `📅 ${today}`,
    ``,
    `<b>US Market Overview</b>`,
    spyLine  ? `• ${spyLine}`  : "",
    qqqLine  ? `• ${qqqLine}`  : "",
    vixLine  ? `• ${vixLine}`  : "",
    ``,
    brief ? `<b>📝 AI วิเคราะห์เชิงสถิติ</b>\n${brief}` : "",
    ``,
    `⚠️ ข้อมูลเชิงสถิติเท่านั้น ไม่ใช่คำแนะนำลงทุน`,
    ``,
    `🔍 <a href="${siteUrl}/dashboard">วิเคราะห์หุ้นเชิงลึก →</a>`,
  ].filter(Boolean).join("\n");

  // ส่งให้ user ทุกคนที่ plan pro/elite + telegram_enabled
  const { data: users } = await supabase
    .from("profiles")
    .select("telegram_chat_id")
    .in("plan", ["pro", "elite"])
    .eq("telegram_enabled", true)
    .not("telegram_chat_id", "is", null);

  let sent = 0;
  for (const u of users ?? []) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: u.telegram_chat_id, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
      });
      if (res.ok) sent++;
      await new Promise(r => setTimeout(r, 50)); // rate limit
    } catch {}
  }

  return NextResponse.json({ success: true, sent, total: users?.length ?? 0 });
}
