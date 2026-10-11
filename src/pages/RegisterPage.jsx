import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categories, wdi } from "../../shared/reference.mjs";
import { Footer, Header, Wordmark } from "../components/Chrome.jsx";
import { useLanguage } from "../i18n.jsx";
import { findCountry } from "../../shared/reference.mjs";
import { registerSearch, useResearch } from "../research.jsx";

const empty = {
  entityType: "entity",
  name: "",
  country: "",
  title: "",
  description: "",
  quantity: "",
  website: "",
  phone: "",
  email: "",
  buyerPurpose: "",
  buyerBudget: "",
  buyerTimeline: "",
  buyerCriteria: "",
  supplierBusinessType: "",
  supplierMOQ: "",
  supplierLeadTime: "",
  supplierExperience: "",
  supplierCertifications: "",
  publicContact: false,
  publishConsent: false,
  membershipConsent: false,
  category: "Food & agriculture",
  listingType: "product",
  originCountry: "",
  targetCountry: "",
};

function Field({ id, label, hint, children }) {
  return (
    <label htmlFor={id}>
      {label}
      <small>{hint}</small>
      {children}
    </label>
  );
}

export default function RegisterPage() {
  const { t, sector } = useLanguage();
  const [context] = useResearch();
  const [params] = useSearchParams();
  const role = params.get("role") === "buyer" || params.get("role") === "supplier" ? params.get("role") : "";
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const formRef = useRef(null);
  const [form, setForm] = useState(empty);
  const buyer = role === "buyer";

  useEffect(() => {
    fetch("/api/session")
      .then((response) => response.json())
      .then((body) => {
        setSession(body);
        const existing = body.member && (!role || body.member.role === role) ? body.member : null;
        setForm((current) => ({
          ...current,
          email: body.email || "",
          category: categories.includes(context.category) ? context.category : current.category,
          listingType:
            context.type ||
            (["Food & agriculture", "Apparel & textiles"].includes(context.category || "Food & agriculture")
              ? "product"
              : "service"),
          originCountry: findCountry(context.origin || "")?.name || "",
          targetCountry: findCountry(context.target || context.country || "")?.name || "",
          ...(existing || {}),
          publicContact: Boolean(existing?.publicContact),
          publishConsent: Boolean(existing?.publishConsent),
          membershipConsent: Boolean(existing?.membershipConsent),
          role,
        }));
      })
      .catch(() => setSession({ email: "" }));
  }, [role]);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate(index) {
    const fields = formRef.current?.querySelectorAll(
      `[data-step="${index}"] input, [data-step="${index}"] select, [data-step="${index}"] textarea`,
    );
    for (const field of fields || []) {
      if (!field.checkValidity()) {
        setStep(index);
        requestAnimationFrame(() => {
          field.reportValidity();
          field.focus();
        });
        return false;
      }
    }
    return true;
  }

  async function signIn(event) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams({ email: emailInput }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Sign-in failed.");
      return;
    }
    const next = await fetch("/api/session").then((item) => item.json());
    setSession(next);
    setForm((current) => ({ ...current, email: next.email, ...(next.member || {}) }));
  }

  async function signOut() {
    await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ action: "signout" }),
    });
    setSession({ email: "" });
    setSaved(null);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (step < 2) {
      if (validate(step)) {
        setStep(step + 1);
        setError("");
      }
      return;
    }
    for (let index = 0; index < 3; index += 1) if (!validate(index)) return;
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    data.set("role", role);
    if (form.publicContact) data.set("publicContact", "on");
    if (form.publishConsent) data.set("publishConsent", "on");
    if (form.membershipConsent) data.set("membershipConsent", "on");
    try {
      const response = await fetch("/api/registration", { method: "POST", headers: { accept: "application/json" }, body: data });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? t("Your session expired. Sign in again before saving.", "Sesi berakhir. Masuk kembali sebelum menyimpan.", "Votre session a expiré. Reconnectez-vous avant d’enregistrer.")
            : body.error ||
                t("Registration was not saved. Review your fields and try again.", "Pendaftaran belum tersimpan. Periksa isian dan coba lagi.", "L’inscription n’a pas été enregistrée. Vérifiez les champs et réessayez."),
        );
      }
      setSaved(body);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (
      !confirm(
        t(
          "Delete your membership and public profile?",
          "Hapus membership dan profil publik Anda?",
          "Supprimer votre adhésion et votre profil public ?",
        ),
      )
    )
      return;
    setSaving(true);
    const data = new FormData();
    data.set("action", "delete");
    const response = await fetch("/api/registration", { method: "POST", body: data });
    if (!response.ok) {
      setError(t("Deletion failed. Try again.", "Penghapusan gagal. Coba lagi.", "La suppression a échoué. Réessayez."));
      setSaving(false);
      return;
    }
    window.location.assign("/daftar");
  }

  const required = t("Required", "Wajib diisi", "Obligatoire");
  const optional = t("Optional", "Opsional", "Facultatif");
  const priv = t("Private member information", "Informasi anggota privat", "Information privée du membre");
  const existing = session?.member;

  return (
    <>
      <Header active="daftar" />
      {session?.email && (
        <div className="account-strip">
          <span>
            {t("Signed in", "Terhubung", "Connecté")} · {session.email}
          </span>
          <div>
            {existing && (
              <Link to={`/anggota/${existing.publicKey}`}>{t("Public profile", "Profil publik", "Profil public")} ↗</Link>
            )}
            <button className="btn" onClick={signOut}>
              {t("Sign out", "Keluar", "Déconnexion")}
            </button>
          </div>
        </div>
      )}
      <main className="member-application">
        <Link to="/marketplace">← AfriXAsia Circle</Link>
        <div className="application-heading">
          <span className="eyebrow">AFRIXASIA CIRCLE · {role || "COMMUNITY"} MEMBERSHIP</span>
          <h1>{t("Your place in the Circle.", "Tempat Anda di Circle.", "Votre place dans le Circle.")}</h1>
          <p>
            {role === "buyer"
              ? t("Tell future suppliers what you need, where and when.", "Jelaskan kepada calon pemasok apa yang Anda butuhkan, di mana, dan kapan.", "Présentez aux fournisseurs vos besoins, les pays et les délais.")
              : role === "supplier"
                ? t("Introduce your products, services and capabilities to new markets.", "Perkenalkan produk, layanan, dan kapabilitas Anda ke pasar baru.", "Présentez vos produits, services et capacités à de nouveaux marchés.")
                : t("Choose your primary role. A distinct application for every ambition.", "Pilih peran utama. Form terpisah sesuai kebutuhan Anda.", "Choisissez votre rôle principal. Un formulaire adapté à votre ambition.")}
          </p>
        </div>
        {!role ? (
          <div className="membership-choices">
            {["buyer", "supplier"].map((choice) => (
              <Link key={choice} className={`membership-choice ${choice}-choice`} to={registerSearch(context, choice)}>
                <span className="choice-number">{choice.toUpperCase()} MEMBERSHIP</span>
                <h3>
                  {choice === "buyer"
                    ? t("Find your next partner.", "Temukan mitra berikutnya.", "Trouvez votre prochain partenaire.")
                    : t("Bring your expertise to new markets.", "Bawa keahlian Anda ke pasar baru.", "Présentez votre savoir-faire à de nouveaux marchés.")}
                </h3>
                <p>
                  {choice === "buyer"
                    ? t("Define your requirements, budget, timing and supplier criteria.", "Tentukan kebutuhan, anggaran, waktu, dan kriteria pemasok.", "Définissez vos besoins, votre budget, vos délais et vos critères.")
                    : t("Describe your offer, capacity, minimum order and delivery readiness.", "Jelaskan penawaran, kapasitas, minimum order, dan kesiapan pengiriman.", "Décrivez votre offre, vos capacités, vos minimums et vos délais.")}
                </p>
                <span className="choice-action">{t("Start application", "Mulai pendaftaran", "Commencer l’inscription")} ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="member-application-grid">
            <section>
              {(context.origin || context.target) && (
                <div className="research-carry">
                  <span>{t("YOUR MARKET CONTEXT", "KONTEKS PASAR ANDA", "VOTRE CONTEXTE DE MARCHÉ")}</span>
                  <b>
                    {context.origin || "—"} → {context.target || context.country || "—"}
                  </b>
                  <p>{context.category}</p>
                </div>
              )}
              {!session?.email ? (
                <div className="membership-signin">
                  <h2>{t("One account. Your own member profile.", "Satu akun. Profil anggota milik Anda.", "Un compte. Votre profil membre.")}</h2>
                  <p>
                    {t(
                      "Sign in to access the registration form, save your membership and manage your profile later. This source build uses a local email session in place of ChatGPT sign-in.",
                      "Masuk untuk mengisi form, menyimpan membership, dan mengelola profil. Pembangunan ulang ini memakai sesi email lokal sebagai pengganti login ChatGPT.",
                      "Connectez-vous pour remplir le formulaire et gérer votre profil. Cette version source utilise une session e-mail locale à la place de ChatGPT.",
                    )}
                  </p>
                  <form className="form-actions" onSubmit={signIn}>
                    <input type="email" required placeholder="name@organization.com" value={emailInput} onChange={(event) => setEmailInput(event.target.value)} />
                    <button className="circle-gold-btn" type="submit">
                      {t("Sign in & complete registration", "Masuk & lengkapi pendaftaran", "Se connecter et s’inscrire")} ↗
                    </button>
                  </form>
                  {error && <div className="form-error">{error}</div>}
                  <div className="signin-questions">
                    <p>01 · {t("Individual or entity details", "Identitas individu atau entitas", "Identité de la personne ou organisation")}</p>
                    <p>
                      02 ·{" "}
                      {buyer
                        ? t("Buying requirements & destination", "Kebutuhan pembelian & tujuan", "Besoins d’achat & destination")
                        : t("Supply capacity & origin", "Kapasitas pasokan & asal", "Capacités d’offre & origine")}
                    </p>
                    <p>03 · {t("Review, publication consent & activation", "Review, persetujuan publikasi & aktivasi", "Vérification, consentement & activation")}</p>
                  </div>
                  <p className="small muted">
                    {t(
                      "An account is required to own, edit and delete your profile. Registration does not automatically send messages to other members.",
                      "Akun diperlukan untuk kepemilikan, perubahan, dan penghapusan profil. Pendaftaran tidak otomatis mengirim pesan ke anggota lain.",
                      "Un compte est nécessaire pour gérer et supprimer votre profil. L’inscription n’envoie pas automatiquement de messages aux membres.",
                    )}
                  </p>
                </div>
              ) : saved ? (
                <div className="membership-welcome" role="status">
                  <span className="eyebrow">{t("YOUR MEMBERSHIP IS ACTIVE", "MEMBERSHIP ANDA AKTIF", "VOTRE ADHÉSION EST ACTIVE")}</span>
                  <h2>
                    {t("Welcome to the Circle", "Selamat datang di Circle", "Bienvenue dans le Circle")}, {form.name}.
                  </h2>
                  <p>
                    {t(
                      "Your profile was saved and its storage confirmed. Your introduction is now available in the public member directory.",
                      "Profil berhasil disimpan dan penyimpanannya dikonfirmasi. Perkenalan Anda kini tersedia di direktori anggota publik.",
                      "Votre profil a été enregistré et son stockage confirmé. Votre présentation est disponible dans l’annuaire public des membres.",
                    )}
                  </p>
                  <div className="mini-membership-card">
                    <Wordmark />
                    <h3>{form.name}</h3>
                    <p>
                      {role.toUpperCase()} · {form.country}
                    </p>
                    <b>{saved.membershipId}</b>
                  </div>
                  <div className="form-actions">
                    <Link className="circle-gold-btn" to={saved.profilePath}>
                      {t("View my profile", "Lihat profil saya", "Voir mon profil")} ↗
                    </Link>
                    <button className="btn" onClick={() => setSaved(null)}>
                      {t("Manage membership", "Kelola membership", "Gérer mon adhésion")}
                    </button>
                    <Link className="btn" to="/marketplace">
                      {t("Member directory", "Direktori anggota", "Annuaire des membres")}
                    </Link>
                  </div>
                </div>
              ) : (
                <form ref={formRef} className="membership-form" onSubmit={onSubmit} noValidate>
                  <datalist id="reference-countries">
                    {wdi.countries.map((country) => (
                      <option key={country.iso3} value={country.name} />
                    ))}
                  </datalist>
                  <div className="membership-stepper">
                    {[
                      t("Identity", "Identitas", "Identité"),
                      buyer ? t("Buyer brief", "Mandat buyer", "Besoin acheteur") : t("Supplier profile", "Profil supplier", "Profil fournisseur"),
                      t("Review & activate", "Review & aktivasi", "Vérifier & activer"),
                    ].map((label, index) => (
                      <div key={label} className={index === step ? "current" : index < step ? "complete" : ""} aria-current={index === step ? "step" : undefined}>
                        <span>{index < step ? "✓" : index + 1}</span>
                        <b>{label}</b>
                      </div>
                    ))}
                  </div>
                  {error && (
                    <div className="form-error" role="alert">
                      {error}
                    </div>
                  )}
                  <fieldset className="member-step" data-step="0" hidden={step !== 0} disabled={saving}>
                    <legend>{t("Let’s start with an introduction.", "Mari mulai dengan perkenalan.", "Commençons par une présentation.")}</legend>
                    <div className="form-grid">
                      <Field id="member-entityType" label={t("You are joining as", "Anda bergabung sebagai", "Vous adhérez en tant que")} hint={required}>
                        <select id="member-entityType" name="entityType" required value={form.entityType} onChange={(event) => set("entityType", event.target.value)}>
                          <option value="entity">{t("Company / organization", "Perusahaan / organisasi", "Entreprise / organisation")}</option>
                          <option value="individual">{t("Individual / professional", "Individu / profesional", "Particulier / professionnel")}</option>
                        </select>
                      </Field>
                      <Field id="member-name" label={t("Individual or organization name", "Nama individu atau organisasi", "Nom de la personne ou organisation")} hint={required}>
                        <input id="member-name" name="name" required minLength={2} maxLength={120} value={form.name} onChange={(event) => set("name", event.target.value)} />
                      </Field>
                      <Field id="member-country" label={t("Country of residence / incorporation", "Negara domisili / pendirian", "Pays de résidence / constitution")} hint={required}>
                        <input id="member-country" name="country" list="reference-countries" required minLength={2} maxLength={80} value={form.country} onChange={(event) => set("country", event.target.value)} />
                      </Field>
                      <Field id="member-website" label={t("Website / business profile", "Website / profil bisnis", "Site web / profil professionnel")} hint={optional}>
                        <input id="member-website" name="website" type="url" maxLength={300} placeholder="https://…" pattern="https://.*" value={form.website} onChange={(event) => set("website", event.target.value)} />
                      </Field>
                      <Field id="member-email" label={t("Contact email", "Email kontak", "Adresse e-mail")} hint={`${priv} · ${required}`}>
                        <input id="member-email" name="email" type="email" required maxLength={200} value={form.email} onChange={(event) => set("email", event.target.value)} />
                      </Field>
                      <Field id="member-phone" label={t("Phone / WhatsApp", "Telepon / WhatsApp", "Téléphone / WhatsApp")} hint={priv}>
                        <input id="member-phone" name="phone" type="tel" maxLength={40} value={form.phone} onChange={(event) => set("phone", event.target.value)} />
                      </Field>
                    </div>
                    <p className="member-privacy">
                      {t(
                        "Email and phone stay private unless you choose public visibility in the final step.",
                        "Email dan telepon privat kecuali Anda memilih publik pada tahap terakhir.",
                        "Votre e-mail et votre téléphone restent privés sauf si vous choisissez de les publier à la dernière étape.",
                      )}
                    </p>
                  </fieldset>
                  <fieldset className="member-step" data-step="1" hidden={step !== 1} disabled={saving}>
                    <legend>
                      {buyer
                        ? t("What are you looking for?", "Apa yang Anda cari?", "Que recherchez-vous ?")
                        : t("What can you bring to the market?", "Apa yang Anda tawarkan?", "Que proposez-vous au marché ?")}
                    </legend>
                    <div className="form-grid">
                      <Field id="member-listingType" label={t("Product or service", "Produk atau jasa", "Produit ou service")} hint={required}>
                        <select id="member-listingType" name="listingType" required value={form.listingType} onChange={(event) => set("listingType", event.target.value)}>
                          <option value="product">{t("Product", "Produk", "Produit")}</option>
                          <option value="service">{t("Service", "Jasa", "Service")}</option>
                        </select>
                      </Field>
                      <Field id="member-category" label={t("Primary sector", "Sektor utama", "Secteur principal")} hint={required}>
                        <select id="member-category" name="category" required value={form.category} onChange={(event) => set("category", event.target.value)}>
                          {[...categories, "Other non-oil & gas"].map((category) => (
                            <option key={category} value={category}>
                              {category === "Other non-oil & gas" ? category : sector(category)}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field id="member-title" label={buyer ? t("Buying requirement title", "Judul kebutuhan pembelian", "Titre du besoin d’achat") : t("Offer title", "Judul penawaran", "Titre de l’offre")} hint={required}>
                        <input id="member-title" name="title" required minLength={5} maxLength={140} value={form.title} onChange={(event) => set("title", event.target.value)} />
                      </Field>
                      <Field id="member-quantity" label={buyer ? t("Required volume / scope", "Volume / lingkup kebutuhan", "Volume / périmètre du besoin") : t("Supply capacity / service scope", "Kapasitas pasokan / layanan", "Capacité d’offre / périmètre")} hint={required}>
                        <input id="member-quantity" name="quantity" required maxLength={120} value={form.quantity} onChange={(event) => set("quantity", event.target.value)} />
                      </Field>
                      <Field id="member-description" label={buyer ? t("Requirements and specifications", "Kebutuhan dan spesifikasi", "Besoins et spécifications") : t("Products, services and capabilities", "Produk, layanan, dan kapabilitas", "Produits, services et capacités")} hint={required}>
                        <textarea id="member-description" name="description" required minLength={20} maxLength={2000} rows={4} value={form.description} onChange={(event) => set("description", event.target.value)} />
                      </Field>
                      <Field id="member-origin" label={buyer ? t("Preferred supplier country", "Negara pemasok yang diinginkan", "Pays fournisseur souhaité") : t("Country of product / operations", "Negara asal produk / operasional", "Pays du produit / des opérations")} hint={buyer ? optional : required}>
                        <input id="member-origin" name="originCountry" list="reference-countries" required={!buyer} maxLength={100} value={form.originCountry} onChange={(event) => set("originCountry", event.target.value)} />
                      </Field>
                      <Field id="member-target" label={t("Destination / target market", "Negara tujuan / target pasar", "Destination / marché cible")} hint={buyer ? required : optional}>
                        <input id="member-target" name="targetCountry" list="reference-countries" required={buyer} maxLength={100} value={form.targetCountry} onChange={(event) => set("targetCountry", event.target.value)} />
                      </Field>
                      {buyer ? (
                        <>
                          <Field id="member-purpose" label={t("Purpose of purchase", "Tujuan pembelian", "Objectif de l’achat")} hint={`${priv} · ${required}`}>
                            <select id="member-purpose" name="buyerPurpose" required value={form.buyerPurpose} onChange={(event) => set("buyerPurpose", event.target.value)}>
                              <option value="">{t("Select…", "Pilih…", "Sélectionner…")}</option>
                              <option value="business">{t("Business operations", "Operasional bisnis", "Activité professionnelle")}</option>
                              <option value="resale">{t("Distribution / resale", "Distribusi / penjualan kembali", "Distribution / revente")}</option>
                              <option value="project">{t("Client project", "Proyek klien", "Projet client")}</option>
                              <option value="personal">{t("Personal / professional use", "Kebutuhan pribadi / profesional", "Usage personnel / professionnel")}</option>
                            </select>
                          </Field>
                          <Field id="member-budget" label={t("Budget range & currency", "Kisaran anggaran & mata uang", "Budget & devise")} hint={`${priv} · ${required}`}>
                            <input id="member-budget" name="buyerBudget" required maxLength={150} placeholder={t("e.g. USD 20,000 or not yet determined", "Misal USD 20.000 atau belum ditentukan", "Ex. 20 000 USD ou non défini")} value={form.buyerBudget} onChange={(event) => set("buyerBudget", event.target.value)} />
                          </Field>
                          <Field id="member-timeline" label={t("Purchase timeline", "Waktu pembelian", "Échéance d’achat")} hint={`${priv} · ${required}`}>
                            <select id="member-timeline" name="buyerTimeline" required value={form.buyerTimeline} onChange={(event) => set("buyerTimeline", event.target.value)}>
                              <option value="">{t("Select…", "Pilih…", "Sélectionner…")}</option>
                              <option value="immediate">{t("Within 30 days", "Dalam 30 hari", "Sous 30 jours")}</option>
                              <option value="quarter">{t("Within 1–3 months", "Dalam 1–3 bulan", "Sous 1 à 3 mois")}</option>
                              <option value="later">{t("More than 3 months", "Lebih dari 3 bulan", "Dans plus de 3 mois")}</option>
                              <option value="exploring">{t("Exploring options", "Masih eksplorasi", "Exploration des options")}</option>
                            </select>
                          </Field>
                          <Field id="member-criteria" label={t("Supplier selection criteria", "Kriteria pemilihan pemasok", "Critères de sélection du fournisseur")} hint={`${priv} · ${required}`}>
                            <textarea id="member-criteria" name="buyerCriteria" required maxLength={1000} rows={4} value={form.buyerCriteria} onChange={(event) => set("buyerCriteria", event.target.value)} />
                          </Field>
                        </>
                      ) : (
                        <>
                          <Field id="member-model" label={t("Business model", "Model bisnis", "Modèle d’activité")} hint={`${priv} · ${required}`}>
                            <select id="member-model" name="supplierBusinessType" required value={form.supplierBusinessType} onChange={(event) => set("supplierBusinessType", event.target.value)}>
                              <option value="">{t("Select…", "Pilih…", "Sélectionner…")}</option>
                              <option value="manufacturer">{t("Manufacturer / product owner", "Produsen / pemilik produk", "Fabricant / propriétaire du produit")}</option>
                              <option value="distributor">{t("Distributor / exporter / trader", "Distributor / eksportir / trader", "Distributeur / exportateur / négociant")}</option>
                              <option value="service">{t("Service company / institution", "Perusahaan jasa / institusi", "Entreprise de services / institution")}</option>
                              <option value="professional">{t("Professional / freelancer", "Profesional / freelancer", "Professionnel / indépendant")}</option>
                            </select>
                          </Field>
                          <Field id="member-moq" label={t("Minimum order / engagement", "Minimum order / engagement", "Commande / engagement minimum")} hint={priv}>
                            <input id="member-moq" name="supplierMOQ" maxLength={150} value={form.supplierMOQ} onChange={(event) => set("supplierMOQ", event.target.value)} />
                          </Field>
                          <Field id="member-lead" label={t("Delivery / service start lead time", "Waktu pengiriman / mulai layanan", "Délai de livraison / démarrage")} hint={`${priv} · ${required}`}>
                            <input id="member-lead" name="supplierLeadTime" required maxLength={150} value={form.supplierLeadTime} onChange={(event) => set("supplierLeadTime", event.target.value)} />
                          </Field>
                          <Field id="member-experience" label={t("Market experience", "Pengalaman pasar", "Expérience commerciale")} hint={`${priv} · ${required}`}>
                            <select id="member-experience" name="supplierExperience" required value={form.supplierExperience} onChange={(event) => set("supplierExperience", event.target.value)}>
                              <option value="">{t("Select…", "Pilih…", "Sélectionner…")}</option>
                              <option value="new">{t("New business", "Usaha baru", "Nouvelle activité")}</option>
                              <option value="domestic">{t("Domestic market experience", "Pengalaman pasar domestik", "Expérience nationale")}</option>
                              <option value="international">{t("International market experience", "Pengalaman pasar internasional", "Expérience internationale")}</option>
                            </select>
                          </Field>
                          <Field id="member-certs" label={t("Certifications / accreditation / portfolio", "Sertifikasi / akreditasi / portofolio", "Certifications / accréditations / portfolio")} hint={priv}>
                            <input id="member-certs" name="supplierCertifications" maxLength={500} value={form.supplierCertifications} onChange={(event) => set("supplierCertifications", event.target.value)} />
                          </Field>
                        </>
                      )}
                    </div>
                    <p className="member-privacy">
                      {t(
                        "Private fields remain in your account. Budget, purchase criteria, minimum order, lead time and qualifications are not published automatically.",
                        "Isian privat tetap di akun Anda. Anggaran, kriteria, minimum order, lead time, dan kualifikasi tidak otomatis dipublikasikan.",
                        "Les champs privés restent dans votre compte. Budget, critères, minimums, délais et qualifications ne sont pas publiés automatiquement.",
                      )}
                    </p>
                  </fieldset>
                  <fieldset className="member-step" data-step="2" hidden={step !== 2} disabled={saving}>
                    <legend>{t("Review your introduction.", "Periksa perkenalan Anda.", "Vérifiez votre présentation.")}</legend>
                    <div className="membership-review">
                      <span className="circle-member-badge">{role.toUpperCase()} MEMBERSHIP</span>
                      <h3>{form.name}</h3>
                      <p>
                        {form.country} · {sector(form.category)}
                      </p>
                      <h3>{form.title}</h3>
                      <p style={{ whiteSpace: "pre-wrap" }}>{form.description}</p>
                      <p>{form.quantity}</p>
                      <p>
                        {form.originCountry || "—"} → {form.targetCountry || "—"}
                      </p>
                      <p>{form.website}</p>
                      <button className="btn" type="button" onClick={() => setStep(1)}>
                        {t("Edit details", "Ubah detail", "Modifier les détails")}
                      </button>
                    </div>
                    <label className="check-row">
                      <input type="checkbox" checked={form.publicContact} onChange={(event) => set("publicContact", event.target.checked)} />
                      <span>{t("Publish my email and phone so potential partners can contact me.", "Publikasikan email dan telepon agar calon mitra dapat menghubungi saya.", "Publier mon e-mail et mon téléphone pour permettre aux partenaires de me contacter.")}</span>
                    </label>
                    <label className="check-row">
                      <input type="checkbox" required checked={form.publishConsent} onChange={(event) => set("publishConsent", event.target.checked)} />
                      <span>{t("I consent to publishing my name, country, website and listing above in the community directory and public data exports.", "Saya menyetujui publikasi nama, negara, website, dan listing di direktori komunitas serta ekspor data publik.", "Je consens à publier mon nom, mon pays, mon site et l’annonce ci-dessus dans l’annuaire communautaire et les exports publics.")}</span>
                    </label>
                    <label className="check-row">
                      <input type="checkbox" required checked={form.membershipConsent} onChange={(event) => set("membershipConsent", event.target.checked)} />
                      <span>{t("I am authorized to represent this profile and provide accurate information. I will not offer oil & gas or illegal goods/services. I understand membership does not verify identity or business capability.", "Saya berwenang mewakili profil dan memberikan informasi yang benar. Saya tidak menawarkan oil & gas atau barang/jasa ilegal. Membership bukan verifikasi identitas atau kapabilitas bisnis.", "Je suis autorisé à représenter ce profil et fournis des informations exactes. Je ne propose ni pétrole et gaz ni produits ou services illégaux. L’adhésion ne vérifie pas l’identité ou les capacités commerciales.")}</span>
                    </label>
                    <p>
                      <a href="/privasi" target="_blank" rel="noreferrer">
                        {t("Privacy & membership terms", "Privasi & ketentuan membership", "Confidentialité & conditions d’adhésion")} ↗
                      </a>
                    </p>
                  </fieldset>
                  <div className="member-form-nav">
                    {step > 0 ? (
                      <button className="btn" type="button" disabled={saving} onClick={() => setStep(step - 1)}>
                        ← {t("Back", "Kembali", "Retour")}
                      </button>
                    ) : (
                      <Link to={registerSearch(context, buyer ? "supplier" : "buyer")}>{t("Change role", "Ganti peran", "Changer de rôle")}</Link>
                    )}
                    <span>{step + 1} / 3</span>
                    {step < 2 ? (
                      <button
                        className="circle-gold-btn"
                        type="button"
                        onClick={() => {
                          if (validate(step)) setStep(step + 1);
                        }}
                      >
                        {t("Continue", "Lanjutkan", "Continuer")} →
                      </button>
                    ) : (
                      <button className="circle-gold-btn" disabled={saving} type="submit">
                        {saving
                          ? t("Saving…", "Menyimpan…", "Enregistrement…")
                          : existing
                            ? t("Save membership", "Simpan membership", "Enregistrer l’adhésion")
                            : t("Activate my membership", "Aktifkan membership saya", "Activer mon adhésion")}{" "}
                        ↗
                      </button>
                    )}
                  </div>
                  {existing && (
                    <div className="membership-manage">
                      <span>{existing.membershipId}</span>
                      <button type="button" disabled={saving} onClick={remove}>
                        {t("Delete membership & profile", "Hapus membership & profil", "Supprimer l’adhésion et le profil")}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </section>
            <aside className="member-side">
              <div className="mini-membership-card">
                <span>
                  <Wordmark /> <b>CIRCLE</b>
                </span>
                <div className="card-emblem">
                  <Wordmark symbol />
                </div>
                <h3>{form.name || t("Your name belongs here.", "Nama Anda di sini.", "Votre nom a sa place ici.")}</h3>
                <p>{role.toUpperCase()} MEMBER</p>
                <small>{existing?.membershipId || t("ID issued after successful registration", "ID terbit setelah pendaftaran berhasil", "Identifiant émis après inscription réussie")}</small>
              </div>
              <div className="member-side-note">
                <h3>{t("A real introduction.", "Perkenalan yang nyata.", "Une véritable présentation.")}</h3>
                <p>
                  {t(
                    "Your profile is saved to the site, with a digital membership ID and a public listing. Membership does not certify identity or business capability.",
                    "Profil disimpan di situs, dengan ID membership digital dan listing publik. Membership bukan sertifikasi identitas atau kapabilitas bisnis.",
                    "Votre profil est enregistré sur le site, avec un identifiant et une annonce publique. L’adhésion ne certifie ni l’identité ni les capacités commerciales.",
                  )}
                </p>
              </div>
            </aside>
          </div>
        )}
        <Footer />
      </main>
    </>
  );
}
