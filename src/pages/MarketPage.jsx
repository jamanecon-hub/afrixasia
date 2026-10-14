import { useState } from "react";
import { Link } from "react-router-dom";
import { market } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import Filters from "../components/Filters.jsx";
import Globe from "../components/Globe.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, patchContext, registerSearch, useResearch } from "../research.jsx";

export default function MarketPage() {
  const { t, formatValue, sector } = useLanguage();
  const [context, setContext] = useResearch();
  const [shown, setShown] = useState(30);
  const rows = market.records.filter(
    (row) =>
      (!context.country || row.country === context.country) &&
      (!context.region || row.region === context.region) &&
      (!context.category || row.category === context.category) &&
      (!context.side || row.side === context.side) &&
      (!context.type || row.type === context.type) &&
      (!context.origin || row.origin === context.origin) &&
      (!context.target || row.target === context.target) &&
      (!context.q ||
        [row.country, row.product, row.category, row.summary]
          .join(" ")
          .toLowerCase()
          .includes(context.q.toLowerCase())),
  );
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(context)) if (value) query.set(key, value);
  return (
    <>
      <Header active="Data pasar" />
      <main>
        <div className="reference-hero">
          <span className="eyebrow">AFRIXASIA · MARKET OBSERVATORY</span>
          <h1>{t("One globe. Connected markets.", "Satu globe. Pasar terhubung.", "Un globe. Des marchés connectés.")}</h1>
          <p>
            {t(
              "Explore historical demand and supply references across Asia and Africa. Select a country, compare sectors, then join as a buyer or supplier.",
              "Jelajahi referensi historis permintaan dan pasokan Asia–Afrika. Pilih negara, bandingkan sektor, lalu bergabung sebagai buyer atau supplier.",
              "Explorez les références historiques de demande et d’offre en Asie et en Afrique. Sélectionnez un pays, comparez les secteurs, puis rejoignez le réseau.",
            )}
          </p>
        </div>
        <Filters
          value={context}
          full
          onChange={(next) => {
            setContext(next);
            setShown(30);
          }}
        />
        <div className="portal-market-grid">
          <Globe
            selected={context.country || ""}
            active={[...new Set(rows.map((row) => row.country))]}
            onSelect={(country) => {
              setContext(patchContext(context, "country", country));
              setShown(30);
            }}
          />
          <aside className="card">
            <span className="eyebrow">{t("YOUR MARKET VIEW", "PILIHAN PASAR ANDA", "VOTRE VUE DU MARCHÉ")}</span>
            <h2>{context.country || t("Asia & Africa", "Asia & Afrika", "Asie & Afrique")}</h2>
            <div className="portal-number">{rows.length}</div>
            <p>{t("matching reference records", "baris referensi cocok", "références correspondantes")}</p>
            <p>
              {t(
                "These are historical trade and sector signals, not open purchase orders or available inventory. A missing record does not mean zero demand.",
                "Ini sinyal perdagangan dan sektor historis, bukan order aktif atau stok tersedia. Tidak adanya data bukan berarti tidak ada permintaan.",
                "Il s’agit de signaux historiques, pas de commandes ouvertes ni de stocks disponibles. Une donnée absente ne signifie pas une demande nulle.",
              )}
            </p>
            <Link className="btn primary" to={registerSearch(context, "buyer")}>
              {t("Join as buyer", "Daftar buyer", "Devenir acheteur")} ↗
            </Link>
            <Link className="btn" to={registerSearch(context, "supplier")}>
              {t("Join as supplier", "Daftar supplier", "Devenir fournisseur")} ↗
            </Link>
            <Link to={contextSearch("/open-data", context)}>
              {t("Analyze this economy", "Analisis ekonomi ini", "Analyser cette économie")} →
            </Link>
          </aside>
        </div>
        <div className="sectionhead">
          <h2>{t("Market reference table", "Tabel referensi pasar", "Tableau des références du marché")}</h2>
          <a href={`/api/market?format=csv&${query.toString()}`}>{t("Download CSV", "Unduh CSV", "Télécharger CSV")} ↓</a>
        </div>
        <p className="notice">
          {t(
            "Snapshot refreshed 14 October 2026. UN Comtrade references now use 2025 where that year is published; other rows stay on their last reported year. WDI proxies remain the 10 October extract. Values are rounded for display; exact values remain in the API.",
            "Snapshot diperbarui 14 Oktober 2026. Referensi UN Comtrade memakai 2025 bila tahun itu sudah terbit; baris lain tetap pada tahun terakhir yang dilaporkan. Proksi WDI tetap ekstrak 10 Oktober. Angka tampilan dibulatkan; nilai persis tersedia melalui API.",
            "Instantané actualisé le 14 octobre 2026. Les références UN Comtrade passent à 2025 lorsque cette année est publiée ; les autres lignes restent sur leur dernière année. Les proxys WDI datent de l’extrait du 10 octobre. Valeurs arrondies à l’écran ; précision originale dans l’API.",
          )}
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  t("Country", "Negara", "Pays"),
                  t("Sector / reference", "Sektor / referensi", "Secteur / référence"),
                  t("Direction", "Arah", "Direction"),
                  t("Value / period", "Nilai / periode", "Valeur / période"),
                  t("Source", "Sumber", "Source"),
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, shown).map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.country}</b>
                    <small>
                      {row.origin} → {row.target}
                    </small>
                  </td>
                  <td>
                    <Link to={`/data-pasar/${row.id}`}>
                      <b>{sector(row.category)}</b>
                      <small>{row.product}</small>
                    </Link>
                  </td>
                  <td>
                    {row.side === "demand"
                      ? t("Demand", "Permintaan", "Demande")
                      : row.side === "supply"
                        ? t("Supply", "Pasokan", "Offre")
                        : row.side}
                  </td>
                  <td>
                    {typeof row.value === "number" ? formatValue(row.value, row.unit) : row.value}
                    <small>
                      {row.unit} · {row.period}
                    </small>
                  </td>
                  <td>
                    <a href={row.sourceUrl} target="_blank" rel="noreferrer">
                      {row.source} ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="detail-note">
            <h3>
              {t(
                "No published reference matches this selection.",
                "Belum ada referensi untuk pilihan ini.",
                "Aucune référence publiée ne correspond à cette sélection.",
              )}
            </h3>
            <p>
              {t(
                "Broaden your filters or describe your own need or capability through membership.",
                "Perluas filter atau daftarkan kebutuhan maupun kemampuan melalui membership.",
                "Élargissez vos filtres ou présentez votre besoin ou votre offre dans votre adhésion.",
              )}
            </p>
            <Link className="btn" to={registerSearch(context)}>
              {t("Create a member profile", "Buat profil anggota", "Créer un profil membre")} →
            </Link>
          </div>
        )}
        {shown < rows.length && (
          <button className="btn" onClick={() => setShown(shown + 50)}>
            {t("Show more", "Tampilkan lagi", "Voir plus")}
          </button>
        )}
        <Footer />
      </main>
    </>
  );
}
