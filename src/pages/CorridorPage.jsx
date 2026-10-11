import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categories, findCountry, inferType, market, sectorCopy, wdi } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import { indicatorTitle } from "../components/ResearchDesk.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, normalizeContext, patchContext, registerSearch, useResearch } from "../research.jsx";

function CorridorForm({ compact = false }) {
  const { t, sector } = useLanguage();
  const [context, setContext] = useResearch();
  const origin = findCountry(context.origin)?.iso3 || "";
  const target = findCountry(context.target)?.iso3 || "";
  const setField = (field, value) => {
    let next = patchContext(context, field, value);
    if (field === "target") next = patchContext(next, "country", findCountry(value)?.name || "");
    setContext(next);
  };
  return (
    <section id="pilih-koridor" className={compact ? "corridor-start compact" : "corridor-start"}>
      <div>
        <span className="eyebrow">AFRIXASIA CIRCLE · YOUR NEXT MARKET</span>
        <h1>
          {compact
            ? t("Change your corridor.", "Ubah koridor Anda.", "Modifiez votre corridor.")
            : t("Choose a market. Take a role.", "Pilih pasar. Ambil peran.", "Choisissez un marché. Prenez un rôle.")}
        </h1>
        <p>
          {t(
            "Find a basis for your decision, then introduce what you need or offer to the Asia–Africa community.",
            "Temukan dasar untuk keputusan Anda, lalu perkenalkan kebutuhan atau penawaran kepada komunitas Asia–Afrika.",
            "Trouvez une base pour décider, puis présentez votre besoin ou votre offre à la communauté Asie–Afrique.",
          )}
        </p>
        <ol className="journey-steps">
          <li>
            <b>01</b> {t("Choose a corridor", "Pilih koridor", "Choisir un corridor")}
          </li>
          <li>
            <b>02</b> {t("Review evidence & network", "Tinjau bukti & jaringan", "Examiner les preuves & le réseau")}
          </li>
          <li>
            <b>03</b> {t("Submit a member profile", "Ajukan profil anggota", "Déposer un profil membre")}
          </li>
        </ol>
      </div>
      <form className="corridor-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          {t("Origin of the product / service", "Negara asal produk / layanan", "Pays d’origine du produit / service")}
          <select value={origin} onChange={(event) => setField("origin", event.target.value)}>
            <option value="">{t("Choose an origin country", "Pilih negara asal", "Choisir le pays d’origine")}</option>
            {wdi.countries.map((country) => (
              <option key={country.iso3} value={country.iso3}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Destination market", "Pasar tujuan", "Marché cible")}
          <select value={target} onChange={(event) => setField("target", event.target.value)}>
            <option value="">{t("Choose a destination market", "Pilih pasar tujuan", "Choisir le marché cible")}</option>
            {wdi.countries.map((country) => (
              <option key={country.iso3} value={country.iso3}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Product or service", "Produk atau layanan", "Produit ou service")}
          <select value={categories.includes(context.category) ? context.category : ""} onChange={(event) => setField("category", event.target.value)}>
            <option value="">{t("Choose a sector", "Pilih sektor", "Choisir un secteur")}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {sector(category)}
              </option>
            ))}
          </select>
        </label>
        <div className="corridor-role-buttons">
          <button type="button" className="circle-gold-btn" onClick={() => setContext(patchContext(context, "role", "buyer"))}>
            {t("I am looking · Buyer ↙", "Saya mencari · Buyer ↙", "Je recherche · Acheteur ↙")}
          </button>
          <button type="button" className="btn" onClick={() => setContext(patchContext(context, "role", "supplier"))}>
            {t("I am offering · Supplier ↗", "Saya menawarkan · Supplier ↗", "Je propose · Fournisseur ↗")}
          </button>
        </div>
        <p className="small muted">
          {t(
            "Origin and destination are the business corridor, not your place of residence. Identity is collected when you register.",
            "Asal dan tujuan adalah koridor bisnis, bukan domisili Anda. Informasi identitas diisi ketika mendaftar.",
            "L’origine et la destination forment le corridor d’affaires, pas votre domicile. L’identité est demandée à l’inscription.",
          )}
        </p>
      </form>
    </section>
  );
}

export default function CorridorPage() {
  const { t, sector, formatValue, language } = useLanguage();
  const [context, setContext] = useResearch();
  const [listings, setListings] = useState({ total: 0, matches: [] });
  const origin = findCountry(context.origin);
  const target = findCountry(context.target);
  const category = categories.includes(context.category) ? context.category : "";
  const role = context.role === "buyer" || context.role === "supplier" ? context.role : "";
  const ready = Boolean(origin && target && origin.iso3 !== target.iso3 && category && role);
  const copy = category ? sectorCopy[category] : null;
  const side = role === "buyer" ? "demand" : role === "supplier" ? "supply" : "";
  const type = category ? inferType(category) : "";

  useEffect(() => {
    if (!ready) return;
    if (context.country === target.name && context.side === side && context.type === type) return;
    setContext(
      normalizeContext({
        ...context,
        country: target.name,
        side,
        type,
      }),
    );
  }, [ready, target?.name, side, type]);

  useEffect(() => {
    if (!ready) return undefined;
    const controller = new AbortController();
    let ignore = false;
    (async () => {
      const rows = [];
      let cursor = "";
      let guard = 0;
      try {
        do {
          const response = await fetch(`/api/listings${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("listings");
          const body = await response.json();
          rows.push(...(body.listings || []));
          cursor = body.cursor || "";
          guard += 1;
        } while (cursor && guard < 40);
        if (ignore) return;
        const matches = rows.filter(
          (row) =>
            row.category === category &&
            row.role === role &&
            (!row.originCountry || row.originCountry === origin.name) &&
            (!row.targetCountry || row.targetCountry === target.name),
        );
        setListings({ total: rows.length, matches });
      } catch (error) {
        if (error.name !== "AbortError" && !ignore) setListings({ total: 0, matches: [] });
      }
    })();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [ready, category, role, origin?.name, target?.name]);

  const bilateral = ready
    ? market.records.filter(
        (row) =>
          row.category === category &&
          ((row.origin === origin.name && row.target === target.name) || (row.origin === target.name && row.target === origin.name)),
      )
    : [];
  const destination = ready ? market.records.filter((row) => row.country === target.name && row.category === category) : [];
  const originProviders = ready ? market.providers.filter((row) => row.country === origin.name && row.category === category) : [];
  const registerContext = ready
    ? {
        country: target.name,
        category,
        origin: origin.name,
        target: target.name,
        type: inferType(category),
      }
    : {};

  function clearCorridor() {
    const next = { ...context };
    for (const key of ["origin", "target", "category", "role", "side", "type"]) delete next[key];
    setContext(next);
  }

  return (
    <>
      <Header active="Beranda" />
      <main className={ready ? "corridor-review" : undefined}>
        {!ready && (
          <div className="detail-note" role="alert">
            {t(
              "Choose two different countries, a sector, and your role to review the corridor.",
              "Pilih dua negara berbeda, sektor, dan peran Anda untuk meninjau koridor.",
              "Choisissez deux pays différents, un secteur et votre rôle pour examiner le corridor.",
            )}
          </div>
        )}
        {ready ? (
          <>
            <a
              className="muted"
              href="#pilih-koridor"
              onClick={(event) => {
                event.preventDefault();
                clearCorridor();
              }}
            >
              ← {t("Choose another corridor", "Pilih koridor lain", "Choisir un autre corridor")}
            </a>
            <section className="corridor-review-hero">
              <span className="eyebrow">02 / REVIEW YOUR CORRIDOR</span>
              <h1>
                {origin.name} <span>→</span> {target.name}
              </h1>
              <p>
                {sector(category)} ·{" "}
                {role === "buyer"
                  ? t("I am looking for a product / service", "Saya mencari produk / layanan", "Je recherche un produit / service")
                  : t("I am offering a product / service", "Saya menawarkan produk / layanan", "Je propose un produit / service")}
              </p>
              <div className="corridor-state">
                {bilateral.length ? (
                  <>
                    <b>{t("Historical bilateral evidence is available", "Bukti bilateral historis tersedia", "Des preuves bilatérales historiques sont disponibles")}</b>
                    <span>{t("Period and product are listed below.", "Periode dan produk tercantum di bawah.", "La période et le produit sont indiqués ci-dessous.")}</span>
                  </>
                ) : (
                  <>
                    <b>{t("No bilateral evidence for this sector yet", "Bukti bilateral untuk sektor ini belum tersedia", "Pas encore de preuve bilatérale pour ce secteur")}</b>
                    <span>
                      {t(
                        "Country context supports the research; it is not yet evidence of demand on this corridor.",
                        "Konteks negara membantu riset; belum menjadi bukti permintaan pada koridor ini.",
                        "Le contexte national aide la recherche ; ce n’est pas encore une preuve de demande sur ce corridor.",
                      )}
                    </span>
                  </>
                )}
              </div>
            </section>
            <div className="corridor-review-grid">
              <article className="card">
                <span className="eyebrow">EVIDENCE · WHAT WE CAN SUPPORT</span>
                <h2>{t("The basis for your decision.", "Dasar keputusan Anda.", "La base de votre décision.")}</h2>
                {bilateral.length ? (
                  bilateral.map((row) => (
                    <div className="corridor-evidence" key={row.id}>
                      <b>{row.product}</b>
                      <p>
                        {row.period} · {row.source}
                      </p>
                      <Link to={`/data-pasar/${row.id}`}>{t("Inspect bilateral evidence", "Periksa bukti bilateral", "Examiner la preuve bilatérale")} →</Link>
                    </div>
                  ))
                ) : (
                  <p>
                    {t(
                      "No curated bilateral record matches both countries and this sector. A country’s total imports or exports do not prove trade between the two.",
                      "Belum ada catatan bilateral terkurasi yang sesuai kedua negara dan sektor. Nilai total impor atau ekspor negara tidak membuktikan perdagangan di antara keduanya.",
                      "Aucun enregistrement bilatéral sélectionné ne correspond aux deux pays et à ce secteur. Le total des importations ou exportations d’un pays ne prouve pas les échanges entre les deux.",
                    )}
                  </p>
                )}
                <div className="corridor-evidence">
                  <b>
                    {t("Destination market", "Pasar tujuan", "Marché cible")} · {target.name}
                  </b>
                  <p>
                    {destination.length}{" "}
                    {t(
                      "country references are available; their scope differs from the bilateral corridor.",
                      "referensi negara tersedia; lingkupnya berbeda dari koridor bilateral.",
                      "références nationales sont disponibles ; leur portée diffère du corridor bilatéral.",
                    )}
                  </p>
                  {destination.slice(0, 2).map((row) => (
                    <Link key={row.id} to={`/data-pasar/${row.id}`}>
                      {row.product} · {row.period} →
                    </Link>
                  ))}
                  {copy.indicators.map((code) => {
                    const definition = wdi.indicators.find((item) => item.code === code);
                    const row = wdi.latest.find((item) => item.country === target.iso3 && item.indicator === code);
                    if (!definition || !row) return null;
                    return (
                      <p key={code}>
                        {indicatorTitle(definition, language)}: {formatValue(row.value, definition.unit, true)} {definition.unit} ({row.year}) ·{" "}
                        {t("annual context", "konteks tahunan", "contexte annuel")}
                      </p>
                    );
                  })}
                </div>
                <Link to={contextSearch("/data-pasar", { country: target.name, category })}>
                  {t("See all destination-market evidence", "Lihat seluruh bukti pasar tujuan", "Voir toutes les preuves du marché cible")} →
                </Link>
              </article>
              <article className="card">
                <span className="eyebrow">NETWORK · WHO YOU CAN RESEARCH</span>
                <h2>{t("Relevant members and organizations.", "Anggota dan organisasi relevan.", "Membres et organisations pertinents.")}</h2>
                <h3>{t("Community members", "Anggota komunitas", "Membres de la communauté")}</h3>
                {listings.matches.length ? (
                  listings.matches.map((member) => (
                    <p key={member.publicKey}>
                      <Link to={member.profilePath}>{member.organization || member.name}</Link>
                      {" · "}
                      {member.role}
                    </p>
                  ))
                ) : (
                  <p>
                    {t(
                      `No matching members among ${listings.total} loaded listings.`,
                      `Belum ditemukan anggota yang sesuai dari ${listings.total} listing dimuat.`,
                      `Aucun membre correspondant parmi ${listings.total} profils chargés.`,
                    )}{" "}
                    {t(
                      "Register your mandate so potential partners can understand what you need or offer.",
                      "Daftarkan mandat Anda agar calon mitra memahami kebutuhan atau penawaran Anda.",
                      "Publiez votre mandat pour que des partenaires comprennent votre besoin ou votre offre.",
                    )}
                  </p>
                )}
                <Link to={contextSearch("/marketplace", { category, origin: origin.name, target: target.name })}>
                  {t("Open the member directory", "Buka direktori anggota", "Ouvrir l’annuaire des membres")} →
                </Link>
                <hr />
                <h3>{t("Organization references · origin country", "Referensi organisasi · negara asal", "Références d’organisations · pays d’origine")}</h3>
                {originProviders.length ? (
                  <>
                    {originProviders.map((row) => (
                      <div className="corridor-evidence" key={row.id}>
                        <Link to={`/penyedia/${row.id}`}>{row.name} →</Link>
                        <p>
                          {row.country} · {sector(row.category)}
                        </p>
                      </div>
                    ))}
                    <p className="small muted">
                      {t(
                        "Not declared as a member or an active supplier for your corridor.",
                        "Belum dinyatakan sebagai anggota atau pemasok aktif untuk koridor Anda.",
                        "Non déclaré comme membre ni comme fournisseur actif pour votre corridor.",
                      )}
                    </p>
                  </>
                ) : (
                  <p>
                    {t(
                      "No curated organization profile in the origin country for this sector. Network coverage still has to be built.",
                      "Belum ada profil organisasi terkurasi di negara asal untuk sektor ini. Cakupan jaringan masih perlu dibangun.",
                      "Aucun profil d’organisation sélectionné dans le pays d’origine pour ce secteur. La couverture du réseau reste à construire.",
                    )}
                  </p>
                )}
                <Link to={contextSearch("/penyedia", { country: origin.name, category })}>
                  {t("Browse organizations & comparisons", "Telusuri organisasi & pembanding", "Parcourir les organisations & comparaisons")} →
                </Link>
              </article>
            </div>
            <section className="corridor-mandate">
              <div>
                <span className="eyebrow">03 / TAKE YOUR PLACE IN THE CIRCLE</span>
                <h2>
                  {role === "buyer"
                    ? t("Apply as a Buyer Member.", "Ajukan diri sebagai Buyer Member.", "Postulez comme Buyer Member.")
                    : t("Apply as a Supplier Member.", "Ajukan diri sebagai Supplier Member.", "Postulez comme Supplier Member.")}
                </h2>
                <p>
                  {t(
                    "The corridor and sector are carried into the form. Complete your identity,",
                    "Koridor dan sektor akan dibawa ke formulir. Lengkapi identitas,",
                    "Le corridor et le secteur sont repris dans le formulaire. Complétez votre identité,",
                  )}{" "}
                  {role === "buyer"
                    ? t(
                        "specification, volume, budget and buying timeline",
                        "spesifikasi, volume, anggaran dan waktu pembelian",
                        "la spécification, le volume, le budget et le calendrier d’achat",
                      )
                    : t(
                        "capability, capacity, lead time and experience",
                        "kapabilitas, kapasitas, lead time dan pengalaman",
                        "la capacité, le volume, le délai et l’expérience",
                      )}
                  , {t("then review what will be published.", "lalu tinjau publikasi profil.", "puis vérifiez ce qui sera publié.")}
                </p>
                <ol>
                  {copy.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ol>
              </div>
              <div>
                <Link className="circle-gold-btn" to={registerSearch(registerContext, role)}>
                  {t("Continue registration", "Lanjutkan pendaftaran", "Continuer l’inscription")} {role === "buyer" ? "Buyer" : "Supplier"} →
                </Link>
                <Link
                  className="muted small"
                  to={contextSearch("/koridor", {
                    ...registerContext,
                    role: role === "buyer" ? "supplier" : "buyer",
                    side: role === "buyer" ? "supply" : "demand",
                  })}
                >
                  {t("Switch membership role", "Ganti peran membership", "Changer de rôle")}
                </Link>
                <p className="small muted">
                  {t(
                    "Continue with Google or the manual form → complete your profile → review → save. A membership ID is issued after a successful save. There is no promise of matching or an automatic contract.",
                    "Lanjutkan dengan Google atau form manual → isi profil → tinjau → simpan. ID anggota terbit setelah penyimpanan berhasil. Tidak ada janji matching atau kontrak otomatis.",
                    "Continuez avec Google ou le formulaire manuel → complétez le profil → vérifiez → enregistrez. Un identifiant est émis après l’enregistrement. Aucune promesse de mise en relation ou de contrat automatique.",
                  )}
                </p>
              </div>
            </section>
            <details className="corridor-edit">
              <summary>{t("Change country or sector", "Ubah negara atau sektor", "Modifier le pays ou le secteur")}</summary>
              <CorridorForm compact />
            </details>
          </>
        ) : (
          <CorridorForm />
        )}
        <Footer />
      </main>
    </>
  );
}
