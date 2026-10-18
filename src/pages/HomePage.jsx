import { Link } from "react-router-dom";
import { Footer, Header, Wordmark } from "../components/Chrome.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, registerSearch, useResearch } from "../research.jsx";

export default function HomePage() {
  const { t } = useLanguage();
  const [context] = useResearch();
  const services = [
    [
      t("Market & Industry Research", "Riset Pasar & Industri", "Recherche sur les marchés & industries"),
      t(
        "Market and sector intelligence that makes the Africa–Asia corridor easier to understand: industries, policy shifts, players and risks.",
        "Intelijen pasar dan sektor untuk memahami koridor Afrika–Asia: industri, perubahan kebijakan, pelaku, dan risiko.",
        "Une intelligence des marchés et des secteurs pour comprendre le corridor Afrique–Asie : industries, évolutions des politiques, acteurs et risques.",
      ),
      "/open-data",
    ],
    [
      t("Capital & Market Access", "Akses Modal & Pasar", "Accès au capital & aux marchés"),
      t(
        "Connect Asian capital with African industry, and African resources and markets with Asian value chains. Value moves in both directions.",
        "Menghubungkan modal Asia dengan industri Afrika, serta sumber daya dan pasar Afrika dengan rantai nilai Asia. Nilai bergerak dua arah.",
        "Relier le capital asiatique à l’industrie africaine, et les ressources et marchés africains aux chaînes de valeur asiatiques. La valeur circule dans les deux sens.",
      ),
      "/data-pasar",
    ],
    [
      t("Talent & Knowledge Exchange", "Pertukaran Talenta & Pengetahuan", "Échanges de talents & de connaissances"),
      t(
        "Engineering scholarships, reverse-innovation programs and cross-continental research collaboration build capabilities that stay and grow locally.",
        "Beasiswa teknik, program reverse innovation, dan kolaborasi riset lintas benua membangun kemampuan yang tumbuh secara lokal.",
        "Bourses d’ingénierie, programmes d’innovation inversée et recherche intercontinentale développent des capacités ancrées localement.",
      ),
      "/marketplace",
    ],
    [
      t("Technology Development & Deployment", "Pengembangan & Implementasi Teknologi", "Développement & déploiement technologiques"),
      t(
        "Turn technological expertise into capability on the ground, across telecommunications, digital payments, AI and the wider digital economy.",
        "Mengubah keahlian teknologi menjadi kemampuan nyata, di bidang telekomunikasi, pembayaran digital, AI, dan ekonomi digital.",
        "Transformer l’expertise technologique en capacités concrètes : télécommunications, paiements numériques, IA et économie numérique.",
      ),
      "/marketplace",
    ],
    [
      t("Community & Media Channel", "Komunitas & Kanal Media", "Communauté & médias"),
      t(
        "Briefs, archives, opportunities and professional stories bring people and ideas together through Instagram, LinkedIn and the AfriXAsia community.",
        "Brief, arsip, peluang, dan cerita profesional mempertemukan orang dan gagasan melalui Instagram, LinkedIn, dan komunitas AfriXAsia.",
        "Briefs, archives, opportunités et récits professionnels réunissent les personnes et les idées via Instagram, LinkedIn et la communauté AfriXAsia.",
      ),
      "/daily-brief",
    ],
  ];
  return (
    <>
      <Header active="Beranda" />
      <main className="about-home">
        <section className="about-hero">
          <div className="about-copy">
            <span className="eyebrow">AFRICA × ASIA COLLABORATION PLATFORM</span>
            <h1>
              {t(
                "Africa’s economic momentum.\nAsia’s technological depth.",
                "Momentum ekonomi Afrika.\nKedalaman teknologi Asia.",
                "L’élan économique africain.\nLa profondeur technologique asiatique.",
              )}
            </h1>
            <p className="about-trajectory">{t("One shared trajectory.", "Satu arah bersama.", "Une trajectoire commune.")}</p>
            <p>
              {t(
                "A strategic alliance opening doors between Africa and Asia through market exchange, consultation and development.",
                "Aliansi strategis yang membuka akses antara Afrika dan Asia melalui pertukaran pasar, konsultasi, dan pengembangan.",
                "Une alliance stratégique qui ouvre des portes entre l’Afrique et l’Asie par les échanges de marché, le conseil et le développement.",
              )}
            </p>
            <div className="form-actions">
              <a className="btn primary" href="#about-services">
                {t("Discover AfriXAsia", "Kenali AfriXAsia", "Découvrir AfriXAsia")} ↓
              </a>
              <Link className="about-text-link" to={registerSearch(context)}>
                {t("Join our community", "Bergabung dengan komunitas", "Rejoindre notre communauté")} ↗
              </Link>
            </div>
            <div className="about-location">
              {t(
                "BASED IN THE UNITED ARAB EMIRATES · CONNECTING TWO CONTINENTS",
                "BERBASIS DI UNI EMIRAT ARAB · MENGHUBUNGKAN DUA BENUA",
                "BASÉ AUX ÉMIRATS ARABES UNIS · RELIER DEUX CONTINENTS",
              )}
            </div>
          </div>
          <figure className="about-earth">
            <img
              src="/about/earth-nasa.jpg"
              alt={t(
                "Earth from space, centered on Africa and Asia",
                "Bumi dari angkasa, berpusat pada Afrika dan Asia",
                "La Terre vue de l’espace, centrée sur l’Afrique et l’Asie",
              )}
              fetchPriority="high"
            />
            <figcaption>NASA Blue Marble · {t("Public domain", "Domain publik", "Domaine public")}</figcaption>
          </figure>
        </section>
        <section className="about-intro">
          <div>
            <span className="eyebrow">{t("WHO WE ARE", "SIAPA KAMI", "QUI SOMMES-NOUS")}</span>
            <h2>{t("Both continents.\nOne platform.", "Dua benua.\nSatu platform.", "Deux continents.\nUne plateforme.")}</h2>
          </div>
          <div>
            <p className="about-lead">
              {t(
                "AfriXAsia provides strategic access and opportunities across Africa and Asia. Our work combines research, capital and market access, talent exchange, technology deployment and our own media channel.",
                "AfriXAsia menyediakan akses strategis dan peluang di Afrika dan Asia. Kami menggabungkan riset, akses modal dan pasar, pertukaran talenta, implementasi teknologi, serta kanal media sendiri.",
                "AfriXAsia offre un accès stratégique et des opportunités en Afrique et en Asie. Notre travail associe recherche, accès au capital et aux marchés, échanges de talents, déploiement technologique et médias.",
              )}
            </p>
            <p>
              {t(
                "We work with investors, corporates, governments and professionals who want to move from insight to action across both regions.",
                "Kami bekerja bersama investor, perusahaan, pemerintah, dan profesional yang ingin beralih dari wawasan menuju aksi di kedua kawasan.",
                "Nous travaillons avec des investisseurs, entreprises, gouvernements et professionnels souhaitant passer de l’analyse à l’action dans les deux régions.",
              )}
            </p>
            <div className="about-facts">
              <div>
                <b>2026</b>
                <span>{t("Founded", "Didirikan", "Fondation")}</span>
              </div>
              <div>
                <b>UAE</b>
                <span>{t("Base of operations", "Basis operasional", "Base opérationnelle")}</span>
              </div>
              <div>
                <b>5</b>
                <span>{t("Connected service lines", "Lini layanan terhubung", "Lignes de services reliées")}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="about-services" id="about-services">
          <div className="sectionhead">
            <div>
              <span className="eyebrow">{t("WHAT WE DO", "APA YANG KAMI LAKUKAN", "NOS ACTIVITÉS")}</span>
              <h2>
                {t(
                  "From first insight to presence on the ground.",
                  "Dari wawasan awal menuju kehadiran nyata.",
                  "De la première analyse à une présence sur le terrain.",
                )}
              </h2>
            </div>
            <Link to="/layanan">{t("Services you can request", "Layanan yang bisa diminta", "Services que vous pouvez demander")} ↗</Link>
          </div>
          {services.map(([title, copy, href], index) => (
            <article className="about-service" key={title}>
              <span className="about-service-number">0{index + 1}</span>
              <h3>{title}</h3>
              <div>
                <p>{copy}</p>
                <Link to={contextSearch(href, context)}>
                  {t("Explore the platform", "Jelajahi platform", "Explorer la plateforme")} ↗
                </Link>
              </div>
            </article>
          ))}
        </section>
        <section className="about-principles">
          <div>
            <span className="eyebrow">BANDUNG 1955 → AFRIXASIA 2026</span>
            <h2>{t("A partnership of equals.", "Kemitraan yang setara.", "Un partenariat d’égal à égal.")}</h2>
            <p>
              {t(
                "Rooted in the South–South spirit of Bandung, our vision is for Africa and Asia to move as equals on one shared trajectory into the technology age.",
                "Berakar pada semangat kerja sama Selatan–Selatan Bandung, visi kami adalah Afrika dan Asia bergerak setara dalam satu arah bersama menuju era teknologi.",
                "Ancrée dans l’esprit de coopération Sud–Sud de Bandung, notre vision est celle d’une Afrique et d’une Asie avançant d’égal à égal vers l’ère technologique.",
              )}
            </p>
          </div>
          <div className="about-values">
            {[
              [t("Partnership of equals", "Kemitraan setara", "Partenariat égalitaire"), t("Two regions at the same table.", "Dua kawasan di meja yang sama.", "Deux régions autour de la même table.")],
              [t("Two-way value", "Nilai dua arah", "Valeur réciproque"), t("Capital, markets and capabilities connected in both directions.", "Modal, pasar, dan kemampuan terhubung dua arah.", "Capital, marchés et capacités reliés dans les deux sens.")],
              [t("Sovereign capability", "Kemandirian kemampuan", "Capacités souveraines"), t("Technology, skills and research that stay and grow where they reach.", "Teknologi, keterampilan, dan riset yang tinggal dan berkembang di tempatnya.", "Technologies, compétences et recherche qui s’ancrent et se développent localement.")],
            ].map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="about-process">
          <span className="eyebrow">{t("HOW WE WORK", "CARA KAMI BEKERJA", "NOTRE APPROCHE")}</span>
          <h2>
            {t(
              "A clear path from question to collaboration.",
              "Jalur yang jelas dari pertanyaan menuju kolaborasi.",
              "Un parcours clair de la question à la collaboration.",
            )}
          </h2>
          <div>
            {[
              [t("Frame", "Rumuskan", "Cadrer"), t("Define the market question, corridor and sectors that matter.", "Tentukan pertanyaan pasar, koridor, dan sektor yang relevan.", "Définir la question, le corridor et les secteurs pertinents.")],
              [t("Understand", "Pahami", "Comprendre"), t("Research demand, rules, players and risks.", "Teliti permintaan, aturan, pelaku, dan risiko.", "Étudier la demande, les règles, les acteurs et les risques.")],
              [t("Connect", "Hubungkan", "Relier"), t("Bring capital, partners and talent across regions.", "Hubungkan modal, mitra, dan talenta lintas kawasan.", "Relier capital, partenaires et talents entre les régions.")],
              [t("Build & amplify", "Bangun & perluas", "Développer & diffuser"), t("Develop capabilities, deploy technology and build visibility.", "Kembangkan kemampuan, implementasikan teknologi, dan bangun visibilitas.", "Développer les capacités, déployer la technologie et renforcer la visibilité.")],
            ].map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <p className="small muted">
            {t(
              "Engagement scope is agreed with each partner.",
              "Lingkup kerja disepakati bersama setiap mitra.",
              "Le périmètre est convenu avec chaque partenaire.",
            )}
          </p>
        </section>
        <section className="about-channel">
          <div>
            <Wordmark />
            <h2>
              {t(
                "Let’s build the Africa–Asia corridor together.",
                "Mari bangun koridor Afrika–Asia bersama.",
                "Construisons ensemble le corridor Afrique–Asie.",
              )}
            </h2>
            <Link className="btn primary" to={contextSearch("/marketplace", context)}>
              {t("Become part of the Circle", "Jadilah bagian dari Circle", "Rejoignez le Circle")} ↗
            </Link>
          </div>
          <div className="about-channel-links">
            <a href="https://www.instagram.com/afrixasia/" target="_blank" rel="noreferrer">
              Instagram <b>@afrixasia ↗</b>
            </a>
            <a href="https://www.linkedin.com/company/afrixasia/" target="_blank" rel="noreferrer">
              LinkedIn <b>AfriXAsia ↗</b>
            </a>
            <a href="https://afrixasia.org" target="_blank" rel="noreferrer">
              Website <b>afrixasia.org ↗</b>
            </a>
            <a href="https://www.instagram.com/afrixasia/" target="_blank" rel="noreferrer">
              Telegram <b>{t("COL-LAB · link in Instagram bio", "COL-LAB · tautan di bio Instagram", "COL-LAB · lien dans la bio Instagram")} ↗</b>
            </a>
          </div>
        </section>
        <p className="about-source">
          {t(
            "About AfriXAsia: based on the company profile supplied on 11 October 2026.",
            "Tentang AfriXAsia: berdasarkan company profile yang diberikan pada 11 Oktober 2026.",
            "À propos d’AfriXAsia : d’après le profil d’entreprise fourni le 11 octobre 2026.",
          )}
        </p>
        <Footer />
      </main>
    </>
  );
}
