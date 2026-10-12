import wdi from "../data/wdi.json" with { type: "json" };
import market from "../data/market.json" with { type: "json" };

export const categories = [
  "Food & agriculture",
  "Apparel & textiles",
  "Business & IT services",
  "Workforce",
  "Education & courses",
  "Film & media",
  "Music & entertainment",
  "Services (aggregate)",
];

export const sectorCopy = {
  "Food & agriculture": {
    focus: "Kualitas, kontinuitas pasokan, dan biaya sampai tujuan",
    contextOnly: false,
    indicators: ["TM.VAL.FOOD.ZS.UN", "TX.VAL.FOOD.ZS.UN"],
    questions: [
      "Tentukan produk, HS code, grade, sertifikasi pangan/halal dan umur simpan.",
      "Bandingkan landed cost, MOQ, musim panen, transportasi dan Incoterms.",
      "Minta bukti stok, sampel serta jadwal pengiriman sebelum kontrak.",
    ],
  },
  "Apparel & textiles": {
    focus: "Kapabilitas manufaktur dan kesiapan order",
    contextOnly: true,
    indicators: ["NY.GDP.PCAP.CD", "SL.TLF.TOTL.IN"],
    questions: [
      "Definisikan bahan, ukuran, standar kualitas dan kebutuhan private label.",
      "Verifikasi kapasitas pabrik, MOQ, kepatuhan tenaga kerja dan waktu produksi.",
      "Konfirmasikan sampel, harga, inspeksi serta hak merek.",
    ],
  },
  "Business & IT services": {
    focus: "Kebutuhan digital dengan mandat proyek yang jelas",
    contextOnly: false,
    indicators: ["BX.GSR.CCIS.CD", "IT.NET.USER.ZS"],
    questions: [
      "Tetapkan outcome, bahasa, integrasi, SLA dan batas akses data.",
      "Bandingkan portofolio, tim delivery, keamanan serta skema pembayaran.",
      "Mulai dengan pilot terukur sebelum memperluas kontrak.",
    ],
  },
  Workforce: {
    focus: "Keterampilan, akses penempatan, dan perlindungan pekerja",
    contextOnly: false,
    indicators: ["SL.TLF.TOTL.IN", "SL.UEM.TOTL.ZS"],
    questions: [
      "Definisikan posisi, keterampilan, bahasa, upah dan lokasi kerja.",
      "Verifikasi lisensi agen, kontrak, visa serta pengakuan sertifikasi.",
      "Periksa biaya penempatan dan perlindungan pekerja pada kedua negara.",
    ],
  },
  "Education & courses": {
    focus: "Intake, relevansi kompetensi, dan kapasitas pelatihan",
    contextOnly: false,
    indicators: ["SE.TER.ENRR", "SE.XPD.TOTL.GD.ZS"],
    questions: [
      "Tentukan peserta, kompetensi akhir, format, bahasa dan jadwal.",
      "Verifikasi akreditasi, pengajar, fasilitas, sertifikat dan biaya total.",
      "Konfirmasikan kursi/intake dan ukur penyelesaian serta hasil belajar.",
    ],
  },
  "Film & media": {
    focus: "Katalog, hak wilayah, dan jaringan distribusi",
    contextOnly: true,
    indicators: ["IT.NET.USER.ZS", "NY.GDP.PCAP.CD"],
    questions: [
      "Tetapkan judul/genre, format, bahasa, subtitle dan wilayah distribusi.",
      "Verifikasi pemilik hak, masa lisensi, sensor dan hak platform.",
      "Uji distributor/festival lokal dan ukur performa judul sebelum ekspansi.",
    ],
  },
  "Music & entertainment": {
    focus: "Hak katalog, distribusi, dan kecocokan audiens",
    contextOnly: true,
    indicators: ["IT.NET.USER.ZS", "NY.GDP.PCAP.CD"],
    questions: [
      "Tetapkan repertoire, genre, bahasa dan wilayah lisensi.",
      "Periksa pemilik master/publishing, royalti dan hak penggunaan.",
      "Uji distribusi atau acara dengan biaya promosi dan metrik yang disepakati.",
    ],
  },
  "Services (aggregate)": {
    focus: "Jenis layanan dan ketentuan lintas negara",
    contextOnly: false,
    indicators: ["BM.GSR.NFSV.CD", "BX.GSR.NFSV.CD"],
    questions: [
      "Identifikasi jenis jasa, ruang lingkup, lokasi pelaksanaan dan lisensi.",
      "Bandingkan SLA, biaya, kurs, pajak serta aturan pembayaran.",
      "Validasi kontrak nyata; total jasa tidak menggambarkan satu subsektor.",
    ],
  },
};

const productCategories = new Set(["Food & agriculture", "Apparel & textiles"]);

export function findCountry(value) {
  if (!value) return null;
  const needle = String(value).trim().toLowerCase();
  return (
    wdi.countries.find((country) =>
      [country.iso2, country.iso3, country.name, country.sourceName].some(
        (item) => item.toLowerCase() === needle,
      ),
    ) || null
  );
}

