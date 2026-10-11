import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Footer, Header } from "../components/Chrome.jsx";
import { MemberMapping } from "../components/MemberMapping.jsx";
import { useLanguage } from "../i18n.jsx";

export default function ProfilePage() {
  const { publicKey } = useParams();
  const { t, sector } = useLanguage();
  const [member, setMember] = useState(undefined);
  useEffect(() => {
    fetch("/api/listings?per=all")
      .then((response) => response.json())
      .then(async (first) => {
        let rows = first.listings || [];
        let cursor = first.cursor;
        while (cursor && !rows.some((item) => item.publicKey === publicKey)) {
          const next = await fetch(`/api/listings?cursor=${encodeURIComponent(cursor)}`).then((response) => response.json());
          rows = rows.concat(next.listings || []);
          cursor = next.cursor;
        }
        setMember(rows.find((item) => item.publicKey === publicKey) || null);
      })
      .catch(() => setMember(null));
  }, [publicKey]);
  return (
    <>
      <Header active="Marketplace" />
      <main>
        {member === undefined ? (
          <p role="status">{t("Loading profile…", "Memuat profil…", "Chargement du profil…")}</p>
        ) : !member ? (
          <div className="market-empty">
            <span className="eyebrow">404 · AFRIXASIA</span>
            <h1>{t("Page not found.", "Halaman belum ditemukan.", "Page introuvable.")}</h1>
            <p>
              {t(
                "The link may no longer be valid, or the owner has removed this profile.",
                "Tautan mungkin tidak berlaku lagi atau profil telah dihapus oleh pemiliknya.",
                "Le lien n’est peut-être plus valable, ou le profil a été retiré par son propriétaire.",
              )}
            </p>
            <div className="form-actions">
              <Link className="btn primary" to="/marketplace">
                Circle directory →
              </Link>
              <Link className="btn" to="/">
                {t("Explore markets", "Jelajahi pasar", "Explorer les marchés")} →
              </Link>
            </div>
          </div>
        ) : (
          <article className="card membership-review">
            <span className="eyebrow">
              {member.role} · {member.membershipId}
            </span>
            <h1>{member.organization || member.name}</h1>
            {member.organization && member.name && member.organization !== member.name && <p>{member.name}</p>}
            <p>
              {member.country} · {sector(member.category)} ·{" "}
              {member.entityType === "individual"
                ? t("Individual", "Individu", "Particulier")
                : t("Organization", "Organisasi", "Organisation")}
            </p>
            {member.interest || member.segment || member.capabilities ? (
              <MemberMapping member={member} />
            ) : (
              <>
                <h2>{member.title}</h2>
                <p style={{ whiteSpace: "pre-wrap" }}>{member.description}</p>
                <p>{member.quantity}</p>
                <p>
                  {member.originCountry || "—"} → {member.targetCountry || "—"}
                </p>
              </>
            )}
            {member.website && (
              <p>
                <a href={member.website} target="_blank" rel="noreferrer">
                  {member.website} ↗
                </a>
              </p>
            )}
            {member.email || member.phone ? (
              <>
                {member.email && <p>{member.email}</p>}
                {member.phone && <p>{member.phone}</p>}
              </>
            ) : (
              <p className="small muted">{t("Contact details are private.", "Kontak bersifat privat.", "Les coordonnées sont privées.")}</p>
            )}
            <p className="small muted">
              {t("Updated", "Diperbarui", "Mis à jour")} {member.updatedAt?.slice(0, 10)}
            </p>
            <Link className="btn" to="/marketplace">
              ← {t("Member directory", "Direktori anggota", "Annuaire des membres")}
            </Link>
          </article>
        )}
        <Footer />
      </main>
    </>
  );
}
