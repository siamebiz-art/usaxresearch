"use client";
import { useState } from "react";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)", padding: "8px 20px", display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--muted)", flexWrap: "wrap" }}>
      <span style={{ color: "var(--yellow)", fontWeight: 700, flexShrink: 0 }}>⚠️ คำเตือน:</span>
      <span style={{ flex: 1 }}>
        เว็บไซต์นี้เป็นเพียง <strong>แพลตฟอร์มเครื่องมือวิเคราะห์เชิงสถิติ</strong> เท่านั้น ไม่ใช่คำแนะนำในการลงทุน
        ข้อมูลทั้งหมดจัดทำเพื่อการศึกษาและอ้างอิง ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติมและตัดสินใจด้วยตนเอง
      </span>
      <a href="/disclaimer" style={{ color: "var(--accent)", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>อ่านเพิ่มเติม</a>
      <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", fontSize: 16, flexShrink: 0, padding: "0 4px" }}>✕</button>
    </div>
  );
}

export function DisclaimerFooter() {
  return (
    <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--faint)", textAlign: "center" }}>
      <span>© 2025 USAXresearch</span>
      <span>·</span>
      <a href="/disclaimer" style={{ color: "var(--faint)" }}>Disclaimer</a>
      <span>·</span>
      <span>ข้อมูลทั้งหมดเป็น <strong>เครื่องมือวิเคราะห์เชิงสถิติ</strong> ไม่ใช่คำแนะนำการลงทุน</span>
      <span>·</span>
      <span>ไม่มีใบอนุญาตผู้แนะนำการลงทุน (IC License)</span>
    </div>
  );
}
