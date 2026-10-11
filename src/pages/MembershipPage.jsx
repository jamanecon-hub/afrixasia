import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { findCountry, market } from "../../shared/reference.mjs";
import { Footer, Header, Wordmark } from "../components/Chrome.jsx";
import { MemberMapping } from "../components/MemberMapping.jsx";
import Filters from "../components/Filters.jsx";
import { useLanguage } from "../i18n.jsx";
import { registerSearch, ResearchBar, useResearch } from "../research.jsx";

export default function MembershipPage() {
  const { t, sector } = useLanguage();
  const [context, setContext] = useResearch();
  const [shown, setShown] = useState(25);
  const [members, setMembers] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load(nextCursor = cursor, append = false) {
    setLoading(true);
    try {
      const response = await fetch(`/api/listings${nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : ""}`);
      if (!response.ok) throw new Error("listings");
      const body = await response.json();
      setMembers(append ? [...members, ...body.listings] : body.listings);
      setCursor(body.cursor);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(null, false);
    // initial directory load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const providers = market.providers.filter(
    (row) =>
      (!context.country || row.country === context.country) &&
      (!context.region || row.region === context.region) &&
      (!context.category || row.category === context.category) &&
      (!context.q || [row.name, row.description, row.country].join(" ").toLowerCase().includes(context.q.toLowerCase())),
  );
  const listings = members.filter(
    (row) =>
      (!context.country || row.country === context.country) &&
      (!context.region || findCountry(row.country)?.region === context.region) &&
      (!context.category || row.category === context.category) &&
      (!context.role || row.role === context.role) &&
      (!context.type || row.listingType === context.type) &&
      (!context.origin || row.originCountry === context.origin) &&
      (!context.target || row.targetCountry === context.target) &&
      (!context.q ||
        [row.name, row.organization, row.title, row.description, row.interest?.statement, row.capabilities?.offer, row.capabilities?.certifications, ...(row.interest?.intents || [])]
          .join(" ")
          .toLowerCase()
          .includes(context.q.toLowerCase())),
  );

  return (
    <>
      <Header active="Marketplace" />
      <main>
        <ResearchBar scope="membership" />
        <section className="circle-hero">
          <div className="circle-hero-copy">
            <span className="circle-overline">AFRIXASIA CIRCLE · MEMBERSHIP</span>
            <h1>{t("Your ambition.\nA wider circle.", "Ambisi Anda.\nKoneksi lebih luas.", "Votre ambition.\nUn cercle plus vaste.")}</h1>
            <p>
              {t(
                "A community for individuals and organizations building business across Asia and Africa. Start with your membership, then introduce what you need or what you offer.",
                "Komunitas individu dan organisasi yang membangun bisnis lintas Asia–Afrika. Daftar membership, lalu perkenalkan kebutuhan atau penawaran Anda.",
                "Une communauté de particuliers et d’organisations développant leurs activités entre l’Asie et l’Afrique. Adhérez, puis présentez vos besoins ou votre offre.",
              )}
            </p>
            <div className="form-actions">
              <Link className="circle-gold-btn" to={registerSearch(context, "buyer")}>
                {t("Become a buyer member", "Daftar sebagai buyer", "Adhérer comme acheteur")} ↗
              </Link>
              <Link className="btn" to={registerSearch(context, "supplier")}>
                {t("Become a supplier member", "Daftar sebagai supplier", "Adhérer comme fournisseur")} ↗
              </Link>
            </div>
            <p className="small">
              {t(
                "Google or a manual form • Buyer and supplier roles • Interest, segment, and capabilities are published • Email and phone stay private unless you opt in",
                "Google atau form manual • Peran buyer dan supplier • Minat, segmen, dan kapabilitas dipublikasikan • Email dan telepon tetap privat kecuali Anda memilih sebaliknya",
                "Google ou formulaire manuel • Rôles acheteur et fournisseur • Intérêt, segment et capacités publiés • E-mail et téléphone privés sauf accord",
              )}
            </p>
            <Link to="/daftar">{t("Already a member? Manage your profile", "Sudah menjadi anggota? Kelola profil", "Déjà membre ? Gérez votre profil")} →</Link>
          </div>
          <div className="membership-card">
            <div className="membership-card-top">
              <Wordmark />
              <span>THE CIRCLE</span>
            </div>
            <div className="card-emblem">
              <Wordmark symbol />
            </div>
            <div className="membership-card-bottom">
              <b>{t("Your next chapter starts here.", "Bab berikutnya dimulai di sini.", "Votre prochain chapitre commence ici.")}</b>
              <span>ASIA · AFRICA</span>
            </div>
          </div>
        </section>
        <section className="circle-benefits">
          {[
            [t("Your member identity", "Identitas anggota", "Votre identité membre"), t("Receive a digital membership ID after your profile is saved successfully.", "Dapatkan ID membership digital setelah profil berhasil disimpan.", "Recevez un identifiant numérique après l’enregistrement réussi de votre profil.")],
            [t("A purposeful introduction", "Perkenalan yang bermakna", "Une présentation utile"), t("Publish your need or capability with sector and country context.", "Publikasikan kebutuhan atau kemampuan dengan konteks sektor dan negara.", "Publiez votre besoin ou votre offre avec son secteur et ses pays.")],
            [t("Your visibility, your choice", "Visibilitas sesuai pilihan", "Votre visibilité, votre choix"), t("Keep contact details private or choose to publish them. Edit or delete your profile anytime.", "Simpan kontak privat atau pilih untuk dipublikasikan. Ubah atau hapus profil kapan saja.", "Gardez vos coordonnées privées ou publiez-les. Modifiez ou supprimez votre profil à tout moment.")],
          ].map(([title, copy], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </section>
        <div className="sectionhead">
          <div>
            <span className="eyebrow">PUBLIC COMPANY REFERENCE</span>
            <h2>{t("Discover organizations across two continents", "Kenali perusahaan lintas dua benua", "Découvrez les organisations de deux continents")}</h2>
          </div>
          <a href="/api/providers?format=csv">CSV ↓</a>
        </div>
        <p className="notice">
          {t(
            "78 profiles sourced from official public websites, checked on 10 October 2026. These organizations are reference listings, not registered members or endorsed partners. Inventory and commercial availability are not verified.",
            "78 profil dari situs publik resmi, diperiksa 10 Oktober 2026. Perusahaan ini adalah referensi, bukan anggota terdaftar atau mitra terverifikasi. Stok dan ketersediaan komersial belum diverifikasi.",
            "78 profils issus de sites officiels publics, consultés le 10 octobre 2026. Ce sont des références, pas des membres inscrits ni des partenaires agréés. Stocks et disponibilité commerciale non vérifiés.",
          )}
        </p>
        <Filters
          value={context}
          onChange={(next) => {
            setContext(next);
            setShown(25);
          }}
        />
        <p>
          {providers.length} {t("matching organizations", "perusahaan cocok", "organisations correspondantes")}
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[t("Organization", "Perusahaan", "Organisation"), t("Country", "Negara", "Pays"), t("Sector", "Sektor", "Secteur"), t("Public source", "Sumber publik", "Source publique")].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providers.slice(0, shown).map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.name}</b>
                    <small>{row.description}</small>
                  </td>
                  <td>
                    {row.country}
                    <small>{row.region}</small>
                  </td>
                  <td>{sector(row.category)}</td>
                  <td>
                    <a href={row.website} target="_blank" rel="noreferrer">
                      {t("Official website", "Website resmi", "Site officiel")} ↗
                    </a>
                    <small>{row.checkedAt}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!providers.length && (
          <p className="empty">
            {t(
              "No matching public company profile. Reset the filters to view the directory.",
              "Tidak ada profil cocok. Reset filter untuk melihat direktori.",
              "Aucun profil correspondant. Réinitialisez les filtres pour consulter l’annuaire.",
            )}
          </p>
        )}
        {shown < providers.length && (
          <button className="btn" onClick={() => setShown(shown + 25)}>
            {t("Show more companies", "Lihat perusahaan lainnya", "Voir plus d’entreprises")}
          </button>
        )}
        <section className="reference-catalog">
          <div className="sectionhead">
            <h2>{t("Member introductions", "Perkenalan anggota", "Présentations des membres")}</h2>
            <a href="/api/listings?format=csv">{t("Public member export", "Ekspor anggota publik", "Export public des membres")} ↓</a>
          </div>
          <p>
            {t(
              "Self-submitted profiles, separate from the public company references above. Membership is not business verification.",
              "Profil yang didaftarkan sendiri, terpisah dari referensi perusahaan publik di atas. Membership bukan verifikasi bisnis.",
              "Profils déposés par les membres, distincts des références publiques ci-dessus. L’adhésion ne constitue pas une vérification commerciale.",
            )}
          </p>
          {failed ? (
            <div role="alert" className="form-error">
              {t("Member profiles could not be loaded.", "Profil anggota belum dapat dimuat.", "Impossible de charger les profils des membres.")}{" "}
              <button className="btn" onClick={() => load(cursor, Boolean(cursor))} disabled={loading}>
                {t("Retry", "Coba lagi", "Réessayer")}
              </button>
            </div>
          ) : listings.length ? (
            <div className="cards">
              {listings.map((member) => (
                <article className="card" key={member.id}>
                  <span className="eyebrow">
                    {member.role} · {member.membershipId}
                  </span>
                  <h3>{member.organization || member.name}</h3>
                  {member.organization && member.name && member.organization !== member.name && <p>{member.name}</p>}
                  <p>
                    {member.country}
                    {member.category ? ` · ${sector(member.category)}` : ""}
                  </p>
                  <MemberMapping member={member} compact />
                  <Link to={member.profilePath}>{t("View profile", "Lihat profil", "Voir le profil")} →</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="detail-note">
              <h3>{t("Be part of the first introductions.", "Jadilah bagian dari perkenalan pertama.", "Faites partie des premières présentations.")}</h3>
              <p>
                {t(
                  "No public member profile matches this view yet. Your profile appears here after successful registration and publication consent.",
                  "Belum ada profil publik anggota sesuai pilihan ini. Profil Anda muncul setelah pendaftaran tersimpan dan persetujuan publikasi diberikan.",
                  "Aucun profil public ne correspond encore à cette vue. Votre profil apparaîtra après inscription réussie et consentement à sa publication.",
                )}
              </p>
              <Link className="circle-gold-btn" to={registerSearch(context)}>
                {t("Start your membership", "Mulai membership Anda", "Commencer votre adhésion")} ↗
              </Link>
            </div>
          )}
          {cursor && (
            <button className="btn" onClick={() => load(cursor, true)} disabled={loading}>
              {t("Load more members", "Muat anggota lainnya", "Charger plus de membres")}
            </button>
          )}
        </section>
        <Footer />
      </main>
    </>
  );
}
