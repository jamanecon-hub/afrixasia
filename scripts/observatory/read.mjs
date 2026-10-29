import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { paths } from "./lib.mjs";

function openDatabase() {
  if (!fs.existsSync(paths.database)) {
    const error = new Error("Observatory database is not built. Run npm run observatory:build.");
    error.status = 503;
    return { error };
  }
  return { db: new DatabaseSync(paths.database, { readOnly: true }) };
}

function fail(status, error) {
  return { status, body: { error } };
}

function limitOf(value, fallback, max = 5000) {
  if (value == null || value === "") return { value: fallback };
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > max) {
    return { error: `limit must be an integer from 1 to ${max}.` };
  }
  return { value: number };
}

function resolveCountry(db, value) {
  if (!value) return null;
  return db.prepare(`
    SELECT iso3, iso2, name, region FROM countries
    WHERE iso3 = ? COLLATE NOCASE OR iso2 = ? COLLATE NOCASE OR name = ? COLLATE NOCASE
  `).get(value, value, value);
}

export function queryObservatory(params) {
  const opened = openDatabase();
  if (opened.error) return fail(opened.error.status || 503, opened.error.message);
  const db = opened.db;
  try {
    const view = params.view || "status";
    if (view === "status") return { status: 200, body: status(db) };
    if (view === "countries") return { status: 200, body: { countries: db.prepare("SELECT * FROM countries ORDER BY region, name").all() } };
    if (view === "indicators") return indicators(db, params);
    if (view === "series") return series(db, params);
    if (view === "trade") return trade(db, params);
    if (view === "corridors") return corridors(db, params);
    if (view === "prices") return prices(db, params);
    if (view === "production") return production(db, params);
    return fail(400, "view must be status, countries, indicators, series, trade, corridors, prices, or production.");
  } finally {
    db.close();
  }
}

