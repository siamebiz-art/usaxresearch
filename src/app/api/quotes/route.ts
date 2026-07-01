import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";
const FMP_KEY = process.env.FMP_API_KEY;

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
  if (!FMP_KEY) {
    return NextResponse.json({ error: "FMP_API_KEY is not configured", quotes: [] }, { status: 503 });
  }

  const symbols = normalizeSymbols(req.nextUrl.searchParams.get("symbols"));
  if (!symbols.length) {
    return NextResponse.json({ quotes: [] });
  }

  const response = await fetch(`${FMP_BASE}/quote/${symbols.join(",")}?apikey=${FMP_KEY}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "FMP quote error", quotes: [] }, { status: 502 });
  }

  const data = await response.json();
  const source = Array.isArray(data) ? data : [];
  const quotes = source.map((quote: any) => ({
    ticker: quote.symbol,
    price: Number(quote.price ?? 0),
    changePct: Number(quote.changesPercentage ?? 0),
  }));

  return NextResponse.json({ quotes });
}
