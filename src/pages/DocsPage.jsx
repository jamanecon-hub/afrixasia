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
  ["/api/db/summary", "SQLite observatory: snapshot counts plus collected trade and WDI supplements", "Observatorium SQLite: jumlah snapshot plus suplemen perdagangan dan WDI", "Observatoire SQLite : totaux de l’instantané et suppléments commerce / WDI"],
  ["/api/db/series?country=KEN&indicator=TX.VAL.MRCH.CD.WT", "Collected merchandise-export series for Kenya", "Seri ekspor barang Kenya yang dikumpulkan", "Série collectée des exportations de marchandises du Kenya"],
  ["/api/db/trade?hs=0902&origin=Kenya&year=2024", "Kenya tea export corridors at or above USD 1 million", "Koridor ekspor teh Kenya minimal USD 1 juta", "Corridors d’exportation de thé du Kenya d’au moins 1 million USD"],
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
              : mode === "method"
                ? t("Sources, methods & limits", "Sumber, metode & batas", "Sources, méthodes & limites")
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
        {mode === "method" ? (
          <section className="method">
            <h3>{t("Interpretation & updates", "Interpretasi & pembaruan", "Interprétation & mises à jour")}</h3>
            <p>
              {t(
                "Annual WDI observations retain their source definitions, units and reporting years. Unlike active orders or inventories, they describe historical economic conditions. Do not add different units, percentages or overlapping trade aggregates. News refreshes do not update the statistical snapshot. Three-month planning is qualitative and is not a numerical sales forecast.",
                "Observasi WDI tahunan mempertahankan definisi, satuan, dan tahun pelaporan sumber. Berbeda dari order atau stok aktif, angka ini menggambarkan kondisi ekonomi historis. Jangan menjumlahkan satuan, persentase, atau agregat perdagangan yang saling tumpang tindih. Pembaruan berita tidak memperbarui snapshot statistik. Perencanaan tiga bulan bersifat kualitatif dan bukan proyeksi penjualan numerik.",
                "Les observations annuelles WDI conservent leurs définitions, unités et années de référence. Elles décrivent des conditions économiques historiques, pas des commandes ou des stocks actifs. N’additionnez pas des unités, des pourcentages ou des agrégats commerciaux qui se chevauchent. L’actualité ne met pas à jour l’instantané statistique. Le plan à trois mois est qualitatif, pas une prévision chiffrée des ventes.",
              )}
            </p>
            <h3>{t("Attribution & licensing", "Atribusi & lisensi", "Attribution & licence")}</h3>
            <p>
              World Bank, World Development Indicators · {wdi.version} · {wdi.retrievedAt.slice(0, 10)}.
            </p>
            <a href={wdi.licenseUrl} target="_blank" rel="noreferrer">
              World Bank {t("terms", "terms", "conditions")} ↗
            </a>
            <p>
              {t(
                "National, industry, news, Instagram and member content remain subject to their own terms. AfriXAsia is independent and does not claim affiliation with World Bank or a licensed Bloomberg feed.",
                "Konten nasional, industri, berita, Instagram, dan anggota tetap tunduk pada ketentuannya sendiri. AfriXAsia independen dan tidak mengklaim afiliasi dengan World Bank atau feed Bloomberg berlisensi.",
                "Les contenus nationaux, sectoriels, d’actualité, Instagram et des membres restent soumis à leurs propres conditions. AfriXAsia est indépendant et ne revendique aucune affiliation avec la Banque mondiale ni un flux Bloomberg sous licence.",
              )}
            </p>
            <p>
              SHA-256: <code style={{ overflowWrap: "anywhere" }}>{wdi.checksum}</code>
            </p>
          </section>
        ) : mode === "quality" ? (
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
                  "GET /api/listings returns up to 25 public profiles and a cursor. Interest, segment, and capabilities are included. Email and phone are included only when the member opted in. Buyer budget and private supplier notes are never included.",
                  "GET /api/listings mengembalikan hingga 25 profil publik dan cursor. Minat, segmen, dan kapabilitas disertakan. Email dan telepon hanya ada jika anggota memilih publik. Anggaran buyer dan catatan privat supplier tidak pernah disertakan.",
                  "GET /api/listings renvoie jusqu’à 25 profils publics et un curseur. Intérêt, segment et capacités sont inclus. E-mail et téléphone ne le sont que si le membre l’a choisi. Le budget acheteur et les notes privées du fournisseur ne sont jamais inclus.",
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
