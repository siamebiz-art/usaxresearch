import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";
const FMP_KEY  = process.env.FMP_API_KEY!;

// Screener preset → FMP query params
const PRESETS: Record<string, Record<string, string>> = {
  dip: {
    marketCapMoreThan: "5000000000",
    betaMoreThan: "0.5",
    volumeMoreThan: "500000",
  },
  growth: {
    revenueGrowthMoreThan: "25",
    marketCapMoreThan: "10000000000",
  },
  quality: {
    returnOnEquityMoreThan: "15",
    debtToEquityLowerThan: "1",
    marketCapMoreThan: "10000000000",
  },
  breakout: {
    volumeMoreThan: "2000000",
    priceMoreThan: "10",
  },
  ai_tech: {
    sector: "Technology",
    marketCapMoreThan: "10000000000",
    revenueGrowthMoreThan: "10",
  },
  cyber: {
    sector: "Technology",
    industryLike: "Security",
  },
  dividend: {
    dividendMoreThan: "2",
    marketCapMoreThan: "5000000000",
  },
  earnings: {
    marketCapMoreThan: "5000000000",
    country: "US",
  },
  value: {
    peRatioLowerThan: "20",
    marketCapMoreThan: "5000000000",
    revenueGrowthMoreThan: "5",
  },
  megatrend: {
    marketCapMoreThan: "10000000000",
    country: "US",
  },
};

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "growth";
  const preset = PRESETS[type] ?? PRESETS.growth;

  // 1. Fetch screener results from FMP
  const params = new URLSearchParams({ ...preset, exchange: "NASDAQ,NYSE", limit: "20", apikey: FMP_KEY });
  const fmpRes = await fetch(`${FMP_BASE}/stock-screener?${params}`);
  if (!fmpRes.ok) return NextResponse.json({ error: "FMP error" }, { status: 502 });
  const stocks: any[] = await fmpRes.json();
  if (!Array.isArray(stocks) || stocks.length === 0) return NextResponse.json({ results: [] });

  // 2. Pick top 10 and fetch key stats
  const top10 = stocks.slice(0, 10);
  const tickers = top10.map((s: any) => s.symbol).join(",");

  const [quoteRes, profileRes] = await Promise.all([
    fetch(`${FMP_BASE}/quote/${tickers}?apikey=${FMP_KEY}`),
    fetch(`${FMP_BASE}/profile/${tickers}?apikey=${FMP_KEY}`),
  ]);
  const quotes:   any[] = quoteRes.ok   ? await quoteRes.json()   : [];
  const profiles: any[] = profileRes.ok ? await profileRes.json() : [];

  const quoteMap:   Record<string, any> = Object.fromEntries(quotes.map(q => [q.symbol, q]));
  const profileMap: Record<string, any> = Object.fromEntries(profiles.map(p => [p.symbol, p]));

  // 3. Compute AI Score (statistical — no buy/sell recommendation)
  function aiScore(s: any, q: any, p: any): number {
    let score = 50;
    if (q?.pe && q.pe > 0 && q.pe < 35) score += 10;
    if (s?.revenueGrowth > 20) score += 15;
    if (s?.revenueGrowth > 50) score += 10;
    if (p?.returnOnEquity > 0.15) score += 10;
    if (p?.debtToEquity < 1) score += 5;
    if (q?.priceAvg50 && q.price > q.priceAvg50) score += 5;
    if (p?.beta && p.beta < 1.5) score += 5;
    return Math.min(score, 99);
  }

  const results = top10.map((s: any) => {
    const q = quoteMap[s.symbol] ?? {};
    const p = profileMap[s.symbol] ?? {};
    return {
      ticker:  s.symbol,
      name:    s.companyName ?? p.companyName ?? s.symbol,
      price:   q.price ?? s.price ?? 0,
      change:  q.changesPercentage ? `${q.changesPercentage > 0 ? "+" : ""}${q.changesPercentage.toFixed(2)}%` : "—",
      up:      (q.changesPercentage ?? 0) >= 0,
      pe:      q.pe ? Math.round(q.pe) : null,
      rev:     s.revenueGrowth ? `+${(s.revenueGrowth * 100).toFixed(0)}%` : "—",
      cap:     s.marketCap ? `${(s.marketCap / 1e9).toFixed(0)}B` : "—",
      score:   aiScore(s, q, p),
      sector:  p.sector ?? s.sector ?? "—",
      reasons: [
        s.revenueGrowth > 0.2  ? `Rev +${(s.revenueGrowth*100).toFixed(0)}%` : null,
        p.returnOnEquity > 0.15 ? `ROE ${(p.returnOnEquity*100).toFixed(0)}%`  : null,
        p.debtToEquity < 1      ? "Low Debt"                                    : null,
        q.pe && q.pe < 25       ? `P/E ${Math.round(q.pe)}`                     : null,
      ].filter(Boolean).slice(0, 3),
    };
  });

  // Sort by AI Score desc
  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({ type, results, count: results.length });
}
