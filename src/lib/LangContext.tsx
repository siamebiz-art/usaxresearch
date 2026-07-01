"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { T, Lang } from "./i18n";

interface LangCtx {
  lang:    Lang;
  setLang: (l: Lang) => void;
  t:       Record<string, string>;
}

const LangContext = createContext<LangCtx>({ lang: "th", setLang: () => {}, t: T.th as Record<string, string> });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("th");

  useEffect(() => {
    const saved = localStorage.getItem("usax-lang") as Lang | null;
    if (saved === "en" || saved === "th") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("usax-lang", l);
    document.documentElement.setAttribute("lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] as Record<string, string> }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
