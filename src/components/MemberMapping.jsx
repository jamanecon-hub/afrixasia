import { useLanguage } from "../i18n.jsx";

export const INTEREST_INTENTS = ["buy", "supply", "research", "partnership"];

const intentCopy = {
  buy: ["Buy", "Beli", "Acheter"],
  supply: ["Supply", "Pasok", "Fournir"],
  research: ["Research", "Riset", "Recherche"],
  partnership: ["Partnership", "Kemitraan", "Partenariat"],
};

export function intentLabel(t, id) {
  const copy = intentCopy[id];
  return copy ? t(copy[0], copy[1], copy[2]) : id;
}

export function MemberMapping({ member, compact = false }) {
  const { t, sector } = useLanguage();
  const interest = member?.interest;
  const segment = member?.segment;
  const capabilities = member?.capabilities;
  if (!interest && !segment && !capabilities) return null;
  const intents = (interest?.intents || []).map((id) => intentLabel(t, id)).filter(Boolean);
  const listing =
    segment?.listingType === "service"
      ? t("Service", "Jasa", "Service")
      : segment?.listingType === "product"
        ? t("Product", "Produk", "Produit")
        : "";
  return (
    <div className={`member-mapping${compact ? " compact" : ""}`}>
      {interest && (interest.statement || intents.length > 0) && (
        <section>
          <h3>{t("Interest", "Minat", "Intérêt")}</h3>
          {intents.length > 0 && <p>{intents.join(" · ")}</p>}
          {interest.statement && <p>{interest.statement}</p>}
        </section>
      )}
      {segment && (
        <section>
          <h3>{t("Segment", "Segmen", "Segment")}</h3>
          <p>{[segment.category ? sector(segment.category) : "", listing].filter(Boolean).join(" · ")}</p>
          <p>
            {segment.originCountry || "—"} → {segment.targetCountry || "—"}
          </p>
        </section>
      )}
      {capabilities && (capabilities.offer || capabilities.capacity || capabilities.certifications || capabilities.leadTime) && (
        <section>
          <h3>{t("Capabilities", "Kapabilitas", "Capacités")}</h3>
          {capabilities.offer && <p style={{ whiteSpace: "pre-wrap" }}>{compact ? capabilities.offer.slice(0, 160) : capabilities.offer}</p>}
          {capabilities.capacity && (
            <p>
              {t("Capacity / volume", "Kapasitas / volume", "Capacité / volume")}: {capabilities.capacity}
            </p>
          )}
          {capabilities.certifications && (
            <p>
              {t("Certifications", "Sertifikasi", "Certifications")}: {capabilities.certifications}
            </p>
          )}
          {capabilities.leadTime && (
            <p>
              {t("Lead time", "Lead time", "Délai")}: {capabilities.leadTime}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
