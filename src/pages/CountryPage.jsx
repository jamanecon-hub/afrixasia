import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { market, wdi } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";
import { indicatorTitle } from "../components/ResearchDesk.jsx";
import TimeSeriesChart from "../components/TimeSeriesChart.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, useApplyResearchContext } from "../research.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

export default function CountryPage() {
  const { code } = useParams();
  const { t, sector, formatValue, language } = useLanguage();
  const [state, setState] = useState({ status: "loading", dossier: null });
  const [indicatorCode, setIndicatorCode] = useState("NY.GDP.MKTP.KD.ZG");
  const dossier = state.dossier;
  useApplyResearchContext(dossier?.country?.iso3, dossier ? { country: dossier.country.name } : null);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", dossier: null });
    fetch(`/api/country?code=${encodeURIComponent(code)}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) {
          setState({ status: "missing", dossier: null });
          return;
        }
        if (!response.ok) throw new Error("country");
        setState({ status: "ready", dossier: await response.json() });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState({ status: "error", dossier: null });
      });
    return () => controller.abort();
  }, [code]);

  if (state.status === "missing") return <NotFoundPage />;

  const indicator = dossier?.indicators?.find((row) => row.code === indicatorCode) || dossier?.indicators?.[0];
  const series = indicator
    ? indicator.series.map((point) => ({ country: dossier.country.iso3, year: point.year, value: point.value }))
    : [];
  const labels = dossier ? { [dossier.country.iso3]: dossier.country.name } : {};

  return (
    <>
      <Header active="Open data" />
      <main>
        {state.status === "loading" && <p role="status">{t("Loading country reference…", "Memuat referensi negara…", "Chargement de la référence pays…")}</p>}
        {state.status === "error" && (
          <div className="form-error" role="alert">
            {t(
              "The country reference could not be loaded. Reload this page.",
              "Referensi negara belum dapat dimuat. Muat ulang halaman ini.",
              "Impossible de charger la référence pays. Rechargez la page.",
            )}
          </div>
        )}
        {dossier && indicator && (
          <>
            <div className="country-reference-heading">
              <div>
                <span className="eyebrow">COUNTRY REFERENCE · {dossier.country.iso3}</span>
                <h1>{dossier.country.name}</h1>
                <p className="muted">
                  {dossier.country.region} · {dossier.country.incomeGroup} · {t("Capital", "Ibu kota", "Capitale")}: {dossier.country.capital}
                </p>
              </div>
              <a className="btn primary" href={`/api/reference?view=series&country=${dossier.country.iso3}&format=csv`}>
                ↓ {t("All country data", "Semua data negara", "Toutes les données du pays")}
              </a>
            </div>
            <p className="notice">
              {dossier.highlights
                .filter((row) => row?.latest)
                .map(
                  (row) =>
                    `${indicatorTitle(row, language)}: ${formatValue(row.latest.value, row.unit, true)} ${row.unit} (${row.latest.year})`,
                )
                .join(". ")}
              .
            </p>
            <div className="country-fact-grid">
              {dossier.cards.filter(Boolean).map((row) => (
                <article className="stat" key={row.code}>
                  <label>{indicatorTitle(row, language).toUpperCase()}</label>
                  <strong>{row.latest ? formatValue(row.latest.value, row.unit, true) : "—"}</strong>
                  <span>
                    {row.unit}
                    {row.latest ? ` · ${row.latest.year}` : ""}
                  </span>
                  {row.delta && (
                    <span>
                      Δ {formatValue(row.delta.value, "%")}{" "}
                      {row.delta.kind === "pp" ? t("percentage points", "poin persentase", "points de pourcentage") : "%"}{" "}
                      {t("from", "dari", "depuis")} {row.delta.fromYear}
                    </span>
                  )}
                  <a className="small" href={row.sourceUrl} target="_blank" rel="noreferrer">
                    {t("Source", "Sumber", "Source")} ↗
                  </a>
                </article>
              ))}
            </div>
            <div className="reference-workspace">
              <article className="card">
                <span className="eyebrow">COUNTRY TIME SERIES</span>
                <label className="reference-selector">
                  {t("Indicator", "Indikator", "Indicateur")}
                  <select value={indicator.code} onChange={(event) => setIndicatorCode(event.target.value)}>
                    {dossier.indicators.map((row) => (
                      <option key={row.code} value={row.code}>
                        {indicatorTitle(row, language)}
                      </option>
                    ))}
                  </select>
                </label>
                <TimeSeriesChart rows={series} labels={labels} unit={indicator.unit} />
                <div className="form-actions">
                  <a className="btn" href={`/api/reference?view=series&country=${dossier.country.iso3}&indicator=${indicator.code}&format=csv`}>
                    ↓ {t("Download this series", "Unduh seri ini", "Télécharger cette série")}
                  </a>
                  <Link className="btn" to={contextSearch("/open-data", { country: dossier.country.name, indicator: indicator.code })}>
                    {t("Compare countries", "Bandingkan negara", "Comparer les pays")} →
                  </Link>
                </div>
                <span className="eyebrow">DATA AVAILABILITY</span>
                <h2>
                  {dossier.availableIndicators} / {dossier.indicators.length} {t("indicators", "indikator", "indicateurs")}
                </h2>
                <p>
                  {dossier.marketCount} {t("trade and sector references and", "referensi perdagangan/sektor dan", "références commerciales/sectorielles et")}{" "}
                  {dossier.providerCount} {t("provider profiles are available for", "profil penyedia tersedia untuk", "profils d’organisations sont disponibles pour")}{" "}
                  {dossier.country.name}.
                </p>
                <Link className="btn" to={contextSearch("/data-pasar", { country: dossier.country.name })}>
                  {t("Demand & supply", "Demand & supply", "Demande & offre")} →
                </Link>
                <Link className="btn" to={contextSearch("/penyedia", { country: dossier.country.name })}>
                  {t("Related providers", "Penyedia terkait", "Organisations associées")} →
                </Link>
                <Link className="btn" to={contextSearch("/daily-brief", { country: dossier.country.name })}>
                  {t("Country notes & news", "Catatan negara & berita", "Notes pays & actualités")} →
                </Link>
                <Link className="btn" to={contextSearch("/proyeksi", { country: dossier.country.name })}>
                  {t("Three-month outlook", "Outlook 3 bulan", "Perspective à trois mois")} →
                </Link>
                <Link className="btn" to={contextSearch("/marketplace", { country: dossier.country.name })}>
                  Circle directory →
                </Link>
              </article>
            </div>
            <div className="sectionhead">
              <h2>{t("Every indicator · latest source value", "Seluruh indikator · nilai terakhir sumber", "Tous les indicateurs · dernière valeur source")}</h2>
              <a href={`/api/reference?country=${dossier.country.iso3}`}>JSON ↗</a>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[
                      t("Indicator", "Indikator", "Indicateur"),
                      t("Value", "Nilai", "Valeur"),
                      t("Unit", "Satuan", "Unité"),
                      t("Period", "Periode", "Période"),
                      t("Coverage", "Cakupan", "Couverture"),
                      t("Source", "Sumber", "Source"),
                    ].map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dossier.indicators.map((row) => (
                    <tr key={row.code}>
                      <td>
                        {indicatorTitle(row, language)}
                        <small>{row.code}</small>
                      </td>
                      <td>{row.latest ? formatValue(row.latest.value, row.unit) : "—"}</td>
                      <td>{row.unit}</td>
                      <td>{row.latest?.year || "—"}</td>
                      <td>
                        {row.count} {t("observations", "observasi", "observations")}
                        <small>
                          {row.status === "available"
                            ? t("Available", "Tersedia", "Disponible")
                            : t("Not reported", "Belum dilaporkan", "Non renseigné")}
                        </small>
                      </td>
                      <td>
                        <a href={row.sourceUrl} target="_blank" rel="noreferrer">
                          World Bank ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sectionhead">
              <h2>{t("Coverage by sector", "Coverage tiap sektor", "Couverture par secteur")}</h2>
              <Link to={contextSearch("/kualitas-data", { country: dossier.country.name })}>
                {t("Review quality", "Periksa kualitas", "Vérifier la qualité")} →
              </Link>
            </div>
            <div className="cards">
              {dossier.sectors.map((row) => (
                <article className="card" key={row.category}>
                  <span className="badge">{sector(row.category)}</span>
                  <h3>
                    {row.marketRecords === 0 && row.providerProfiles === 0
                      ? t("Sector research mandate", "Mandat riset sektor", "Mandat de recherche sectorielle")
                      : `${row.marketRecords} ${t("references", "referensi", "références")} · ${row.providerProfiles} ${t("providers", "penyedia", "organisations")}`}
                  </h3>
                  <p>{row.focus}</p>
                  <p>
                    {row.referenceIndicators} {t("related WDI indicators.", "indikator WDI terkait.", "indicateurs WDI associés.")}{" "}
                    {row.contextOnly
                      ? t(
                          "No curated sector statistic for this country. Population or internet access is not used as a substitute for a sector market measure.",
                          "Belum ada statistik sektor terkurasi untuk negara ini. Populasi atau akses internet tidak digunakan sebagai pengganti ukuran pasar sektor.",
                          "Aucune statistique sectorielle sélectionnée pour ce pays. La population ou l’accès à internet ne remplace pas une mesure de marché sectorielle.",
                        )
                      : t(
                          "Figures are historical activity or sector context; current capacity and active demand still need confirmation.",
                          "Angka merupakan aktivitas historis/konteks sektor; kapasitas dan kebutuhan aktif perlu dikonfirmasi.",
                          "Les chiffres décrivent une activité historique ou un contexte sectoriel ; la capacité et la demande actuelles doivent encore être confirmées.",
                        )}
                  </p>
                  <ul className="country-sector-checks">
                    {row.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                  {row.samples.map((sample) => (
                    <Link key={sample.id} to={`/data-pasar/${sample.id}`}>
                      {sample.product} · {sample.period} →
                    </Link>
                  ))}
                  <Link to={contextSearch("/data-pasar", { country: dossier.country.name, category: row.category })}>
                    {t("Sector dossier & comparisons", "Dossier sektor & pembanding", "Dossier sectoriel & comparaisons")} →
                  </Link>
                </article>
              ))}
            </div>
            <div className="sectionhead">
              <h2>{t("Providers from official sources", "Penyedia dari sumber resmi", "Organisations issues de sources officielles")}</h2>
              <span>
                {dossier.providerCount} {t("profiles", "profil", "profils")}
              </span>
            </div>
            <div className="cards">
              {market.providers
                .filter((row) => row.country === dossier.country.name)
                .map((row) => (
                  <article className="card" key={row.id}>
                    <h3 className="company-name">
                      <CompanyLogo id={row.id} name={row.name} />
                      {row.name}
                    </h3>
                    <span className="badge">{sector(row.category)}</span>
                    <p>{row.description}</p>
                    <Link to={`/penyedia/${row.id}`}>{t("Full profile & source", "Profil lengkap & sumber", "Profil complet & source")} →</Link>
                  </article>
                ))}
            </div>
            <p className="notice">
              {t("Snapshot", "Snapshot", "Instantané")} {wdi.version}; {t("WDI source updated", "sumber WDI diperbarui", "source WDI mise à jour")}{" "}
              {wdi.sourceUpdatedAt}.{" "}
              {t(
                "Periods can differ across indicators. Missing years are left blank, not filled with zero. Macro context covers the whole economy; oil and gas products are not added to the trade dataset.",
                "Periode antar indikator dapat berbeda. Tahun yang tidak dilaporkan dikosongkan, tidak diisi nol. Referensi konteks makro mencakup seluruh perekonomian; produk oil & gas tidak ditambahkan ke dataset perdagangan.",
                "Les périodes peuvent différer selon l’indicateur. Les années absentes restent vides et ne sont pas remplacées par zéro. Le contexte macro couvre toute l’économie ; les produits pétroliers et gaziers ne sont pas ajoutés au jeu de données commerciales.",
              )}
            </p>
          </>
        )}
        <Footer />
      </main>
    </>
  );
}
