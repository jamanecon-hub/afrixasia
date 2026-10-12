import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { findCountry, wdi } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import TimeSeriesChart from "../components/TimeSeriesChart.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, registerSearch, ResearchBar, useResearch } from "../research.jsx";

export default function AnalysisPage() {
  const { t, formatValue, sector, language } = useLanguage();
  const [context, setContext] = useResearch();
  const country = findCountry(context.country || "") || wdi.countries.find((item) => item.iso3 === "IDN");
  const compareCode =
    context.compare === "none"
      ? ""
      : findCountry(context.compare || "")?.iso3 || (country.iso3 === "KEN" ? "IDN" : "KEN");
  const indicatorCode = wdi.indicators.some((item) => item.code === context.indicator)
    ? context.indicator
    : wdi.indicators.find((item) => item.category === context.category)?.code || "NY.GDP.MKTP.KD.ZG";
  const indicator = wdi.indicators.find((item) => item.code === indicatorCode);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title =
      language === "id"
        ? "AfriXAsia | Analisis Ekonomi"
        : language === "fr"
          ? "AfriXAsia | Analyse économique"
          : "AfriXAsia | Economic Analysis";
    return () => {
      document.title = previous;
    };
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    setRows([]);
    const params = new URLSearchParams({
      view: "series",
      indicator: indicatorCode,
      countries: [country.iso3, compareCode].filter(Boolean).join(","),
      per_page: "1000",
    });
    fetch(`/api/reference?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("series");
        setRows((await response.json()).observations);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [country.iso3, compareCode, indicatorCode]);

  const latest = wdi.latest.find((row) => row.country === country.iso3 && row.indicator === indicatorCode);
  const previous = rows
    .filter((row) => row.country === country.iso3 && row.year < (latest?.year || 0))
    .sort((a, b) => b.year - a.year)[0];
  const delta = latest && previous ? latest.value - previous.value : null;
  const labels = Object.fromEntries(wdi.countries.map((item) => [item.iso3, item.name]));
  const csv = new URLSearchParams({
    view: "series",
    countries: [country.iso3, compareCode].filter(Boolean).join(","),
    indicator: indicatorCode,
    format: "csv",
  });

  return (
    <>
      <Header active="Open data" />
      <main>
        <ResearchBar scope="analysis" />
        <div className="reference-hero">
          <span className="eyebrow">ECONOMIC INTELLIGENCE · OPEN REFERENCE</span>
          <h1>{t("Economic Analysis", "Analisis Ekonomi", "Analyse économique")}</h1>
          <p>
            {t(
              "Understand market scale, economic direction and sector context. Compare official annual data, inspect source definitions and frame the next three months with explicit evidence limits.",
              "Pahami skala pasar, arah ekonomi, dan konteks sektor. Bandingkan data tahunan resmi, periksa definisi sumber, dan kaji tiga bulan ke depan dengan batas bukti yang jelas.",
              "Comprenez la taille des marchés, la dynamique économique et les secteurs. Comparez les données annuelles officielles et préparez les trois prochains mois en tenant compte des limites des données.",
            )}
          </p>
          <div className="reference-badges">
            <span>104 {t("economies", "ekonomi", "économies")}</span>
            <span>17 {t("indicators", "indikator", "indicateurs")}</span>
            <span>2015–2025</span>
            <span>World Bank WDI</span>
          </div>
        </div>
        <div className="dataset-strip">
          <span>{t("Retrieved", "Diambil", "Collecté")} · 10 October 2026</span>
          <span>
            {t("Source updated", "Sumber diperbarui", "Source mise à jour")} · {wdi.sourceUpdatedAt}
          </span>
          <a href="/api/reference?view=series&format=csv">
            {t("Download full dataset", "Unduh dataset lengkap", "Télécharger les données")} ↓
          </a>
          <Link to="/api-docs">API →</Link>
        </div>
        <div className="reference-selectors">
          <label>
            {t("Economy", "Ekonomi", "Économie")}
            <select
              value={country.iso3}
              onChange={(event) => {
                const next = findCountry(event.target.value);
                setContext({
                  ...context,
                  country: next.name,
                  ...(event.target.value === compareCode ? { compare: "none" } : {}),
                });
              }}
            >
              {wdi.countries.map((item) => (
                <option key={item.iso3} value={item.iso3}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Compare with", "Bandingkan dengan", "Comparer avec")}
            <select
              value={compareCode}
              onChange={(event) => setContext({ ...context, compare: event.target.value || "none" })}
            >
              <option value="">{t("No comparison", "Tanpa pembanding", "Sans comparaison")}</option>
              {wdi.countries
                .filter((item) => item.iso3 !== country.iso3)
                .map((item) => (
                  <option key={item.iso3} value={item.iso3}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            {t("Indicator", "Indikator", "Indicateur")}
            <select value={indicatorCode} onChange={(event) => setContext({ ...context, indicator: event.target.value })}>
              {wdi.indicators.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="reference-workspace">
          <article className="card">
            <span className="eyebrow">
              {sector(indicator.category)} · {indicator.unit}
            </span>
            <h2>{indicator.name}</h2>
            {loading ? (
              <p role="status">{t("Loading official series…", "Memuat seri resmi…", "Chargement des séries officielles…")}</p>
            ) : failed ? (
              <div className="form-error" role="alert">
                {t(
                  "The series could not be loaded. Choose another indicator or reload this page.",
                  "Seri belum dapat dimuat. Pilih indikator lain atau muat ulang.",
                  "Impossible de charger la série. Choisissez un autre indicateur ou rechargez la page.",
                )}
              </div>
            ) : (
              <TimeSeriesChart rows={rows} labels={labels} unit={indicator.unit} />
            )}
            <p className="notice">
              {t(
                "Original indicator names and definitions are retained in the source language. Missing observations are not estimated.",
                "Nama indikator dan definisi asli dipertahankan dalam bahasa sumber. Data yang hilang tidak diestimasi.",
                "Les noms et définitions des indicateurs restent dans la langue source. Les observations manquantes ne sont pas estimées.",
              )}
            </p>
            <a className="btn" href={`/api/reference?${csv}`}>
              CSV ↓
            </a>
          </article>
          <aside className="card">
            <span className="eyebrow">{t("READING THE SIGNAL", "MEMBACA SINYAL", "INTERPRÉTER LE SIGNAL")}</span>
            <h2>{country.name}</h2>
            <div className="portal-number">{latest ? formatValue(latest.value, indicator.unit, true) : "—"}</div>
            <p>
              {indicator.unit} · {latest?.year || t("Not reported", "Belum dilaporkan", "Non renseigné")}
            </p>
            {latest && previous && delta !== null && (
              <p>
                {t("Change from", "Perubahan dari", "Variation depuis")} {previous.year}:{" "}
                <b>
                  {delta > 0 ? "+" : ""}
                  {formatValue(delta, indicator.unit)}
                </b>{" "}
                {indicator.unit}
              </p>
            )}
            <p>
              {t(
                "This measures the selected indicator only. It does not establish purchasable demand, supplier readiness or a bilateral opportunity.",
                "Ini hanya mengukur indikator terpilih. Bukan bukti permintaan siap beli, kesiapan pemasok, atau peluang bilateral.",
                "Cette mesure concerne uniquement l’indicateur choisi. Elle ne prouve pas une demande d’achat, la disponibilité des fournisseurs ni une opportunité bilatérale.",
              )}
            </p>
            <Link className="btn primary" to={contextSearch("/data-pasar", { ...context, country: country.name })}>
              {t("Explore market references", "Jelajahi referensi pasar", "Explorer les références du marché")} →
            </Link>
            <Link className="btn" to={registerSearch({ ...context, country: country.name, target: context.target || country.name })}>
              {t("Turn research into an introduction", "Lanjutkan riset ke perkenalan", "Passer de l’analyse à la présentation")} ↗
            </Link>
          </aside>
        </div>
        <section className="reference-catalog" id="outlook">
          <span className="eyebrow">
            {t("THREE-MONTH PLANNING OUTLOOK", "KAJIAN PERENCANAAN TIGA BULAN", "PERSPECTIVES DE PLANIFICATION SUR TROIS MOIS")}
          </span>
          <h2>{t("November 2026 — January 2027", "November 2026 — Januari 2027", "Novembre 2026 — janvier 2027")}</h2>
          <p className="notice">
            {t(
              "Qualitative planning scenarios prepared on 10 October 2026. These are analyst questions and monitoring priorities, not numerical forecasts. Annual historical observations cannot support a precise three-month sales forecast.",
              "Skenario perencanaan kualitatif disusun 10 Oktober 2026. Ini pertanyaan analisis dan prioritas pemantauan, bukan proyeksi numerik. Data tahunan historis tidak cukup untuk meramal penjualan tiga bulan secara presisi.",
              "Scénarios qualitatifs préparés le 10 octobre 2026 : questions d’analyse et priorités de suivi, pas de prévisions chiffrées. Les observations annuelles ne permettent pas de prévoir précisément les ventes sur trois mois.",
            )}
          </p>
          <div className="cards">
            {[
              [
                t("01 · Validate the baseline", "01 · Validasi baseline", "01 · Valider la référence"),
                t(
                  "Confirm the latest reported year and indicator definition. Check whether the measure covers your specific product or service before choosing a market.",
                  "Konfirmasi tahun terakhir dan definisi indikator. Periksa apakah ukuran mencakup produk atau jasa Anda sebelum memilih pasar.",
                  "Confirmez l’année disponible et la définition. Vérifiez que la mesure couvre votre produit ou service avant de choisir un marché.",
                ),
              ],
              [
                t("02 · Test the corridor", "02 · Uji koridor", "02 · Tester le corridor"),
                t(
                  "Compare destination demand references with origin capabilities. Ask actual suppliers about capacity, delivery, certification and pricing; public company profiles do not confirm availability.",
                  "Bandingkan referensi permintaan tujuan dengan kemampuan negara asal. Tanyakan kapasitas, pengiriman, sertifikasi, dan harga langsung kepada penyedia.",
                  "Comparez les références du pays cible aux capacités du pays d’origine. Vérifiez directement capacités, délais, certifications et prix auprès des fournisseurs.",
                ),
              ],
              [
                t("03 · Reassess with current evidence", "03 · Evaluasi dengan bukti terbaru", "03 · Réévaluer avec des preuves récentes"),
                t(
                  "Track published news, exchange-rate and logistics developments. Revisit assumptions when new official releases or direct partner responses arrive.",
                  "Pantau berita, perubahan kurs, dan logistik. Tinjau ulang asumsi saat rilis resmi atau jawaban mitra diterima.",
                  "Suivez l’actualité, les devises et la logistique. Réévaluez vos hypothèses à chaque nouvelle publication officielle ou réponse de partenaire.",
                ),
              ],
            ].map(([title, copy]) => (
              <article className="card" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <Link to={contextSearch("/daily-brief", context)}>Media Brief →</Link>
        </section>
        <details className="card">
          <summary>{t("Source definition & reuse", "Definisi sumber & penggunaan", "Définition source & réutilisation")}</summary>
          <p>{indicator.definition}</p>
          <p>{indicator.interpretation}</p>
          <a href={indicator.sourceUrl} target="_blank" rel="noreferrer">
            World Bank ↗
          </a>
          {" · "}
          <a href={indicator.licenseUrl} target="_blank" rel="noreferrer">
            {t("License", "Lisensi", "Licence")} ↗
          </a>
        </details>
        <Footer />
      </main>
    </>
  );
}
