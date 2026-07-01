import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, referred_by, trial_ends_at, plan")
    .eq("id", userId)
    .single();

  // สร้าง referral code ถ้ายังไม่มี
  let code = profile?.referral_code;
  if (!code) {
    code = `USX${userId.slice(0, 6).toUpperCase()}`;
    await supabase.from("profiles").update({ referral_code: code }).eq("id", userId);
  }

  const { data: referrals } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });

  const total     = referrals?.length ?? 0;
  const completed = referrals?.filter(r => r.status === "completed").length ?? 0;
  const pending   = referrals?.filter(r => r.status === "pending").length   ?? 0;
  const rewarded  = referrals?.filter(r => r.status === "rewarded").length  ?? 0;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://usaxresearch.com";

  return NextResponse.json({
    code,
    referralUrl: `${siteUrl}/?ref=${code}`,
    reward:      "ชวน 3 คน → ได้ Pro 1 เดือนฟรี",
    stats:       { total, completed, pending, rewarded },
    referrals:   referrals ?? [],
    trialEndsAt: profile?.trial_ends_at,
  });
}