export function summary() {
  const available = wdi.coverage.filter((row) => row.status === "available");
  return {
    countries: wdi.countries.length,
    indicators: wdi.indicators.length,
    observations: wdi.observationCount,
    pairs: wdi.coverage.length,
    availablePairs: available.length,
    missingPairs: wdi.coverage.length - available.length,
    stalePairs: available.filter((row) => row.latestYear !== null && row.latestYear <= 2022).length,
    latestCountryCount: new Set(wdi.latest.map((row) => row.country)).size,
    latestObservationYear: Math.max(...wdi.latest.map((row) => row.year)),
    curatedRecords: market.records.filter((row) => !row.datasetId).length,
    tradeRecords: market.records.length,
    providers: market.providers.length,
  };
}

export function countrySectors(countryQuery) {
  const selected = countryQuery ? findCountry(countryQuery) : null;
  return wdi.countries
    .filter((country) => !selected || country.iso3 === selected.iso3)
    .map((country) => ({
      country: country.name,
      iso2: country.iso2,
      iso3: country.iso3,
      region: country.region,
      indicators: wdi.coverage.filter(
        (row) => row.country === country.iso3 && row.status === "available",
      ).length,
      sectors: categories.map((category) => ({
        category,
        marketRecords: market.records.filter(
          (row) => row.country === country.name && row.category === category,
        ).length,
        providerProfiles: market.providers.filter(
          (row) => row.country === country.name && row.category === category,
        ).length,
        referenceIndicators: wdi.indicators.filter(
          (indicator) =>
            indicator.category === category &&
            wdi.coverage.some(
              (row) =>
                row.country === country.iso3 &&
                row.indicator === indicator.code &&
                row.status === "available",
            ),
        ).length,
      })),
    }));
}

export function inferType(category) {
  return productCategories.has(category) ? "product" : "service";
}

export function filterMarket(query) {
  const country = query.country ? findCountry(query.country)?.name || query.country : "";
  const origin = query.origin ? findCountry(query.origin)?.name || query.origin : "";
  const target = query.target ? findCountry(query.target)?.name || query.target : "";
  return market.records.filter(
    (row) =>
      (!country || row.country === country) &&
      (!query.region || row.region === query.region) &&
      (!query.category || row.category === query.category) &&
      (!query.side || row.side === query.side) &&
      (!query.type || row.type === query.type) &&
      (!origin || row.origin === origin) &&
      (!target || row.target === target) &&
      (!query.q ||
        [row.country, row.product, row.category, row.summary]
          .join(" ")
          .toLowerCase()
          .includes(String(query.q).toLowerCase())),
  );
}

export function filterProviders(query) {
  const country = query.country ? findCountry(query.country) : null;
  return market.providers.filter(
    (row) =>
      (!country || row.country === country.name || row.iso2 === country.iso2) &&
      (!query.region || row.region === query.region) &&
      (!query.category || row.category === query.category) &&
      (!query.q ||
        [row.name, row.description, row.country]
          .join(" ")
          .toLowerCase()
          .includes(String(query.q).toLowerCase())),
  );
}

export function toCsv(rows) {
  if (!rows.length) return "";
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value) => {
    if (value == null) return "";
    const text = Array.isArray(value) ? value.join("|") : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join(
    "\n",
  );
}

export function intelligence(countryQuery, categoryQuery) {
  const country = findCountry(countryQuery);
  if (!country) return { error: "Unknown country. Use an ISO2, ISO3 or country name." };
  const selected = categoryQuery ? categories.filter((item) => item === categoryQuery) : categories;
  if (categoryQuery && !selected.length) return { error: "Unknown category." };
  return {
    version: wdi.version,
    country,
    sectors: selected.map((category) => {
      const copy = sectorCopy[category];
      const facts = copy.indicators
        .map((code) => {
          const definition = wdi.indicators.find((item) => item.code === code);
          const row = wdi.latest.find((item) => item.country === country.iso3 && item.indicator === code);
          return definition && row ? { definition, row } : null;
        })
        .filter(Boolean);
      return {
        category,
        focus: copy.focus,
        validationQuestions: copy.questions,
        contextOnly: copy.contextOnly,
        facts,
        marketEvidence: market.records
          .filter((row) => row.country === country.name && row.category === category)
          .map((row) => ({
            ...row,
            evidenceScope: "curated_reference",
            license: "Source page cited on each record",
          })),
        localProviders: market.providers
          .filter((row) => row.country === country.name && row.category === category)
          .map((row) => ({ ...row, sourceUrl: row.website })),
        otherCountryProviders: market.providers
          .filter((row) => row.country !== country.name && row.category === category)
          .slice(0, 5)
          .map((row) => ({
            name: row.name,
            country: row.country,
            countryCode: row.iso2,
            category: row.category,
            description: row.description,
            website: row.website,
            contact: row.email || "",
            sourceRef: row.website,
            id: row.id,
            status: "public_reference",
            verifiedAt: row.checkedAt,
            availability: "not_confirmed_for_this_country",
            iso2: row.iso2,
            region: row.region,
          })),
        interpretation:
          "Historical references and a research agenda. Cross-country organizations are not confirmed to serve this country. No active order or available inventory is inferred.",
      };
    }),
    regionalEvidenceNote:
      "Regional music statistics are available separately in /api/market and are not country measurements.",
  };
}

export { wdi, market };
