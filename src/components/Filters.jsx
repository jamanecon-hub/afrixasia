import { categories, wdi } from "../../shared/reference.mjs";
import { useLanguage } from "../i18n.jsx";
import { patchContext } from "../research.jsx";

function CountryOptions() {
  return wdi.countries.map((country) => (
    <option key={country.iso3} value={country.name}>
      {country.name}
    </option>
  ));
}

export default function Filters({ value, onChange, full = false }) {
  const { t, sector } = useLanguage();
  const set = (field, next) => onChange(patchContext(value, field, next));
  return (
    <div className="portal-filters">
      <label>
        {t("Country", "Negara", "Pays")}
        <select value={value.country || ""} onChange={(event) => set("country", event.target.value)}>
          <option value="">{t("All countries", "Semua negara", "Tous les pays")}</option>
          <CountryOptions />
        </select>
      </label>
      <label>
        {t("Sector", "Sektor", "Secteur")}
        <select value={value.category || ""} onChange={(event) => set("category", event.target.value)}>
          <option value="">{t("All sectors", "Semua sektor", "Tous les secteurs")}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {sector(category)}
            </option>
          ))}
        </select>
      </label>
      {full && (
        <>
          <label>
            {t("Reference type", "Jenis referensi", "Type de référence")}
            <select value={value.side || ""} onChange={(event) => set("side", event.target.value)}>
              <option value="">{t("Demand & supply", "Demand & supply", "Demande & offre")}</option>
              <option value="demand">{t("Demand", "Permintaan", "Demande")}</option>
              <option value="supply">{t("Supply", "Pasokan", "Offre")}</option>
            </select>
          </label>
          <label>
            {t("Product / service", "Produk / jasa", "Produit / service")}
            <select value={value.type || ""} onChange={(event) => set("type", event.target.value)}>
              <option value="">{t("Both", "Keduanya", "Les deux")}</option>
              <option value="product">{t("Product", "Produk", "Produit")}</option>
              <option value="service">{t("Service", "Jasa", "Service")}</option>
            </select>
          </label>
          {["origin", "target"].map((field) => (
            <label key={field}>
              {field === "origin"
                ? t("Origin country", "Negara asal", "Pays d’origine")
                : t("Target country", "Negara tujuan", "Pays cible")}
              <select value={value[field] || ""} onChange={(event) => set(field, event.target.value)}>
                <option value="">{t("All countries", "Semua negara", "Tous les pays")}</option>
                <CountryOptions />
              </select>
            </label>
          ))}
        </>
      )}
      <label>
        {t("Search", "Cari", "Rechercher")}
        <input
          value={value.q || ""}
          onChange={(event) => set("q", event.target.value)}
          placeholder={t("Name or keyword", "Nama atau kata kunci", "Nom ou mot-clé")}
        />
      </label>
      <button className="btn" onClick={() => onChange({})}>
        {t("Reset filters", "Reset filter", "Réinitialiser")}
      </button>
    </div>
  );
}
