import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const isPro   = (plan?: string) => plan === "pro"   || plan === "elite";
export const isElite = (plan?: string) => plan === "elite";
