import { supabase } from "./supabase";

export type UserAlertType = "price_above" | "price_below";
export type UserAlertStatus = "active" | "triggered" | "paused";

export type UserAlert = {
  id: string;
  user_id?: string;
  ticker: string;
  type: UserAlertType;
  target_value: number;
  status: UserAlertStatus;
  last_price: number | null;
  triggered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserNotification = {
  id: string;
  user_id?: string;
  alert_id: string | null;
  ticker: string;
  title: string;
  body: string;
  price: number | null;
  read_at: string | null;
  created_at: string;
};

const LS_ALERTS_KEY = "usax-ai-alerts-v2";
const LS_NOTIFICATIONS_KEY = "usax-notifications-v1";

function normalizeTicker(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export function readLocalAlerts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_ALERTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as UserAlert[]) : [];
  } catch {
    return [];
  }
}

function writeLocalAlerts(alerts: UserAlert[]) {
  try {
    localStorage.setItem(LS_ALERTS_KEY, JSON.stringify(alerts));
  } catch {}
}

export function readLocalNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_NOTIFICATIONS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as UserNotification[]) : [];
  } catch {
    return [];
  }
}

function writeLocalNotifications(notifications: UserNotification[]) {
  try {
    localStorage.setItem(LS_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {}
}

export async function loadUserAlerts() {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return null;
  return data as UserAlert[];
}

export async function createUserAlert(input: { ticker: string; type: UserAlertType; target_value: number }) {
  const ticker = normalizeTicker(input.ticker);
  const target = Number(input.target_value);
  if (!ticker || !Number.isFinite(target) || target <= 0) return { ok: false, synced: false };

  const userId = await getUserId();
  const now = new Date().toISOString();

  if (!userId) {
    const localAlert: UserAlert = {
      id: String(Date.now()),
      ticker,
      type: input.type,
      target_value: target,
      status: "active",
      last_price: null,
      triggered_at: null,
      created_at: now,
      updated_at: now,
    };
    writeLocalAlerts([localAlert, ...readLocalAlerts()]);
    window.dispatchEvent(new CustomEvent("usax-alerts-updated"));
    return { ok: true, synced: false, alert: localAlert };
  }

  const { data, error } = await supabase
    .from("user_alerts")
    .insert({
      user_id: userId,
      ticker,
      type: input.type,
      target_value: target,
      status: "active",
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) return { ok: false, synced: true };
  window.dispatchEvent(new CustomEvent("usax-alerts-updated"));
  return { ok: true, synced: true, alert: data as UserAlert };
}

export async function updateUserAlertStatus(id: string, status: UserAlertStatus) {
  const userId = await getUserId();
  const now = new Date().toISOString();
  if (!userId) {
    writeLocalAlerts(readLocalAlerts().map((alert) => (alert.id === id ? { ...alert, status, updated_at: now } : alert)));
    window.dispatchEvent(new CustomEvent("usax-alerts-updated"));
    return;
  }

  await supabase.from("user_alerts").update({ status, updated_at: now }).eq("id", id).eq("user_id", userId);
  window.dispatchEvent(new CustomEvent("usax-alerts-updated"));
}

export async function deleteUserAlert(id: string) {
  const userId = await getUserId();
  if (!userId) {
    writeLocalAlerts(readLocalAlerts().filter((alert) => alert.id !== id));
    window.dispatchEvent(new CustomEvent("usax-alerts-updated"));
    return;
  }

  await supabase.from("user_alerts").delete().eq("id", id).eq("user_id", userId);
  window.dispatchEvent(new CustomEvent("usax-alerts-updated"));
}

export async function loadUserNotifications(limit = 10) {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return null;
  return data as UserNotification[];
}

export async function markNotificationsRead() {
  const userId = await getUserId();
  const now = new Date().toISOString();
  if (!userId) {
    writeLocalNotifications(readLocalNotifications().map((item) => ({ ...item, read_at: item.read_at ?? now })));
    window.dispatchEvent(new CustomEvent("usax-notifications-updated"));
    return;
  }

  await supabase.from("user_notifications").update({ read_at: now }).eq("user_id", userId).is("read_at", null);
  window.dispatchEvent(new CustomEvent("usax-notifications-updated"));
}
