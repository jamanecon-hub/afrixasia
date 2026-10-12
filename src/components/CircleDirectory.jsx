import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { findCountry, market } from "../../shared/reference.mjs";
import CompanyLogo from "./CompanyLogo.jsx";
import { MemberMapping } from "./MemberMapping.jsx";
import Filters from "./Filters.jsx";
import { useLanguage } from "../i18n.jsx";
import { useResearch } from "../research.jsx";

export default function CircleDirectory() {
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
      (row.region === "Africa" || row.region === "Asia") &&
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
  const buyers = listings.filter((row) => row.role === "buyer");
  const suppliers = listings.filter((row) => row.role === "supplier");
  const africa = providers.filter((row) => row.region === "Africa").length;
  const asia = providers.filter((row) => row.region === "Asia").length;

  return (
    <>
      <div className="sectionhead">
        <div>
          <span className="eyebrow">AFRICA · ASIA</span>
          <h2>{t("Buyer and supplier players across two continents", "Pemain buyer dan supplier lintas dua benua", "Acheteurs et fournisseurs de deux continents")}</h2>
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
        {africa} {t("Africa", "Afrika", "Afrique")} · {asia} {t("Asia", "Asia", "Asie")} · {providers.length}{" "}
        {t("matching organizations", "perusahaan cocok", "organisations correspondantes")}
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
                  <div className="company-name">
                    <CompanyLogo id={row.id} name={row.name} />
                    <div>
                      <b>
                        <Link to={`/penyedia/${row.id}`}>{row.name}</Link>
                      </b>
                      <small>{row.description}</small>
                    </div>
                  </div>
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
            `${buyers.length} buyer members and ${suppliers.length} supplier members in this view. Self-submitted profiles are separate from the public company references above. Membership is not business verification.`,
            `${buyers.length} anggota buyer dan ${suppliers.length} anggota supplier pada tampilan ini. Profil yang didaftarkan sendiri terpisah dari referensi perusahaan publik di atas. Membership bukan verifikasi bisnis.`,
            `${buyers.length} membres acheteurs et ${suppliers.length} membres fournisseurs dans cette vue. Les profils déposés sont distincts des références publiques ci-dessus. L’adhésion ne constitue pas une vérification commerciale.`,
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
            <a className="circle-gold-btn" href="#join-circle">
              AFRIXASIA MEMBER ↗
            </a>
          </div>
        )}
        {cursor && (
          <button className="btn" onClick={() => load(cursor, true)} disabled={loading}>
            {t("Load more members", "Muat anggota lainnya", "Charger plus de membres")}
          </button>
        )}
      </section>
    </>
  );
}
