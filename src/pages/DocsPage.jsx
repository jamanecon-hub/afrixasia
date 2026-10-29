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
  ["/api/observatory?view=status", "Observatory database: coverage, sources, and the Kenya checks", "Basis data observatorium: cakupan, sumber, dan cek Kenya", "Base observatoire : couverture, sources et contrôles Kenya"],
  ["/api/observatory?view=trade&reporter=KEN&partner=PAK&hs=0902&year=2024", "Kenya tea exports to Pakistan, 2024", "Ekspor teh Kenya ke Pakistan, 2024", "Exportations de thé du Kenya vers le Pakistan, 2024"],
  ["/api/observatory?view=production&country=KEN&item=667&element=5510", "Kenya tea-leaf production", "Produksi daun teh Kenya", "Production de feuilles de thé au Kenya"],
  ["/api/observatory?view=prices&series=Tea,%20Mombasa&limit=3", "Latest Mombasa tea auction benchmarks", "Patokan lelang teh Mombasa terbaru", "Derniers prix de référence du thé de Mombasa"],
  ["/api/observatory?view=trade&hs=120740&year=2024", "Sesame-seed exports of at least USD 1 million, 2024", "Ekspor biji wijen minimal USD 1 juta, 2024", "Exportations de graines de sésame d’au moins 1 million USD, 2024"],
  ["/api/observatory?view=trade&hs=0303&year=2024", "Frozen-fish exports of at least USD 1 million, 2024", "Ekspor ikan beku minimal USD 1 juta, 2024", "Exportations de poisson congelé d’au moins 1 million USD, 2024"],
  ["/api/observatory?view=production&country=EGY&item=FISH-AQUA&element=Q_tlw", "Egypt aquaculture, live weight", "Akuakultur Mesir, bobot hidup", "Aquaculture égyptienne, poids vif"],
  ["/api/observatory?view=trade&hs=4001&year=2024", "Natural rubber exports of at least USD 1 million, 2024", "Ekspor karet alam minimal USD 1 juta, 2024", "Exportations de caoutchouc naturel d’au moins 1 million USD, 2024"],
  ["/api/observatory?view=prices&series=Rubber,%20TSR20&limit=3", "Latest TSR20 natural-rubber benchmarks", "Patokan karet alam TSR20 terbaru", "Derniers prix de référence du caoutchouc naturel TSR20"],
  ["/api/observatory?view=trade&reporter=SEN&partner=CHN&hs=1202&year=2024", "Senegal groundnut exports to China, 2024", "Ekspor kacang tanah Senegal ke Tiongkok, 2024", "Exportations d’arachides du Sénégal vers la Chine, 2024"],
  ["/api/observatory?view=production&country=SEN&item=242&element=5510", "Senegal in-shell groundnut production", "Produksi kacang tanah berkulit Senegal", "Production d’arachides en coque du Sénégal"],
  ["/api/observatory?view=prices&series=Groundnuts&limit=3", "Latest groundnut benchmarks", "Patokan kacang tanah terbaru", "Derniers prix de référence de l’arachide"],
  ["/api/observatory?view=trade&reporter=ZAF&partner=KOR&hs=1005&year=2023", "South Africa maize exports to Korea, 2023", "Ekspor jagung Afrika Selatan ke Korea, 2023", "Exportations de maïs de l’Afrique du Sud vers la Corée, 2023"],
  ["/api/observatory?view=production&country=ZAF&item=56&element=5510", "South Africa maize production", "Produksi jagung Afrika Selatan", "Production de maïs de l’Afrique du Sud"],
  ["/api/observatory?view=prices&series=Maize&limit=3", "Latest US Gulf maize benchmarks", "Patokan jagung US Gulf terbaru", "Derniers prix de référence du maïs US Gulf"],
  ["/api/observatory?view=trade&reporter=ZWE&partner=CHN&hs=2401&year=2024", "Zimbabwe unmanufactured tobacco exports to China, 2024", "Ekspor tembakau belum diolah Zimbabwe ke Tiongkok, 2024", "Exportations de tabac non fabriqué du Zimbabwe vers la Chine, 2024"],
  ["/api/observatory?view=production&country=ZWE&item=826&element=5510", "Zimbabwe unmanufactured tobacco production", "Produksi tembakau belum diolah Zimbabwe", "Production de tabac non fabriqué du Zimbabwe"],
  ["/api/observatory?view=prices&series=Tobacco,%20US%20import%20u.v.&limit=3", "Latest US tobacco import unit values", "Nilai satuan impor tembakau AS terbaru", "Dernières valeurs unitaires du tabac importé aux États-Unis"],
  ["/api/observatory?view=trade&reporter=IND&partner=LBY&hs=1701&year=2024", "India sugar exports to Libya, 2024", "Ekspor gula India ke Libya, 2024", "Exportations de sucre de l’Inde vers la Libye, 2024"],
  ["/api/observatory?view=production&country=IND&item=156&element=5510", "India sugar-cane production", "Produksi tebu India", "Production de canne à sucre de l’Inde"],
  ["/api/observatory?view=prices&series=Sugar,%20world&limit=3", "Latest ISA world sugar benchmarks", "Patokan gula dunia ISA terbaru", "Derniers prix de référence ISA du sucre mondial"],
  ["/api/observatory?view=trade&reporter=MAR&partner=IND&hs=2510&year=2024", "Morocco phosphate rock exports to India, 2024", "Ekspor batuan fosfat Maroko ke India, 2024", "Exportations de phosphate naturel du Maroc vers l’Inde, 2024"],
  ["/api/observatory?view=prices&series=Phosphate%20rock&limit=3", "Latest North Africa phosphate rock benchmarks", "Patokan batuan fosfat Afrika Utara terbaru", "Derniers prix de référence du phosphate naturel d’Afrique du Nord"],
  ["/api/observatory?view=trade&reporter=COD&partner=CHN&hs=740311&year=2024", "DRC refined copper cathode exports to China, 2024", "Ekspor katoda tembaga olahan Kongo ke Tiongkok, 2024", "Exportations de cathodes de cuivre affiné de la RDC vers la Chine, 2024"],
  ["/api/observatory?view=trade&reporter=COD&partner=CHN&hs=2603&year=2024", "DRC copper ore exports to China, 2024", "Ekspor bijih tembaga Kongo ke Tiongkok, 2024", "Exportations de minerai de cuivre de la RDC vers la Chine, 2024"],
  ["/api/observatory?view=prices&series=Copper&limit=3", "Latest LME copper cathode benchmarks", "Patokan katoda tembaga LME terbaru", "Derniers prix de référence LME des cathodes de cuivre"],
  ["/api/observatory?view=trade&reporter=COD&partner=CHN&hs=282200&year=2024", "DRC cobalt oxides and hydroxides exports to China, 2024", "Ekspor oksida dan hidroksida kobalt Kongo ke Tiongkok, 2024", "Exportations d’oxydes et d’hydroxydes de cobalt de la RDC vers la Chine, 2024"],
  ["/api/observatory?view=trade&reporter=ZAF&partner=CHN&hs=2601&year=2024", "South Africa iron ore exports to China, 2024", "Ekspor bijih besi Afrika Selatan ke Tiongkok, 2024", "Exportations de minerai de fer de l’Afrique du Sud vers la Chine, 2024"],
  ["/api/observatory?view=prices&series=Iron%20ore,%20cfr%20spot&limit=3", "Latest cfr China iron-ore benchmarks", "Patokan bijih besi cfr Tiongkok terbaru", "Derniers prix de référence c.f.r. Chine du minerai de fer"],
  ["/api/observatory?view=trade&reporter=ZAF&partner=CHN&hs=2602&year=2024", "South Africa manganese ore exports to China, 2024", "Ekspor bijih mangan Afrika Selatan ke Tiongkok, 2024", "Exportations de minerai de manganèse de l’Afrique du Sud vers la Chine, 2024"],
  ["/api/observatory?view=trade&reporter=ZAF&partner=CHN&hs=2610&year=2024", "South Africa chromium ore exports to China, 2024", "Ekspor bijih krom Afrika Selatan ke Tiongkok, 2024", "Exportations de minerai de chrome de l’Afrique du Sud vers la Chine, 2024"],
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
              World Bank, World Development Indicators · {wdi.version} · {wdi.retrievedAt.slice(0, 10)}. UN Comtrade
              public preview for Africa–Asia product flows, including sesame, vanilla, cloves, pepper, frozen fish,
              fillets, prepared tuna, natural rubber, groundnuts, maize, unmanufactured tobacco, sugar, phosphate rock, copper ore, refined copper cathodes, cobalt oxides and hydroxides, iron ore, manganese ore, and chromium ore. World Bank Pink Sheet for monthly commodity benchmarks. FAO. 2025. FAOSTAT:
              Crops and livestock products. FAO. 2026. FishStat: Global production. Licence: CC-BY-4.0.
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
              <h3>{t("Observatory database", "Basis data observatorium", "Base de l’observatoire")}</h3>
              <p>
                <code>view=status|countries|indicators|series|trade|corridors|prices|production · country · reporter · partner · indicator · hs · product · series · item · element · year · start · end · limit · format=csv</code>
              </p>
              <p>
                {t(
                  "SQLite file data/observatory.sqlite. Series requires country and indicator. Trade requires reporter, partner, hs, or year. Prices require product or series. Production requires country, item, or product. Flows below USD 1 million are omitted, and a missing pair is not zero trade. A missing production year is not zero output. Fish production is live weight, not the customs weight of HS 0303, 0304, or 160414. Groundnut production is in shell, not HS 1202 customs weight. Maize production is grain, not HS 1005 customs weight. Unmanufactured tobacco production is not the customs weight of HS 2401. Sugar cane and sugar beet are not raw sugar and must not be added. Raw centrifugal sugar is not the customs weight of HS 1701. Phosphate rock trade is the customs weight of HS 2510, not mine production and not DAP, TSP, or urea. Copper ore (HS 2603) and refined copper cathodes (HS 740311) must not be added. Cathode trade is not mine production and not the LME price. Cobalt oxides and hydroxides (HS 282200) are not cobalt ores (HS 2605), not unwrought cobalt (HS 810520), and not copper. Customs weight is not contained cobalt metal. No cobalt price is stored. Iron ore trade is the customs weight of HS 2601, including agglomerated ore, not pig iron, not steel, and not mine production. The iron-ore benchmark is 62% Fe fines, c.f.r. China, in US dollars per dry metric ton. Manganese ore trade is the customs weight of HS 2602, including ferruginous manganese ores with a manganese content of 20% or more, calculated on the dry weight. It is not ferromanganese (HS 7202), not manganese oxides (HS 2820), and not mine production. No manganese price is stored. Chromium ore trade is the customs weight of HS 2610. It is not ferrochromium (HS 720241 or HS 720249), not chromium oxides and hydroxides (HS 2819), and not mine production. No chromium price is stored.",
                  "Berkas SQLite data/observatory.sqlite. Series memerlukan negara dan indikator. Trade memerlukan reporter, partner, hs, atau year. Prices memerlukan product atau series. Production memerlukan country, item, atau product. Arus di bawah USD 1 juta tidak dimuat, dan pasangan yang tidak ada bukan nol perdagangan. Tahun produksi yang kosong bukan nol hasil. Produksi ikan adalah bobot hidup, bukan bobot bea cukai HS 0303, 0304, atau 160414. Produksi kacang tanah adalah berkulit, bukan bobot bea cukai HS 1202. Produksi jagung adalah biji-bijian, bukan bobot bea cukai HS 1005. Produksi tembakau belum diolah bukan bobot bea cukai HS 2401. Tebu dan bit gula bukan gula mentah dan tidak boleh dijumlahkan. Gula sentrifugal mentah bukan bobot bea cukai HS 1701. Perdagangan batuan fosfat adalah bobot bea cukai HS 2510, bukan produksi tambang dan bukan DAP, TSP, atau urea. Bijih tembaga (HS 2603) dan katoda tembaga olahan (HS 740311) tidak boleh dijumlahkan. Perdagangan katoda bukan produksi tambang dan bukan harga LME. Oksida dan hidroksida kobalt (HS 282200) bukan bijih kobalt (HS 2605), bukan kobalt belum diolah (HS 810520), dan bukan tembaga. Bobot bea cukai bukan logam terkandung. Harga kobalt tidak disimpan. Perdagangan bijih besi adalah bobot bea cukai HS 2601, termasuk bijih yang diaglomerasi, bukan besi kasar, bukan baja, dan bukan produksi tambang. Patokan bijih besi adalah bijih halus 62% Fe, c.f.r. Tiongkok, dalam dolar AS per ton kering. Perdagangan bijih mangan adalah bobot bea cukai HS 2602, termasuk bijih mangan feruginus dengan kadar mangan 20% atau lebih, dihitung atas berat kering. Ini bukan ferromangan (HS 7202), bukan oksida mangan (HS 2820), dan bukan produksi tambang. Harga mangan tidak disimpan. Perdagangan bijih krom adalah bobot bea cukai HS 2610. Ini bukan ferrokrom (HS 720241 atau HS 720249), bukan oksida dan hidroksida krom (HS 2819), dan bukan produksi tambang. Harga krom tidak disimpan.",
                  "Fichier SQLite data/observatory.sqlite. Series exige un pays et un indicateur. Trade exige reporter, partner, hs ou year. Prices exige product ou series. Production exige country, item ou product. Les flux inférieurs à 1 million USD sont omis, et une paire absente n’est pas un commerce nul. Une année de production absente n’est pas une production nulle. La production de poisson est un poids vif, pas le poids en douane des codes SH 0303, 0304 ou 160414. La production d’arachides est en coque, pas le poids en douane du SH 1202. La production de maïs est du grain, pas le poids en douane du SH 1005. La production de tabac non fabriqué n’est pas le poids en douane du SH 2401. La canne à sucre et la betterave sucrière ne sont pas du sucre brut et ne doivent pas être additionnées. Le sucre brut centrifuge n’est pas le poids en douane du SH 1701. Le commerce de phosphate naturel est le poids en douane du SH 2510, pas la production minière et pas le DAP, le TSP ou l’urée. Le minerai de cuivre (SH 2603) et les cathodes de cuivre affiné (SH 740311) ne doivent pas être additionnés. Le commerce des cathodes n’est pas la production minière et n’est pas le prix LME. Les oxydes et hydroxydes de cobalt (SH 282200) ne sont pas le minerai de cobalt (SH 2605), ni le cobalt brut (SH 810520), ni le cuivre. Le poids en douane n’est pas le métal contenu. Aucun prix du cobalt n’est enregistré. Le commerce de minerai de fer est le poids en douane du SH 2601, y compris le minerai aggloméré, pas la fonte, pas l’acier, et pas la production minière. Le prix de référence est le minerai fin à 62 % Fe, c.f.r. Chine, en dollars par tonne sèche. Le commerce de minerai de manganèse est le poids en douane du SH 2602, y compris les minerais de manganèse ferrugineux d’une teneur en manganèse de 20 % ou plus, calculée sur le poids sec. Ce n’est pas le ferromanganèse (SH 7202), ni les oxydes de manganèse (SH 2820), ni la production minière. Aucun prix du manganèse n’est enregistré. Le commerce de minerai de chrome est le poids en douane du SH 2610. Ce n’est pas le ferrochrome (SH 720241 ou SH 720249), ni les oxydes et hydroxydes de chrome (SH 2819), ni la production minière. Aucun prix du chrome n’est enregistré.",
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
