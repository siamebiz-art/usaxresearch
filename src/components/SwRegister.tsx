"use client";
import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    // The public backtest page must not install the old app's offline cache (it precaches "/" and "/dashboard").
    if (location.pathname.startsWith("/backtest")) return;
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {});
    }
  }, []);
  return null;
}
