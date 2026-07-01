"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, TrendingUp, TrendingDown } from "lucide-react";

const TKR_CLR: Record<string, string> = {
  NVDA: "#76B900", CRM: "#00A1E0", CRWD: "#C1121F", AAPL: "#555",
  MSFT: "#00A1F1", META: "#0867FC", AMZN: "#FF9900", GOOGL: "#4285F4",
  AMD:  "#ED1C24", AVGO: "#CC0000", SNOW: "#29B5E8", TSLA: "#CC0000",
  COST: "#E31837", WMT:  "#0071CE", DIS:  "#0066CC",
};

type EarningsItem = {
  ticker: string; name: string;
  day: number;
  time: "BMO" | "AMC" | "DNK";
  eps_est: string; eps_prev: string;
  rev_est: string;
  beat?: boolean;
};

const EARNINGS: EarningsItem[] = [
  { ticker: "NVDA", name: "NVIDIA Corporation",        day: 1, time: "AMC", eps_est: "$5.52", eps_prev: "$2.48", rev_est: "$24.5B", beat: true  },
  { ticker: "CRM",  name: "Salesforce, Inc.",           day: 1, time: "AMC", eps_est: "$2.38", eps_prev: "$1.69", rev_est: "$9.2B"              },
  { ticker: "CRWD", name: "CrowdStrike Holdings",       day: 2, time: "AMC", eps_est: "$0.90", eps_prev: "$0.57", rev_est: "$905M"              },
  { ticker: "COST", name: "Costco Wholesale",           day: 2, time: "AMC", eps_est: "$3.70", eps_prev: "$3.24", rev_est: "$58.1B"             },
  { ticker: "AVGO", name: "Broadcom Inc.",              day: 3, time: "AMC", eps_est: "$10.84",eps_prev: "$8.15", rev_est: "$12.0B"             },
  { ticker: "MSFT", name: "Microsoft Corporation",      day: 3, time: "AMC", eps_est: "$2.93", eps_prev: "$2.45", rev_est: "$60.1B"             },
  { ticker: "AAPL", name: "Apple Inc.",                 day: 4, time: "AMC", eps_est: "$1.50", eps_prev: "$1.53", rev_est: "$89.3B"             },
  { ticker: "AMZN", name: "Amazon.com Inc.",            day: 4, time: "AMC", eps_est: "$0.81", eps_prev: "$0.31", rev_est: "$142.5B"            },
  { ticker: "META", name: "Meta Platforms",             day: 4, time: "AMC", eps_est: "$4.32", eps_prev: "$2.98", rev_est: "$36.2B"             },
  { ticker: "GOOGL",name: "Alphabet Inc.",              day: 5, time: "AMC", eps_est: "$1.51", eps_prev: "$1.17", rev_est: "$80.2B"             },
  { ticker: "TSLA", name: "Tesla Inc.",                 day: 5, time: "AMC", eps_est: "$0.60", eps_prev: "$0.73", rev_est: "$25.5B"             },
  { ticker: "AMD",  name: "Advanced Micro Devices",     day: 5, time: "AMC", eps_est: "$0.68", eps_prev: "$0.58", rev_est: "$5.9B"              },
];

const DAY_NAMES_TH = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์"];
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT_EN = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_SHORT_TH = ["จ.", "อ.", "พ.", "พฤ.", "ศ."];

function TimeBadge({ time, lang }: { time: string; lang: string }) {
  const TH = lang === "th";
  const cfg: Record<string, { color: string; bg: string; label_th: string; label_en: string }> = {
    BMO: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  label_th: "ก่อนเปิด", label_en: "Before Open" },
    AMC: { color: "#F97316", bg: "rgba(249,115,22,0.12)",  label_th: "หลังปิด",  label_en: "After Close" },
    DNK: { color: "#94A3B8", bg: "rgba(148,163,184,0.12)", label_th: "ไม่ระบุ",  label_en: "Unknown"     },
  };
  const c = cfg[time] ?? cfg.DNK;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, borderRadius: 5, padding: "2px 7px" }}>
      {TH ? c.label_th : c.label_en}
    </span>
  );
}

