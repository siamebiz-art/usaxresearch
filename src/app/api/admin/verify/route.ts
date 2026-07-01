import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASS = process.env.ADMIN_PASS ?? "usax2024admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (password === ADMIN_PASS) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
