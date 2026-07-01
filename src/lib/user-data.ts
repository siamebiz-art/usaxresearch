import { supabase } from "./supabase";

export type PortfolioPosition = {
  id: number;
  ticker: string;
  name: string;
  color: string;
  shares: number;
  avgCost: number;
  price: number;
  sector: string;
};

function normalizeTicker(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

export function normalizeTickerList(value: unknown) {
  const source = Array.isArray(value) ? value : [];
  return [...new Set(source.map(normalizeTicker).filter(Boolean))];
}

async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function loadUserWatchlist() {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_watchlists")
    .select("tickers, alert_tickers")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    tickers: normalizeTickerList(data.tickers),
    alerts: normalizeTickerList(data.alert_tickers),
  };
}

export async function saveUserWatchlist(tickers: string[], alerts: string[]) {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from("user_watchlists").upsert({
    user_id: userId,
    tickers: normalizeTickerList(tickers),
    alert_tickers: normalizeTickerList(alerts),
    updated_at: new Date().toISOString(),
  });
}

export async function addTickerToUserWatchlist(ticker: string) {
  const normalized = normalizeTicker(ticker);
  if (!normalized) return;

  const current = await loadUserWatchlist();
  const tickers = normalizeTickerList([...(current?.tickers ?? []), normalized]);
  await saveUserWatchlist(tickers, current?.alerts ?? []);
}

export async function addAlertTickerToUserWatchlist(ticker: string) {
  const normalized = normalizeTicker(ticker);
  if (!normalized) return;

  const current = await loadUserWatchlist();
  const tickers = normalizeTickerList([...(current?.tickers ?? []), normalized]);
  const alerts = normalizeTickerList([...(current?.alerts ?? []), normalized]);
  await saveUserWatchlist(tickers, alerts);
}

export async function loadUserPortfolio() {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_portfolios")
    .select("positions")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data || !Array.isArray(data.positions)) return null;
  return data.positions as PortfolioPosition[];
}

export async function saveUserPortfolio(positions: PortfolioPosition[]) {
  const userId = await getUserId();
  if (!userId) {
    return { ok: true, synced: false, error: "not_authenticated" };
  }

  const { error } = await supabase.from("user_portfolios").upsert({
    user_id: userId,
    positions,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, synced: false, error: error.message };
  }

  return { ok: true, synced: true };
}
