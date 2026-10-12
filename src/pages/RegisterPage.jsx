import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categories, findCountry, wdi } from "../../shared/reference.mjs";
import { Footer, Header, Wordmark } from "../components/Chrome.jsx";
import CircleDirectory from "../components/CircleDirectory.jsx";
import { INTEREST_INTENTS, MemberMapping, intentLabel } from "../components/MemberMapping.jsx";
import { useLanguage } from "../i18n.jsx";
import { useResearch } from "../research.jsx";

const empty = {
  entityType: "entity",
  name: "",
  organization: "",
  country: "",
  interestStatement: "",
  interestIntents: [],
  description: "",
  quantity: "",
  website: "",
  phone: "",
  email: "",
  buyerPurpose: "",
  buyerBudget: "",
  buyerCriteria: "",
  supplierBusinessType: "",
  supplierMOQ: "",
  supplierExperience: "",
  certifications: "",
  leadTime: "",
  publicContact: false,
  publishConsent: false,
  membershipConsent: false,
  category: "Food & agriculture",
  listingType: "product",
  originCountry: "",
  targetCountry: "",
};

function Field({ id, label, hint, className = "", children }) {
  return (
    <label className={className} htmlFor={id}>
      {label}
      <small>{hint}</small>
      {children}
    </label>
  );
}

function memberToForm(member) {
  const interest = member.interest || {};
  const segment = member.segment || {};
  const capabilities = member.capabilities || {};
  return {
    ...empty,
    entityType: member.entityType === "individual" ? "individual" : "entity",
    name: member.name || "",
    organization: member.organization || "",
    country: member.country || "",
    email: member.email || "",
    phone: member.phone || "",
    website: member.website || "",
    interestStatement: interest.statement || member.title || "",
    interestIntents: Array.isArray(interest.intents) ? interest.intents : [],
    description: capabilities.offer || member.description || "",
    quantity: capabilities.capacity || member.quantity || "",
    certifications: capabilities.certifications || "",
    leadTime: capabilities.leadTime || "",
    category: segment.category || member.category || empty.category,
    listingType: segment.listingType || member.listingType || "product",
    originCountry: segment.originCountry || member.originCountry || "",
    targetCountry: segment.targetCountry || member.targetCountry || "",
    buyerPurpose: member.buyerPurpose || "",
    buyerBudget: member.buyerBudget || "",
    buyerCriteria: member.buyerCriteria || "",
    supplierBusinessType: member.supplierBusinessType || "",
    supplierMOQ: member.supplierMOQ || "",
    supplierExperience: member.supplierExperience || "",
    publicContact: Boolean(member.publicContact),
    publishConsent: Boolean(member.publishConsent),
    membershipConsent: Boolean(member.membershipConsent),
  };
}

function withContext(base, context) {
  const category = categories.includes(context.category) ? context.category : base.category;
  const listingType =
    context.type ||
    (["Food & agriculture", "Apparel & textiles"].includes(context.category || category) ? "product" : "service");
  return {
    ...base,
    category: base.interestStatement ? base.category : category,
    listingType: base.interestStatement ? base.listingType : listingType,
    originCountry: base.originCountry || findCountry(context.origin || "")?.name || "",
    targetCountry: base.targetCountry || findCountry(context.target || context.country || "")?.name || "",
  };
}