function status(db) {
  const datasets = db.prepare("SELECT * FROM datasets ORDER BY id").all();
  const queries = db.prepare(`
    SELECT dataset_id AS datasetId, status, COUNT(*) AS queries
    FROM collection_queries GROUP BY dataset_id, status
  `).all();
  const tea = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'KEN' AND partner_iso3 = 'PAK' AND hs_code = '0902' AND year = 2024 AND flow = 'export'
  `).get();
  const sesame = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'CHN' AND hs_code = '120740' AND year = 2024 AND flow = 'export'
  `).get();
  const egyptAqua = db.prepare(`
    SELECT value, unit, flag
    FROM production
    WHERE country_iso3 = 'EGY' AND item_code = 'FISH-AQUA' AND element_code = 'Q_tlw' AND year = 2022
  `).get();
  const frozenFish = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'CHN' AND partner_iso3 = 'CIV' AND hs_code = '0303' AND year = 2024 AND flow = 'export'
  `).get();
  const rubberPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Rubber, TSR20' ORDER BY period DESC LIMIT 1
  `).get();
  const rubberOutput = db.prepare(`
    SELECT value, unit, flag
    FROM production
    WHERE country_iso3 = 'CIV' AND item_code = '836' AND element_code = '5510' AND year = 2023
  `).get();
  const rubberTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'CIV' AND partner_iso3 = 'CHN' AND hs_code = '4001' AND year = 2024 AND flow = 'export'
  `).get();
  const groundnutPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Groundnuts' ORDER BY period DESC LIMIT 1
  `).get();
  const groundnutOutput = db.prepare(`
    SELECT value, unit, flag
    FROM production
    WHERE country_iso3 = 'SEN' AND item_code = '242' AND element_code = '5510' AND year = 2023
  `).get();
  const groundnutTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'SEN' AND partner_iso3 = 'CHN' AND hs_code = '1202' AND year = 2024 AND flow = 'export'
  `).get();
  const maizePrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Maize' ORDER BY period DESC LIMIT 1
  `).get();
  const maizeOutput = db.prepare(`
    SELECT value, unit, flag
    FROM production
    WHERE country_iso3 = 'ZAF' AND item_code = '56' AND element_code = '5510' AND year = 2023
  `).get();
  const maizeTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'KOR' AND hs_code = '1005' AND year = 2023 AND flow = 'export'
  `).get();
  const tobaccoPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Tobacco, US import u.v.' ORDER BY period DESC LIMIT 1
  `).get();
  const tobaccoOutput = db.prepare(`
    SELECT value, unit, flag
    FROM production
    WHERE country_iso3 = 'ZWE' AND item_code = '826' AND element_code = '5510' AND year = 2023
  `).get();
  const tobaccoTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'ZWE' AND partner_iso3 = 'CHN' AND hs_code = '2401' AND year = 2024 AND flow = 'export'
  `).get();
  const sugarPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Sugar, world' ORDER BY period DESC LIMIT 1
  `).get();
  const caneOutput = db.prepare(`
    SELECT value, unit, flag
    FROM production
    WHERE country_iso3 = 'IND' AND item_code = '156' AND element_code = '5510' AND year = 2023
  `).get();
  const rawSugarOutput = db.prepare(`
    SELECT value, unit, flag
    FROM production
    WHERE country_iso3 = 'ZAF' AND item_code = '162' AND element_code = '5510' AND year = 2023
  `).get();
  const sugarTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'IND' AND partner_iso3 = 'LBY' AND hs_code = '1701' AND year = 2024 AND flow = 'export'
  `).get();
  const phosphatePrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Phosphate rock' ORDER BY period DESC LIMIT 1
  `).get();
  const phosphateTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'MAR' AND partner_iso3 = 'IND' AND hs_code = '2510' AND year = 2024 AND flow = 'export'
  `).get();
  const copperPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Copper' ORDER BY period DESC LIMIT 1
  `).get();
  const copperCathodeTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'COD' AND partner_iso3 = 'CHN' AND hs_code = '740311' AND year = 2024 AND flow = 'export'
  `).get();
  const copperOreTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'COD' AND partner_iso3 = 'CHN' AND hs_code = '2603' AND year = 2024 AND flow = 'export'
  `).get();
  const cobaltTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'COD' AND partner_iso3 = 'CHN' AND hs_code = '282200' AND year = 2024 AND flow = 'export'
  `).get();
  const cobaltSeries = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series WHERE series LIKE '%obalt%'
  `).get();
  const ironPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Iron ore, cfr spot' ORDER BY period DESC LIMIT 1
  `).get();
  const ironTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'CHN' AND hs_code = '2601' AND year = 2024 AND flow = 'export'
  `).get();
  const manganeseSeries = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series WHERE series LIKE '%anganese%'
  `).get();
  const manganeseTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'CHN' AND hs_code = '2602' AND year = 2024 AND flow = 'export'
  `).get();
  const chromiumSeries = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series WHERE series LIKE '%hrom%'
  `).get();
  const chromiumTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM trade_flows
    WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'CHN' AND hs_code = '2610' AND year = 2024 AND flow = 'export'
  `).get();
  return {
    database: "data/observatory.sqlite",
    counts: {
      countries: db.prepare("SELECT COUNT(*) AS n FROM countries").get().n,
      indicators: db.prepare("SELECT COUNT(*) AS n FROM indicators").get().n,
      observations: db.prepare("SELECT COUNT(*) AS n FROM observations").get().n,
      tradeFlows: db.prepare("SELECT COUNT(*) AS n FROM trade_flows").get().n,
      commodityPrices: db.prepare("SELECT COUNT(*) AS n FROM commodity_prices").get().n,
      production: db.prepare("SELECT COUNT(*) AS n FROM production").get().n,
      marketRecords: db.prepare("SELECT COUNT(*) AS n FROM market_records").get().n,
    },
    observationsByDataset: db.prepare(`
      SELECT dataset_id AS datasetId, COUNT(*) AS observations FROM observations GROUP BY dataset_id
    `).all(),
    collectionQueries: queries,
    kenyaTeaExportsToPakistan2024: tea || null,
    nigeriaSesameExportsToChina2024: sesame || null,
    egyptAquaculture2022: egyptAqua || null,
    chinaFrozenFishExportsToCoteDivoire2024: frozenFish || null,
    rubberTsr20Latest: rubberPrice || null,
    coteDivoireNaturalRubber2023: rubberOutput || null,
    coteDivoireRubberExportsToChina2024: rubberTrade || null,
    groundnutsLatest: groundnutPrice || null,
    senegalGroundnuts2023: groundnutOutput || null,
    senegalGroundnutExportsToChina2024: groundnutTrade || null,
    maizeLatest: maizePrice || null,
    southAfricaMaize2023: maizeOutput || null,
    southAfricaMaizeExportsToKorea2023: maizeTrade || null,
    tobaccoLatest: tobaccoPrice || null,
    zimbabweTobacco2023: tobaccoOutput || null,
    zimbabweTobaccoExportsToChina2024: tobaccoTrade || null,
    sugarWorldLatest: sugarPrice || null,
    indiaSugarCane2023: caneOutput || null,
    southAfricaRawSugar2023: rawSugarOutput || null,
    indiaSugarExportsToLibya2024: sugarTrade || null,
    phosphateRockLatest: phosphatePrice || null,
    moroccoPhosphateExportsToIndia2024: phosphateTrade || null,
    copperLatest: copperPrice || null,
    drcCopperCathodeExportsToChina2024: copperCathodeTrade || null,
    drcCopperOreExportsToChina2024: copperOreTrade || null,
    drcCobaltOxideExportsToChina2024: cobaltTrade || null,
    cobaltPriceSeries: cobaltSeries?.n || 0,
    ironOreLatest: ironPrice || null,
    southAfricaIronOreExportsToChina2024: ironTrade || null,
    manganesePriceSeries: manganeseSeries?.n || 0,
    southAfricaManganeseOreExportsToChina2024: manganeseTrade || null,
    chromiumPriceSeries: chromiumSeries?.n || 0,
    southAfricaChromiumOreExportsToChina2024: chromiumTrade || null,
    note: "A missing trade row is not zero trade. Flows under USD 1 million are omitted. Commodity prices are international benchmarks, not bilateral contracts. Crop figures are production, area, or yield, not available stock. Fish figures are live weight of aquatic animals, not export weight. Groundnut production is in shell, not HS 1202 customs weight and not the groundnut-oil price. Maize production is grain, not HS 1005 customs weight and not the US Gulf price. Tobacco production is unmanufactured leaf, not HS 2401 customs weight and not the US import unit value. A missing tobacco price month is not zero. Sugar cane and sugar beet are not raw sugar and must not be added. Raw centrifugal sugar is not HS 1701 customs weight and not the ISA world price. Phosphate rock trade is HS 2510 customs weight, not mine production and not the DAP, TSP, or urea price. The phosphate benchmark is f.o.b. North Africa. Copper ore (HS 2603) and refined copper cathodes (HS 740311) must not be added. Mine production is absent, not zero. The copper benchmark is the LME grade A cathode price, not a concentrate price. Cobalt oxides and hydroxides (HS 282200) are not cobalt ores (HS 2605), not unwrought cobalt (HS 810520), and not copper. Customs weight is not contained cobalt metal. No cobalt price is stored. Iron ore trade is HS 2601 customs weight, including agglomerated ore, not pig iron, not steel, and not mine production. The iron-ore benchmark is 62% Fe fines, c.f.r. China, in US dollars per dry metric ton, not the customs unit value. Manganese ore trade is HS 2602 customs weight, including ferruginous manganese ores with a manganese content of 20% or more, calculated on the dry weight. It is not ferromanganese (HS 7202), not manganese oxides (HS 2820), and not contained manganese metal. No manganese price is stored. Chromium ore trade is HS 2610 customs weight. It is not ferrochromium (HS 720241 or HS 720249), not chromium oxides and hydroxides (HS 2819), and not contained chromium metal. No chromium price is stored.",
    datasets,
  };
}

