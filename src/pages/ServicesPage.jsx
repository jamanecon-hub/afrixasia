import { Link } from "react-router-dom";
import { Footer, Header } from "../components/Chrome.jsx";
import { AreaGlyph, CorridorDiagram } from "../components/ServiceVisuals.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, registerSearch, useResearch } from "../research.jsx";

export default function ServicesPage() {
  const { t } = useLanguage();
  const [context] = useResearch();
  const research = t("Data-driven research", "Riset berbasis data", "Recherche fondée sur les données");
  const advisory = t(
    "Market entry and advisory",
    "Masuk pasar dan advisory",
    "Entrée sur le marché et conseil",
  );
  const education = t("Education and consulting", "Pendidikan dan konsultasi", "Formation et conseil");
  const technology = t(
    "Technology implementation",
    "Implementasi teknologi",
    "Mise en œuvre technologique",
  );
  const clients = t(
    "A government, an investor, or a business.",
    "Pemerintah, investor, atau bisnis.",
    "Un gouvernement, un investisseur ou une entreprise.",
  );
  const offers = [
    {
      area: "research",
      line: research,
      name: t("Corridor and sector evidence", "Bukti koridor dan sektor", "Preuves de corridor et de secteur"),
      who: clients,
      receive: t(
        "A research note on one Africa–Asia corridor and one published sector: UN Comtrade year, HS code, direction, and value, next to the sector questions on quality, capacity, and standards.",
        "Catatan riset untuk satu koridor Afrika–Asia dan satu sektor yang terbit: tahun UN Comtrade, kode HS, arah, dan nilai, di samping pertanyaan sektor tentang kualitas, kapasitas, dan standar.",
        "Une note de recherche sur un corridor Afrique–Asie et un secteur publié : année UN Comtrade, code SH, sens et valeur, à côté des questions de qualité, de capacité et de normes.",
      ),
      limit: t(
        "The figures are historical. A missing year stays blank. Oil and gas stay outside. A directory profile is a reference, not verified stock.",
        "Angkanya historis. Tahun yang tidak ada tetap kosong. Minyak bumi dan gas tetap di luar. Profil direktori adalah referensi, bukan stok yang diverifikasi.",
        "Les chiffres sont historiques. Une année manquante reste vide. Le pétrole et le gaz restent exclus. Un profil d’annuaire est une référence, pas un stock vérifié.",
      ),
      href: "/koridor",
      link: t("Open a corridor", "Buka koridor", "Ouvrir un corridor"),
    },
    {
      area: "research",
      line: research,
      name: t("Country economic reading", "Pembacaan ekonomi negara", "Lecture économique d’un pays"),
      who: clients,
      receive: t(
        "The World Bank series already in the observatory for an African or Asian economy, with the release date on the note.",
        "Seri World Bank yang sudah ada di observatory untuk satu ekonomi Afrika atau Asia, dengan tanggal rilis pada catatan.",
        "Les séries de la Banque mondiale déjà dans l’observatoire pour une économie africaine ou asiatique, avec la date de publication sur la note.",
      ),
      limit: t(
        "Rechecked on 18 October 2026; the World Bank release was still 8 October 2026. A blank year is not a zero, and the reading is not a forecast.",
        "Dicek ulang 18 Oktober 2026; rilis World Bank masih 8 Oktober 2026. Tahun kosong bukan nol, dan pembacaan ini bukan prakiraan.",
        "Revérifié le 18 octobre 2026 ; la publication de la Banque mondiale datait toujours du 8 octobre 2026. Une année vide n’est pas un zéro, et la lecture n’est pas une prévision.",
      ),
      href: "/open-data",
      link: t("Open the economic desk", "Buka meja ekonomi", "Ouvrir le bureau économique"),
    },
    {
      area: "advisory",
      line: advisory,
      name: t("Market-entry advisory", "Advisory masuk pasar", "Conseil d’entrée sur un marché"),
      who: clients,
      receive: t(
        "An advisory note on whether a corridor is visible in the published data, what a government, an investor, or a business can decide from it, and what still has to be checked on the ground.",
        "Catatan advisory tentang apakah suatu koridor terlihat dalam data yang terbit, apa yang dapat diputuskan pemerintah, investor, atau bisnis dari data itu, dan apa yang masih harus dicek di lapangan.",
        "Une note de conseil sur la visibilité d’un corridor dans les données publiées, sur ce qu’un gouvernement, un investisseur ou une entreprise peut en décider, et sur ce qui doit encore être vérifié sur le terrain.",
      ),
      limit: t(
        "The advice does not size a market beyond the published figures. It is not a valuation, an investment memorandum, a financing plan, or a public budget.",
        "Saran ini tidak mengukur pasar di luar angka yang terbit. Bukan valuasi, memorandum investasi, rencana pembiayaan, atau anggaran publik.",
        "Le conseil ne mesure pas un marché au-delà des chiffres publiés. Ce n’est ni une valorisation, ni un mémorandum d’investissement, ni un plan de financement, ni un budget public.",
      ),
      href: "/daftar",
      link: t("Start from the Circle", "Mulai dari Circle", "Commencer par le Circle"),
    },
    {
      area: "advisory",
      line: advisory,
      name: t("Segment and counterparty map", "Peta segmen dan lawan transaksi", "Carte du segment et des contreparties"),
      who: t(
        "A government agency, an investor, or a business that has named a product and an origin or destination.",
        "Lembaga pemerintah, investor, atau bisnis yang sudah menyebut produk serta asal atau tujuan.",
        "Une administration, un investisseur ou une entreprise qui a indiqué un produit et une origine ou une destination.",
      ),
      receive: t(
        "Public member profiles and organization references that match that segment, in either direction between Africa and Asia.",
        "Profil anggota publik dan referensi organisasi yang cocok dengan segmen itu, di kedua arah antara Afrika dan Asia.",
        "Les profils publics et les références d’organisations qui correspondent à ce segment, dans les deux sens entre l’Afrique et l’Asie.",
      ),
      limit: t(
        "Email and phone appear only with an opt-in. The map is not vetting, certification, or a transaction. This site does not take payment or hold escrow.",
        "Email dan telepon hanya muncul jika dipilih untuk dipublikasikan. Peta ini bukan pemeriksaan, sertifikasi, atau transaksi. Situs ini tidak menerima pembayaran atau menahan escrow.",
        "L’e-mail et le téléphone n’apparaissent qu’avec un accord. La carte n’est ni un contrôle, ni une certification, ni une transaction. Ce site n’encaisse pas et ne séquestre pas de fonds.",
      ),
      href: "/marketplace",
      link: t("Open the directory", "Buka direktori", "Ouvrir l’annuaire"),
    },
    {
      area: "education",
      line: education,
      name: t("Team education", "Pendidikan tim", "Formation d’équipe"),
      who: t(
        "A team in government, an investment office, or a business that will keep reading the corridor after the session.",
        "Tim di pemerintah, kantor investasi, atau bisnis yang akan terus membaca koridor setelah sesi.",
        "Une équipe publique, un bureau d’investissement ou une entreprise qui continuera à lire le corridor après la séance.",
      ),
      receive: t(
        "A teaching session on how to read a corridor, a series, and a blank year, using the method already published on the desk.",
        "Sesi pengajaran tentang cara membaca koridor, seri, dan tahun yang kosong, dengan metode yang sudah terbit di meja ini.",
        "Une séance pour apprendre à lire un corridor, une série et une année vide, avec la méthode déjà publiée sur ce bureau.",
      ),
      limit: t(
        "Education transfers the method. It does not certify the team, award a scholarship, or select participants.",
        "Pendidikan memindahkan metodenya. Ia tidak menyertifikasi tim, memberi beasiswa, atau memilih peserta.",
        "La formation transmet la méthode. Elle ne certifie pas l’équipe, n’accorde pas de bourse et ne sélectionne pas de participants.",
      ),
      href: "/metodologi",
      link: t("Read the method", "Baca metode", "Lire la méthode"),
    },
    {
      area: "education",
      line: education,
      name: t("Decision consulting", "Konsultasi keputusan", "Conseil de décision"),
      who: clients,
      receive: t(
        "A consulting note for one decision: what the evidence supports, what it does not, and the next check the client still owns.",
        "Catatan konsultasi untuk satu keputusan: apa yang didukung bukti, apa yang tidak, dan pemeriksaan berikutnya yang tetap di tangan klien.",
        "Une note de conseil pour une décision : ce que les preuves soutiennent, ce qu’elles ne soutiennent pas, et la vérification suivante qui reste au client.",
      ),
      limit: t(
        "Consulting does not take over the decision, the budget, or the transaction. A resident team is not placed inside a ministry.",
        "Konsultasi tidak mengambil alih keputusan, anggaran, atau transaksi. Tim tidak ditempatkan di dalam kementerian.",
        "Le conseil ne reprend ni la décision, ni le budget, ni la transaction. Aucune équipe n’est placée dans un ministère.",
      ),
      href: "/daftar",
      link: t("Publish a profile", "Terbitkan profil", "Publier un profil"),
    },
    {
      area: "technology",
      line: technology,
      name: t("Working desk", "Meja kerja yang bisa diulang", "Bureau de travail réutilisable"),
      who: t(
        "A team that will ask the same corridor question more than once.",
        "Tim yang akan mengajukan pertanyaan koridor yang sama lebih dari sekali.",
        "Une équipe qui posera plus d’une fois la même question de corridor.",
      ),
      receive: t(
        "The question implemented as filters, a brief, and a CSV or JSON extract the team can run again.",
        "Pertanyaan itu diimplementasikan sebagai filter, brief, serta ekstrak CSV atau JSON yang dapat dijalankan lagi oleh tim.",
        "La question mise en œuvre comme filtres, brief et extrait CSV ou JSON que l’équipe peut relancer.",
      ),
      limit: t(
        "The desk serves the published snapshot. It is not a feed of live inventory.",
        "Meja ini melayani snapshot yang terbit. Bukan umpan stok hidup.",
        "Le bureau sert l’instantané publié. Ce n’est pas un flux de stock en direct.",
      ),
      href: "/api-docs",
      link: t("Read the API", "Baca API", "Lire l’API"),
    },
    {
      area: "technology",
      line: technology,
      name: t("Capability scale-up", "Peningkatan kapabilitas", "Montée en capacité"),
      who: t(
        "A government unit, an investor team, or a firm that needs the method to stay after the engagement.",
        "Unit pemerintah, tim investor, atau perusahaan yang membutuhkan metode itu tetap ada setelah penugasan.",
        "Une unité publique, une équipe d’investisseurs ou une entreprise qui a besoin que la méthode reste après la mission.",
      ),
      receive: t(
        "The research and advisory workflow implemented on the observatory, with the team shown how to run the next question itself.",
        "Alur riset dan advisory diimplementasikan di observatory, dan tim ditunjukkan cara menjalankan pertanyaan berikutnya sendiri.",
        "Le flux de recherche et de conseil mis en œuvre dans l’observatoire, l’équipe apprenant à poser elle-même la question suivante.",
      ),
      limit: t(
        "Implementation is this desk and the agreed workflow. It is not a payment system, a national digital-government rebuild, or an embedded unit.",
        "Implementasi adalah meja ini dan alur yang disepakati. Bukan sistem pembayaran, pembangunan ulang pemerintahan digital nasional, atau unit yang ditempatkan di dalam lembaga.",
        "La mise en œuvre est ce bureau et le flux convenu. Ce n’est ni un système de paiement, ni une refonte numérique de l’État, ni une unité installée.",
      ),
      href: "/api-docs",
      link: t("Open the desk", "Buka meja", "Ouvrir le bureau"),
    },
  ];

  return (
    <>
      <Header active="Layanan" />
      <main className="about-home">
        <section className="about-hero service-hero">
          <div className="about-copy">
            <span className="eyebrow">{t("SERVICES", "LAYANAN", "SERVICES")}</span>
            <h1>
              {t(
                "Research, advice,\nand a desk the team keeps.",
                "Riset, saran,\ndan meja yang tetap dipakai tim.",
                "Recherche, conseil,\net un bureau que l’équipe garde.",
              )}
            </h1>
            <p className="about-lead">
              {t(
                "The work is data-driven research, market-entry advisory for governments, investors and businesses, education and consulting, and technology implementation that scales the client’s own capability.",
                "Pekerjaannya adalah riset berbasis data, advisory masuk pasar untuk pemerintah, investor, dan bisnis, pendidikan dan konsultasi, serta implementasi teknologi yang meningkatkan kapabilitas klien sendiri.",
                "Le travail couvre la recherche fondée sur les données, le conseil d’entrée sur un marché pour les gouvernements, les investisseurs et les entreprises, la formation et le conseil, et une mise en œuvre technologique qui accroît la capacité propre du client.",
              )}
            </p>
            <p>
              {t(
                "The subject stays the Africa–Asia corridor, in both directions. A recommendation names the figure, the date, and the gap.",
                "Subjeknya tetap koridor Afrika–Asia, di kedua arah. Sebuah saran menyebut angkanya, tanggalnya, dan celahnya.",
                "Le sujet reste le corridor Afrique–Asie, dans les deux sens. Une recommandation nomme le chiffre, la date et la lacune.",
              )}
            </p>
          </div>
          <CorridorDiagram
            label={t(
              "Spider diagram of the Africa–Asia method across six kinds of work",
              "Diagram laba-laba metode Afrika–Asia pada enam jenis pekerjaan",
              "Diagramme en toile de la méthode Afrique–Asie sur six types de travail",
            )}
            caption={t(
              "Spider diagram of the method. Not a score.",
              "Diagram laba-laba metode. Bukan skor.",
              "Diagramme en toile de la méthode. Pas un score.",
            )}
            africaLabel={t("Africa", "Afrika", "Afrique")}
            asiaLabel={t("Asia", "Asia", "Asie")}
            axes={[
              t("Research", "Riset", "Recherche"),
              t("Entry", "Masuk", "Entrée"),
              t("Advice", "Saran", "Avis"),
              t("Education", "Didik", "Formation"),
              t("Consult", "Konsultasi", "Conseil"),
              t("Technology", "Teknologi", "Techno"),
            ]}
          />
        </section>

        <section className="about-process">
          <span className="eyebrow">{t("HOW A REQUEST MOVES", "CARA PERMINTAAN BERJALAN", "COMMENT UNE DEMANDE AVANCE")}</span>
          <h2>
            {t(
              "From the figures to a capability.",
              "Dari angka menuju kapabilitas.",
              "Des chiffres vers une capacité.",
            )}
          </h2>
          <div>
            {[
              [
                t("Research", "Riset", "Recherche"),
                t(
                  "Read the published corridor, sector, and country series. Missing years stay blank.",
                  "Baca koridor, sektor, dan seri negara yang terbit. Tahun yang hilang tetap kosong.",
                  "Lire le corridor, le secteur et les séries nationales publiés. Les années manquantes restent vides.",
                ),
              ],
              [
                t("Advise", "Sarankan", "Conseiller"),
                t(
                  "Say what a government, an investor, or a business can decide, and what the data cannot settle.",
                  "Sebutkan apa yang dapat diputuskan pemerintah, investor, atau bisnis, dan apa yang tidak bisa diselesaikan data.",
                  "Dire ce qu’un gouvernement, un investisseur ou une entreprise peut décider, et ce que les données ne peuvent pas trancher.",
                ),
              ],
              [
                t("Teach", "Ajarkan", "Former"),
                t(
                  "Leave the team able to read the next question with the same method.",
                  "Tinggalkan tim yang mampu membaca pertanyaan berikutnya dengan metode yang sama.",
                  "Laisser l’équipe capable de lire la question suivante avec la même méthode.",
                ),
              ],
              [
                t("Implement", "Implementasikan", "Mettre en œuvre"),
                t(
                  "Put the repeated question on a working desk so the capability stays.",
                  "Taruh pertanyaan yang berulang di meja kerja supaya kapabilitasnya tetap ada.",
                  "Placer la question répétée sur un bureau de travail pour que la capacité demeure.",
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

        <section className="service-areas" aria-label={t("Four service areas", "Empat bidang layanan", "Quatre domaines de service")}>
          {[
            [
              "research",
              "#offer-0",
              research,
              t(
                "Corridor, sector, and country series, with a blank year left blank.",
                "Koridor, sektor, dan seri negara, dengan tahun kosong yang tetap kosong.",
                "Corridor, secteur et séries nationales, une année vide restant vide.",
              ),
            ],
            [
              "advisory",
              "#offer-2",
              advisory,
              t(
                "What a government, an investor, or a business can decide from the evidence.",
                "Apa yang dapat diputuskan pemerintah, investor, atau bisnis dari bukti itu.",
                "Ce qu’un gouvernement, un investisseur ou une entreprise peut décider à partir des preuves.",
              ),
            ],
            [
              "education",
              "#offer-4",
              education,
              t(
                "The method taught to the team, then applied to one decision.",
                "Metode diajarkan ke tim, lalu dipakai untuk satu keputusan.",
                "La méthode transmise à l’équipe, puis appliquée à une décision.",
              ),
            ],
            [
              "technology",
              "#offer-6",
              technology,
              t(
                "The repeated question implemented so the team can run it again.",
                "Pertanyaan yang berulang diimplementasikan supaya tim dapat menjalankannya lagi.",
                "La question répétée mise en œuvre pour que l’équipe puisse la relancer.",
              ),
            ],
          ].map(([type, href, title, copy]) => (
            <article className={`service-area service-area-${type}`} key={type}>
              <AreaGlyph type={type} />
              <h3>{title}</h3>
              <p>{copy}</p>
              <a href={href}>{t("See the outputs", "Lihat hasilnya", "Voir les résultats")} ↓</a>
            </article>
          ))}
        </section>

        <section className="about-services" id="service-list">
          <div className="sectionhead">
            <div>
              <span className="eyebrow">{t("THE LIST", "DAFTAR", "LA LISTE")}</span>
              <h2>
                {t(
                  "Four areas. Eight outputs.",
                  "Empat bidang. Delapan hasil.",
                  "Quatre domaines. Huit résultats.",
                )}
              </h2>
            </div>
          </div>
          {offers.map((offer, index) => (
            <article className="about-service service-offer" id={`offer-${index}`} data-line={offer.area} key={offer.name}>
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
            <span className="eyebrow">{t("WHO IT IS FOR", "UNTUK SIAPA", "POUR QUI")}</span>
            <h2>
              {t(
                "Three clients.\nOne corridor.",
                "Tiga klien.\nSatu koridor.",
                "Trois clients.\nUn corridor.",
              )}
            </h2>
            <p>
              {t(
                "Governments, investors, and businesses can ask for the same four areas. Tony Blair Institute packages strategy, policy, and delivery for political leaders. ITC and Afreximbank add market intelligence and custom questions. AfriXAsia keeps the work on Africa–Asia evidence, then teaches it and implements it so the client’s team can run it again.",
                "Pemerintah, investor, dan bisnis dapat meminta empat bidang yang sama. Tony Blair Institute mengemas strategi, kebijakan, dan pelaksanaan untuk pemimpin politik. ITC dan Afreximbank menambahkan intelijen pasar dan pertanyaan khusus. AfriXAsia menahan pekerjaannya pada bukti Afrika–Asia, lalu mengajarkannya dan mengimplementasikannya supaya tim klien dapat menjalankannya lagi.",
                "Gouvernements, investisseurs et entreprises peuvent demander les mêmes quatre domaines. Le Tony Blair Institute assemble stratégie, politique et mise en œuvre pour des dirigeants politiques. L’ITC et Afreximbank ajoutent l’intelligence de marché et des questions sur mesure. AfriXAsia maintient le travail sur les preuves Afrique–Asie, puis le transmet et le met en œuvre pour que l’équipe du client puisse le relancer.",
              )}
            </p>
          </div>
          <div className="about-values">
            {[
              [
                t("Government", "Pemerintah", "Gouvernement"),
                t(
                  "A market-entry and evidence note for a public decision. The ministry keeps the decision.",
                  "Catatan masuk pasar dan bukti untuk keputusan publik. Kementerian tetap memegang keputusan.",
                  "Une note d’entrée et de preuves pour une décision publique. Le ministère garde la décision.",
                ),
              ],
              [
                t("Investors", "Investor", "Investisseurs"),
                t(
                  "A reading of the corridor and the visible segment. Not a valuation or a financing mandate.",
                  "Pembacaan koridor dan segmen yang terlihat. Bukan valuasi atau mandat pembiayaan.",
                  "Une lecture du corridor et du segment visible. Ni une valorisation ni un mandat de financement.",
                ),
              ],
              [
                t("Businesses", "Bisnis", "Entreprises"),
                t(
                  "Research, consulting, and a desk the operating team can reuse.",
                  "Riset, konsultasi, dan meja yang dapat dipakai lagi oleh tim operasional.",
                  "Recherche, conseil et un bureau que l’équipe opérationnelle peut réutiliser.",
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
                "Ask for one area,\nfrom research to implementation.",
                "Minta satu bidang,\ndari riset sampai implementasi.",
                "Demandez un domaine,\nde la recherche à la mise en œuvre.",
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
            <Link to={contextSearch("/metodologi", context)}>
              {t("Method", "Metode", "Méthode")} <b>↗</b>
            </Link>
            <Link to={contextSearch("/api-docs", context)}>
              API <b>↗</b>
            </Link>
          </div>
        </section>
        <p className="about-source">
          {t(
            "Read on 18 October 2026 from the Tony Blair Institute pages “Helping governments deliver” and “Approach”, the Institute’s 2024 financial statements, ITC pages on MSME export development and market intelligence, and Afreximbank’s Trade Information & Advisory and Trade Intelligence Solutions pages. AfriXAsia uses that advisory shape for governments, investors, and businesses, and does not reproduce the financing or in-government delivery mandates.",
            "Dibaca pada 18 Oktober 2026 dari halaman Tony Blair Institute “Helping governments deliver” dan “Approach”, laporan keuangan Institute tahun 2024, halaman ITC tentang pengembangan ekspor UMKM dan intelijen pasar, serta halaman Afreximbank Trade Information & Advisory dan Trade Intelligence Solutions. AfriXAsia memakai bentuk advisory itu untuk pemerintah, investor, dan bisnis, dan tidak meniru mandat pembiayaan atau pelaksanaan di dalam pemerintah.",
            "Lu le 18 octobre 2026 sur les pages du Tony Blair Institute « Helping governments deliver » et « Approach », les états financiers 2024 de l’Institute, les pages de l’ITC sur l’export des MPME et l’intelligence de marché, et les pages Afreximbank Trade Information & Advisory et Trade Intelligence Solutions. AfriXAsia reprend cette forme de conseil pour les gouvernements, les investisseurs et les entreprises, sans reprendre les mandats de financement ou d’exécution au sein d’un gouvernement.",
          )}
        </p>
        <Footer />
      </main>
    </>
  );
}