function registrationError(t, status, body) {
  const known = {
    need_path: t(
      "Choose a local Google profile, or send the manual form. You do not need an account for the manual path.",
      "Pilih profil Google lokal, atau kirim form manual. Form manual tidak membutuhkan akun.",
      "Choisissez un profil Google local, ou envoyez le formulaire manuel. Le formulaire manuel ne demande pas de compte.",
    ),
    need_email: t("A contact email is required.", "Email kontak wajib diisi.", "Une adresse e-mail est obligatoire."),
    need_consent: t(
      "Publication and membership consent are required.",
      "Persetujuan publikasi dan membership wajib.",
      "Le consentement de publication et d’adhésion est obligatoire.",
    ),
    missing_fields: t(
      "Registration was not saved. Review identity, interest, segment, and capabilities.",
      "Pendaftaran belum tersimpan. Periksa identitas, minat, segmen, dan kapabilitas.",
      "L’inscription n’a pas été enregistrée. Vérifiez l’identité, l’intérêt, le segment et les capacités.",
    ),
    bad_role: t("Choose buyer or supplier.", "Pilih buyer atau supplier.", "Choisissez acheteur ou fournisseur."),
    email_taken: t(
      "This email already has a membership. Continue with Google if it is one of the local profiles, or use the signed-in session for that address.",
      "Email ini sudah punya membership. Lanjutkan dengan Google jika itu profil lokal, atau gunakan sesi alamat tersebut.",
      "Cet e-mail a déjà une adhésion. Continuez avec Google s’il s’agit d’un profil local, ou utilisez la session de cette adresse.",
    ),
    bad_profile: t(
      "Choose a sample profile from the local Google sign-in.",
      "Pilih profil contoh pada masuk Google lokal.",
      "Choisissez un profil d’exemple dans la connexion Google locale.",
    ),
    need_session: t(
      "Sign in again before deleting this membership.",
      "Masuk kembali sebelum menghapus membership ini.",
      "Reconnectez-vous avant de supprimer cette adhésion.",
    ),
  };
  if (body?.code && known[body.code]) return known[body.code];
  if (status === 401) return known.need_session;
  return (
    body?.error ||
    t(
      "Registration was not saved. Review your fields and try again.",
      "Pendaftaran belum tersimpan. Periksa isian dan coba lagi.",
      "L’inscription n’a pas été enregistrée. Vérifiez les champs et réessayez.",
    )
  );
}

