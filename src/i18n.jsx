import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({ language: "en", setLanguage() {} });

const sectorFr = {
  "Food & agriculture": "Alimentation & agriculture",
  "Apparel & textiles": "Habillement & textiles",
  "Business & IT services": "Services aux entreprises & informatique",
  Workforce: "Main-d’œuvre",
  "Education & courses": "Éducation & formation",
  "Film & media": "Cinéma & médias",
  "Music & entertainment": "Musique & divertissement",
  "Services (aggregate)": "Services (agrégés)",
};

const sectorId = {
  "Food & agriculture": "Pangan & agrikultur",
  "Apparel & textiles": "Pakaian & tekstil",
  "Business & IT services": "Bisnis & layanan IT",
  Workforce: "Tenaga kerja",
  "Education & courses": "Pendidikan & kursus",
  "Film & media": "Film & media",
  "Music & entertainment": "Musik & hiburan",
  "Services (aggregate)": "Jasa lintas sektor",
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("afrixasia-language");
      if (stored === "id" || stored === "fr" || stored === "en") setLanguageState(stored);
    } catch {
      /* private mode */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const setLanguage = (next) => {
    setLanguageState(next);
    try {
      localStorage.setItem("afrixasia-language", next);
    } catch {
      /* ignore */
    }
  };
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const { language, setLanguage } = useContext(LanguageContext);
  return {
    language,
    setLanguage,
    formatValue(value, unit = "", compact = false) {
      if (value == null || value === "") return "—";
      return new Intl.NumberFormat(language === "id" ? "id-ID" : language === "fr" ? "fr-FR" : "en-GB", {
        maximumFractionDigits: /USD|US\$/i.test(unit) ? Number(compact) : 2,
        notation: compact ? "compact" : "standard",
      }).format(value);
    },
    t(en, id, fr) {
      return language === "id" ? id : language === "fr" ? fr : en;
    },
    sector(name) {
      if (language === "fr") return sectorFr[name] || name;
      if (language === "id") return sectorId[name] || name;
      return name;
    },
  };
}

export function LanguageSelect() {
  const { language, setLanguage } = useLanguage();
  return (
    <select
      className="language-select"
      aria-label="Language / Bahasa / Langue"
      value={language}
      onChange={(event) => setLanguage(event.target.value)}
    >
      <option value="en">English</option>
      <option value="id">Indonesia</option>
      <option value="fr">Français</option>
    </select>
  );
}
