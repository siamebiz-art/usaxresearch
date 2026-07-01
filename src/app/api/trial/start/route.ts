import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("plan, trial_type").eq("id", userId).single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (profile.trial_type === "free_trial" || profile.plan === "pro" || profile.plan === "elite") {
    return NextResponse.json({ error: "Already used trial or already pro" }, { status: 400 });
  }

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("profiles").update({
    plan: "pro",
    trial_ends_at:    trialEndsAt,
    trial_started_at: new Date().toISOString(),
    trial_type:       "free_trial",
  }).eq("id", userId);

  // แจ้ง Admin
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN!;
    const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID!;
    if (token && adminId) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminId,
          text: `🎁 <b>USAXresearch — Free Trial เริ่มแล้ว</b>\n\nUser: ${userId.slice(0,12)}...\nTrial Pro 14 วัน\nหมดอายุ: ${new Date(trialEndsAt).toLocaleDateString("th-TH")}`,
          parse_mode: "HTML",
        }),
      });
    }
  } catch {}

  return NextResponse.json({ success: true, trialEndsAt });
}
