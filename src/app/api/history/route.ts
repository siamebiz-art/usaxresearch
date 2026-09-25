import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

// Full daily history for one ticker, as dividend/split-adjusted closes.
// Used by the DCA vs Buy-the-Dip backtest (src/lib/backtest.ts).
export async function GET(req: NextRequest) {
  const ticker = String(req.nextUrl.searchParams.get("ticker") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9.^=-]{1,12}$/.test(ticker)) {
    return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
  }

  const params = new URLSearchParams({ period1: "0", period2: String(Math.floor(Date.now() / 1000)), interval: "1d", events: "div,splits" });
  const response = await fetch(`${YAHOO_CHART_BASE}/${encodeURIComponent(ticker)}?${params}`, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    return NextResponse.json({ error: response.status === 404 ? "Ticker not found" : "History provider error" }, { status: response.status === 404 ? 404 : 502 });
  }

  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const timestamps: number[] = Array.isArray(result?.timestamp) ? result.timestamp : [];
  const adj: unknown[] = result?.indicators?.adjclose?.[0]?.adjclose ?? [];

  const dates: string[] = [];
  const prices: number[] = [];
  timestamps.forEach((t, i) => {
    const p = Number(adj[i]);
    if (!Number.isFinite(p) || p <= 0) return;
    // Yahoo stamps daily bars at the US open (13:30/14:30 UTC) → the UTC date is the trading date.
    const d = new Date(t * 1000).toISOString().slice(0, 10);
    if (dates.length && dates[dates.length - 1] === d) { prices[prices.length - 1] = p; return; }
    dates.push(d);
    prices.push(Number(p.toFixed(4)));
  });

  if (dates.length < 300) {
    return NextResponse.json({ error: "Not enough history" }, { status: 404 });
  }

  return NextResponse.json(
    { ticker, name: result?.meta?.longName ?? result?.meta?.shortName ?? ticker, source: "yahoo-finance-adjclose", dates, prices },
    { headers: { "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400" } },
  );
}
