import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Cron: เช็ค trial หมดอายุ — เรียกทุกวัน 00:00 UTC
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date().toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://usaxresearch.com";

  // หา user trial หมดอายุ
  const { data: expired } = await supabase
    .from("profiles")
    .select("id, telegram_chat_id, display_name, trial_ends_at")
    .in("trial_type", ["free_trial", "referral"])
    .lt("trial_ends_at", now)
    .eq("plan", "pro");

  for (const user of expired ?? []) {
    await supabase.from("profiles").update({ plan: "free", trial_type: "expired" }).eq("id", user.id);
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN!;
      if (token && user.telegram_chat_id) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: user.telegram_chat_id,
            text: `⏰ <b>Trial ของคุณหมดอายุแล้ว</b>\n\nขอบคุณที่ทดลองใช้ USAXresearch Pro!\nหากต้องการใช้ต่อ สมัคร Pro เพียง <b>฿299/เดือน</b>\n\n<a href="${siteUrl}/dashboard">Upgrade Pro →</a>`,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });
      }
    } catch {}
  }

  // แจ้งเตือนล่วงหน้า 2 วัน
  const twoDaysLater = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const { data: soon } = await supabase
    .from("profiles")
    .select("id, telegram_chat_id, trial_ends_at")
    .in("trial_type", ["free_trial", "referral"])
    .gt("trial_ends_at", now)
    .lt("trial_ends_at", twoDaysLater)
    .eq("plan", "pro");

  for (const user of soon ?? []) {
    try {
      const daysLeft = Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000);
      const token = process.env.TELEGRAM_BOT_TOKEN!;
      if (token && user.telegram_chat_id) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: user.telegram_chat_id,
            text: `⚠️ <b>Trial ใกล้หมดอายุ!</b>\n\nTrial Pro ของคุณจะหมดใน <b>${daysLeft} วัน</b>\n\n<a href="${siteUrl}/dashboard">Upgrade Pro ฿299/เดือน →</a>`,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });
      }
    } catch {}
  }

  return NextResponse.json({ success: true, expired: (expired ?? []).length, expiringSoon: (soon ?? []).length });
}
