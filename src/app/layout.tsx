import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "USAXresearch — AI Stock Research",
  description: "AI คัดหุ้นอเมริกาให้ พร้อมเหตุผล สำหรับนักลงทุนไทย",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('usax-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}` }} />
      </head>
      <body className={geist.variable} style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
