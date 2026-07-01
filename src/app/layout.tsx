import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";
import SwRegister from "@/components/SwRegister";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "USAXresearch — AI Stock Research",
  description: "AI วิเคราะห์หุ้นสหรัฐฯ สำหรับนักลงทุนไทย",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "USAXresearch",
  },
  icons: {
    icon: "/iconLogoUSAX.png",
    apple: "/iconLogoUSAX.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try{
            var t=localStorage.getItem('usax-theme');
            document.documentElement.setAttribute('data-theme', t==='dark'?'dark':'light');
            var l=localStorage.getItem('usax-lang');
            if(l==='en')document.documentElement.setAttribute('lang','en');
          }catch(e){}
        `}} />
      </head>
      <body className={geist.variable} style={{ minHeight: "100vh" }}>
        <LangProvider>{children}</LangProvider>
        <SwRegister />
      </body>
    </html>
  );
}