function indicators(db, params) {
  const rows = db.prepare(`
    SELECT code, name, label, unit, category, side, frequency, source_url AS sourceUrl, interpretation, dataset_id AS datasetId
    FROM indicators
    WHERE (? = '' OR category = ?)
    ORDER BY category, code
  `).all(params.category || "", params.category || "");
  return { status: 200, body: { total: rows.length, rows } };
}

function series(db, params) {
  const country = resolveCountry(db, params.country);
  if (!country) return fail(400, "country is required. Use ISO2, ISO3, or a country name.");
  if (!params.indicator) return fail(400, "indicator is required.");
  const indicator = db.prepare("SELECT code, name, unit, category, dataset_id AS datasetId FROM indicators WHERE code = ?").get(params.indicator);
  if (!indicator) return fail(400, `Unknown indicator: ${params.indicator}`);
  const start = Number(params.start || 2015);
  const end = Number(params.end || 2025);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) return fail(400, "start and end must be years, with start <= end.");
  const rows = db.prepare(`
    SELECT country_iso3 AS country, year, value, status, dataset_id AS datasetId
    FROM observations
    WHERE country_iso3 = ? AND indicator_code = ? AND year BETWEEN ? AND ?
    ORDER BY year
  `).all(country.iso3, indicator.code, start, end);
  return {
    status: 200,
    body: {
      country,
      indicator,
      total: rows.length,
      rows,
      note: "Missing years are omitted. A missing year is not zero.",
    },
  };
}