export default function EarningsPage({ lang }: { lang: string }) {
  const TH = lang === "th";
  const [week, setWeek]   = useState(0);
  const [view, setView]   = useState<"week" | "list">("week");
  const [selDay, setSelDay] = useState<number | null>(null);

  const WEEK_LABEL = week === 0
    ? (TH ? "สัปดาห์นี้" : "This Week")
    : week === 1
    ? (TH ? "สัปดาห์หน้า" : "Next Week")
    : (TH ? `+${week} สัปดาห์` : `+${week} Weeks`);

  const earningsForDay = (d: number) => EARNINGS.filter(e => e.day === d);
  const displayEarnings = selDay !== null ? EARNINGS.filter(e => e.day === selDay) : EARNINGS;

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
            {TH ? "Earnings Calendar" : "Earnings Calendar"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {TH ? `${EARNINGS.length} บริษัทรายงานผลสัปดาห์นี้` : `${EARNINGS.length} companies reporting this week`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Week nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-raised)", borderRadius: 10, padding: "4px 6px" }}>
            <button onClick={() => setWeek(w => Math.max(0, w - 1))} disabled={week === 0}
              style={{ background: "none", border: "none", cursor: week === 0 ? "not-allowed" : "pointer", color: "var(--muted)", padding: 4, opacity: week === 0 ? 0.3 : 1, display: "flex" }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", minWidth: 90, textAlign: "center" }}>{WEEK_LABEL}</span>
            <button onClick={() => setWeek(w => w + 1)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, display: "flex" }}>
              <ChevronRight size={16} />
            </button>
          </div>
          {/* View toggle */}
          <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: 9, padding: 3, gap: 2 }}>
            {(["week", "list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: view === v ? "var(--bg-card)" : "transparent", color: view === v ? "var(--text)" : "var(--muted)", fontWeight: view === v ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
                {v === "week" ? (TH ? "รายสัปดาห์" : "Week") : (TH ? "รายการ" : "List")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week view */}
      {view === "week" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(d => {
            const dayEarnings = earningsForDay(d);
            const isSelected = selDay === d;
            return (
              <div key={d} onClick={() => setSelDay(isSelected ? null : d)}
                style={{ background: isSelected ? "rgba(37,99,235,0.07)" : "var(--bg-card)", border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, borderRadius: 14, padding: "14px 12px", cursor: "pointer", transition: "all .14s" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "var(--accent)" : "var(--faint)", textTransform: "uppercase", marginBottom: 10 }}>
                  {TH ? DAY_SHORT_TH[d - 1] : DAY_SHORT_EN[d - 1]}
                </div>
                {dayEarnings.length === 0 ? (
                  <div style={{ fontSize: 11, color: "var(--faint)", fontStyle: "italic" }}>
                    {TH ? "ไม่มี" : "—"}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dayEarnings.slice(0, 3).map(e => (
                      <div key={e.ticker} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: TKR_CLR[e.ticker] ?? "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                          {e.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{e.ticker}</div>
                          <TimeBadge time={e.time} lang={lang} />
                        </div>
                      </div>
                    ))}
                    {dayEarnings.length > 3 && (
                      <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>+{dayEarnings.length - 3} {TH ? "อื่นๆ" : "more"}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List of earnings */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            {selDay !== null
              ? (TH ? `วัน${DAY_NAMES_TH[selDay - 1]}` : DAY_NAMES_EN[selDay - 1])
              : (TH ? "ทั้งสัปดาห์" : "All Week")}
          </div>
          {selDay !== null && (
            <button onClick={() => setSelDay(null)}
              style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              {TH ? "ดูทั้งหมด" : "Show all"}
            </button>
          )}
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 80px", gap: 8, padding: "8px 18px", borderBottom: "1px solid var(--border)" }}>
          {[TH ? "บริษัท" : "Company", TH ? "วันที่" : "Date", "EPS Est.", "EPS Prev.", TH ? "เวลา" : "Time"].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>

        {displayEarnings.map((e, idx) => (
          <div key={`${e.ticker}-${e.day}`}
            style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 80px", gap: 8, alignItems: "center", padding: "12px 18px", borderBottom: idx < displayEarnings.length - 1 ? "1px solid var(--border)" : "none", transition: "background .12s" }}
            onMouseEnter={el => (el.currentTarget.style.background = "var(--bg-raised)")}
            onMouseLeave={el => (el.currentTarget.style.background = "transparent")}>
            {/* Company */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: TKR_CLR[e.ticker] ?? "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                {e.ticker.slice(0, 4)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{e.ticker}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
              </div>
            </div>
            {/* Day */}
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
              {TH ? `วัน${DAY_NAMES_TH[e.day - 1]}` : DAY_SHORT_EN[e.day - 1]}
            </div>
            {/* EPS Est */}
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{e.eps_est}</div>
            {/* EPS Prev */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{e.eps_prev}</span>
              {e.beat !== undefined && (
                e.beat
                  ? <TrendingUp size={12} color="var(--green)" />
                  : <TrendingDown size={12} color="var(--red)" />
              )}
            </div>
            {/* Time */}
            <TimeBadge time={e.time} lang={lang} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: "var(--faint)" }}>
        ⚠️ {TH ? "วันที่รายงานอาจเปลี่ยนแปลง ข้อมูลเพื่อการศึกษาเท่านั้น" : "Earnings dates subject to change. For educational purposes only."}
      </div>
    </div>
  );
}
