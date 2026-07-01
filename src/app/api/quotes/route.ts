import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

function normalizeSymbols(value: string | null) {
  return [
    ...new Set(
      String(value ?? "")
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean),
    ),
  ].slice(0, 30);
}

export async function GET(req: NextRequest) {
  const symbols = normalizeSymbols(req.nextUrl.searchParams.get("symbols"));
  if (!symbols.length) {
    return NextResponse.json({ quotes: [] });
  }

  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      const params = new URLSearchParams({ range: "1d", interval: "1m" });
      const response = await fetch(`${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?${params}`, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });
      if (!response.ok) return null;

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      const price = Number(meta?.regularMarketPrice ?? meta?.previousClose ?? 0);
      const previousClose = Number(meta?.previousClose ?? 0);
      const changePct = previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0;

      return {
        ticker: symbol,
        price,
        changePct,
      };
    }),
  );

  const validQuotes = quotes.filter((quote): quote is { ticker: string; price: number; changePct: number } => Boolean(quote && quote.price > 0));

  if (!validQuotes.length) {
    return NextResponse.json({ error: "Quote provider error", quotes: [] }, { status: 502 });
  }

  return NextResponse.json({ source: "yahoo-finance-chart", quotes: validQuotes });
}
