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

type YahooQuote = {
  ticker: string;
  price: number;
  changePct: number;
  points: Array<{ time: number; price: number }>;
};

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
      const timestamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
      const closes = Array.isArray(result?.indicators?.quote?.[0]?.close) ? result.indicators.quote[0].close : [];
      const rawPoints = closes
        .map((close: unknown, index: number) => ({
          time: Number(timestamps[index] ?? 0) * 1000,
          price: Number(close),
        }))
        .filter((point: { time: number; price: number }) => Number.isFinite(point.time) && point.time > 0 && Number.isFinite(point.price) && point.price > 0);
      const step = Math.max(1, Math.ceil(rawPoints.length / 72));
      const points = rawPoints.filter((_: { time: number; price: number }, index: number) => index % step === 0).slice(-72);

      return {
        ticker: symbol,
        price,
        changePct,
        points,
      };
    }),
  );

  const validQuotes = quotes.filter((quote): quote is YahooQuote => Boolean(quote && quote.price > 0));

  if (!validQuotes.length) {
    return NextResponse.json({ error: "Quote provider error", quotes: [] }, { status: 502 });
  }

  return NextResponse.json({ source: "yahoo-finance-chart", quotes: validQuotes });
}