export default function RegisterPage() {
  const { t, sector } = useLanguage();
  const [context] = useResearch();
  const [params] = useSearchParams();
  const paramRole = params.get("role");
  const contextRole = context.role === "buyer" || context.role === "supplier" ? context.role : "";
  const [role, setRoleState] = useState(paramRole === "buyer" || paramRole === "supplier" ? paramRole : contextRole);
  const [session, setSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);
  const formRef = useRef(null);
  const contextRef = useRef(context);
  const [form, setForm] = useState(empty);
  const buyer = role === "buyer";
  contextRef.current = context;

  useEffect(() => {
    let cancel = false;
    fetch("/api/session")
      .then((response) => response.json())
      .then((body) => {
        if (cancel) return;
        if (!body.email) {
          setSession({ email: "" });
          setForm((current) => (current.name || current.email ? current : withContext(current, contextRef.current)));
          return;
        }
        setSession(body);
        if (body.member) {
          setRoleState(body.member.role === "supplier" ? "supplier" : "buyer");
          setForm(memberToForm(body.member));
          return;
        }
        if (body.provider === "google-local" || body.identity) {
          const identity = body.identity || {};
          setForm((current) =>
            withContext(
              {
                ...current,
                email: body.email,
                name: current.name || identity.name || "",
                country: current.country || identity.country || "",
                entityType: identity.entityType || current.entityType,
                organization: current.organization || identity.organization || "",
              },
              contextRef.current,
            ),
          );
          return;
        }
        setForm((current) => withContext({ ...current, email: current.email || body.email }, contextRef.current));
      })
      .catch(() => {
        if (!cancel) setSession({ email: "" });
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (role !== "buyer" && role !== "supplier") return;
    setForm((current) => {
      const intents = new Set(current.interestIntents);
      if (role === "buyer") intents.add("buy");
      if (role === "supplier") intents.add("supply");
      const next = [...intents];
      if (next.length === current.interestIntents.length && next.every((item) => current.interestIntents.includes(item))) return current;
      return { ...current, interestIntents: next };
    });
  }, [role]);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setRole(next) {
    setRoleState(next);
    setError("");
  }

  function toggleIntent(id) {
    const locked = (role === "buyer" && id === "buy") || (role === "supplier" && id === "supply");
    if (locked) return;
    setForm((current) => {
      const intents = new Set(current.interestIntents);
      if (intents.has(id)) intents.delete(id);
      else intents.add(id);
      return { ...current, interestIntents: [...intents] };
    });
  }

  function validate() {
    if (role !== "buyer" && role !== "supplier") {
      setError(t("Choose buyer or supplier.", "Pilih buyer atau supplier.", "Choisissez acheteur ou fournisseur."));
      return false;
    }
    const fields = formRef.current?.querySelectorAll("input, select, textarea");
    for (const field of fields || []) {
      if (field.disabled || field.type === "hidden") continue;
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }
    return true;
  }

  async function signOut() {
    await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ action: "signout" }),
    });
    setSession({ email: "" });
    setSaved(null);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    data.set("authPath", "manual");
    data.set("role", role);
    data.set("interestIntents", form.interestIntents.join(","));
    data.set("organization", form.entityType === "entity" ? form.organization : "");
    data.set("email", form.email);
    data.set("interestStatement", form.interestStatement);
    if (form.publicContact) data.set("publicContact", "on");
    if (form.publishConsent) data.set("publishConsent", "on");
    if (form.membershipConsent) data.set("membershipConsent", "on");
    try {
      const response = await fetch("/api/registration", { method: "POST", headers: { accept: "application/json" }, body: data });
      const body = await response.json();
      if (!response.ok) throw new Error(registrationError(t, response.status, body));
      const next = await fetch("/api/session").then((item) => item.json());
      setSession(next);
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
    const response = await fetch("/api/registration", { method: "POST", headers: { accept: "application/json" }, body: data });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(registrationError(t, response.status, body));
      setSaving(false);
      return;
    }
    window.location.assign("/daftar");
  }

  const required = t("Required", "Wajib diisi", "Obligatoire");
  const optional = t("Optional", "Opsional", "Facultatif");
  const priv = t("Private unless you opt in", "Privat kecuali Anda memilih publik", "Privé sauf si vous le publiez");
  const published = t("Published on your profile", "Dipublikasikan di profil", "Publié sur votre profil");
  const existing = session?.member;
  const displayName = (form.entityType === "entity" && form.organization) || form.name;
  const preview = {
    interest: { role, intents: form.interestIntents, statement: form.interestStatement },
    segment: {
      category: form.category,
      listingType: form.listingType,
      originCountry: form.originCountry,
      targetCountry: form.targetCountry,
    },
    capabilities: {
      offer: form.description,
      capacity: form.quantity,
      certifications: form.certifications,
      leadTime: form.leadTime,
    },
  };
  return (
    <>
      <Header active="daftar" />
      {session?.email && (
        <div className="account-strip">
          <span>
            {session.provider === "google-local"
              ? t("Local Google sign-in", "Masuk Google lokal", "Connexion Google locale")
              : t("Manual registration", "Pendaftaran manual", "Inscription manuelle")}
            {" · "}
            {session.identity?.name ? `${session.identity.name} · ` : ""}
            {session.email}
          </span>
          <div>
            {existing && (
              <Link to={`/anggota/${existing.publicKey}`}>{t("Public profile", "Profil publik", "Profil public")} ↗</Link>
            )}
            <button className="btn" type="button" onClick={signOut}>
              {t("Sign out", "Keluar", "Déconnexion")}
            </button>
          </div>
        </div>
      )}
      <main>
        <section className="circle-landing">
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
              <button className="circle-gold-btn" type="button" onClick={() => document.getElementById("join-circle")?.scrollIntoView({ behavior: "smooth" })}>
                AFRIXASIA MEMBER ↗
              </button>
              <p className="circle-hero-foot">
                <span>
                {t(
                  "One form • Buyer or supplier",
                  "Satu form • Buyer atau supplier",
                  "Un formulaire • Acheteur ou fournisseur",
                )}
                </span>
                <span>
                  {t(
                    "Email and phone stay private unless you opt in",
                    "Email dan telepon tetap privat kecuali Anda memilih sebaliknya",
                    "E-mail et téléphone privés sauf accord",
                  )}
                </span>
              </p>
            </div>
            <div className="circle-art" aria-hidden="true">
              <span className="orbit orbit-one" />
              <span className="orbit orbit-two" />
              <span className="orbit orbit-three" />
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
            </div>
          </section>
          <section className="circle-benefits">
            {[
              [t("Your member identity", "Identitas anggota", "Votre identité membre"), t("Receive a digital membership ID after your profile is saved successfully.", "Dapatkan ID membership digital setelah profil berhasil disimpan.", "Recevez un identifiant numérique après l’enregistrement réussi de votre profil.")],
              [t("A purposeful introduction", "Perkenalan yang bermakna", "Une présentation utile"), t("Publish your need or capability with sector and country context.", "Publikasikan kebutuhan atau kemampuan dengan konteks sektor dan negara.", "Publiez votre besoin ou votre offre avec son secteur et ses pays.")],
              [t("Your visibility, your choice", "Visibilitas sesuai pilihan", "Votre visibilité, votre choix"), t("Keep contact details private or choose to publish them. Edit or delete your profile anytime.", "Simpan kontak privat atau pilih untuk dipublikasikan. Ubah atau hapus profil kapan saja.", "Gardez vos coordonnées privées ou publiez-les. Modifiez ou supprimez votre profil à tout moment.")],
            ].map(([title, copy], index) => (
              <div key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </section>
        </section>
        <div className="member-application membership-path" id="join-circle">
        <Link to="/marketplace">← AfriXAsia Circle</Link>
        <div className="application-heading">
          <span className="eyebrow">AFRIXASIA CIRCLE · MEMBERSHIP</span>
          <h1>{t("Join the Circle.", "Daftar membership Circle.", "Rejoindre le Circle.")}</h1>
          <p>
            {t(
              "One form. Choose buyer or supplier, then add your identity, interest, segment, and capabilities.",
              "Satu form. Pilih buyer atau supplier, lalu isi identitas, minat, segmen, dan kapabilitas.",
              "Un seul formulaire. Choisissez acheteur ou fournisseur, puis votre identité, votre intérêt, votre segment et vos capacités.",
            )}
          </p>
        </div>
        {saved ? (
          <div className="membership-welcome" role="status">
            <span className="eyebrow">{t("YOUR MEMBERSHIP IS ACTIVE", "MEMBERSHIP ANDA AKTIF", "VOTRE ADHÉSION EST ACTIVE")}</span>
            <h2>
              {t("Welcome to the Circle", "Selamat datang di Circle", "Bienvenue dans le Circle")}, {displayName}.
            </h2>
            <p>
              {t(
                "Your profile was saved. Interest, segment, and capabilities are now in the public directory. Email and phone stay private unless you opted in.",
                "Profil berhasil disimpan. Minat, segmen, dan kapabilitas kini ada di direktori publik. Email dan telepon tetap privat kecuali Anda memilih untuk mempublikasikannya.",
                "Votre profil est enregistré. Intérêt, segment et capacités figurent dans l’annuaire public. E-mail et téléphone restent privés sauf accord.",
              )}
            </p>
            <div className="mini-membership-card">
              <Wordmark />
              <h3>{displayName}</h3>
              <p>
                {role.toUpperCase()} · {form.country}
              </p>
              <b>{saved.membershipId}</b>
            </div>
            <div className="form-actions">
              <Link className="circle-gold-btn" to={saved.profilePath}>
                {t("View my profile", "Lihat profil saya", "Voir mon profil")} ↗
              </Link>
              <button className="btn" type="button" onClick={() => setSaved(null)}>
                {t("Manage membership", "Kelola membership", "Gérer mon adhésion")}
              </button>
              <Link className="btn" to="/marketplace">
                {t("Member directory", "Direktori anggota", "Annuaire des membres")}
              </Link>
            </div>
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
              <form ref={formRef} className="membership-form" onSubmit={onSubmit} noValidate>
                <input type="hidden" name="authPath" value="manual" />
                <input type="hidden" name="role" value={role} />
                <input type="hidden" name="interestIntents" value={form.interestIntents.join(",")} />
                <datalist id="reference-countries">
                  {wdi.countries.map((country) => (
                    <option key={country.iso3} value={country.name} />
                  ))}
                </datalist>
                {error && (
                  <div className="form-error" role="alert">
                    {error}
                  </div>
                )}
                <fieldset className="member-step" disabled={saving}>
                  <legend>{t("Buyer or supplier", "Buyer atau supplier", "Acheteur ou fournisseur")}</legend>
                  <div className="role-picks">
                    {[
                      ["buyer", t("Buyer", "Buyer", "Acheteur"), t("You want to buy, source, or commission.", "Anda ingin membeli, mencari pasokan, atau menugaskan.", "Vous voulez acheter, sourcer ou commander.")],
                      ["supplier", t("Supplier", "Supplier", "Fournisseur"), t("You can supply a product or service.", "Anda dapat memasok produk atau jasa.", "Vous pouvez fournir un produit ou un service.")],
                    ].map(([value, label, copy]) => (
                      <button key={value} className={`join-path ${role === value ? "selected" : ""}`} type="button" onClick={() => setRole(value)}>
                        <b>{label}</b>
                        <small>{copy}</small>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="member-step" disabled={saving}>
                  <legend>
                    {t(
                      "Identity, interest, segment, and capabilities.",
                      "Identitas, minat, segmen, dan kapabilitas.",
                      "Identité, intérêt, segment et capacités.",
                    )}
                  </legend>
                  <div className="form-grid">
                    <div className="form-full map-kicker">
                      <span>01 · {t("IDENTITY", "IDENTITAS", "IDENTITÉ")}</span>
                      <h3>{t("Who is joining", "Siapa yang mendaftar", "Qui adhère")}</h3>
                      <p>
                        {t(
                          "Full name, whether you are an organization or an individual, and your domicile.",
                          "Nama lengkap, organisasi atau individu, dan domisili.",
                          "Nom complet, organisation ou particulier, et domicile.",
                        )}
                      </p>
                    </div>
                    <Field id="member-name" label={t("Full name", "Nama lengkap", "Nom complet")} hint={required}>
                      <input id="member-name" name="name" required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={(event) => set("name", event.target.value)} />
                    </Field>
                    <Field id="member-entityType" label={t("Organization or individual", "Organisasi atau individu", "Organisation ou particulier")} hint={required}>
                      <select id="member-entityType" name="entityType" required value={form.entityType} onChange={(event) => set("entityType", event.target.value)}>
                        <option value="entity">{t("Organization", "Organisasi", "Organisation")}</option>
                        <option value="individual">{t("Individual", "Individu", "Particulier")}</option>
                      </select>
                    </Field>
                    {form.entityType === "entity" && (
                      <Field id="member-organization" label={t("Organization name", "Nama organisasi", "Nom de l’organisation")} hint={optional}>
                        <input id="member-organization" name="organization" maxLength={160} value={form.organization} onChange={(event) => set("organization", event.target.value)} />
                      </Field>
                    )}
                    <Field id="member-country" label={t("Domicile / country", "Domisili / negara", "Domicile / pays")} hint={required}>
                      <input id="member-country" name="country" list="reference-countries" required minLength={2} maxLength={80} autoComplete="country-name" value={form.country} onChange={(event) => set("country", event.target.value)} />
                    </Field>
                    <Field id="member-website" label={t("Website", "Website", "Site web")} hint={optional}>
                      <input id="member-website" name="website" type="url" maxLength={300} placeholder="https://…" pattern="https://.*" value={form.website} onChange={(event) => set("website", event.target.value)} />
                    </Field>
                    <div className="form-full map-kicker">
                      <span>02 · {t("CONTACT", "KONTAK", "CONTACT")}</span>
                      <h3>{t("How partners may reach you", "Cara mitra menghubungi Anda", "Comment les partenaires peuvent vous joindre")}</h3>
                    </div>
                    <Field id="member-email" label={t("Contact email", "Email kontak", "E-mail de contact")} hint={`${priv} · ${required}`}>
                      <input id="member-email" name="email" type="email" required maxLength={200} autoComplete="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
                    </Field>
                    <Field id="member-phone" label={t("Phone / WhatsApp", "Telepon / WhatsApp", "Téléphone / WhatsApp")} hint={`${optional} · ${priv}`}>
                      <input id="member-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
                    </Field>
                    <div className="form-full map-kicker">
                      <span>03 · {t("INTEREST", "MINAT", "INTÉRÊT")}</span>
                      <h3>{t("What you want", "Apa yang Anda inginkan", "Ce que vous voulez")}</h3>
                      <p>
                        {t(
                          "Buyer or supplier, plus research or partnership if they fit. Then a short interest statement.",
                          "Buyer atau supplier, plus riset atau kemitraan bila sesuai. Lalu pernyataan minat yang singkat.",
                          "Acheteur ou fournisseur, plus recherche ou partenariat si cela correspond. Puis un court énoncé.",
                        )}
                      </p>
                    </div>
                    <div className="form-full">
                      <div className="intent-picks">
                        {INTEREST_INTENTS.map((id) => {
                          const locked = (role === "buyer" && id === "buy") || (role === "supplier" && id === "supply");
                          return (
                            <label key={id}>
                              <input type="checkbox" checked={form.interestIntents.includes(id)} disabled={locked} onChange={() => toggleIntent(id)} />
                              {intentLabel(t, id)}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <Field className="form-full" id="member-interest" label={t("Interest statement", "Pernyataan minat", "Énoncé d’intérêt")} hint={`${published} · ${required}`}>
                      <input
                        id="member-interest"
                        name="interestStatement"
                        required
                        minLength={5}
                        maxLength={280}
                        placeholder={t(
                          "Example: sourcing cocoa ingredients for a Jakarta buyer",
                          "Contoh: mencari bahan kakao untuk buyer di Jakarta",
                          "Exemple : sourcer du cacao pour un acheteur à Jakarta",
                        )}
                        value={form.interestStatement}
                        onChange={(event) => set("interestStatement", event.target.value)}
                      />
                    </Field>
                    {buyer && (
                      <Field id="member-purpose" label={t("Purpose of purchase", "Tujuan pembelian", "Objectif de l’achat")} hint={t("Private, stays on your account", "Privat, tetap di akun Anda", "Privé, reste sur votre compte")}>
                        <select id="member-purpose" name="buyerPurpose" value={form.buyerPurpose} onChange={(event) => set("buyerPurpose", event.target.value)}>
                          <option value="">{t("Select…", "Pilih…", "Sélectionner…")}</option>
                          <option value="business">{t("Business operations", "Operasional bisnis", "Activité professionnelle")}</option>
                          <option value="resale">{t("Distribution / resale", "Distribusi / penjualan kembali", "Distribution / revente")}</option>
                          <option value="project">{t("Client project", "Proyek klien", "Projet client")}</option>
                          <option value="personal">{t("Personal / professional use", "Kebutuhan pribadi / profesional", "Usage personnel / professionnel")}</option>
                        </select>
                      </Field>
                    )}
                    <div className="form-full map-kicker">
                      <span>04 · {t("SEGMENT", "SEGMEN", "SEGMENT")}</span>
                      <h3>{t("Where this sits in the market", "Posisi di pasar", "Place sur le marché")}</h3>
                      <p>{t("Sector, origin country, and target market.", "Sektor, negara asal, dan pasar tujuan.", "Secteur, pays d’origine et marché cible.")}</p>
                    </div>
                    <Field id="member-listingType" label={t("Product or service", "Produk atau jasa", "Produit ou service")} hint={required}>
                      <select id="member-listingType" name="listingType" required value={form.listingType} onChange={(event) => set("listingType", event.target.value)}>
                        <option value="product">{t("Product", "Produk", "Produit")}</option>
                        <option value="service">{t("Service", "Jasa", "Service")}</option>
                      </select>
                    </Field>
                    <Field id="member-category" label={t("Sector / category", "Sektor / kategori", "Secteur / catégorie")} hint={`${published} · ${required}`}>
                      <select id="member-category" name="category" required value={form.category} onChange={(event) => set("category", event.target.value)}>
                        {[...categories, "Other non-oil & gas"].map((category) => (
                          <option key={category} value={category}>
                            {category === "Other non-oil & gas" ? category : sector(category)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id="member-origin" label={t("Origin country", "Negara asal", "Pays d’origine")} hint={buyer ? optional : required}>
                      <input id="member-origin" name="originCountry" list="reference-countries" required={!buyer} maxLength={100} value={form.originCountry} onChange={(event) => set("originCountry", event.target.value)} />
                    </Field>
                    <Field id="member-target" label={t("Target market", "Pasar tujuan", "Marché cible")} hint={buyer ? required : optional}>
                      <input id="member-target" name="targetCountry" list="reference-countries" required={buyer} maxLength={100} value={form.targetCountry} onChange={(event) => set("targetCountry", event.target.value)} />
                    </Field>
                    <div className="form-full map-kicker">
                      <span>05 · {t("CAPABILITIES", "KAPABILITAS", "CAPACITÉS")}</span>
                      <h3>{t("What you can offer", "Apa yang dapat Anda tawarkan", "Ce que vous pouvez offrir")}</h3>
                      <p>
                        {t(
                          "Products or services, capacity or volume, certifications, and lead time.",
                          "Produk atau jasa, kapasitas atau volume, sertifikasi, dan lead time.",
                          "Produits ou services, capacité ou volume, certifications et délai.",
                        )}
                      </p>
                    </div>
                    <Field className="form-full" id="member-description" label={t("Products / services", "Produk / jasa", "Produits / services")} hint={`${published} · ${required}`}>
                      <textarea id="member-description" name="description" required minLength={20} maxLength={2000} rows={4} value={form.description} onChange={(event) => set("description", event.target.value)} />
                    </Field>
                    <Field id="member-quantity" label={t("Capacity or volume", "Kapasitas atau volume", "Capacité ou volume")} hint={`${published} · ${required}`}>
                      <input id="member-quantity" name="quantity" required maxLength={160} value={form.quantity} onChange={(event) => set("quantity", event.target.value)} />
                    </Field>
                    <Field id="member-certs" label={t("Certifications", "Sertifikasi", "Certifications")} hint={`${published} · ${optional}`}>
                      <input id="member-certs" name="certifications" maxLength={500} value={form.certifications} onChange={(event) => set("certifications", event.target.value)} />
                    </Field>
                    <Field id="member-lead" label={t("Lead time", "Lead time", "Délai")} hint={`${published} · ${required}`}>
                      <input
                        id="member-lead"
                        name="leadTime"
                        required
                        maxLength={160}
                        placeholder={t("Example: 30 days after order", "Contoh: 30 hari setelah pesanan", "Exemple : 30 jours après commande")}
                        value={form.leadTime}
                        onChange={(event) => set("leadTime", event.target.value)}
                      />
                    </Field>
                    {buyer ? (
                      <>
                        <Field id="member-budget" label={t("Budget range & currency", "Kisaran anggaran & mata uang", "Budget et devise")} hint={t("Private, stays on your account", "Privat, tetap di akun Anda", "Privé, reste sur votre compte")}>
                          <input id="member-budget" name="buyerBudget" maxLength={150} placeholder={t("e.g. USD 20,000 or not yet determined", "Misal USD 20.000 atau belum ditentukan", "Ex. 20 000 USD ou non défini")} value={form.buyerBudget} onChange={(event) => set("buyerBudget", event.target.value)} />
                        </Field>
                        <Field className="form-full" id="member-criteria" label={t("Supplier selection criteria", "Kriteria pemilihan pemasok", "Critères de sélection")} hint={t("Private, stays on your account", "Privat, tetap di akun Anda", "Privé, reste sur votre compte")}>
                          <textarea id="member-criteria" name="buyerCriteria" maxLength={1000} rows={3} value={form.buyerCriteria} onChange={(event) => set("buyerCriteria", event.target.value)} />
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field id="member-model" label={t("Business model", "Model bisnis", "Modèle d’activité")} hint={t("Private, stays on your account", "Privat, tetap di akun Anda", "Privé, reste sur votre compte")}>
                          <select id="member-model" name="supplierBusinessType" value={form.supplierBusinessType} onChange={(event) => set("supplierBusinessType", event.target.value)}>
                            <option value="">{t("Select…", "Pilih…", "Sélectionner…")}</option>
                            <option value="manufacturer">{t("Manufacturer / product owner", "Produsen / pemilik produk", "Fabricant / propriétaire du produit")}</option>
                            <option value="distributor">{t("Distributor / exporter / trader", "Distributor / eksportir / trader", "Distributeur / exportateur / négociant")}</option>
                            <option value="service">{t("Service company / institution", "Perusahaan jasa / institusi", "Entreprise de services / institution")}</option>
                            <option value="professional">{t("Professional / freelancer", "Profesional / freelancer", "Professionnel / indépendant")}</option>
                          </select>
                        </Field>
                        <Field id="member-moq" label={t("Minimum order", "Minimum order", "Commande minimum")} hint={t("Private, stays on your account", "Privat, tetap di akun Anda", "Privé, reste sur votre compte")}>
                          <input id="member-moq" name="supplierMOQ" maxLength={150} value={form.supplierMOQ} onChange={(event) => set("supplierMOQ", event.target.value)} />
                        </Field>
                        <Field id="member-experience" label={t("Market experience", "Pengalaman pasar", "Expérience commerciale")} hint={t("Private, stays on your account", "Privat, tetap di akun Anda", "Privé, reste sur votre compte")}>
                          <select id="member-experience" name="supplierExperience" value={form.supplierExperience} onChange={(event) => set("supplierExperience", event.target.value)}>
                            <option value="">{t("Select…", "Pilih…", "Sélectionner…")}</option>
                            <option value="new">{t("New business", "Usaha baru", "Nouvelle activité")}</option>
                            <option value="domestic">{t("Domestic market experience", "Pengalaman pasar domestik", "Expérience nationale")}</option>
                            <option value="international">{t("International market experience", "Pengalaman pasar internasional", "Expérience internationale")}</option>
                          </select>
                        </Field>
                      </>
                    )}
                  </div>
                  <p className="member-privacy">
                    {t(
                      "Email and phone stay private unless you opt in. Budget, selection criteria, business model, minimum order, and market experience stay on your account. Certifications and lead time are part of the public capabilities.",
                      "Email dan telepon tetap privat kecuali Anda memilih publik. Anggaran, kriteria, model bisnis, minimum order, dan pengalaman pasar tetap di akun. Sertifikasi dan lead time menjadi bagian kapabilitas publik.",
                      "E-mail et téléphone restent privés sauf accord. Budget, critères, modèle, minimum et expérience restent sur le compte. Certifications et délai font partie des capacités publiques.",
                    )}
                  </p>
                </fieldset>
                <fieldset className="member-step" disabled={saving}>
                  <legend>{t("Consent", "Persetujuan", "Consentement")}</legend>
                  <MemberMapping member={preview} />
                  <label className="check-row">
                    <input type="checkbox" checked={form.publicContact} onChange={(event) => set("publicContact", event.target.checked)} />
                    <span>
                      {t(
                        "Publish my email and phone so potential partners can contact me.",
                        "Publikasikan email dan telepon agar calon mitra dapat menghubungi saya.",
                        "Publier mon e-mail et mon téléphone pour permettre aux partenaires de me contacter.",
                      )}
                    </span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" required checked={form.publishConsent} onChange={(event) => set("publishConsent", event.target.checked)} />
                    <span>
                      {t(
                        "I consent to publishing my name, country, organization, interest, segment, and capabilities in the directory and public data exports.",
                        "Saya menyetujui publikasi nama, negara, organisasi, minat, segmen, dan kapabilitas di direktori serta ekspor data publik.",
                        "Je consens à publier mon nom, mon pays, mon organisation, mon intérêt, mon segment et mes capacités dans l’annuaire et les exports publics.",
                      )}
                    </span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" required checked={form.membershipConsent} onChange={(event) => set("membershipConsent", event.target.checked)} />
                    <span>
                      {t(
                        "I am authorized to represent this profile and the information is accurate. I will not offer oil & gas or illegal goods or services. Membership does not verify identity or business capability.",
                        "Saya berwenang mewakili profil ini dan informasinya benar. Saya tidak menawarkan oil & gas atau barang/jasa ilegal. Membership bukan verifikasi identitas atau kapabilitas bisnis.",
                        "Je suis autorisé à représenter ce profil et les informations sont exactes. Je ne propose ni pétrole et gaz ni biens ou services illégaux. L’adhésion ne vérifie pas l’identité ou les capacités.",
                      )}
                    </span>
                  </label>
                  <p>
                    <a href="/privasi" target="_blank" rel="noreferrer">
                      {t("Privacy & membership terms", "Privasi & ketentuan membership", "Confidentialité & conditions d’adhésion")} ↗
                    </a>
                  </p>
                </fieldset>
                <div className="member-form-nav">
                  <button className="circle-gold-btn" disabled={saving} type="submit">
                    {saving
                      ? t("Saving…", "Menyimpan…", "Enregistrement…")
                      : existing
                        ? t("Save membership", "Simpan membership", "Enregistrer l’adhésion")
                        : "AFRIXASIA MEMBER"}{" "}
                    ↗
                  </button>
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
            </section>
            <aside className="member-side">
              <div className="mini-membership-card">
                <span>
                  <Wordmark /> <b>CIRCLE</b>
                </span>
                <div className="card-emblem">
                  <Wordmark symbol />
                </div>
                <h3>{displayName || t("Your name belongs here.", "Nama Anda di sini.", "Votre nom a sa place ici.")}</h3>
                <p>{role ? `${role.toUpperCase()} MEMBER` : t("MEMBER", "ANGGOTA", "MEMBRE")}</p>
                <small>{existing?.membershipId || t("ID issued after successful registration", "ID terbit setelah pendaftaran berhasil", "Identifiant émis après inscription réussie")}</small>
              </div>
              <div className="member-side-note">
                <h3>{t("A real introduction.", "Perkenalan yang nyata.", "Une véritable présentation.")}</h3>
                <p>
                  {t(
                    "One form saves your membership. It does not certify identity or business capability.",
                    "Satu form menyimpan membership Anda. Ini bukan sertifikasi identitas atau kapabilitas bisnis.",
                    "Un seul formulaire enregistre votre adhésion. Il ne certifie ni l’identité ni les capacités.",
                  )}
                </p>
              </div>
            </aside>
          </div>
        )}
        </div>
        <CircleDirectory />
        <Footer />
      </main>
    </>
  );
}
