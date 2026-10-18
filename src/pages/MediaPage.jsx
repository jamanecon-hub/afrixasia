import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { findCountry, wdi } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, patchContext, ResearchBar, useResearch } from "../research.jsx";

function Spotlight({ brief, country, onSelect }) {
  const { t, language } = useLanguage();
  const [context] = useResearch();
  const [shown, setShown] = useState(20);
  const selected = findCountry(country || brief.highlight?.name || "Kenya");
  const notes = (brief.notes || []).filter((note) => !country || note.country === country);
  const stats = wdi.latest.filter(
    (row) =>
      row.country === selected?.iso3 &&
      ["SP.POP.TOTL", "NY.GDP.MKTP.KD.ZG", "NY.GDP.PCAP.CD"].includes(row.indicator),
  );
  if (!selected) return null;
  return (
    <section className="reference-catalog">
      <span className="eyebrow">{t("COUNTRY SPOTLIGHT", "SOROTAN NEGARA", "PAYS À LA UNE")}</span>
      <h2>{selected.name}</h2>
      <p>
        {t(
          "Historical context for reading today’s coverage; these statistics are not daily updates.",
          "Konteks historis untuk membaca liputan hari ini; statistik ini bukan pembaruan harian.",
          "Contexte historique pour lire l’actualité ; ces statistiques ne sont pas des mises à jour quotidiennes.",
        )}
      </p>
      <div className="cards">
        {stats.map((row) => {
          const indicator = wdi.indicators.find((item) => item.code === row.indicator);
          return (
            <article className="card" key={row.indicator}>
              <span className="eyebrow">{indicator.name}</span>
              <h3>
                {new Intl.NumberFormat(language === "id" ? "id-ID" : language === "fr" ? "fr-FR" : "en-GB", {
                  maximumFractionDigits: 2,
                  notation: "compact",
                }).format(row.value)}
              </h3>
              <p>
                {indicator.unit} · {row.year}
              </p>
              <a href={indicator.sourceUrl} target="_blank" rel="noreferrer">
                World Bank ↗
              </a>
            </article>
          );
        })}
      </div>
      <Link className="btn" to={contextSearch("/open-data", { ...context, country: selected.name })}>
        {t("Analyze this economy", "Analisis ekonomi ini", "Analyser cette économie")} →
      </Link>
      <div className="sectionhead">
        <h2>{t("Country coverage notes", "Catatan cakupan negara", "Notes de couverture par pays")}</h2>
        <span>
          {brief.scannedCountryCount || 0}/104 {t("scanned", "dipindai", "analysés")}
        </span>
      </div>
      <p className="notice">
        {t(
          "The table reports source access and collected headlines, not daily demand growth. Missing feeds are explicit; a quiet feed does not mean an unchanged market.",
          "Tabel melaporkan akses sumber dan berita terkumpul, bukan pertumbuhan permintaan harian. Feed yang tidak tersedia ditandai; tanpa berita bukan berarti pasar tidak berubah.",
          "Le tableau décrit l’accès aux sources et les articles collectés, pas la croissance quotidienne de la demande. Les flux absents sont signalés ; un flux sans nouvelles ne signifie pas un marché inchangé.",
        )}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("Country", "Negara", "Pays")}</th>
              <th>{t("Source status", "Status sumber", "État des sources")}</th>
              <th>{t("Headlines collected", "Berita terkumpul", "Articles collectés")}</th>
              <th>{t("Read coverage", "Baca liputan", "Lire les articles")}</th>
            </tr>
          </thead>
          <tbody>
            {notes.slice(0, shown).map((note) => (
              <tr key={note.iso3}>
                <td>{note.country}</td>
                <td>
                  {note.feedStatus === "available"
                    ? t("Feed accessible", "Feed dapat diakses", "Flux accessible")
                    : note.feedStatus === "unavailable"
                      ? t("Feed unavailable", "Feed tidak tersedia", "Flux indisponible")
                      : t("Not yet scanned", "Belum dipindai", "Non analysé")}
                </td>
                <td>{note.headlines?.length || 0}</td>
                <td>
                  <button className="btn" onClick={() => onSelect(note.country)}>
                    {t("View country", "Lihat negara", "Voir le pays")} →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notes.length > shown && (
        <button className="btn" onClick={() => setShown(shown + 30)}>
          {t("Show more countries", "Lihat negara lainnya", "Voir plus de pays")}
        </button>
      )}
    </section>
  );
}

export default function MediaPage() {
  const { t } = useLanguage();
  const [context, setContext] = useResearch();
  const [brief, setBrief] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetch("/api/brief")
      .then((response) => {
        if (!response.ok) throw new Error("brief");
        return response.json();
      })
      .then(setBrief)
      .catch(() => setFailed(true));
  }, []);
  const news = (brief?.news || []).filter(
    (item) =>
      (!context.country || item.country === context.country || item.countries?.includes(context.country)) &&
      (!context.region || item.region === context.region || item.regions?.includes(context.region)) &&
      (!context.q || [item.title, item.source, item.summary].join(" ").toLowerCase().includes(context.q.toLowerCase())),
  );
  return (
    <>
      <Header active="Daily brief" />
      <main>
        <ResearchBar scope="media" />
        <div className="reference-hero">
          <span className="eyebrow">AFRIXASIA · MEDIA BRIEF</span>
          <h1>{t("Stories connecting two continents.", "Cerita yang menghubungkan dua benua.", "Des récits qui relient deux continents.")}</h1>
          <p>
            {t(
              "Follow the AfriXAsia channel and read externally sourced market headlines with their original publication dates.",
              "Ikuti kanal AfriXAsia dan baca berita pasar bersumber eksternal dengan tanggal publikasi aslinya.",
              "Suivez le canal AfriXAsia et consultez l’actualité économique avec les dates de publication originales.",
            )}
          </p>
        </div>
        <section className="media-brand-panel">
          <div className="media-brand-art">
            <img src="/brand/afrixasia-wordmark-white.png" alt="AfriXAsia" />
          </div>
          <div>
            <span className="eyebrow">INSTAGRAM · @AFRIXASIA</span>
            <h2>{t("From the AfriXAsia community", "Dari komunitas AfriXAsia", "La communauté AfriXAsia")}</h2>
            <p>
              {t(
                "Explore the account for original visual stories, community updates and conversations across Africa and Asia.",
                "Kunjungi akun untuk cerita visual asli, kabar komunitas, dan percakapan lintas Afrika–Asia.",
                "Consultez le compte pour ses récits visuels, ses nouvelles communautaires et ses échanges entre Afrique et Asie.",
              )}
            </p>
            <a className="btn primary" href="https://www.instagram.com/afrixasia/" target="_blank" rel="noreferrer">
              {t("View @afrixasia on Instagram", "Lihat @afrixasia di Instagram", "Voir @afrixasia sur Instagram")} ↗
            </a>
            <p className="small muted">
              {t(
                "Checked again on 18 October 2026. Instagram and Threads still require a login, so post images and captions are not copied here. The image shown is the AfriXAsia brand asset. Headlines below are public news items, not Instagram posts.",
                "Dicek lagi pada 18 Oktober 2026. Instagram dan Threads masih meminta login, jadi gambar dan caption posting tidak disalin di sini. Gambar yang tampil adalah aset brand AfriXAsia. Berita di bawah berasal dari kabar publik, bukan posting Instagram.",
                "Nouvelle vérification le 18 octobre 2026. Instagram et Threads exigent toujours une connexion, donc les images et légendes ne sont pas copiées ici. Le visuel est l’identité AfriXAsia. Les titres ci-dessous viennent de sources publiques, pas d’Instagram.",
              )}
            </p>
          </div>
        </section>
        {failed && <div className="form-error">Media brief could not be loaded.</div>}
        {brief && (
          <>
            <div className="dataset-strip">
              <span>
                {t("Brief date", "Tanggal brief", "Date du brief")}: {brief.date}
              </span>
              <span>
                {t("Successful feeds", "Feed berhasil", "Flux disponibles")}: {brief.successfulFeeds || 0}/{brief.totalFeeds || 0}
              </span>
              <span>
                {(brief.news || []).length} {t("headlines", "berita", "articles")}
              </span>
              <a href="/api/brief">{t("Source status JSON", "Status sumber JSON", "État des sources JSON")} ↗</a>
            </div>
            {brief.fallback && (
              <p className="notice">
                {t(
                  "Live news retrieval is incomplete. Available reference headlines may be older than this brief. Check each publication date.",
                  "Pengambilan berita langsung belum lengkap. Referensi berita dapat lebih lama dari tanggal brief. Periksa tanggal publikasi masing-masing.",
                  "La collecte des nouvelles est incomplète. Certaines références peuvent être antérieures au brief. Vérifiez chaque date de publication.",
                )}
              </p>
            )}
            <div className="portal-filters">
              <label>
                {t("Country", "Negara", "Pays")}
                <select value={context.country || ""} onChange={(event) => setContext(patchContext(context, "country", event.target.value))}>
                  <option value="">{t("All countries", "Semua negara", "Tous les pays")}</option>
                  {wdi.countries.map((country) => (
                    <option key={country.iso3} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("Search headlines", "Cari berita", "Rechercher des articles")}
                <input value={context.q || ""} onChange={(event) => setContext({ ...context, q: event.target.value })} />
              </label>
            </div>
            <p className="small muted">
              {t(
                "Headlines remain in their original language. Automated collection does not imply editorial verification or affiliation with the publisher.",
                "Judul berita tetap dalam bahasa aslinya. Pengumpulan otomatis bukan verifikasi editorial atau afiliasi dengan penerbit.",
                "Les titres restent dans leur langue originale. La collecte automatique ne constitue ni vérification éditoriale ni affiliation à l’éditeur.",
              )}
            </p>
            <div className="cards">
              {news.slice(0, 60).map((item, index) => (
                <article className="card" key={item.url || index}>
                  <span className="eyebrow">
                    {item.source} · {item.country}
                  </span>
                  <h3>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.title} ↗
                    </a>
                  </h3>
                  <p>
                    {item.provenance === "rss"
                      ? t(
                          "Read the original article for context. Not individually editorially verified.",
                          "Baca sumber asli untuk konteks. Belum diverifikasi editorial individual.",
                          "Consultez l’article original pour le contexte. Non vérifié individuellement par une rédaction.",
                        )
                      : item.summary}
                  </p>
                  <time dateTime={item.publishedAt || item.date}>
                    {item.publishedAt || item.date || t("Publication date unavailable", "Tanggal publikasi tidak tersedia", "Date de publication indisponible")}
                  </time>
                </article>
              ))}
            </div>
            {!news.length && (
              <div className="detail-note">
                <h3>{t("No headlines available for this selection.", "Belum ada berita untuk pilihan ini.", "Aucun article disponible pour cette sélection.")}</h3>
                <p>
                  {t(
                    "Broaden the country filter, view the official AfriXAsia channel or inspect the feed status above.",
                    "Perluas filter negara, kunjungi kanal AfriXAsia, atau periksa status feed di atas.",
                    "Élargissez le filtre pays, consultez le canal AfriXAsia ou vérifiez l’état des flux ci-dessus.",
                  )}
                </p>
                <button className="btn" onClick={() => setContext({ ...context, country: "", region: "", q: "" })}>
                  {t("Show all headlines", "Lihat semua berita", "Voir tous les articles")}
                </button>
              </div>
            )}
            <Spotlight brief={brief} country={context.country || ""} onSelect={(country) => setContext(patchContext(context, "country", country))} />
          </>
        )}
        <Footer />
      </main>
    </>
  );
}
