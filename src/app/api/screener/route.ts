import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote";

const UNIVERSES: Record<string, string[]> = {
  dip: ["GOOG", "PYPL", "ADBE", "TSLA", "SQ", "BRK-B", "DIS", "NKE", "INTC", "SBUX", "CRM", "SHOP"],
  growth: ["NVDA", "META", "CRWD", "SNOW", "PLTR", "UBER", "DDOG", "NET", "MDB", "SHOP", "NOW", "PANW"],
  quality: ["MSFT", "AAPL", "V", "MA", "COST", "AVGO", "GOOG", "META", "ADBE", "ORCL", "ACN", "INTU"],
  breakout: ["NVDA", "META", "UBER", "AVGO", "CRWD", "AMD", "PANW", "NOW", "NFLX", "AMZN", "ANET", "ARM"],
  ai_tech: ["NVDA", "MSFT", "AVGO", "TSM", "AMD", "ORCL", "ARM", "SMCI", "MU", "PLTR", "GOOG", "META"],
  cyber: ["CRWD", "ZS", "PANW", "FTNT", "NET", "S", "OKTA", "CHKP", "GEN", "TENB", "QLYS", "VRNS"],
  dividend: ["JNJ", "KO", "PG", "ABBV", "XOM", "CVX", "PEP", "MCD", "WMT", "T", "VZ", "HD"],
  earnings: ["NVDA", "META", "AMZN", "MSFT", "GOOG", "AVGO", "NFLX", "CRM", "ORCL", "COST", "ADBE", "AMD"],
  value: ["GOOG", "BRK-B", "PYPL", "V", "JPM", "BAC", "DIS", "CVX", "XOM", "INTC", "PFE", "CMCSA"],
  megatrend: ["NVDA", "TSLA", "ENPH", "PLTR", "MSFT", "GOOG", "AMZN", "TSM", "NEE", "FSLR", "CRWD", "PANW"],
};

type YahooQuote = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  trailingPE?: number;
  forwardPE?: number;
  marketCap?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  dividendYield?: number;
};

function formatCap(value?: number) {
  if (!Number.isFinite(value) || !value) return "—";
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
  return `${(value / 1e6).toFixed(0)}M`;
}

function formatPct(value?: number) {
  if (!Number.isFinite(value)) return "—";
  return `${value! >= 0 ? "+" : ""}${value!.toFixed(2)}%`;
}

function scoreQuote(type: string, quote: YahooQuote) {
  const price = Number(quote.regularMarketPrice ?? 0);
  const changePct = Number(quote.regularMarketChangePercent ?? 0);
  const pe = Number(quote.trailingPE ?? quote.forwardPE ?? 0);
  const marketCap = Number(quote.marketCap ?? 0);
  const volume = Number(quote.regularMarketVolume ?? 0);
  const avgVolume = Number(quote.averageDailyVolume3Month ?? 0);
  const above50 = price > 0 && Number(quote.fiftyDayAverage ?? 0) > 0 && price > Number(quote.fiftyDayAverage);
  const above200 = price > 0 && Number(quote.twoHundredDayAverage ?? 0) > 0 && price > Number(quote.twoHundredDayAverage);
  const volumeRatio = avgVolume > 0 ? volume / avgVolume : 0;
  const dividendYield = Number(quote.dividendYield ?? 0);

  let score = 55;
  if (marketCap > 10e9) score += 5;
  if (marketCap > 100e9) score += 5;
  if (changePct > 0) score += Math.min(10, changePct * 2);
  if (above50) score += 8;
  if (above200) score += 8;
  if (volumeRatio > 1) score += 5;
  if (pe > 0 && pe < 35) score += 7;

  if (type === "value" && pe > 0 && pe < 25) score += 10;
  if (type === "dividend" && dividendYield > 0.02) score += 14;
  if (type === "breakout" && changePct > 1 && above50) score += 10;
  if (type === "growth" && changePct > 0.5 && above50) score += 8;
  if (type === "dip" && price > 0 && quote.fiftyDayAverage && price < quote.fiftyDayAverage) score += 8;

  return Math.max(1, Math.min(99, Math.round(score)));
}

function reasonsFor(type: string, quote: YahooQuote) {
  const price = Number(quote.regularMarketPrice ?? 0);
  const pe = Number(quote.trailingPE ?? quote.forwardPE ?? 0);
  const changePct = Number(quote.regularMarketChangePercent ?? 0);
  const volume = Number(quote.regularMarketVolume ?? 0);
  const avgVolume = Number(quote.averageDailyVolume3Month ?? 0);
  const volumeRatio = avgVolume > 0 ? volume / avgVolume : 0;
  const fiftyDay = Number(quote.fiftyDayAverage ?? 0);
  const twoHundredDay = Number(quote.twoHundredDayAverage ?? 0);
  const dividendYield = Number(quote.dividendYield ?? 0);

  const reasons = [
    changePct > 0 ? `1D ${formatPct(changePct)}` : null,
    price > 0 && fiftyDay > 0 && price > fiftyDay ? "Above 50D" : null,
    price > 0 && twoHundredDay > 0 && price > twoHundredDay ? "Above 200D" : null,
    volumeRatio > 1 ? `Vol ${volumeRatio.toFixed(1)}x` : null,
    pe > 0 && pe < 25 ? `P/E ${Math.round(pe)}` : null,
    type === "dividend" && dividendYield > 0 ? `Yield ${(dividendYield * 100).toFixed(1)}%` : null,
  ].filter(Boolean) as string[];

  return reasons.slice(0, 3);
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "growth";
  const symbols = UNIVERSES[type] ?? UNIVERSES.growth;
  const params = new URLSearchParams({
    symbols: symbols.join(","),
    fields: [
      "symbol",
      "shortName",
      "longName",
      "regularMarketPrice",
      "regularMarketChangePercent",
      "trailingPE",
      "forwardPE",
      "marketCap",
      "regularMarketVolume",
      "averageDailyVolume3Month",
      "fiftyDayAverage",
      "twoHundredDayAverage",
      "dividendYield",
    ].join(","),
  });

  const response = await fetch(`${YAHOO_QUOTE_URL}?${params}`, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Yahoo Finance quote error", results: [] }, { status: 502 });
  }

  const data = await response.json();
  const quotes: YahooQuote[] = data?.quoteResponse?.result ?? [];
  const results = quotes
    .filter((quote) => quote.symbol && Number(quote.regularMarketPrice ?? 0) > 0)
    .map((quote) => {
      const price = Number(quote.regularMarketPrice ?? 0);
      const changePct = Number(quote.regularMarketChangePercent ?? 0);
      const pe = Number(quote.trailingPE ?? quote.forwardPE ?? 0);
      const score = scoreQuote(type, quote);
      return {
        ticker: quote.symbol === "BRK-B" ? "BRKB" : quote.symbol,
        name: quote.shortName ?? quote.longName ?? quote.symbol,
        price,
        change: formatPct(changePct),
        up: changePct >= 0,
        pe: pe > 0 ? Math.round(pe) : null,
        rev: changePct !== 0 ? `1D ${formatPct(changePct)}` : "—",
        cap: formatCap(quote.marketCap),
        score,
        sector: "—",
        reasons: reasonsFor(type, quote),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return NextResponse.json({
    type,
    source: "yahoo-finance-quote",
    updatedAt: new Date().toISOString(),
    results,
    count: results.length,
  });
}
