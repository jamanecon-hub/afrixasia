import observations from "../data/observations.json" with { type: "json" };
import { countrySectors, findCountry, market, sectorCopy, wdi } from "../shared/reference.mjs";

const byCountry = new Map();
for (const row of observations) {
  if (!byCountry.has(row.country)) byCountry.set(row.country, []);
  byCountry.get(row.country).push(row);
}

export function dossier(query) {
  const country = findCountry(query);
  if (!country) return null;
  const rows = byCountry.get(country.iso3) || [];
  const indicators = wdi.indicators.map((indicator) => {
    const points = rows.filter((row) => row.indicator === indicator.code && row.value !== null);
    const latest = points[points.length - 1] || null;
    const previous = points.length > 1 ? points[points.length - 2] : null;
    const coverage = wdi.coverage.find(
      (row) => row.country === country.iso3 && row.indicator === indicator.code,
    );
    const rate = /%/.test(indicator.unit);
    const delta =
      latest && previous && (rate || previous.value)
        ? {
            kind: rate ? "pp" : "pct",
            value: rate
              ? latest.value - previous.value
              : ((latest.value - previous.value) / Math.abs(previous.value)) * 100,
            fromYear: previous.year,
          }
        : null;
    return {
      code: indicator.code,
      name: indicator.name,
      label: indicator.label,
      unit: indicator.unit,
      category: indicator.category,
      sourceUrl: indicator.sourceUrl,
      latest: latest ? { year: latest.year, value: latest.value } : null,
      delta,
      count: points.length,
      status: coverage?.status || "missing",
      series: points.map((row) => ({ year: row.year, value: row.value })),
    };
  });
  const byCode = Object.fromEntries(indicators.map((row) => [row.code, row]));
  const sectorRow = countrySectors(country.iso3)[0];
  const records = market.records.filter((row) => row.country === country.name);
  return {
    country,
    highlights: ["SP.POP.TOTL", "NY.GDP.MKTP.KD.ZG", "TM.VAL.FOOD.ZS.UN", "BX.GSR.CCIS.CD"].map(
      (code) => byCode[code],
    ),
    cards: [
      "SP.POP.TOTL",
      "NY.GDP.PCAP.CD",
      "NY.GDP.MKTP.KD.ZG",
      "IT.NET.USER.ZS",
      "TM.VAL.FOOD.ZS.UN",
      "TX.VAL.FOOD.ZS.UN",
      "BM.GSR.NFSV.CD",
      "BX.GSR.NFSV.CD",
    ].map((code) => byCode[code]),
    indicators,
    availableIndicators: indicators.filter((row) => row.status === "available").length,
    marketCount: records.length,
    providerCount: market.providers.filter((row) => row.country === country.name).length,
    sectors: sectorRow.sectors.map((sector) => {
      const copy = sectorCopy[sector.category];
      const samples = records.filter((row) => row.category === sector.category).slice(0, 2);
      return {
        category: sector.category,
        marketRecords: sector.marketRecords,
        providerProfiles: sector.providerProfiles,
        referenceIndicators: sector.referenceIndicators,
        focus: copy.focus,
        contextOnly: copy.contextOnly,
        questions: copy.questions.slice(0, 2),
        samples: samples.map((row) => ({ id: row.id, product: row.product, period: row.period })),
      };
    }),
  };
}
