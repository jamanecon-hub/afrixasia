import { Link } from "react-router-dom";
import { LINKEDIN_URL, TELEGRAM_URL, membershipCardPdf } from "../../shared/card-pdf.mjs";
import { intentLabel } from "./MemberMapping.jsx";
import { Wordmark } from "./Chrome.jsx";
import { useLanguage } from "../i18n.jsx";

function downloadCard(member) {
  const bytes = membershipCardPdf(member);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `AfriXAsia-${member.membershipId || "card"}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function Detail({ label, value }) {
  if (!String(value || "").trim()) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

export default function MemberWelcome({ member, mail, onManage }) {
  const { t, sector } = useLanguage();
  const name = member.name || "";
  const organization = member.organization || t("Individual member", "Anggota individu", "Membre individuel");
  const role = member.role === "supplier" ? t("Supplier", "Supplier", "Fournisseur") : t("Buyer", "Buyer", "Acheteur");
  const intents = (member.interest?.intents || []).map((id) => intentLabel(t, id)).join(" · ");
  const mailSent = mail?.sent === true;
  const mailSkipped = mail && mail.sent === false;
  return (
    <section className="membership-welcome crm-kit" id="membership-kit">
      <span className="eyebrow">01 · {t("GREETING", "SAPAAN", "ACCUEIL")}</span>
      <h2>
        {t("Welcome to the Circle", "Selamat datang di Circle", "Bienvenue dans le Circle")}, {name}.
      </h2>
      <p>
        {t(
          "Your membership is active. This page is your Circle kit: the details you submitted, a virtual card in your name, and the two communities to join next.",
          "Membership Anda aktif. Halaman ini adalah kit Circle Anda: data yang Anda isi, kartu virtual atas nama Anda, dan dua komunitas untuk diikuti berikutnya.",
          "Votre adhésion est active. Cette page est votre kit Circle : les informations envoyées, une carte virtuelle à votre nom, et les deux communautés à rejoindre.",
        )}
      </p>
      {mailSent && (
        <p className="notice">
          {t(
            `A greeting email, with your details and the card attached, was sent to ${member.email}.`,
            `Email sapaan, beserta data Anda dan kartu terlampir, dikirim ke ${member.email}.`,
            `Un e-mail d’accueil, avec vos informations et la carte en pièce jointe, a été envoyé à ${member.email}.`,
          )}
        </p>
      )}
      {mailSkipped && (
        <p className="notice">
          {t(
            `Your greeting is ready here. Outbound email is not connected yet, so a copy was not sent to ${member.email}.`,
            `Sapaan Anda siap di halaman ini. Email keluar belum terhubung, jadi salinan belum terkirim ke ${member.email}.`,
            `Votre accueil est prêt ici. L’envoi d’e-mail n’est pas encore connecté, donc aucune copie n’a été envoyée à ${member.email}.`,
          )}
        </p>
      )}

      <div className="sectionhead">
        <h3>02 · {t("What you submitted", "Yang Anda isi", "Ce que vous avez envoyé")}</h3>
        <span>{member.membershipId}</span>
      </div>
      <dl className="crm-details">
        <Detail label={t("Full name", "Nama lengkap", "Nom complet")} value={name} />
        <Detail label={t("Organization", "Organisasi", "Organisation")} value={organization} />
        <Detail label={t("Role", "Peran", "Rôle")} value={role} />
        <Detail label={t("Country", "Negara", "Pays")} value={member.country} />
        <Detail label={t("Email", "Email", "E-mail")} value={member.email} />
        <Detail label={t("Phone", "Telepon", "Téléphone")} value={member.phone} />
        <Detail label={t("Website", "Website", "Site web")} value={member.website} />
        <Detail label={t("Interest", "Minat", "Intérêt")} value={[intents, member.interest?.statement].filter(Boolean).join(" — ")} />
        <Detail label={t("Sector", "Sektor", "Secteur")} value={member.category ? sector(member.category) : ""} />
        <Detail label={t("Origin", "Asal", "Origine")} value={member.originCountry || member.segment?.originCountry} />
        <Detail label={t("Target market", "Pasar tujuan", "Marché cible")} value={member.targetCountry || member.segment?.targetCountry} />
        <Detail label={t("Offer", "Penawaran", "Offre")} value={member.description || member.capabilities?.offer} />
        <Detail label={t("Capacity", "Kapasitas", "Capacité")} value={member.quantity || member.capabilities?.capacity} />
        <Detail label={t("Certifications", "Sertifikasi", "Certifications")} value={member.capabilities?.certifications} />
        <Detail label={t("Lead time", "Lead time", "Délai")} value={member.capabilities?.leadTime} />
        <Detail label={t("Purchase purpose", "Tujuan pembelian", "Objectif de l’achat")} value={member.buyerPurpose} />
        <Detail label={t("Budget", "Anggaran", "Budget")} value={member.buyerBudget} />
        <Detail label={t("Selection criteria", "Kriteria pemilihan", "Critères de sélection")} value={member.buyerCriteria} />
        <Detail label={t("Business model", "Model bisnis", "Modèle d’activité")} value={member.supplierBusinessType} />
        <Detail label={t("Minimum order", "Minimum order", "Commande minimum")} value={member.supplierMOQ} />
        <Detail label={t("Market experience", "Pengalaman pasar", "Expérience commerciale")} value={member.supplierExperience} />
      </dl>

      <div className="sectionhead">
        <h3>03 · {t("Virtual card", "Kartu virtual", "Carte virtuelle")}</h3>
      </div>
      <div className="virtual-cards">
        <article className="vcard vcard-front">
          <div>
            <Wordmark />
            <span className="vcard-kicker">THE CIRCLE · {t("FRONT", "DEPAN", "RECTO")}</span>
          </div>
          <div>
            <h3>{name}</h3>
            <p>{organization}</p>
          </div>
          <span>
            {role.toUpperCase()} · {member.country} · {member.membershipId}
          </span>
        </article>
        <article className="vcard vcard-back">
          <div>
            <b>AFRIXASIA</b>
            <span className="vcard-kicker">{t("BACK", "BELAKANG", "VERSO")}</span>
          </div>
          <p>
            {t(
              "Bring the corridor with you. Join the group, then follow the page.",
              "Bawa koridor ini bersama Anda. Masuk ke grup, lalu ikuti halamannya.",
              "Emportez le corridor avec vous. Rejoignez le groupe, puis suivez la page.",
            )}
          </p>
          <p>
            Telegram
            <br />
            <a href={TELEGRAM_URL}>t.me/afrixasia</a>
          </p>
          <p>
            LinkedIn
            <br />
            <a href={LINKEDIN_URL}>linkedin.com/company/afrixasia</a>
          </p>
        </article>
      </div>
      <button className="circle-gold-btn" type="button" onClick={() => downloadCard(member)}>
        {t("Download card PDF", "Unduh kartu PDF", "Télécharger la carte PDF")} ↓
      </button>

      <div className="sectionhead">
        <h3>04 · {t("Join the communities", "Masuk ke komunitas", "Rejoindre les communautés")}</h3>
      </div>
      <div className="crm-invites">
        <a className="crm-invite" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
          <span>Telegram</span>
          <b>{t("Join the AfriXAsia group", "Masuk grup AfriXAsia", "Rejoindre le groupe AfriXAsia")}</b>
          <small>t.me/afrixasia ↗</small>
        </a>
        <a className="crm-invite" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          <span>LinkedIn</span>
          <b>{t("Follow the AfriXAsia page", "Ikuti halaman AfriXAsia", "Suivre la page AfriXAsia")}</b>
          <small>AfriXAsia ↗</small>
        </a>
      </div>

      <div className="form-actions">
        {member.profilePath && (
          <Link className="btn" to={member.profilePath}>
            {t("View my profile", "Lihat profil saya", "Voir mon profil")} ↗
          </Link>
        )}
        <button className="btn" type="button" onClick={onManage}>
          {t("Manage membership", "Kelola membership", "Gérer mon adhésion")}
        </button>
        <Link className="btn" to="/marketplace">
          {t("Member directory", "Direktori anggota", "Annuaire des membres")}
        </Link>
      </div>
    </section>
  );
}
