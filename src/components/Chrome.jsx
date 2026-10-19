import { Link } from "react-router-dom";
import { LanguageSelect, useLanguage } from "../i18n.jsx";
import { contextSearch, registerSearch, useResearch } from "../research.jsx";

export function Wordmark({ symbol = false }) {
  return (
    <span className={symbol ? "brand-symbol" : "brand-wordmark"}>
      <img
        src={symbol ? "/brand/afrixasia-symbol-color.png" : "/brand/afrixasia-wordmark-white.png"}
        alt={symbol ? "" : "AfriXAsia"}
        width={symbol ? 1254 : 2036}
        height={symbol ? 1254 : 772}
      />
    </span>
  );
}

const NAV = [
  ["/", "Home", "Beranda", "Accueil", ["Beranda"]],
  ["/data-pasar", "Markets & Globe", "Pasar & Globe", "Marchés & Globe", ["Explore", "Data pasar"]],
  [
    "/open-data",
    "Economic Analysis",
    "Analisis Ekonomi",
    "Analyse économique",
    ["Open data", "Proyeksi"],
  ],
  ["/daily-brief", "Media Brief", "Media Brief", "Media Brief", ["Daily brief"]],
  ["/layanan", "Services", "Layanan", "Services", ["Layanan", "Services"]],
  ["/marketplace", "Membership", "Keanggotaan", "Adhésion", ["Marketplace", "Penyedia", "daftar"]],
];

export function Header({ active = "" }) {
  const { t } = useLanguage();
  const [context] = useResearch();
  return (
    <header className="site-header">
      <Link className="brand" to={contextSearch("/", context)} aria-label="AfriXAsia">
        <Wordmark />
      </Link>
      <nav aria-label={t("Main navigation", "Navigasi utama", "Navigation principale")}>
        {NAV.map(([href, en, id, fr, aliases]) => (
          <Link key={href} to={contextSearch(href, context)} className={aliases.includes(active) ? "active" : ""}>
            {t(en, id, fr)}
          </Link>
        ))}
      </nav>
      <LanguageSelect />
      <Link className="btn primary register-cta" to={registerSearch(context)}>
        AFRIXASIA MEMBER ↗
      </Link>
    </header>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const [context] = useResearch();
  return (
    <footer className="footer">
      <div>
        <b>AfriXAsia</b>
        <br />
        {t(
          "Two continents. A shared ambition.",
          "Dua benua. Ambisi bersama.",
          "Deux continents. Une ambition commune.",
        )}
      </div>
      <div>
        <Link to={contextSearch("/layanan", context)}>
          {t("Services", "Layanan", "Services")}
        </Link>
        {" · "}
        <Link to={contextSearch("/open-data", context)}>
          {t("Economic Analysis", "Analisis Ekonomi", "Analyse économique")}
        </Link>
        {" · "}
        <Link to={contextSearch("/kualitas-data", context)}>
          {t("Data quality", "Kualitas data", "Qualité des données")}
        </Link>
        {" · "}
        <Link to={contextSearch("/metodologi", context)}>
          {t("Methodology", "Metodologi", "Méthodologie")}
        </Link>
        {" · "}
        <Link to={contextSearch("/api-docs", context)}>API</Link>
        {" · "}
        <Link to={contextSearch("/privasi", context)}>
          {t("Privacy & membership", "Privasi & keanggotaan", "Confidentialité & adhésion")}
        </Link>
        <br />
        <Link to={contextSearch("/daftar", context)}>
          {t("Manage membership", "Kelola keanggotaan", "Gérer mon adhésion")}
        </Link>
        {" · "}
        <a href="https://www.instagram.com/afrixasia/" target="_blank" rel="noreferrer">
          @afrixasia ↗
        </a>
      </div>
    </footer>
  );
}

export function Shell({ active, children }) {
  return (
    <>
      <Header active={active} />
      {children}
    </>
  );
}
