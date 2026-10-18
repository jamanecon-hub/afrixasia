import { Link } from "react-router-dom";
import { Footer, Header } from "../components/Chrome.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, registerSearch, useResearch } from "../research.jsx";

export default function ServicesPage() {
  const { t } = useLanguage();
  const [context] = useResearch();
  const offers = [
    {
      line: t("Market & industry research", "Riset pasar & industri", "Recherche sur les marchés & industries"),
      name: t("Corridor evidence note", "Catatan bukti koridor", "Note de preuves sur un corridor"),
      who: t(
        "A buyer, supplier, or public agency with one origin, one destination, and one product.",
        "Buyer, supplier, atau lembaga publik dengan satu asal, satu tujuan, dan satu produk.",
        "Un acheteur, un fournisseur ou un organisme public avec une origine, une destination et un produit.",
      ),
      receive: t(
        "A reading of the published UN Comtrade rows: year, HS code, direction, and value. A missing year stays blank.",
        "Pembacaan baris UN Comtrade yang sudah terbit: tahun, kode HS, arah, dan nilai. Tahun yang tidak ada tetap kosong.",
        "Une lecture des lignes UN Comtrade publiées : année, code SH, sens et valeur. Une année manquante reste vide.",
      ),
      limit: t(
        "A historical reference. It is not a price, a live order, or proof of trade between two countries when only a world total is published.",
        "Referensi historis. Bukan harga, order hidup, atau bukti perdagangan antara dua negara bila yang terbit hanya total dunia.",
        "Une référence historique. Ni un prix, ni une commande en cours, ni la preuve d’un échange entre deux pays lorsque seul un total mondial est publié.",
      ),
      href: "/koridor",
      link: t("Open a corridor", "Buka koridor", "Ouvrir un corridor"),
    },
    {
      line: t("Market & industry research", "Riset pasar & industri", "Recherche sur les marchés & industries"),
      name: t("Country economic note", "Catatan ekonomi negara", "Note économique pays"),
      who: t(
        "Someone comparing an African or Asian economy before a market decision.",
        "Pihak yang membandingkan ekonomi Afrika atau Asia sebelum keputusan pasar.",
        "Une personne qui compare une économie africaine ou asiatique avant une décision de marché.",
      ),
      receive: t(
        "The World Bank series already in the observatory, with the release date on the page.",
        "Seri World Bank yang sudah ada di observatory, dengan tanggal rilis di halaman.",
        "Les séries de la Banque mondiale déjà dans l’observatoire, avec la date de publication sur la page.",
      ),
      limit: t(
        "Rechecked on 18 October 2026; the World Bank release was still 8 October 2026. A blank year is not a zero, and the note is not a forecast.",
        "Dicek ulang 18 Oktober 2026; rilis World Bank masih 8 Oktober 2026. Tahun kosong bukan nol, dan catatan ini bukan prakiraan.",
        "Revérifié le 18 octobre 2026 ; la publication de la Banque mondiale datait toujours du 8 octobre 2026. Une année vide n’est pas un zéro, et la note n’est pas une prévision.",
      ),
      href: "/open-data",
      link: t("Open the economic desk", "Buka meja ekonomi", "Ouvrir le bureau économique"),
    },
    {
      line: t("Market & industry research", "Riset pasar & industri", "Recherche sur les marchés & industries"),
      name: t("Sector reading", "Pembacaan sektor", "Lecture sectorielle"),
      who: t(
        "A question inside one of the eight published sectors, most often food and agriculture or apparel and textiles.",
        "Pertanyaan di salah satu dari delapan sektor yang terbit, paling sering pangan dan agrikultur atau pakaian dan tekstil.",
        "Une question dans l’un des huit secteurs publiés, le plus souvent l’alimentation et l’agriculture ou l’habillement et les textiles.",
      ),
      receive: t(
        "The sector questions already used on the desk — quality, capacity, standards — set next to the published figures.",
        "Pertanyaan sektor yang sudah dipakai meja ini — kualitas, kapasitas, standar — diletakkan di samping angka yang terbit.",
        "Les questions sectorielles déjà utilisées — qualité, capacité, normes — placées à côté des chiffres publiés.",
      ),
      limit: t(
        "Oil and gas stay outside this offer. A directory profile is a reference, not verified stock.",
        "Minyak bumi dan gas tetap di luar tawaran ini. Profil direktori adalah referensi, bukan stok yang diverifikasi.",
        "Le pétrole et le gaz restent hors de cette offre. Un profil d’annuaire est une référence, pas un stock vérifié.",
      ),
      href: "/data-pasar",
      link: t("Open markets", "Buka pasar", "Ouvrir les marchés"),
    },
    {
      line: t("Capital & market access", "Akses modal & pasar", "Accès au capital & aux marchés"),
      name: t("Counterparty map", "Peta lawan transaksi", "Carte des contreparties"),
      who: t(
        "A Circle member who has named a role, a product, and an origin or destination.",
        "Anggota Circle yang sudah menyebut peran, produk, serta asal atau tujuan.",
        "Un membre du Circle qui a indiqué un rôle, un produit et une origine ou une destination.",
      ),
      receive: t(
        "Public member profiles and organization references that match that segment, in either direction between Africa and Asia.",
        "Profil anggota publik dan referensi organisasi yang cocok dengan segmen itu, di kedua arah antara Afrika dan Asia.",
        "Les profils publics et les références d’organisations qui correspondent à ce segment, dans les deux sens entre l’Afrique et l’Asie.",
      ),
      limit: t(
        "Email and phone appear only with an opt-in. Membership is not vetting, certification, or a guarantee. This site does not take payment or hold escrow.",
        "Email dan telepon hanya muncul jika dipilih untuk dipublikasikan. Keanggotaan bukan pemeriksaan, sertifikasi, atau jaminan. Situs ini tidak menerima pembayaran atau menahan escrow.",
        "L’e-mail et le téléphone n’apparaissent qu’avec un accord. L’adhésion n’est ni un contrôle, ni une certification, ni une garantie. Ce site n’encaisse pas et ne séquestre pas de fonds.",
      ),
      href: "/marketplace",
      link: t("Open the directory", "Buka direktori", "Ouvrir l’annuaire"),
    },
    {
      line: t("Capital & market access", "Akses modal & pasar", "Accès au capital & aux marchés"),
      name: t("Market-entry question", "Pertanyaan masuk pasar", "Question d’entrée sur un marché"),
      who: t(
        "A firm deciding whether a corridor is even visible in the published data.",
        "Perusahaan yang sedang memutuskan apakah suatu koridor terlihat dalam data yang terbit.",
        "Une entreprise qui cherche à savoir si un corridor est visible dans les données publiées.",
      ),
      receive: t(
        "A scoped session that separates what the observatory can show from what still has to be checked on the ground: samples, capacity, and compliance.",
        "Sesi berlingkup yang memisahkan apa yang observatory bisa tunjukkan dari apa yang masih harus dicek di lapangan: sampel, kapasitas, dan kepatuhan.",
        "Une séance cadrée qui sépare ce que l’observatoire peut montrer de ce qui doit encore être vérifié sur le terrain : échantillons, capacité et conformité.",
      ),
      limit: t(
        "The session does not size a market beyond the published figures, and it does not produce a valuation, an investment memorandum, or a financing plan.",
        "Sesi ini tidak mengukur pasar di luar angka yang terbit, dan tidak menyusun valuasi, memorandum investasi, atau rencana pembiayaan.",
        "La séance ne mesure pas un marché au-delà des chiffres publiés, et elle ne produit ni valorisation, ni mémorandum d’investissement, ni plan de financement.",
      ),
      href: "/daftar",
      link: t("Start from the Circle", "Mulai dari Circle", "Commencer par le Circle"),
    },
    {
      line: t("Talent & knowledge exchange", "Pertukaran talenta & pengetahuan", "Échanges de talents & de connaissances"),
      name: t("Knowledge introduction", "Pengantar pengetahuan", "Mise en relation de connaissances"),
      who: t(
        "Members who marked research or partnership and published a fitting profile.",
        "Anggota yang menandai riset atau kemitraan dan menerbitkan profil yang sesuai.",
        "Des membres qui ont indiqué la recherche ou le partenariat et publié un profil correspondant.",
      ),
      receive: t(
        "An introduction across the two regions when both sides can be read from the public directory.",
        "Pengantar lintas dua kawasan bila kedua pihak dapat dibaca dari direktori publik.",
        "Une mise en relation entre les deux régions lorsque les deux parties sont lisibles dans l’annuaire public.",
      ),
      limit: t(
        "A scholarship, a placement, or a funded program is agreed outside this page. The observatory does not select recipients and does not open an application.",
        "Beasiswa, penempatan, atau program berdana disepakati di luar halaman ini. Observatory tidak memilih penerima dan tidak membuka lamaran.",
        "Une bourse, un placement ou un programme financé se conviennent en dehors de cette page. L’observatoire ne sélectionne pas de bénéficiaires et n’ouvre pas de candidature.",
      ),
      href: "/daftar",
      link: t("Publish a profile", "Terbitkan profil", "Publier un profil"),
    },
    {
      line: t("Technology on the desk", "Teknologi di meja kerja", "La technologie sur le bureau"),
      name: t("Observatory extract", "Ekstrak observatory", "Extrait de l’observatoire"),
      who: t(
        "An analyst who wants the published rows in their own sheet.",
        "Analis yang ingin membawa baris yang terbit ke lembar kerjanya sendiri.",
        "Un analyste qui veut les lignes publiées dans son propre tableau.",
      ),
      receive: t(
        "CSV or JSON for market rows, economic series, or public providers, using the same filters as the site.",
        "CSV atau JSON untuk baris pasar, seri ekonomi, atau penyedia publik, dengan filter yang sama seperti di situs.",
        "CSV ou JSON pour les lignes de marché, les séries économiques ou les fournisseurs publics, avec les mêmes filtres que le site.",
      ),
      limit: t(
        "The file is the snapshot, not a feed of live inventory. Republishing it as a newer release than the date on the file misstates the source.",
        "Berkas itu adalah snapshot, bukan umpan stok hidup. Menerbitkannya lagi sebagai rilis yang lebih baru daripada tanggal berkas menyesatkan sumbernya.",
        "Le fichier est l’instantané, pas un flux de stock en direct. Le republier comme une édition plus récente que la date du fichier dénature la source.",
      ),
      href: "/api-docs",
      link: t("Read the API", "Baca API", "Lire l’API"),
    },
    {
      line: t("Community & media", "Komunitas & media", "Communauté & médias"),
      name: t("Public news scan", "Pindaian berita publik", "Veille d’actualités publiques"),
      who: t(
        "A corridor or country that needs the headlines already held in the media brief.",
        "Koridor atau negara yang membutuhkan headline yang sudah ada di media brief.",
        "Un corridor ou un pays qui a besoin des titres déjà conservés dans le brief médias.",
      ),
      receive: t(
        "The public items, with source, date, and the countries named.",
        "Item publik, dengan sumber, tanggal, dan negara yang disebut.",
        "Les éléments publics, avec la source, la date et les pays cités.",
      ),
      limit: t(
        "Instagram captions are not part of the scan while that account requires a login. Oil and gas items stay out.",
        "Caption Instagram tidak masuk ke pindaian ini selama akun itu meminta login. Item minyak bumi dan gas tetap di luar.",
        "Les légendes Instagram ne font pas partie de cette veille tant que le compte exige une connexion. Le pétrole et le gaz restent exclus.",
      ),
      href: "/daily-brief",
      link: t("Open the brief", "Buka brief", "Ouvrir le brief"),
    },
  ];

  return (
    <>
      <Header active="Layanan" />
      <main className="about-home">
        <section className="about-intro">
          <div>
            <span className="eyebrow">{t("SERVICES", "LAYANAN", "SERVICES")}</span>
            <h2>
              {t(
                "Work you can ask for,\ninside the corridor.",
                "Pekerjaan yang bisa diminta,\ndi dalam koridor.",
                "Un travail que vous pouvez demander,\ndans le corridor.",
              )}
            </h2>
          </div>
          <div>
            <p className="about-lead">
              {t(
                "AfriXAsia keeps eight offers under the five lines already on the home page. Each one starts from the observatory or the Circle.",
                "AfriXAsia menaruh delapan tawaran di bawah lima lini yang sudah ada di beranda. Masing-masing berangkat dari observatory atau Circle.",
                "AfriXAsia place huit offres sous les cinq lignes déjà présentes sur l’accueil. Chacune part de l’observatoire ou du Circle.",
              )}
            </p>
            <p>
              {t(
                "The sequence is one used by advisory institutes: name the question, choose a practical output, and agree how far the work goes. Here the subject stays Africa and Asia, in both directions.",
                "Urutannya sama dengan yang dipakai lembaga penasihat: sebutkan pertanyaannya, pilih hasil yang praktis, dan sepakati sejauh mana pekerjaannya. Di sini subjeknya tetap Afrika dan Asia, di kedua arah.",
                "L’ordre est celui des instituts de conseil : nommer la question, choisir un résultat pratique, et convenir de la portée. Ici le sujet reste l’Afrique et l’Asie, dans les deux sens.",
              )}
            </p>
          </div>
        </section>

        <section className="about-process">
          <span className="eyebrow">{t("HOW A REQUEST MOVES", "CARA PERMINTAAN BERJALAN", "COMMENT UNE DEMANDE AVANCE")}</span>
          <h2>
            {t(
              "From a question to a bounded output.",
              "Dari pertanyaan menuju hasil yang berbatas.",
              "D’une question à un résultat borné.",
            )}
          </h2>
          <div>
            {[
              [
                t("Name", "Sebutkan", "Nommer"),
                t(
                  "The corridor, the product, and the decision the note has to serve.",
                  "Koridor, produk, dan keputusan yang harus dilayani catatan itu.",
                  "Le corridor, le produit et la décision que la note doit servir.",
                ),
              ],
              [
                t("Choose", "Pilih", "Choisir"),
                t(
                  "One output from the list below. The open desks already hold the published figures.",
                  "Satu hasil dari daftar di bawah. Meja yang terbuka sudah menyimpan angka yang terbit.",
                  "Un résultat dans la liste ci-dessous. Les bureaux ouverts tiennent déjà les chiffres publiés.",
                ),
              ],
              [
                t("Limit", "Batasi", "Limiter"),
                t(
                  "Say what the snapshot cannot answer. Missing years stay blank.",
                  "Sebutkan apa yang tidak bisa dijawab snapshot. Tahun yang hilang tetap kosong.",
                  "Dire ce que l’instantané ne peut pas répondre. Les années manquantes restent vides.",
                ),
              ],
              [
                t("Next", "Lanjut", "Ensuite"),
                t(
                  "Use the open desk, or enter the Circle when the work needs a published profile.",
                  "Pakai meja yang terbuka, atau masuk Circle bila pekerjaan membutuhkan profil yang terbit.",
                  "Utiliser le bureau ouvert, ou entrer dans le Circle lorsque le travail exige un profil publié.",
                ),
              ],
            ].map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-services" id="service-list">
          <div className="sectionhead">
            <div>
              <span className="eyebrow">{t("THE LIST", "DAFTAR", "LA LISTE")}</span>
              <h2>
                {t(
                  "Eight offers. Five lines.",
                  "Delapan tawaran. Lima lini.",
                  "Huit offres. Cinq lignes.",
                )}
              </h2>
            </div>
          </div>
          {offers.map((offer, index) => (
            <article className="about-service service-offer" key={offer.name}>
              <span className="about-service-number">0{index + 1}</span>
              <h3>{offer.name}</h3>
              <div>
                <p className="small">{offer.line}</p>
                <p>
                  <b>{t("For", "Untuk", "Pour")}. </b>
                  {offer.who}
                </p>
                <p>
                  <b>{t("You receive", "Yang Anda terima", "Vous recevez")}. </b>
                  {offer.receive}
                </p>
                <p>
                  <b>{t("Limit", "Batas", "Limite")}. </b>
                  {offer.limit}
                </p>
                <Link to={contextSearch(offer.href, context)}>{offer.link} ↗</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="about-principles">
          <div>
            <span className="eyebrow">{t("WHAT STAYS OURS", "YANG TETAP KHAS", "CE QUI RESTE LE NÔTRE")}</span>
            <h2>
              {t(
                "The same sequence.\nA different mandate.",
                "Urutan yang sama.\nMandat yang berbeda.",
                "Le même ordre.\nUn mandat différent.",
              )}
            </h2>
            <p>
              {t(
                "Tony Blair Institute describes its work as strategy, policy, and delivery, with technology as the enabler, often beside a government. ITC and Afreximbank’s trade-information desks add country briefs, sector briefs, and custom market questions. AfriXAsia uses that order and stops at the corridor.",
                "Tony Blair Institute menggambarkan kerjanya sebagai strategi, kebijakan, dan pelaksanaan, dengan teknologi sebagai penggerak, sering di samping pemerintah. Meja informasi perdagangan ITC dan Afreximbank menambahkan catatan negara, catatan sektor, dan pertanyaan pasar yang disusun khusus. AfriXAsia memakai urutan itu dan berhenti di koridor.",
                "Le Tony Blair Institute décrit son travail comme stratégie, politique et mise en œuvre, la technologie servant de levier, souvent aux côtés d’un gouvernement. Les bureaux d’information commerciale de l’ITC et d’Afreximbank ajoutent des notes pays, des notes sectorielles et des questions de marché sur mesure. AfriXAsia suit cet ordre et s’arrête au corridor.",
              )}
            </p>
          </div>
          <div className="about-values">
            {[
              [
                t("No embedded government team", "Tanpa tim di dalam pemerintah", "Pas d’équipe installée au gouvernement"),
                t(
                  "A session uses the observatory. It does not place staff inside a ministry.",
                  "Sesi memakai observatory. Ia tidak menempatkan staf di dalam kementerian.",
                  "Une séance utilise l’observatoire. Elle ne place pas de personnel dans un ministère.",
                ),
              ],
              [
                t("No financing mandate", "Tanpa mandat pembiayaan", "Pas de mandat de financement"),
                t(
                  "No privatization, debt, currency management, merger, valuation, or capital-markets mandate.",
                  "Tidak ada mandat privatisasi, utang, pengelolaan mata uang, merger, valuasi, atau pasar modal.",
                  "Pas de mandat de privatisation, de dette, de gestion de change, de fusion, de valorisation ou de marché de capitaux.",
                ),
              ],
              [
                t("No execution of the trade", "Tanpa pelaksanaan transaksi", "Pas d’exécution de l’échange"),
                t(
                  "No due diligence certificate, payment rail, logistics booking, or escrow.",
                  "Tidak ada sertifikat uji tuntas, jalur pembayaran, pemesanan logistik, atau escrow.",
                  "Pas de certificat de diligence, de rail de paiement, de réservation logistique ni de séquestre.",
                ),
              ],
            ].map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-channel">
          <div>
            <h2>
              {t(
                "Ask for one output,\nnot a blank engagement.",
                "Minta satu hasil,\nbukan penugasan kosong.",
                "Demandez un résultat,\npas une mission ouverte.",
              )}
            </h2>
            <div className="form-actions">
              <Link className="btn primary" to={registerSearch(context)}>
                {t("Join the Circle", "Gabung Circle", "Rejoindre le Circle")} ↗
              </Link>
              <Link className="btn" to={contextSearch("/koridor", context)}>
                {t("Open a corridor", "Buka koridor", "Ouvrir un corridor")}
              </Link>
            </div>
          </div>
          <div className="about-channel-links">
            <Link to={contextSearch("/data-pasar", context)}>
              {t("Markets", "Pasar", "Marchés")} <b>↗</b>
            </Link>
            <Link to={contextSearch("/open-data", context)}>
              {t("Economic desk", "Meja ekonomi", "Bureau économique")} <b>↗</b>
            </Link>
            <Link to={contextSearch("/daily-brief", context)}>
              {t("Media brief", "Media brief", "Brief médias")} <b>↗</b>
            </Link>
            <Link to={contextSearch("/metodologi", context)}>
              {t("Methodology", "Metodologi", "Méthodologie")} <b>↗</b>
            </Link>
          </div>
        </section>
        <p className="about-source">
          {t(
            "Read on 18 October 2026 from the Tony Blair Institute pages “Helping governments deliver” and “Approach”, the Institute’s 2024 financial statements, ITC pages on MSME export development and market intelligence, and Afreximbank’s Trade Information & Advisory and Trade Intelligence Solutions pages. AfriXAsia does not reproduce those mandates.",
            "Dibaca pada 18 Oktober 2026 dari halaman Tony Blair Institute “Helping governments deliver” dan “Approach”, laporan keuangan Institute tahun 2024, halaman ITC tentang pengembangan ekspor UMKM dan intelijen pasar, serta halaman Afreximbank Trade Information & Advisory dan Trade Intelligence Solutions. AfriXAsia tidak meniru mandat tersebut.",
            "Lu le 18 octobre 2026 sur les pages du Tony Blair Institute « Helping governments deliver » et « Approach », les états financiers 2024 de l’Institute, les pages de l’ITC sur l’export des MPME et l’intelligence de marché, et les pages Afreximbank Trade Information & Advisory et Trade Intelligence Solutions. AfriXAsia ne reprend pas ces mandats.",
          )}
        </p>
        <Footer />
      </main>
    </>
  );
}
