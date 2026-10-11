import { useMemo, useState } from "react";
import { countrySectors, summary, wdi } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import { useLanguage } from "../i18n.jsx";

const examples = [
  ["/api/catalog", "Dataset catalog, definitions and licenses", "Katalog dataset, definisi, dan lisensi", "Catalogue, définitions et licences"],
  ["/api/reference?view=latest&country=IDN", "Latest reported values for Indonesia", "Nilai terakhir Indonesia", "Dernières valeurs disponibles pour l’Indonésie"],
  ["/api/reference?view=series&countries=IDN,KEN&indicator=SP.POP.TOTL", "Population time series: Indonesia and Kenya", "Seri populasi: Indonesia dan Kenya", "Séries démographiques : Indonésie et Kenya"],
  ["/api/market?country=Kenya&side=demand", "Historical demand references for Kenya", "Referensi permintaan historis Kenya", "Références historiques de demande au Kenya"],
  ["/api/providers?country=JP&category=Workforce", "Public organization references, Japan workforce sector", "Referensi perusahaan publik sektor tenaga kerja Jepang", "Références publiques, secteur de la main-d’œuvre au Japon"],
  ["/api/intelligence?country=BF&category=Film%20%26%20media", "Country–sector evidence and research questions", "Bukti dan pertanyaan riset negara–sektor", "Données et questions de recherche pays–secteur"],
  ["/api/coverage", "Coverage and missing data", "Cakupan dan data belum tersedia", "Couverture et données manquantes"],
  ["/api/brief", "Media Brief, source status and dated headlines", "Media Brief, status sumber, dan tanggal berita", "Media Brief, état des sources et articles datés"],
  ["/api/listings", "Public member profiles", "Profil anggota publik", "Profils publics des membres"],
  ["/api/listings?format=csv", "Public member CSV export", "Ekspor CSV anggota publik", "Export CSV public des membres"],
];

