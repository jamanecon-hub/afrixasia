import { Link, useParams } from "react-router-dom";
import { findCountry, market, sectorCopy } from "../../shared/reference.mjs";
import { Footer, Header } from "../components/Chrome.jsx";
import ResearchDesk from "../components/ResearchDesk.jsx";
import { useLanguage } from "../i18n.jsx";
import { contextSearch, registerSearch, useApplyResearchContext } from "../research.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

export default function EvidencePage() {
  const { id } = useParams();
  const { t, sector, formatValue } = useLanguage();
  const record = market.records.find((row) => row.id === id);
  const country = record ? findCountry(record.country) : null;
  const indicator = record ? sectorCopy[record.category]?.indicators?.[0] : "";
  const fields = record
    ? {
        country: record.country,
        category: record.category,
        side: record.side,
        type: record.type,
        role: record.side === "supply" ? "supplier" : "buyer",
        ...(indicator ? { indicator } : {}),
      }
    : null;
  useApplyResearchContext(record?.id, fields);
  if (!record) return <NotFoundPage />;
  const opposite = record.side === "supply" ? "buyer" : "supplier";
  return (
    <>
      <Header active="Data pasar" />
      <main>
        <div className="breadcrumbs">
          <Link to={contextSearch("/data-pasar", fields)}>
            ← {t("Market results", "Hasil data pasar", "Résultats du marché")}
          </Link>
          <span>EVIDENCE / {record.id}</span>
        </div>
        <section className="detail-hero">
          <div>
            <span className="eyebrow">
              {record.side === "supply" ? "SUPPLY" : "DEMAND"} REFERENCE · {sector(record.category)}
            </span>
            <h1>{record.product}</h1>
            <p>
              {record.country} · {t("Reporting period", "Periode pelaporan", "Période de référence")} {record.period}
            </p>
          </div>
          <a className="btn primary" href={record.sourceUrl} target="_blank" rel="noreferrer">
            {t("Check the original source", "Periksa sumber asli", "Vérifier la source originale")} ↗
          </a>
        </section>
        <div className="profile-layout">
          <article className="card profile-card">
            <span className="detail-value">
              {typeof record.value === "number" ? formatValue(record.value, record.unit) : record.value}
              <small>{record.unit}</small>
            </span>
            <p className="small muted">
              {t(
                "USD figures are rounded for reading; source precision is kept in the API and CSV.",
                "Nilai USD dibulatkan untuk dibaca; presisi sumber dipertahankan dalam API/CSV.",
                "Les montants en USD sont arrondis à l’écran ; la précision source reste dans l’API et le CSV.",
              )}
            </p>
            <h2>{t("What was reported?", "Apa yang dilaporkan?", "Que rapporte la source ?")}</h2>
            <p>{record.summary}</p>
            <dl>
              <dt>{t("Evidence type", "Jenis bukti", "Type de preuve")}</dt>
              <dd>{String(record.indicatorType || "").replaceAll("_", " ")}</dd>
              <dt>{t("Reporting country", "Negara reporter", "Pays déclarant")}</dt>
              <dd>{record.country}</dd>
              <dt>{t("Reference flow", "Arus referensi", "Flux de référence")}</dt>
              <dd>
                {record.origin} → {record.target}
              </dd>
              <dt>{t("Period", "Periode", "Période")}</dt>
              <dd>{record.period}</dd>
              <dt>{t("Source", "Sumber", "Source")}</dt>
              <dd>{record.source}</dd>
              <dt>{t("Indicator / HS code", "Kode indikator / HS", "Code indicateur / SH")}</dt>
              <dd>
                {record.hsCode ||
                  record.indicatorCode ||
                  t("Not applicable to this indicator", "Tidak berlaku pada indikator ini", "Sans objet pour cet indicateur")}
              </dd>
              <dt>{t("Checked", "Diperiksa", "Vérifié")}</dt>
              <dd>{record.checkedAt}</dd>
            </dl>
            <div className="detail-note">
              <b>{t("How to read this evidence", "Cara membaca bukti ini", "Comment lire cette preuve")}</b>
              <p>
                {record.side === "supply"
                  ? t(
                      "Historical exports or activity help recognize a production or service base. The figure does not prove sellable stock or capacity available today.",
                      "Ekspor atau aktivitas historis membantu mengenali basis produksi/layanan. Angka ini tidak membuktikan stok siap jual atau kapasitas tersedia saat ini.",
                      "Les exportations ou l’activité historiques aident à reconnaître une base de production ou de service. Le chiffre ne prouve pas un stock vendable ni une capacité disponible aujourd’hui.",
                    )
                  : t(
                      "Historical imports or consumption help recognize market use. The figure does not prove unmet need or an active purchase order.",
                      "Impor atau konsumsi historis membantu mengenali penggunaan pasar. Angka ini tidak membuktikan kebutuhan yang belum terpenuhi maupun order pembelian aktif.",
                      "Les importations ou la consommation historiques aident à reconnaître l’usage du marché. Le chiffre ne prouve ni un besoin non satisfait ni une commande active.",
                    )}
              </p>
              <p>
                {t(
                  "Units and periods must match before any comparison.",
                  "Satuan dan periode harus sama sebelum melakukan perbandingan.",
                  "Les unités et les périodes doivent être identiques avant toute comparaison.",
                )}
              </p>
            </div>
            <span className="eyebrow">NEXT RESEARCH STEP</span>
            <h2>{t("From evidence to a mandate.", "Dari bukti ke mandat.", "De la preuve au mandat.")}</h2>
            <Link className="btn" to={`/negara/${country?.iso3 || record.iso2}`}>
              {t("Country context", "Konteks negara", "Contexte du pays")} →
            </Link>
            <Link className="btn" to={contextSearch("/penyedia", fields)}>
              {t("Related sector providers", "Penyedia sektor terkait", "Organisations du secteur")} →
            </Link>
            <Link className="btn" to={contextSearch("/proyeksi", fields)}>
              {t("Three-month outlook", "Outlook 3 bulan", "Perspective à trois mois")} →
            </Link>
            <Link className="btn primary" to={registerSearch(fields, opposite)}>
              {record.side === "supply"
                ? t("Look for suppliers", "Cari calon pemasok", "Chercher des fournisseurs")
                : t("Offer a capability", "Tawarkan kapabilitas", "Proposer une capacité")}{" "}
              →
            </Link>
          </article>
        </div>
        <ResearchDesk countryName={record.country} category={record.category} contextFields={fields} />
        <Footer />
      </main>
    </>
  );
}
