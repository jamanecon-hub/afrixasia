import { Link } from "react-router-dom";
import { findCountry, market, sectorCopy, wdi } from "../../shared/reference.mjs";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, registerSearch } from "../research.jsx";

export function indicatorTitle(indicator, language) {
  if (!indicator) return "";
  return language === "id" ? indicator.label || indicator.name : indicator.name;
}

export default function ResearchDesk({ countryName, category, contextFields = {} }) {
  const { t, sector, formatValue, language } = useLanguage();
  const country = findCountry(countryName);
  const copy = sectorCopy[category];
  if (!country || !copy) return null;
  const facts = copy.indicators
    .map((code) => {
      const definition = wdi.indicators.find((item) => item.code === code);
      const row = wdi.latest.find((item) => item.country === country.iso3 && item.indicator === code);
      return definition && row ? { definition, row } : null;
    })
    .filter(Boolean);
  const evidenceCount = market.records.filter((row) => row.country === country.name && row.category === category).length;
  const providerRows = market.providers.filter((row) => row.country === country.name && row.category === category);
  const base = { country: country.name, category, ...contextFields };
  return (
    <section className="intelligence-panel">
      <div className="sectionhead">
        <div>
          <span className="eyebrow">SECTOR RESEARCH DESK</span>
          <h2>
            {sector(category)} · {country.name}
          </h2>
        </div>
        <Link to={contextSearch("/open-data", { ...base, indicator: copy.indicators[0] })}>
          {t("Inspect source data", "Periksa data sumber", "Examiner les données source")} →
        </Link>
      </div>
      <p>
        {copy.focus}.{" "}
        {t(
          "Historical statistics help judge the context; current needs and capacity still have to be confirmed.",
          "Statistik historis membantu menilai konteks; kebutuhan dan kapasitas saat ini perlu dikonfirmasi.",
          "Les statistiques historiques aident à juger le contexte ; les besoins et la capacité actuels doivent encore être confirmés.",
        )}
      </p>
      <div className="intelligence-columns">
        <article>
          <h3>{t("Basis for a decision", "Dasar untuk keputusan", "Base de décision")}</h3>
          {facts.map(({ definition, row }) => (
            <div className="evidence-line" key={definition.code}>
              <span>{indicatorTitle(definition, language)}</span>
              <b>{formatValue(row.value, definition.unit, true)}</b>
              <small>{definition.unit}</small>
              <small>
                {row.year} ·{" "}
                <a href={definition.sourceUrl} target="_blank" rel="noreferrer">
                  {t("Official source", "Sumber resmi", "Source officielle")} ↗
                </a>
              </small>
            </div>
          ))}
          <div className="desk-metrics">
            <span>
              <b>{evidenceCount}</b> {t("country evidence records", "bukti negara", "preuves nationales")}
            </span>
            <span>
              <b>{providerRows.length}</b> {t("country providers", "penyedia negara", "organisations du pays")}
            </span>
          </div>
        </article>
        <article>
          <h3>{t("Mandate to prepare", "Mandat yang perlu disiapkan", "Mandat à préparer")}</h3>
          <ol>
            {copy.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
          <div className="desk-actions">
            <Link className="btn primary" to={registerSearch(base, "buyer")}>
              {t("Create a buyer brief", "Buat brief buyer", "Créer un brief acheteur")} →
            </Link>
            <Link className="btn" to={registerSearch(base, "supplier")}>
              {t("Introduce supply", "Perkenalkan supply", "Présenter une offre")} →
            </Link>
          </div>
        </article>
        <article>
          <h3>{t("Related providers in this country", "Penyedia negara terkait", "Organisations du pays")}</h3>
          {providerRows.map((row) => (
            <Link className="provider-link" key={row.id} to={`/penyedia/${row.id}`}>
              <b>{row.name}</b>
              <span>
                {row.country} · {sector(row.category)}
              </span>
            </Link>
          ))}
          {!providerRows.length && (
            <p>
              {t(
                "No curated organization in this country for the sector.",
                "Belum ada organisasi terkurasi di negara ini untuk sektor tersebut.",
                "Aucune organisation sélectionnée dans ce pays pour ce secteur.",
              )}
            </p>
          )}
          <Link to={contextSearch("/penyedia", base)}>{t("Explore the directory", "Jelajahi direktori", "Explorer l’annuaire")} →</Link>
        </article>
      </div>
    </section>
  );
}
