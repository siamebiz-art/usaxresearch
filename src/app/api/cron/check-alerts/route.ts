import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

type AlertRow = {
  id: string;
  user_id: string;
  ticker: string;
  type: "price_above" | "price_below";
  target_value: number;
};

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}

async function fetchQuote(symbol: string) {
  const params = new URLSearchParams({ range: "1d", interval: "1m" });
  const response = await fetch(`${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?${params}`, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) return null;

  const data = await response.json();
  const meta = data?.chart?.result?.[0]?.meta;
  const price = Number(meta?.regularMarketPrice ?? meta?.previousClose ?? 0);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function isTriggered(alert: AlertRow, price: number) {
  if (alert.type === "price_above") return price >= Number(alert.target_value);
  if (alert.type === "price_below") return price <= Number(alert.target_value);
  return false;
}

function notificationText(alert: AlertRow, price: number) {
  const target = Number(alert.target_value).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const current = price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const condition = alert.type === "price_above" ? "ขึ้นถึง" : "ลงถึง";
  return {
    title: `${alert.ticker} แจ้งเตือนราคา`,
    body: `${alert.ticker} ราคา${condition}เป้าหมาย $${target} แล้ว ราคาล่าสุด $${current}`,
  };
}

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = serviceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const { data: alerts, error } = await supabase
    .from("user_alerts")
    .select("id,user_id,ticker,type,target_value")
    .eq("status", "active")
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (alerts ?? []) as AlertRow[];
  const symbols = [...new Set(rows.map((alert) => alert.ticker))];
  const quotePairs = await Promise.all(symbols.map(async (symbol) => [symbol, await fetchQuote(symbol)] as const));
  const quoteMap = new Map(quotePairs.filter((pair): pair is readonly [string, number] => typeof pair[1] === "number"));

  let checked = 0;
  let triggered = 0;

  for (const alert of rows) {
    const price = quoteMap.get(alert.ticker);
    if (!price) continue;
    checked++;

    const checkedAt = new Date().toISOString();
    await supabase
      .from("user_alerts")
      .update({ last_price: price, last_checked_at: checkedAt, updated_at: checkedAt })
      .eq("id", alert.id);

    if (!isTriggered(alert, price)) continue;

    const text = notificationText(alert, price);
    await supabase.from("user_notifications").insert({
      user_id: alert.user_id,
      alert_id: alert.id,
      ticker: alert.ticker,
      title: text.title,
      body: text.body,
      price,
    });

    await supabase
      .from("user_alerts")
      .update({
        status: "triggered",
        last_price: price,
        triggered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", alert.id);

    triggered++;
  }

  return NextResponse.json({ success: true, total: rows.length, checked, triggered });
}
