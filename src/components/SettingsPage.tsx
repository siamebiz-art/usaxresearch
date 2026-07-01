"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, Bell, Moon, Sun, Globe, Shield, CreditCard, LogOut, Save, Check, Crown, Zap } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  user: any;
  profile: any;
  theme: string;
  onThemeToggle: () => void;
  lang: string;
  setLang: (l: string) => void;
  onSignOut: () => void;
  onUpgrade: () => void;
};

const L = {
  th: {
    title: "ตั้งค่าบัญชี",
    profile: "ข้อมูลโปรไฟล์",
    displayName: "ชื่อที่แสดง",
    email: "อีเมล",
    namePlaceholder: "กรอกชื่อที่แสดง",
    preferences: "ค่ากำหนดส่วนตัว",
    theme: "ธีม",
    themeLight: "โหมดสว่าง",
    themeDark: "โหมดมืด",
    language: "ภาษา",
    notifications: "การแจ้งเตือน",
    notifMarket: "แจ้งเตือนตลาดเปิด/ปิด",
    notifEarnings: "แจ้งเตือน Earnings",
    notifAI: "แจ้งเตือน AI Picks ใหม่",
    notifPrice: "แจ้งเตือนราคาถึงเป้า",
    subscription: "แพ็คเกจ",
    currentPlan: "แพ็คเกจปัจจุบัน",
    freePlan: "Free Plan",
    proPlan: "Pro Plan",
    elitePlan: "Elite Plan",
    upgrade: "อัพเกรด",
    security: "ความปลอดภัย",
    changePassword: "เปลี่ยนรหัสผ่าน",
    signOut: "ออกจากระบบ",
    save: "บันทึก",
    saved: "บันทึกแล้ว",
    disclaimer: "ข้อมูลทั้งหมดใน USAXresearch เป็นเครื่องมือทางสถิติเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน",
  },
  en: {
    title: "Account Settings",
    profile: "Profile",
    displayName: "Display Name",
    email: "Email",
    namePlaceholder: "Enter display name",
    preferences: "Preferences",
    theme: "Theme",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    notifMarket: "Market open/close alerts",
    notifEarnings: "Earnings alerts",
    notifAI: "New AI Picks notifications",
    notifPrice: "Price target alerts",
    subscription: "Subscription",
    currentPlan: "Current Plan",
    freePlan: "Free Plan",
    proPlan: "Pro Plan",
    elitePlan: "Elite Plan",
    upgrade: "Upgrade",
    security: "Security",
    changePassword: "Change Password",
    signOut: "Sign Out",
    save: "Save",
    saved: "Saved!",
    disclaimer: "All data in USAXresearch is for statistical purposes only and does not constitute investment advice.",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange}
      style={{ width: 42, height: 24, borderRadius: 99, background: on ? "var(--accent)" : "var(--bg-raised)", border: "1px solid var(--border)", cursor: "pointer", position: "relative", transition: "background .18s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 16, height: 16, borderRadius: 99, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left .18s" }} />
    </div>
  );
}

const LS_NOTIFS_KEY = "usax-notifs-v1";

