import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { userId, code } = await req.json();
  if (!userId || !code) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const res   = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=50`);
  const data  = await res.json();

  if (!data.ok) return NextResponse.json({ error: "Telegram error" }, { status: 500 });

  const match = data.result?.find((u: any) => u.message?.text?.trim() === `/connect ${code}`);
  if (!match)  return NextResponse.json({ error: "ไม่พบ code กรุณาส่ง code ใน Telegram Bot ก่อน" }, { status: 404 });

  const chatId = String(match.message.chat.id);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ telegram_chat_id: chatId, telegram_enabled: true })
    .eq("id", userId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://usaxresearch.com";
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ <b>เชื่อมต่อ USAXresearch สำเร็จ!</b>\n\n📊 คุณจะได้รับ:\n• แจ้งเตือน AI Score หุ้นที่เปลี่ยนแปลงสำคัญ\n• Daily Market Brief ทุกเช้า\n• แจ้งเตือน Earnings สำคัญ\n\n🔗 <a href="${siteUrl}/dashboard">เปิด Dashboard →</a>`,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  return NextResponse.json({ success: true, chatId });
}
