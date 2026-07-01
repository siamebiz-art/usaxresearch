import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { userId, plan, amount, method, slipUrl, aiResult } = await req.json();
  if (!userId || !plan) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const { data, error } = await supabase.from("payments").insert({
    user_id:     userId,
    plan,
    amount,
    method,
    slip_url:    slipUrl,
    ai_verified: aiResult?.valid ?? false,
    ai_result:   aiResult,
    status:      "pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // แจ้ง Admin ผ่าน Telegram
  try {
    const token       = process.env.TELEGRAM_BOT_TOKEN!;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID!;
    if (token && adminChatId) {
      const planLabels: Record<string, string> = {
        pro: "Pro ฿299/เดือน", elite: "Elite ฿799/เดือน",
        pro_annual: "Pro ฿2,990/ปี", elite_annual: "Elite ฿7,990/ปี",
      };
      const msg = [
        `💰 <b>USAXresearch — Payment ใหม่</b>`,
        ``,
        `📦 Plan: <b>${planLabels[plan] ?? plan.toUpperCase()}</b>`,
        `💳 วิธี: <b>${method === "promptpay" ? "PromptPay QR" : "บัตรเครดิต"}</b>`,
        `🤖 AI ตรวจสลิป: <b>${aiResult?.valid ? "✅ ผ่าน" : "❌ ไม่ผ่าน / ยังไม่ตรวจ"}</b>`,
        aiResult?.amount ? `💵 ยอดที่อ่านได้: ฿${aiResult.amount}` : "",
        ``,
        `🔗 <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://usaxresearch.com"}/admin">เข้า Admin อนุมัติ</a>`,
      ].filter(Boolean).join("\n");

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: adminChatId, text: msg, parse_mode: "HTML", disable_web_page_preview: true }),
      });

      if (slipUrl) {
        await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: adminChatId, photo: slipUrl, caption: `สลิป ${plan.toUpperCase()} ฿${amount}` }),
        });
      }
    }
  } catch {}

  return NextResponse.json({ success: true, paymentId: data.id });
}