export default function SettingsPage({ user, profile, theme, onThemeToggle, lang, setLang, onSignOut, onUpgrade }: Props) {
  const t = L[lang as "th" | "en"] ?? L.th;
  const plan = profile?.plan ?? "free";
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({ market: true, earnings: true, ai: false, price: false });

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_NOTIFS_KEY);
      if (s) setNotifs(JSON.parse(s));
    } catch {}
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(LS_NOTIFS_KEY, JSON.stringify(notifs));
      if (user?.id && displayName !== (profile?.display_name ?? "")) {
        await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    finally { setSaving(false); }
  };

  const planColor = plan === "elite" ? "var(--purple)" : plan === "pro" ? "var(--accent)" : "var(--muted)";
  const planLabel = plan === "elite" ? t.elitePlan : plan === "pro" ? t.proPlan : t.freePlan;
  const planIcon  = plan === "elite" ? <Crown size={14} /> : plan === "pro" ? <Zap size={14} /> : null;

  return (
    <div style={{ maxWidth: 640 }} className="fade-up">
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: "0 0 20px" }}>{t.title}</h1>

      {/* Profile */}
      <Section title={t.profile}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: "linear-gradient(135deg, #2563EB, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {(displayName || user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{displayName || user?.email?.split("@")[0]}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>{t.displayName}</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t.namePlaceholder}
              style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>{t.email}</label>
            <input
              value={user?.email ?? ""}
              readOnly
              style={{ width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", color: "var(--faint)", fontSize: 14, outline: "none", boxSizing: "border-box", cursor: "not-allowed" }}
            />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 7, background: saved ? "var(--green)" : "var(--accent)", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "wait" : "pointer", transition: "background .2s", opacity: saving ? 0.7 : 1 }}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? t.saved : saving ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : t.save}
        </button>
      </Section>

      {/* Preferences */}
      <Section title={t.preferences}>
        {/* Theme */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            {theme === "dark" ? <Moon size={16} color="var(--muted)" /> : <Sun size={16} color="var(--muted)" />}
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{t.theme}</div>
              <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 1 }}>{theme === "dark" ? t.themeDark : t.themeLight}</div>
            </div>
          </div>
          <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: 10, padding: 3, gap: 3 }}>
            <button onClick={() => theme === "dark" && onThemeToggle()}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: theme === "light" ? "var(--bg-card)" : "transparent", color: theme === "light" ? "var(--text)" : "var(--faint)", fontWeight: theme === "light" ? 700 : 400, fontSize: 12, cursor: "pointer", boxShadow: theme === "light" ? "var(--shadow)" : "none" }}>
              <Sun size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />{t.themeLight}
            </button>
            <button onClick={() => theme === "light" && onThemeToggle()}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: theme === "dark" ? "var(--bg-card)" : "transparent", color: theme === "dark" ? "var(--text)" : "var(--faint)", fontWeight: theme === "dark" ? 700 : 400, fontSize: 12, cursor: "pointer", boxShadow: theme === "dark" ? "var(--shadow)" : "none" }}>
              <Moon size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />{t.themeDark}
            </button>
          </div>
        </div>

        {/* Language */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Globe size={16} color="var(--muted)" />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{t.language}</div>
              <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 1 }}>{lang === "th" ? "ภาษาไทย" : "English"}</div>
            </div>
          </div>
          <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: 10, padding: 3, gap: 3 }}>
            {["th", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: lang === l ? "var(--bg-card)" : "transparent", color: lang === l ? "var(--text)" : "var(--faint)", fontWeight: lang === l ? 700 : 400, fontSize: 12, cursor: "pointer", boxShadow: lang === l ? "var(--shadow)" : "none" }}>
                {l === "th" ? "ไทย" : "English"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title={t.notifications}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {([
            ["market",   t.notifMarket],
            ["earnings", t.notifEarnings],
            ["ai",       t.notifAI],
            ["price",    t.notifPrice],
          ] as [keyof typeof notifs, string][]).map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Bell size={15} color="var(--muted)" />
                <span style={{ fontSize: 13.5, color: "var(--text)" }}>{label}</span>
              </div>
              <Toggle on={notifs[key]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key] }))} />
            </div>
          ))}
        </div>
      </Section>

      {/* Subscription */}
      <Section title={t.subscription}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: plan !== "elite" ? 16 : 0 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>{t.currentPlan}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${planColor}18`, border: `1px solid ${planColor}44`, borderRadius: 8, padding: "5px 12px", color: planColor, fontWeight: 800, fontSize: 14 }}>
                {planIcon}{planLabel}
              </div>
            </div>
          </div>
          {plan !== "elite" && (
            <button onClick={onUpgrade}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg, #7C3AED, #2563EB)", border: "none", borderRadius: 11, padding: "10px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              <Crown size={14} />{t.upgrade}
            </button>
          )}
        </div>
        {plan !== "elite" && (
          <div style={{ background: "var(--bg-raised)", borderRadius: 11, padding: "12px 14px", fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
            {lang === "th"
              ? "Pro Plan ฿299/เดือน: AI Screener ไม่จำกัด, AI Alerts แบบ Real-time, Compare สูงสุด 5 หุ้น"
              : "Pro Plan ฿299/mo: Unlimited AI Screener, Real-time AI Alerts, Compare up to 5 stocks"}
          </div>
        )}
      </Section>

      {/* Security */}
      <Section title={t.security}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 11, padding: "12px 16px", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
            <Shield size={15} color="var(--muted)" />
            {t.changePassword}
          </button>
          <button onClick={onSignOut}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 11, padding: "12px 16px", color: "var(--red)", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
            <LogOut size={15} />
            {t.signOut}
          </button>
        </div>
      </Section>

      <div style={{ fontSize: 11, color: "var(--faint)", lineHeight: 1.7, padding: "4px 2px 24px" }}>
        ⚠️ {t.disclaimer}
      </div>
    </div>
  );
}