function trade(db, params) {
  const reporter = params.reporter ? resolveCountry(db, params.reporter) : null;
  const partner = params.partner ? resolveCountry(db, params.partner) : null;
  if (params.reporter && !reporter) return fail(400, "Unknown reporter.");
  if (params.partner && !partner) return fail(400, "Unknown partner.");
  if (!reporter && !partner && !params.hs && !params.year) {
    return fail(400, "Provide reporter, partner, hs, or year.");
  }
  const limited = limitOf(params.limit, 100);
  if (limited.error) return fail(400, limited.error);
  const year = params.year ? Number(params.year) : null;
  if (params.year && !Number.isInteger(year)) return fail(400, "year must be an integer.");
  const rows = db.prepare(`
    SELECT reporter_iso3 AS reporter, reporter_name AS reporterName, reporter_region AS reporterRegion,
      partner_iso3 AS partner, partner_name AS partnerName, partner_region AS partnerRegion,
      hs_code AS hsCode, product_name AS product, category, observatory_product AS observatoryProduct,
      year, flow, trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM v_africa_asia_trade
    WHERE (? IS NULL OR reporter_iso3 = ?)
      AND (? IS NULL OR partner_iso3 = ?)
      AND (? = '' OR hs_code = ?)
      AND (? IS NULL OR year = ?)
    ORDER BY trade_value_usd DESC
    LIMIT ?
  `).all(reporter?.iso3 || null, reporter?.iso3 || null, partner?.iso3 || null, partner?.iso3 || null, params.hs || "", params.hs || "", year, year, limited.value);
  return {
    status: 200,
    body: {
      total: rows.length,
      rows,
      note: "Export values of at least USD 1 million. A missing pair is not zero trade.",
    },
  };
}

function corridors(db, params) {
  const limited = limitOf(params.limit, 25);
  if (limited.error) return fail(400, limited.error);
  const year = params.year ? Number(params.year) : null;
  if (params.year && !Number.isInteger(year)) return fail(400, "year must be an integer.");
  const rows = db.prepare(`
    SELECT reporter_iso3 AS reporter, reporter_name AS reporterName, reporter_region AS reporterRegion,
      partner_iso3 AS partner, partner_name AS partnerName, partner_region AS partnerRegion,
      hs_code AS hsCode, product_name AS product, observatory_product AS observatoryProduct,
      year, trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg
    FROM v_africa_asia_trade
    WHERE flow = 'export' AND (? IS NULL OR year = ?) AND (? = '' OR hs_code = ?)
    ORDER BY trade_value_usd DESC
    LIMIT ?
  `).all(year, year, params.hs || "", params.hs || "", limited.value);
  return { status: 200, body: { total: rows.length, rows } };
}

