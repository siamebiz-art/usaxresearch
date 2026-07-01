"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Loading = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
    <div style={{ textAlign: "center", color: "#94A3B8" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
      <div style={{ fontSize: 16 }}>กำลังเข้าสู่ระบบ...</div>
    </div>
  </div>
);

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.push(error ? "/?error=auth_failed" : "/dashboard");
      });
    } else {
      router.push("/");
    }
  }, []);

  return <Loading />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<Loading />}>
      <CallbackInner />
    </Suspense>
  );
}
