import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";
const FMP_KEY  = process.env.FMP_API_KEY!;

export async function GET(req: NextRequest, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;

  const [profileRes, quoteRes, incomeRes, newsRes] = await Promise.all([
    fetch(`${FMP_BASE}/profile/${ticker}?apikey=${FMP_KEY}`),
    fetch(`${FMP_BASE}/quote/${ticker}?apikey=${FMP_KEY}`),
    fetch(`${FMP_BASE}/income-statement/${ticker}?limit=4&apikey=${FMP_KEY}`),
    fetch(`${FMP_BASE}/stock_news?tickers=${ticker}&limit=5&apikey=${FMP_KEY}`),
  ]);

  const [profiles, quotes, income, newsRaw] = await Promise.all([
    profileRes.ok ? profileRes.json() : [],
    quoteRes.ok   ? quoteRes.json()   : [],
    incomeRes.ok  ? incomeRes.json()  : [],
    newsRes.ok    ? newsRes.json()    : [],
  ]);

  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  const quote   = Array.isArray(quotes)   ? quotes[0]   : quotes;

  // Use Claude to summarize if ANTHROPIC_API_KEY is set
  let aiSummary = "";
  if (process.env.ANTHROPIC_API_KEY && profile?.description) {
    try {
      const latestIncome = income[0] ?? {};
      const prompt = `วิเคราะห์บริษัทนี้สั้นๆ เป็นภาษาไทย ไม่เกิน 4 ประโยค เน้นข้อมูลเชิงสถิติ ห้ามแนะนำซื้อหรือขาย:
บริษัท: ${profile.companyName} (${ticker})
ธุรกิจ: ${profile.description?.slice(0, 300)}
รายได้ล่าสุด: $${(latestIncome.revenue / 1e9)?.toFixed(1)}B
กำไรสุทธิ: $${(latestIncome.netIncome / 1e9)?.toFixed(1)}B
P/E: ${quote?.pe?.toFixed(1)}
Market Cap: $${(profile.mktCap / 1e9)?.toFixed(0)}B`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 250, messages: [{ role: "user", content: prompt }] }),
      });
      const aiData = await res.json();
      aiSummary = aiData.content?.[0]?.text ?? "";
    } catch {}
  }

  return NextResponse.json({
    ticker,
    profile: {
      name:     profile?.companyName,
      sector:   profile?.sector,
      industry: profile?.industry,
      website:  profile?.website,
      image:    profile?.image,
      desc:     profile?.description?.slice(0, 500),
      mktCap:   profile?.mktCap,
      beta:     profile?.beta,
      roe:      profile?.returnOnEquity,
      debt:     profile?.totalDebt,
    },
    quote: {
      price:    quote?.price,
      change:   quote?.changesPercentage,
      pe:       quote?.pe,
      eps:      quote?.eps,
      high52:   quote?.yearHigh,
      low52:    quote?.yearLow,
      avgVol:   quote?.avgVolume,
    },
    income: income.slice(0, 4).map((i: any) => ({
      year:    i.calendarYear,
      revenue: i.revenue,
      profit:  i.netIncome,
      margin:  i.netIncomeRatio,
    })),
    news: (Array.isArray(newsRaw) ? newsRaw : []).slice(0, 5).map((n: any) => ({
      title:       n.title,
      publishedAt: n.publishedDate,
      url:         n.url,
    })),
    aiSummary,
  });
}
