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
  ["/api/observatory", "Bilateral trade database: products, prices, coverage, and limits", "Basis data perdagangan bilateral: produk, harga, cakupan, dan batas", "Base de commerce bilatéral : produits, prix, couverture et limites"],
  ["/api/observatory/trade?reporter=KEN&partner=PAK&hs=0902&year=2024&flow=export", "Kenya tea export statement to Pakistan, 2024", "Pernyataan ekspor teh Kenya ke Pakistan, 2024", "Déclaration d’export de thé du Kenya vers le Pakistan, 2024"],
  ["/api/observatory/trade?reporter=MAR&partner=IND&hs=310530&year=2024&flow=export", "Morocco diammonium phosphate export statement to India, 2024", "Pernyataan ekspor diammonium fosfat Maroko ke India, 2024", "Déclaration d’export de phosphate diammonique du Maroc vers l’Inde, 2024"],
  ["/api/observatory/prices?series=cocoa,tea-mombasa&from=2024-01", "Cocoa and Mombasa tea reference prices", "Harga referensi kakao dan teh Mombasa", "Prix de référence du cacao et du thé de Mombasa"],
  ["/api/observatory/trade?reporter=CIV&partner=CHN&hs=4001&year=2024&flow=export", "Côte d’Ivoire natural rubber export statement to China, 2024", "Pernyataan ekspor karet alam Pantai Gading ke Tiongkok, 2024", "Déclaration d’export de caoutchouc naturel de la Côte d’Ivoire vers la Chine, 2024"],
  ["/api/observatory/prices?series=maize,sugar-world&from=2026-01", "Maize and world sugar reference prices", "Harga referensi jagung dan gula dunia", "Prix de référence du maïs et du sucre mondial"],
  ["/api/observatory/trade?reporter=ZAF&partner=CHN&hs=2601&year=2024&flow=export", "South Africa iron ore export statement to China, 2024", "Pernyataan ekspor bijih besi Afrika Selatan ke Tiongkok, 2024", "Déclaration d’export de minerai de fer d’Afrique du Sud vers la Chine, 2024"],
  ["/api/observatory/prices?series=crude-brent,iron-ore&from=2026-10", "Brent crude and iron ore reference prices", "Harga referensi minyak Brent dan bijih besi", "Prix de référence du Brent et du minerai de fer"],
  ["/api/observatory/trade?reporter=CHN&partner=ZAF&hs=710812&year=2024&flow=import", "China unwrought gold import statement from South Africa, 2024", "Pernyataan impor emas belum diolah Tiongkok dari Afrika Selatan, 2024", "Déclaration d’import d’or non façonné de la Chine depuis l’Afrique du Sud, 2024"],
  ["/api/observatory/prices?series=gold,platinum&from=2026-10", "Gold and platinum reference prices", "Harga referensi emas dan platina", "Prix de référence de l’or et du platine"],
  ["/api/observatory/trade?reporter=CHN&partner=CMR&hs=4403&year=2024&flow=import", "China wood-in-the-rough import statement from Cameroon, 2024", "Pernyataan impor kayu gelondongan Tiongkok dari Kamerun, 2024", "Déclaration d’import de bois bruts de la Chine depuis le Cameroun, 2024"],
  ["/api/observatory/prices?series=logs-cameroon,sawnwood-cameroon&from=2026-10", "Cameroon log and sawnwood reference prices", "Harga referensi kayu gelondongan dan kayu gergajian Kamerun", "Prix de référence des grumes et du bois scié du Cameroun"],
  ["/api/observatory/trade?reporter=CHN&partner=GIN&hs=2606&year=2024&flow=import", "China bauxite import statement from Guinea, 2024", "Pernyataan impor bauksit Tiongkok dari Guinea, 2024", "Déclaration d’import de bauxite de la Chine depuis la Guinée, 2024"],
  ["/api/observatory/prices?series=aluminum&from=2026-10", "Aluminum reference price", "Harga referensi aluminium", "Prix de référence de l’aluminium"],
  ["/api/observatory/trade?reporter=COD&partner=CHN&hs=282200&year=2024&flow=export", "DRC cobalt oxides and hydroxides export statement to China, 2024", "Pernyataan ekspor oksida dan hidroksida kobalt Kongo, Rep. Dem. ke Tiongkok, 2024", "Déclaration d’export d’oxydes et hydroxydes de cobalt de la RDC vers la Chine, 2024"],
  ["/api/observatory/trade?reporter=NGA&partner=CHN&hs=271111&year=2024&flow=export", "Nigeria liquefied natural gas export statement to China, 2024", "Pernyataan ekspor gas alam cair Nigeria ke Tiongkok, 2024", "Déclaration d’export de gaz naturel liquéfié du Nigeria vers la Chine, 2024"],
  ["/api/observatory/prices?series=lng-japan,gas-europe&from=2026-10", "Japan LNG and Europe natural gas reference prices", "Harga referensi LNG Jepang dan gas alam Eropa", "Prix de référence du GNL du Japon et du gaz naturel européen"],
  ["/api/observatory/trade?reporter=MDG&partner=KOR&hs=750210&year=2024&flow=export", "Madagascar unwrought nickel export statement to South Korea, 2024", "Pernyataan ekspor nikel belum diolah Madagaskar ke Korea Selatan, 2024", "Déclaration d’export de nickel non façonné de Madagascar vers la Corée du Sud, 2024"],
  ["/api/observatory/trade?reporter=COD&partner=CHN&hs=2609&year=2024&flow=export", "DRC tin ore export statement to China, 2024", "Pernyataan ekspor bijih timah Kongo, Rep. Dem. ke Tiongkok, 2024", "Déclaration d’export de minerai d’étain de la RDC vers la Chine, 2024"],
  ["/api/observatory/prices?series=nickel,tin&from=2026-10", "Nickel and tin reference prices", "Harga referensi nikel dan timah", "Prix de référence du nickel et de l’étain"],
  ["/api/observatory/prices?series=zinc,lead&from=2026-10", "Zinc and lead reference prices", "Harga referensi seng dan timbal", "Prix de référence du zinc et du plomb"],
  ["/api/observatory/trade?reporter=ZAF&partner=CHN&hs=2608&year=2024&flow=export", "South Africa zinc ore export statement to China, 2024", "Pernyataan ekspor bijih seng Afrika Selatan ke Tiongkok, 2024", "Déclaration d’export de minerai de zinc d’Afrique du Sud vers la Chine, 2024"],
  ["/api/observatory/trade?reporter=MAR&partner=CHN&hs=2607&year=2024&flow=export", "Morocco lead ore export statement to China, 2024", "Pernyataan ekspor bijih timbal Maroko ke Tiongkok, 2024", "Déclaration d’export de minerai de plomb du Maroc vers la Chine, 2024"],
  ["/api/observatory/trade?reporter=BWA&partner=IND&hs=710231&year=2024&flow=export", "Botswana non-industrial unworked diamond export statement to India, 2024", "Pernyataan ekspor berlian belum diolah non-industri Botswana ke India, 2024", "Déclaration d’export de diamants non industriels bruts du Botswana vers l’Inde, 2024"],
  ["/api/observatory/trade?reporter=TZA&partner=CHN&hs=2504&year=2024&flow=export", "Tanzania natural graphite export statement to China, 2024", "Pernyataan ekspor grafit alam Tanzania ke Tiongkok, 2024", "Déclaration d’export de graphite naturel de la Tanzanie vers la Chine, 2024"],
  ["/api/observatory/trade?reporter=MOZ&partner=CHN&hs=2614&year=2024&flow=export", "Mozambique titanium ore export statement to China, 2024", "Pernyataan ekspor bijih titanium Mozambik ke Tiongkok, 2024", "Déclaration d’export de minerai de titane du Mozambique vers la Chine, 2024"],
  ["/api/observatory/prices?series=urea,dap&from=2026-01", "Urea and diammonium phosphate reference prices", "Harga referensi urea dan diammonium fosfat", "Prix de référence de l’urée et du phosphate diammonique"],
  ["/api/observatory/exchange-rates?country=KEN&from=2024", "Kenya official exchange rate, local currency per US dollar", "Kurs resmi Kenya, mata uang lokal per dolar AS", "Taux de change officiel du Kenya, monnaie locale pour un dollar"],
  ["/api/observatory/logistics?country=SGP&series=lsci&year=2021", "Singapore liner shipping connectivity", "Konektivitas pelayaran liner Singapura", "Connectivité maritime de ligne de Singapour"],
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
              <h3>{t("Trade database", "Basis data perdagangan", "Base commerciale")}</h3>
              <p>
                <code>GET /api/observatory/trade · reporter · partner · origin · target · flow=export|import · hs=0902[,1006] · category · year · page · per_page=1…500 · format=csv</code>
              </p>
              <p>
                {t(
                  "reporter and partner are who filed the trade statement. origin and target follow the goods. Export and import rows are separate statements. HS 610910 sits inside chapter 61, and shelled cashew, cocoa paste, butter, and powder are separate from in-shell cashew and cocoa beans. Phosphate rock, urea, triple superphosphate, potassium chloride, and diammonium phosphate are separate fertilizer lines. Maize, groundnuts, cane or beet sugar, and natural rubber are separate lines too. Crude petroleum, coal, iron ore, copper ore, and copper cathodes are separate lines as well. Unwrought gold, semi-manufactured gold, unwrought platinum, semi-manufactured platinum, and unwrought silver are separate lines too. Wood in the rough and sawnwood are separate lines, and a cubic-meter volume is not the net weight. Bauxite, unwrought unalloyed aluminum, and unwrought aluminum alloys are separate lines. Manganese ore, chromium ore, cobalt ore, cobalt oxides and hydroxides, and unwrought cobalt, mattes, and powders are separate lines too. Liquefied natural gas, propane, butanes, and gaseous natural gas are separate lines. Do not add them to crude petroleum or to each other. A kilogram of LNG is not a million British thermal units. Nickel ore and unwrought unalloyed nickel are separate lines, and tin ore and unwrought unalloyed tin are separate lines. Do not add an ore to its metal, and do not add nickel to tin. Ferronickel, nickel mattes, nickel alloys, and tin alloys are not in these lines. Zinc ore and unwrought zinc of at least 99.99 percent are separate lines, and lead ore and refined unwrought lead are separate lines. Do not add an ore to its metal, and do not add zinc to lead. Unwrought zinc under 99.99 percent, zinc alloys, and other unwrought lead are not in these lines. Customs weight of an ore is not contained metal. Unsorted diamonds, industrial unworked diamonds, non-industrial unworked diamonds, and non-industrial worked diamonds are separate lines. Do not add them to each other or to gold. Quantity is carats and is not the net weight in kilograms. Worked industrial diamonds, synthetic diamonds, and diamond powder are not in these lines. Do not add those rows. Natural graphite, titanium ores, zirconium ores, and the residual niobium, tantalum, and vanadium ore line are separate lines. Do not add them. Customs weight is not contained carbon or contained metal. The residual line is not pure tantalum. Synthetic graphite, titanium oxides, titanium pigment, and unwrought titanium are not in these lines. CSV is refused above 20,000 rows.",
                  "reporter dan partner adalah pihak yang melaporkan. origin dan target mengikuti arah barang. Baris ekspor dan impor adalah pernyataan terpisah. HS 610910 berada di dalam bab 61, dan mete kupas, pasta kakao, mentega kakao, serta bubuk kakao terpisah dari mete berkulit dan biji kakao. Batuan fosfat, urea, triple superphosphate, kalium klorida, dan diammonium fosfat adalah baris pupuk yang terpisah. Jagung, kacang tanah, gula tebu atau bit, dan karet alam juga baris yang terpisah. Minyak mentah, batu bara, bijih besi, bijih tembaga, dan katoda tembaga juga baris yang terpisah. Emas belum diolah, emas setengah jadi, platina belum diolah, platina setengah jadi, dan perak belum diolah juga baris yang terpisah. Kayu gelondongan dan kayu gergajian juga baris yang terpisah, dan volume meter kubik bukan berat bersih. Bauksit, aluminium belum diolah tanpa paduan, dan paduan aluminium belum diolah juga baris yang terpisah. Bijih mangan, bijih kromium, bijih kobalt, oksida dan hidroksida kobalt, serta kobalt belum diolah, matte, dan bubuk juga baris yang terpisah. Gas alam cair, propana, butana, dan gas alam dalam wujud gas juga baris yang terpisah. Jangan jumlahkan dengan minyak mentah atau satu sama lain. Satu kilogram LNG bukan satu juta British thermal unit. Bijih nikel dan nikel belum diolah tanpa paduan adalah baris yang terpisah, dan bijih timah serta timah belum diolah tanpa paduan juga baris yang terpisah. Jangan jumlahkan bijih dengan logamnya, dan jangan jumlahkan nikel dengan timah. Feronicel, matte nikel, paduan nikel, dan paduan timah tidak ada di baris ini. Bijih seng dan seng belum diolah berkadar sekurang-kurangnya 99,99 persen adalah baris yang terpisah, dan bijih timbal serta timbal olahan belum diolah juga baris yang terpisah. Jangan jumlahkan bijih dengan logamnya, dan jangan jumlahkan seng dengan timbal. Seng belum diolah di bawah 99,99 persen, paduan seng, dan timbal belum diolah lainnya tidak ada di baris ini. Berat pabean bijih bukan kandungan logam. Berlian tak tersortir, berlian industri belum diolah, berlian non-industri belum diolah, dan berlian non-industri sudah diolah adalah baris yang terpisah. Jangan jumlahkan satu sama lain atau dengan emas. Kuantitas dalam karat, bukan berat bersih dalam kilogram. Berlian industri sudah diolah, berlian sintetis, dan bubuk berlian tidak ada di baris ini. Jangan jumlahkan baris itu. Grafit alam, bijih titanium, bijih zirkonium, dan baris sisa bijih niobium, tantalum, dan vanadium adalah baris yang terpisah. Jangan jumlahkan. Berat pabean bukan kandungan karbon atau kandungan logam. Baris sisa itu bukan tantalum murni. Grafit sintetis, oksida titanium, pigmen titanium, dan titanium belum diolah tidak ada di baris ini. CSV ditolak di atas 20.000 baris.",
                  "reporter et partner désignent le déclarant. origin et target suivent la marchandise. Les lignes d’export et d’import sont des déclarations distinctes. Le SH 610910 est déjà dans le chapitre 61, et la noix de cajou décortiquée, la pâte, le beurre et la poudre de cacao sont distincts de la noix en coque et des fèves. La roche phosphatée, l’urée, le superphosphate triple, le chlorure de potassium et le phosphate diammonique sont des lignes d’engrais distinctes. Le maïs, l’arachide, le sucre de canne ou de betterave et le caoutchouc naturel sont aussi des lignes distinctes. Le pétrole brut, le charbon, le minerai de fer, le minerai de cuivre et les cathodes de cuivre sont également des lignes distinctes. L’or non façonné, l’or mi-ouvré, le platine non façonné, le platine mi-ouvré et l’argent non façonné sont aussi des lignes distinctes. Les bois bruts et le bois scié sont des lignes distinctes, et un volume en mètres cubes n’est pas le poids net. La bauxite, l’aluminium non allié non façonné et les alliages d’aluminium non façonnés sont des lignes distinctes. Le minerai de manganèse, le minerai de chrome, le minerai de cobalt, les oxydes et hydroxydes de cobalt, et le cobalt non façonné, les mattes et les poudres sont aussi des lignes distinctes. Le gaz naturel liquéfié, le propane, les butanes et le gaz naturel à l’état gazeux sont des lignes distinctes. Ne les additionnez pas au pétrole brut ni entre eux. Un kilogramme de GNL n’est pas un million de British thermal units. Le minerai de nickel et le nickel non allié non façonné sont des lignes distinctes, et le minerai d’étain et l’étain non allié non façonné sont aussi des lignes distinctes. N’additionnez pas un minerai à son métal, ni le nickel à l’étain. Le ferronickel, les mattes de nickel, les alliages de nickel et les alliages d’étain ne sont pas dans ces lignes. Le minerai de zinc et le zinc non façonné d’au moins 99,99 % sont des lignes distinctes, et le minerai de plomb et le plomb affiné non façonné sont aussi des lignes distinctes. N’additionnez pas un minerai à son métal, ni le zinc au plomb. Le zinc non façonné de moins de 99,99 %, les alliages de zinc et les autres plombs non façonnés ne sont pas dans ces lignes. Le poids en douane d’un minerai n’est pas le métal contenu. Les diamants non triés, les diamants industriels bruts, les diamants non industriels bruts et les diamants non industriels travaillés sont des lignes distinctes. Ne les additionnez pas entre eux ni à l’or. La quantité est en carats et n’est pas le poids net en kilogrammes. Les diamants industriels travaillés, les diamants synthétiques et la poudre de diamant ne sont pas dans ces lignes. Ne les additionnez pas. Le graphite naturel, les minerais de titane, les minerais de zirconium et la ligne résiduelle des minerais de niobium, de tantale et de vanadium sont des lignes distinctes. Ne les additionnez pas. Le poids en douane n’est pas le carbone contenu ni le métal contenu. La ligne résiduelle n’est pas du tantale pur. Le graphite synthétique, les oxydes de titane, le pigment de titane et le titane non façonné ne sont pas dans ces lignes. Le CSV est refusé au-delà de 20 000 lignes.",
                )}
              </p>
              <h3>{t("Reference prices", "Harga referensi", "Prix de référence")}</h3>
              <p>
                <code>GET /api/observatory/prices · series=cocoa,tea-mombasa · hs=0902 · from=YYYY-MM · to=YYYY-MM · page · per_page=1…500 · format=csv</code>
              </p>
              <p>
                {t(
                  "Monthly World Bank Pink Sheet quotes in nominal US dollars, from January 2015. A missing month was not published. Several rice, wheat, tea, coffee, fertilizer, sugar, rubber, or crude series in one month are alternative benchmarks, not parts of one price. Iron ore is dollars per dry metric ton. The copper quote is refined metal, not copper ore. Gold, platinum, and silver are dollars per troy ounce and are not added together. Cameroon and Malaysian log quotes, and the two sawnwood quotes, are dollars per cubic meter and are not added together. The aluminum quote is LME unalloyed metal in dollars per metric ton, not bauxite and not aluminum alloys. The Pink Sheet has no manganese, chromium, or cobalt series. US, Europe, and Japan natural-gas quotes are dollars per million British thermal units and are not added together. The Japan quote is liquefied natural gas, not propane, butanes, or gaseous natural gas. The natural gas index is not stored. The nickel quote is LME cathodes, at least 99.8 percent pure, in dollars per metric ton, linked to unwrought unalloyed nickel and not to nickel ore. The tin quote is LME refined tin, 99.85 percent pure, in dollars per metric ton, linked to unwrought unalloyed tin and not to tin ore. The nickel and tin quotes are not added together. The zinc quote is LME high grade, minimum 99.95 percent pure, in dollars per metric ton. It is linked to unwrought zinc of at least 99.99 percent and is not a price for zinc ore or for zinc under 99.99 percent. The lead quote is LME refined lead, 99.97 percent pure, in dollars per metric ton, linked to refined unwrought lead and not to lead ore. The zinc and lead quotes are not added together. The Pink Sheet has no diamond series. The Pink Sheet has no graphite, titanium, zirconium, or niobium, tantalum, and vanadium ore series.",
                  "Kutipan bulanan Pink Sheet Bank Dunia dalam dolar AS nominal, sejak Januari 2015. Bulan yang kosong tidak dipublikasikan. Beberapa seri beras, gandum, teh, kopi, pupuk, gula, karet, atau minyak mentah pada bulan yang sama adalah patokan alternatif, bukan bagian dari satu harga. Bijih besi dalam dolar per ton metrik kering. Kutipan tembaga adalah logam olahan, bukan bijih tembaga. Emas, platina, dan perak dalam dolar per troy ons dan tidak dijumlahkan. Kutipan kayu gelondongan Kamerun dan Malaysia, serta kedua kutipan kayu gergajian, dalam dolar per meter kubik dan tidak dijumlahkan. Kutipan aluminium adalah logam LME tanpa paduan dalam dolar per ton metrik, bukan bauksit dan bukan paduan aluminium. Pink Sheet tidak memiliki seri mangan, kromium, atau kobalt. Kutipan gas alam AS, Eropa, dan Jepang dalam dolar per juta British thermal unit dan tidak dijumlahkan. Kutipan Jepang adalah gas alam cair, bukan propana, butana, atau gas alam dalam wujud gas. Indeks gas alam tidak disimpan. Kutipan nikel adalah katoda LME, kemurnian sekurang-kurangnya 99,8 persen, dalam dolar per ton metrik, tertaut pada nikel belum diolah tanpa paduan dan bukan pada bijih nikel. Kutipan timah adalah timah olahan LME, kemurnian 99,85 persen, dalam dolar per ton metrik, tertaut pada timah belum diolah tanpa paduan dan bukan pada bijih timah. Kutipan nikel dan timah tidak dijumlahkan. Kutipan seng adalah seng mutu tinggi LME, kemurnian sekurang-kurangnya 99,95 persen, dalam dolar per ton metrik. Kutipan itu tertaut pada seng belum diolah berkadar sekurang-kurangnya 99,99 persen dan bukan harga bijih seng atau seng di bawah 99,99 persen. Kutipan timbal adalah timbal olahan LME, kemurnian 99,97 persen, dalam dolar per ton metrik, tertaut pada timbal olahan belum diolah dan bukan pada bijih timbal. Kutipan seng dan timbal tidak dijumlahkan. Pink Sheet tidak memiliki seri berlian. Pink Sheet tidak memiliki seri grafit, titanium, zirkonium, atau bijih niobium, tantalum, dan vanadium.",
                  "Cotations mensuelles du Pink Sheet de la Banque mondiale en dollars nominaux, depuis janvier 2015. Un mois absent n’a pas été publié. Plusieurs séries de riz, de blé, de thé, de café, d’engrais, de sucre, de caoutchouc ou de pétrole brut pour un même mois sont des références alternatives, pas les parties d’un seul prix. Le minerai de fer est en dollars par tonne métrique sèche. La cotation du cuivre est le métal affiné, pas le minerai. L’or, le platine et l’argent sont en dollars par once troy et ne s’additionnent pas. Les cotations de grumes du Cameroun et de Malaisie, et les deux cotations de bois scié, sont en dollars par mètre cube et ne s’additionnent pas. La cotation de l’aluminium est le métal non allié du LME en dollars par tonne métrique, pas la bauxite et pas les alliages. Le Pink Sheet n’a pas de série pour le manganèse, le chrome ou le cobalt. Les cotations du gaz naturel des États-Unis, d’Europe et du Japon sont en dollars par million de British thermal units et ne s’additionnent pas. La cotation du Japon est le gaz naturel liquéfié, pas le propane, les butanes ou le gaz naturel à l’état gazeux. L’indice du gaz naturel n’est pas conservé. La cotation du nickel est celle des cathodes LME, d’une pureté d’au moins 99,8 %, en dollars par tonne métrique, liée au nickel non allié non façonné et non au minerai. La cotation de l’étain est celle de l’étain affiné du LME, pureté 99,85 %, en dollars par tonne métrique, liée à l’étain non allié non façonné et non au minerai. Les cotations du nickel et de l’étain ne s’additionnent pas. La cotation du zinc est celle du zinc haute qualité du LME, d’une pureté d’au moins 99,95 %, en dollars par tonne métrique. Elle est liée au zinc non façonné d’au moins 99,99 % et n’est pas un prix du minerai de zinc ni du zinc de moins de 99,99 %. La cotation du plomb est celle du plomb affiné du LME, pureté 99,97 %, en dollars par tonne métrique, liée au plomb affiné non façonné et non au minerai. Les cotations du zinc et du plomb ne s’additionnent pas. Le Pink Sheet n’a pas de série pour le diamant. Le Pink Sheet n’a pas de série pour le graphite, le titane, le zirconium, ni pour les minerais de niobium, de tantale et de vanadium.",
                )}
              </p>
              <h3>{t("Exchange rates and logistics", "Kurs dan logistik", "Taux de change et logistique")}</h3>
              <p>
                <code>GET /api/observatory/exchange-rates · country · year · from · to · page · per_page=1…500 · format=csv</code>
              </p>
              <p>
                <code>GET /api/observatory/logistics · country · series=lsci,lpi-overall · year · from · to · page · per_page=1…500 · format=csv</code>
              </p>
              <p>
                {t(
                  "Exchange rates are annual averages of local currency units per US dollar. lsci is the liner shipping connectivity index, with 2004 = 100. lpi-overall is a survey score from 1 to 5; 2022 is the late-2022 survey. A missing economy-year was not published. These are not freight quotes or spot rates for a contract date.",
                  "Kurs adalah rata-rata tahunan satuan mata uang lokal per dolar AS. lsci adalah indeks konektivitas pelayaran liner, dengan 2004 = 100. lpi-overall adalah skor survei dari 1 sampai 5; 2022 adalah survei akhir 2022. Tahun yang kosong tidak dipublikasikan. Ini bukan tarif angkutan atau kurs spot untuk tanggal kontrak.",
                  "Les taux sont des moyennes annuelles d’unités de monnaie locale pour un dollar. lsci est l’indice de connectivité du transport maritime de ligne, base 100 en 2004. lpi-overall est un score d’enquête de 1 à 5 ; 2022 correspond à l’enquête de fin 2022. Une année absente n’a pas été publiée. Ce ne sont ni des tarifs de fret ni des cours au comptant pour une date de contrat.",
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
