import { NextResponse, type NextRequest } from "next/server";

// The full app is closed (its Supabase project was deleted 2026-07-29, so login can't work).
// Only the public backtest stays open; every other page goes to it.
// To reopen the full app, set FULL_APP=1 in the environment.
const OPEN = [/^\/backtest\/?$/, /^\/api\/history$/, /^\/[\w.-]+\.(png|svg|ico|txt|webmanifest)$/];

export function proxy(request: NextRequest) {
  if (process.env.FULL_APP === "1") return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (OPEN.some(re => re.test(pathname))) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  return NextResponse.redirect(new URL("/backtest", request.url), 307);
}

export const config = {
  // Checked in code above — a path-based matcher misses prerendered pages.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
