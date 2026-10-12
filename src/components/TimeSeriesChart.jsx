import { useState } from "react";
import { useLanguage } from "../i18n.jsx";

export default function TimeSeriesChart({ rows, labels, unit }) {
  const { t, formatValue } = useLanguage();
  const [year, setYear] = useState(null);
  const countries = [...new Set(rows.map((row) => row.country))];
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
  if (!rows.length) {
    return (
      <div className="series-gap">
        <span className="eyebrow">SOURCE COVERAGE</span>
        <h3>{t("Series not reported.", "Seri belum dilaporkan.", "Série non renseignée.")}</h3>
        <p>
          {t(
            "No numerical observations are reported for this country and indicator in 2015–2025. Choose another indicator. Missing values are not replaced with zeros or estimates.",
            "Sumber tidak melaporkan angka untuk negara dan indikator ini pada 2015–2025. Pilih indikator lain. Data kosong tidak diganti nol atau estimasi.",
            "Aucune observation numérique pour ce pays et cet indicateur en 2015–2025. Choisissez un autre indicateur. Les valeurs manquantes ne sont ni nulles ni estimées.",
          )}
        </p>
      </div>
    );
  }
  const values = rows.map((row) => row.value);
  const floor = Math.min(0, ...values);
  const span = Math.max(...values) - floor || 1;
  const x = (value) => 64 + (value - 2015) * 62;
  const y = (value) => 216 - ((value - floor) / span) * 170;
  const colors = ["#2843f4", "#299421", "#9c47ac"];
  const inspected = year || years[years.length - 1];
  return (
    <div className="timeseries">
      <div className="chart-legend">
        {countries.map((country, index) => (
          <span key={country}>
            <i style={{ background: colors[index % 3] }} />
            {labels[country] || country}
          </span>
        ))}
        <span>{unit}</span>
      </div>
      <svg viewBox="0 0 760 270" role="img" aria-label={t("Annual time series ", "Seri waktu tahunan ", "Série chronologique annuelle ") + unit}>
        <title>
          {t(
            "Source data 2015–2025. Missing years are not interpolated.",
            "Data sumber 2015–2025. Celah tahun tidak diinterpolasi.",
            "Données sources 2015–2025. Les années manquantes ne sont pas interpolées.",
          )}
        </title>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1="64" x2="700" y1={216 - tick * 170} y2={216 - tick * 170} stroke="#dfe5f0" />
            <text x="55" y={220 - tick * 170} textAnchor="end" fontSize="10" fill="#667789">
              {formatValue(floor + tick * span, unit, true)}
            </text>
          </g>
        ))}
        {[2015, 2017, 2019, 2021, 2023, 2025].map((tick) => (
          <text key={tick} x={x(tick)} y="245" textAnchor="middle" fontSize="10" fill="#667789">
            {tick}
          </text>
        ))}
        {countries.map((country, index) => {
          const series = rows.filter((row) => row.country === country).sort((a, b) => a.year - b.year);
          return (
            <g key={country}>
              {series.map((row, rowIndex) => (
                <g key={row.year}>
                  {rowIndex > 0 && row.year === series[rowIndex - 1].year + 1 && (
                    <line
                      x1={x(series[rowIndex - 1].year)}
                      y1={y(series[rowIndex - 1].value)}
                      x2={x(row.year)}
                      y2={y(row.value)}
                      stroke={colors[index % 3]}
                      strokeWidth="2.5"
                    />
                  )}
                  <circle cx={x(row.year)} cy={y(row.value)} r={inspected === row.year ? 6 : 3.5} fill={colors[index % 3]}>
                    <title>{`${labels[country] || country}: ${row.year} · ${formatValue(row.value, unit)} ${unit}`}</title>
                  </circle>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <label className="chart-slider">
        {t("Inspect year", "Periksa tahun", "Consulter une année")}{" "}
        <input
          aria-label={t("Chart year", "Tahun pada grafik", "Année du graphique")}
          type="range"
          min="2015"
          max="2025"
          value={inspected}
          onChange={(event) => setYear(Number(event.target.value))}
        />
        <b>{inspected}</b>
      </label>
      <div className="chart-readout">
        {countries.map((country) => {
          const row = rows.find((item) => item.country === country && item.year === inspected);
          return (
            <span key={country}>
              {labels[country]}: <b>{row ? formatValue(row.value, unit) : t("Not reported", "Tidak dilaporkan", "Non renseigné")}</b>{" "}
              {row ? unit : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
