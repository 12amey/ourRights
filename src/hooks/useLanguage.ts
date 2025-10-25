"use client";

import { useState, useEffect } from "react";
import { Language, translations } from "@/lib/translations";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("mgnrega-language");
    if (stored === "en" || stored === "hi") {
      setLanguage(stored);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("mgnrega-language", newLang);
  };

  const t = translations[language];

  return { language, toggleLanguage, t };
}
