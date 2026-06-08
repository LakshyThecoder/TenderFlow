"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Language, translations } from "./translations"

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("it")

  useEffect(() => {
    const saved = localStorage.getItem("tenderflow-lang") as Language
    if (saved && (saved === "it" || saved === "en" || saved === "de" || saved === "fr" || saved === "es")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("tenderflow-lang", lang)
  }

  // Nested path translation helper (e.g. t('welcome.title') or general key)
  const t = (key: string): string => {
    const dict = translations[language] || translations["it"]
    // @ts-ignore
    return dict[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