export default function DocsPage({ mode }) {
  const { t, sector, language } = useLanguage();
  const stats = useMemo(() => summary(), []);
  const [country, setCountry] = useState("");
  const rows = useMemo(() => countrySectors(country), [country]);
  return (
    <>
      <Header active="Open data" />
      <main>
        <div className="reference-hero">
          <span className="eyebrow">AFRIXASIA · OPEN REFERENCE</span>
          <h1>
            {mode === "quality"
              ? t("Data quality & coverage", "Kualitas & cakupan data", "Qualité & couverture des données")
              : t("Use the AfriXAsia data API", "Gunakan API data AfriXAsia", "Utilisez l’API de données AfriXAsia")}
          </h1>
          <p>
            {t(
              "A public reference built from traceable sources. Historical statistics, current news and self-declared member profiles are different kinds of evidence.",
              "Referensi publik dengan sumber yang dapat ditelusuri. Statistik historis, berita terkini, dan profil anggota memiliki jenis bukti berbeda.",
              "Une référence publique fondée sur des sources traçables. Statistiques historiques, actualités et profils autodéclarés sont des catégories de preuves distinctes.",
            )}
          </p>
        </div>
        <div className="dataset-strip">
          <span>{wdi.version}</span>
          <span>
            {t("Retrieved", "Diambil", "Collecté")} {wdi.retrievedAt.slice(0, 10)}
          </span>
          <span>
            {t("WDI updated", "WDI diperbarui", "WDI mis à jour")} {wdi.sourceUpdatedAt}
          </span>
        </div>
        {mode === "quality" ? (
          <>
            <div className="country-fact-grid">
              {[
                [stats.observations.toLocaleString(language === "id" ? "id-ID" : language === "fr" ? "fr-FR" : "en-GB"), t("Numerical observations", "Observasi numerik", "Observations numériques")],
                [`${stats.availablePairs} / ${stats.pairs}`, t("Country–indicator pairs reported", "Pasangan negara–indikator tersedia", "Paires pays–indicateur renseignées")],
                [stats.missingPairs, t("Pairs without reported values", "Pasangan belum dilaporkan", "Paires sans valeurs disponibles")],
                [stats.stalePairs, t("Latest year 2022 or older", "Tahun terakhir 2022 atau lebih lama", "Dernière année 2022 ou antérieure")],
              ].map(([value, label]) => (
                <div className="stat" key={label}>
                  <label>{label}</label>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="portal-filters">
              <label>
                {t("Country", "Negara", "Pays")}
                <select value={country} onChange={(event) => setCountry(event.target.value)}>
                  <option value="">{t("All economies", "Semua ekonomi", "Toutes les économies")}</option>
                  {wdi.countries.map((item) => (
                    <option key={item.iso3} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("Economy", "Ekonomi", "Économie")}</th>
                    <th>WDI</th>
                    {rows[0]?.sectors.map((sectorRow) => (
                      <th key={sectorRow.category}>{sector(sectorRow.category)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.iso3}>
                      <td>{row.country}</td>
                      <td>{row.indicators}/17</td>
                      {row.sectors.map((sectorRow) => (
                        <td key={sectorRow.category}>
                          <b>
                            {sectorRow.marketRecords} {t("references", "referensi", "références")}
                          </b>
                          <small>
                            {sectorRow.referenceIndicators} WDI · {sectorRow.providerProfiles} {t("organizations", "perusahaan", "organisations")}
                          </small>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="notice">
              {t(
                "Zero references means no curated record in this snapshot, not zero market demand. WDI context indicators are not equivalent to sector-specific trade data.",
                "Nol referensi berarti belum ada catatan terkurasi di snapshot, bukan nol permintaan pasar. Indikator konteks WDI bukan data perdagangan spesifik sektor.",
                "Zéro référence signifie aucune donnée sélectionnée dans cet instantané, pas une demande nulle. Les indicateurs de contexte WDI ne sont pas des données commerciales sectorielles.",
              )}
            </p>
          </>
        ) : (
          <>
            <p className="notice">
              {t(
                "Public reference endpoints require no API key or login and support JSON/CSV with CORS. Creating or changing a member profile requires authentication.",
                "Endpoint referensi publik tidak memerlukan API key atau login dan mendukung JSON/CSV dengan CORS. Pembuatan atau perubahan profil anggota memerlukan autentikasi.",
                "Les points d’accès publics ne nécessitent ni clé API ni connexion et prennent en charge JSON/CSV avec CORS. La création et la modification d’un profil nécessitent une authentification.",
              )}
            </p>
            <div className="api-examples">
              {examples.map(([href, en, id, fr]) => (
                <article key={href}>
                  <a href={href} target="_blank" rel="noreferrer">
                    <code>GET {href}</code> ↗
                  </a>
                  <p>{t(en, id, fr)}</p>
                </article>
              ))}
            </div>
            <section className="method">
              <h3>{t("Reference API parameters", "Parameter API reference", "Paramètres de l’API reference")}</h3>
              <p>
                <code>view=latest|series|metadata · country=ISO2/ISO3/name · countries=IDN,KEN · indicator=CODE[,CODE] · start/end=2015…2025 · page · per_page=1…20000 · format=csv</code>
              </p>
              <p>
                {t(
                  "Reference CSV includes all filtered results. Invalid countries, indicators or ranges return HTTP 400. Latest values may refer to different reporting years. Missing years are omitted, not estimated.",
                  "CSV reference memuat seluruh hasil filter. Negara, indikator, atau rentang tidak valid menerima HTTP 400. Nilai terakhir dapat memiliki tahun berbeda. Tahun kosong tidak diestimasi.",
                  "Le CSV reference inclut tous les résultats filtrés. Pays, indicateurs ou plages invalides renvoient HTTP 400. Les dernières valeurs peuvent avoir des années différentes. Les années absentes ne sont pas estimées.",
                )}
              </p>
              <h3>{t("Member export pagination", "Paginasi ekspor anggota", "Pagination de l’export des membres")}</h3>
              <p>
                {t(
                  "GET /api/listings returns up to 25 public profiles and a cursor. Pass cursor to read the next page. CSV export returns the full public directory. Private buyer and supplier fields are never included.",
                  "GET /api/listings mengembalikan hingga 25 profil publik dan cursor. Kirim cursor untuk halaman berikutnya. Ekspor CSV memuat seluruh direktori publik. Isian privat buyer dan supplier tidak pernah disertakan.",
                  "GET /api/listings renvoie jusqu’à 25 profils publics et un curseur. Passez le curseur pour la page suivante. L’export CSV contient tout l’annuaire public. Les champs privés ne sont jamais inclus.",
                )}
              </p>
            </section>
          </>
        )}
        <Footer />
      </main>
    </>
  );
}