function prices(db, params) {
  if (!params.product && !params.series) return fail(400, "product or series is required.");
  const limited = limitOf(params.limit, 24, 2000);
  if (limited.error) return fail(400, limited.error);
  const rows = db.prepare(`
    SELECT p.series, s.product, s.category, s.observatory_product AS observatoryProduct, s.unit, s.detail,
      p.period, p.price
    FROM commodity_prices p
    JOIN commodity_series s ON s.series = p.series
    WHERE (? = '' OR s.product = ? COLLATE NOCASE OR s.observatory_product = ? COLLATE NOCASE)
      AND (? = '' OR p.series = ? COLLATE NOCASE)
    ORDER BY p.period DESC
    LIMIT ?
  `).all(params.product || "", params.product || "", params.product || "", params.series || "", params.series || "", limited.value);
  return {
    status: 200,
    body: {
      total: rows.length,
      rows,
      note: "Monthly international benchmarks. Tea is the Mombasa auction price. Tobacco is the US import unit value, and a missing month is not zero. Copper is the LME grade A cathode price, not copper ore. Phosphate rock is f.o.b. North Africa, not DAP, TSP, or urea. This extract has no cobalt series. Iron ore is 62% Fe fines, c.f.r. China, in US dollars per dry metric ton, not HS 2601 customs value. This extract has no manganese series. This extract has no chromium series.",
    },
  };
}

function production(db, params) {
  const country = params.country ? resolveCountry(db, params.country) : null;
  if (params.country && !country) return fail(400, "Unknown country.");
  if (!country && !params.item && !params.product) return fail(400, "Provide country, item, or product.");
  const limited = limitOf(params.limit, 100, 20000);
  if (limited.error) return fail(400, limited.error);
  const year = params.year ? Number(params.year) : null;
  if (params.year && !Number.isInteger(year)) return fail(400, "year must be an integer.");
  const rows = db.prepare(`
    SELECT p.country_iso3 AS country, c.name AS countryName, c.region,
      p.item_code AS itemCode, i.name AS item, i.observatory_product AS observatoryProduct, i.category,
      p.element_code AS elementCode, p.element_name AS element, p.year, p.value, p.unit, p.flag
    FROM production p
    JOIN countries c ON c.iso3 = p.country_iso3
    JOIN production_items i ON i.item_code = p.item_code
    WHERE (? IS NULL OR p.country_iso3 = ?)
      AND (? = '' OR p.item_code = ?)
      AND (? = '' OR i.observatory_product = ? COLLATE NOCASE OR i.name = ? COLLATE NOCASE)
      AND (? = '' OR p.element_code = ?)
      AND (? IS NULL OR p.year = ?)
    ORDER BY p.year DESC, p.country_iso3
    LIMIT ?
  `).all(
    country?.iso3 || null,
    country?.iso3 || null,
    params.item || "",
    params.item || "",
    params.product || "",
    params.product || "",
    params.product || "",
    params.element || "",
    params.element || "",
    year,
    year,
    limited.value,
  );
  return {
    status: 200,
    body: {
      total: rows.length,
      rows,
      note: "FAOSTAT production, harvested area, or yield, plus FAO FishStat live weight for aquatic animals. Tea leaves are not made tea. Capture and aquaculture must not be added into a trade figure. A missing country-year is not zero production. Palm fruit and palm oil must not be added together. Unmanufactured tobacco production is not HS 2401 customs weight. Sugar cane and sugar beet must not be added. Raw centrifugal sugar is not HS 1701 customs weight.",
    },
  };
}
