import { Link, useParams } from "react-router-dom";
import { findCountry, market, sectorCopy } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";
import ResearchDesk from "../components/ResearchDesk.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, useApplyResearchContext } from "../research.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

export default function ProviderPage() {
  const { id } = useParams();
  const { t, sector } = useLanguage();
  const provider = market.providers.find((row) => row.id === id);
  const country = provider ? findCountry(provider.country) : null;
  const indicator = provider ? sectorCopy[provider.category]?.indicators?.[0] : "";
  const fields = provider
    ? {
        country: provider.country,
        category: provider.category,
        ...(indicator ? { indicator } : {}),
      }
    : null;
  useApplyResearchContext(provider?.id, fields);
  if (!provider) return <NotFoundPage />;
  const peers = market.providers.filter((row) => row.category === provider.category && row.id !== provider.id).slice(0, 3);
  return (
    <>
      <Header active="Marketplace" />
      <main>
        <div className="breadcrumbs">
          <Link to={contextSearch("/penyedia", fields)}>
            ← {t("Provider directory", "Direktori penyedia", "Annuaire des organisations")}
          </Link>
          <span>PROVIDER REFERENCE / {provider.id}</span>
        </div>
        <section className="detail-hero">
          <div>
            <span className="eyebrow">OFFICIAL-SOURCE ORGANIZATION PROFILE</span>
            <h1 className="company-name">
              <CompanyLogo id={provider.id} name={provider.name} />
              {provider.name}
            </h1>
            <p>
              {provider.country} · {sector(provider.category)}
            </p>
          </div>
          <a className="btn primary" href={provider.website} target="_blank" rel="noreferrer">
            {t("Official website & contact", "Website & kontak resmi", "Site officiel & contact")} ↗
          </a>
        </section>
        <div className="profile-layout">
          <article className="card profile-card">
            <h2>{t("Published capability", "Kapabilitas yang dipublikasikan", "Capacité publiée")}</h2>
            <p>{provider.description}</p>
            <dl>
              <dt>{t("Reference country", "Negara referensi", "Pays de référence")}</dt>
              <dd>{provider.country}</dd>
              <dt>{t("Sector", "Sektor", "Secteur")}</dt>
              <dd>{sector(provider.category)}</dd>
              <dt>{t("Organization", "Organisasi", "Organisation")}</dt>
              <dd>{t("Independent profile from an official source", "Profil independen dari sumber resmi", "Profil indépendant issu d’une source officielle")}</dd>
              <dt>{t("Source check", "Pemeriksaan sumber", "Vérification de la source")}</dt>
              <dd>{provider.checkedAt}</dd>
              <dt>{t("Availability", "Ketersediaan", "Disponibilité")}</dt>
              <dd>{t("Confirm directly with the organization", "Konfirmasi langsung dengan organisasi", "À confirmer directement avec l’organisation")}</dd>
              <dt>{t("Source", "Sumber", "Source")}</dt>
              <dd>
                <a href={provider.website} target="_blank" rel="noreferrer">
                  {provider.website} ↗
                </a>
              </dd>
              {provider.email && (
                <>
                  <dt>Email</dt>
                  <dd>{provider.email}</dd>
                </>
              )}
            </dl>
            <div className="detail-note">
              <b>{t("Before you write", "Sebelum menghubungi", "Avant de les contacter")}</b>
              <p>
                {t(
                  "Prepare the specification, volume or scope, destination country, budget and deadline. Ask them to confirm cross-border service, permits, portfolio and transaction terms.",
                  "Siapkan spesifikasi, volume/lingkup, negara tujuan, anggaran dan tenggat. Minta konfirmasi layanan lintas negara, izin, portofolio dan ketentuan transaksi.",
                  "Préparez la spécification, le volume ou le périmètre, le pays de destination, le budget et l’échéance. Demandez une confirmation du service transfrontalier, des autorisations, du portefeuille et des conditions.",
                )}
              </p>
            </div>
            <p className="small muted">
              {provider.verification}{" "}
              {t(
                "This profile is not evidence of Circle membership, a partnership, stock, or business certification.",
                "Profil ini bukan bukti keanggotaan Circle, kemitraan, stok, atau sertifikasi bisnis.",
                "Ce profil n’est pas une preuve d’adhésion au Circle, de partenariat, de stock ou de certification.",
              )}
            </p>
            <span className="eyebrow">RESEARCH TO CONNECTION</span>
            <h2>{t("Continue with the same context.", "Lanjutkan dengan konteks yang sama.", "Poursuivre avec le même contexte.")}</h2>
            <Link className="btn" to={`/negara/${country?.iso3 || provider.iso2}`}>
              {t("Country profile", "Profil negara", "Profil du pays")} →
            </Link>
            <Link className="btn" to={contextSearch("/data-pasar", fields)}>
              {t("Related market evidence", "Bukti pasar terkait", "Preuves de marché associées")} →
            </Link>
            <Link className="btn" to={contextSearch("/proyeksi", fields)}>
              {t("Sector outlook", "Outlook sektor", "Perspective du secteur")} →
            </Link>
            <Link className="btn primary" to={contextSearch("/koridor", { origin: provider.country, category: provider.category })}>
              {t("Choose a destination market & submit a mandate", "Pilih pasar tujuan & ajukan mandat", "Choisir un marché cible & déposer un mandat")} →
            </Link>
          </article>
        </div>
        <ResearchDesk countryName={provider.country} category={provider.category} contextFields={fields} />
        {peers.length > 0 && (
          <>
            <div className="sectionhead">
              <h2>{t("Comparison organizations · same sector", "Organisasi pembanding · sektor sama", "Organisations comparables · même secteur")}</h2>
            </div>
            <div className="cards">
              {peers.map((row) => (
                <article className="card" key={row.id}>
                  <span className="badge">{row.country}</span>
                  <h3 className="company-name">
                    <CompanyLogo id={row.id} name={row.name} />
                    {row.name}
                  </h3>
                  <p>{row.description}</p>
                  <Link to={`/penyedia/${row.id}`}>{t("Full profile", "Profil lengkap", "Profil complet")} →</Link>
                </article>
              ))}
            </div>
          </>
        )}
        <Footer />
      </main>
    </>
  );
}
