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
  const bauxiteSeries = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series LIKE '%auxite%' OR series = 'Aluminum' OR series = 'Aluminium'
  `).get();
  const bauxiteTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'GHA' AND partner_iso3 = 'CHN' AND hs_code = '2606' AND year = 2024 AND flow = 'export'
  `).get();
  const titaniumSeries = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series LIKE '%itanium%' OR series LIKE '%lmenite%' OR series LIKE '%utile%'
  `).get();
  const titaniumTrade = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'CHN' AND hs_code = '2614' AND year = 2024 AND flow = 'export'
  `).get();
  const brentPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Crude oil, Brent' ORDER BY period DESC LIMIT 1
  `).get();
  const dubaiPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Crude oil, Dubai' ORDER BY period DESC LIMIT 1
  `).get();
  const excludedCrude = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series IN ('Crude oil, WTI', 'Crude oil, average')
  `).get();
  const angolaCrude = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'AGO' AND partner_iso3 = 'CHN' AND hs_code = '2709' AND year = 2024 AND flow = 'export'
  `).get();
  const mozambiqueCrude = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'CHN' AND hs_code = '2709' AND year = 2023 AND flow = 'export'
  `).get();
  const nigeriaCrude = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'IND' AND hs_code = '2709' AND year = 2025 AND flow = 'export'
  `).get();
  const coalPrice = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Coal, South African' ORDER BY period DESC LIMIT 1
  `).get();
  const excludedEnergy = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series IN (
      'Coal, Australian',
      'Natural gas, US',
      'Natural gas, Europe',
      'Natural gas index'
    )
  `).get();
  const japanLng = db.prepare(`
    SELECT price, period FROM commodity_prices
    WHERE series = 'Liquefied natural gas, Japan' ORDER BY period DESC LIMIT 1
  `).get();
  const algeriaGas = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'DZA' AND partner_iso3 = 'TUR' AND hs_code = '2711' AND year = 2024 AND flow = 'export'
  `).get();
  const nigeriaGas = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'IND' AND hs_code = '2711' AND year = 2024 AND flow = 'export'
  `).get();
  const nigeriaGas2023 = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'IND' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
  `).get();
  const mozambiqueGas = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'CHN' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
  `).get();
  const mozambiqueGasTurkiye = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'TUR' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
  `).get();
  const egyptGas = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'EGY' AND partner_iso3 = 'PSE' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
  `).get();
  const refinedFlow = (reporter, partner, year) => db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = '2710' AND year = ? AND flow = 'export'
  `).get(reporter, partner, year);
  const indiaRefined2024 = refinedFlow("IND", "ZAF", 2024);
  const indiaRefined2023 = refinedFlow("IND", "ZAF", 2023);
  const indiaRefined2025 = refinedFlow("IND", "ZAF", 2025);
  const algeriaRefined = refinedFlow("DZA", "CHN", 2024);
  const chinaRefined2024 = refinedFlow("CHN", "LBR", 2024);
  const chinaRefined2023 = refinedFlow("CHN", "LBR", 2023);
  const turkiyeMoroccoRefined = refinedFlow("TUR", "MAR", 2025);
  const mozambiqueUaeRefined = refinedFlow("MOZ", "ARE", 2023);
  const nigeriaSaudiRefined = refinedFlow("NGA", "SAU", 2025);
  const nigeriaSingaporeRefined = refinedFlow("NGA", "SGP", 2025);
  const egyptSaudiRefined = refinedFlow("EGY", "SAU", 2023);
  const refinedPriceSeries = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE lower(series) LIKE '%gasoline%'
      OR lower(series) LIKE '%gasoil%'
      OR lower(series) LIKE '%diesel%'
      OR lower(series) LIKE '%jet fuel%'
      OR lower(series) LIKE '%kerosene%'
      OR lower(series) LIKE '%fuel oil%'
  `).get();
  const goldFlow = (reporter, partner, year) => db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = '7108' AND year = ? AND flow = 'export'
  `).get(reporter, partner, year);
  const ghanaGold2024 = goldFlow("GHA", "ARE", 2024);
  const ghanaGold2023 = goldFlow("GHA", "ARE", 2023);
  const ghanaGold2025 = goldFlow("GHA", "ARE", 2025);
  const ghanaIndiaGold = goldFlow("GHA", "IND", 2024);
  const burkinaGold = goldFlow("BFA", "ARE", 2024);
  const maliGold = goldFlow("MLI", "ARE", 2024);
  const tanzaniaGold = goldFlow("TZA", "IND", 2024);
  const goldPrice = db.prepare(`
    SELECT period, price FROM commodity_prices
    WHERE series = 'Gold'
    ORDER BY period DESC LIMIT 1
  `).get();
  const excludedPrecious = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series IN ('Palladium', 'Rhodium')
  `).get();
  const silverPrice = db.prepare(`
    SELECT period, price FROM commodity_prices
    WHERE series = 'Silver'
    ORDER BY period DESC LIMIT 1
  `).get();
  const silverFlow = (reporter, partner, year) => db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = '7106' AND year = ? AND flow = 'export'
  `).get(reporter, partner, year);
  const platinumPrice = db.prepare(`
    SELECT period, price FROM commodity_prices
    WHERE series = 'Platinum'
    ORDER BY period DESC LIMIT 1
  `).get();
  const platinumFlow = (reporter, partner, year, hs) => db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = ? AND year = ? AND flow = 'export'
  `).get(reporter, partner, hs, year);
  const southAfricaCoal = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'IND' AND hs_code = '2701' AND year = 2024 AND flow = 'export'
  `).get();
  const southAfricaCoal2023 = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'IND' AND hs_code = '2701' AND year = 2023 AND flow = 'export'
  `).get();
  const vietnamCoal = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'VNM' AND hs_code = '2701' AND year = 2024 AND flow = 'export'
  `).get();
  const mozambiqueCoal = db.prepare(`
    SELECT trade_value_usd AS tradeValueUsd, net_weight_kg AS netWeightKg, qty, qty_unit_code AS qtyUnitCode
    FROM trade_flows
    WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'IND' AND hs_code = '2701' AND year = 2023 AND flow = 'export'
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
    bauxitePriceSeries: bauxiteSeries?.n || 0,
    ghanaBauxiteExportsToChina2024: bauxiteTrade || null,
    titaniumPriceSeries: titaniumSeries?.n || 0,
    mozambiqueTitaniumOreExportsToChina2024: titaniumTrade || null,
    brentLatest: brentPrice || null,
    dubaiLatest: dubaiPrice || null,
    excludedCrudeSeries: excludedCrude?.n || 0,
    angolaCrudeExportsToChina2024: angolaCrude || null,
    mozambiqueCrudeExportsToChina2023: mozambiqueCrude || null,
    nigeriaCrudeExportsToIndia2025: nigeriaCrude || null,
    southAfricanCoalLatest: coalPrice || null,
    excludedEnergySeries: excludedEnergy?.n || 0,
    southAfricaCoalExportsToIndia2024: southAfricaCoal || null,
    southAfricaCoalExportsToIndia2023: southAfricaCoal2023 || null,
    southAfricaCoalExportsToVietnam2024: vietnamCoal || null,
    mozambiqueCoalExportsToIndia2023: mozambiqueCoal || null,
    japanLngLatest: japanLng || null,
    algeriaPetroleumGasExportsToTurkiye2024: algeriaGas || null,
    nigeriaPetroleumGasExportsToIndia2024: nigeriaGas || null,
    nigeriaPetroleumGasExportsToIndia2023: nigeriaGas2023 || null,
    mozambiquePetroleumGasExportsToChina2023: mozambiqueGas || null,
    mozambiquePetroleumGasExportsToTurkiye2023: mozambiqueGasTurkiye || null,
    egyptPetroleumGasExportsToPalestine2023: egyptGas || null,
    indiaRefinedPetroleumExportsToSouthAfrica2024: indiaRefined2024 || null,
    indiaRefinedPetroleumExportsToSouthAfrica2023: indiaRefined2023 || null,
    indiaRefinedPetroleumExportsToSouthAfrica2025: indiaRefined2025 || null,
    algeriaRefinedPetroleumExportsToChina2024: algeriaRefined || null,
    chinaRefinedPetroleumExportsToLiberia2024: chinaRefined2024 || null,
    chinaRefinedPetroleumExportsToLiberia2023: chinaRefined2023 || null,
    turkiyeRefinedPetroleumExportsToMorocco2025: turkiyeMoroccoRefined || null,
    mozambiqueRefinedPetroleumExportsToUae2023: mozambiqueUaeRefined || null,
    nigeriaRefinedPetroleumExportsToSaudiArabia2025: nigeriaSaudiRefined || null,
    nigeriaRefinedPetroleumExportsToSingapore2025: nigeriaSingaporeRefined || null,
    egyptRefinedPetroleumExportsToSaudiArabia2023: egyptSaudiRefined || null,
    refinedPriceSeries: refinedPriceSeries?.n || 0,
    goldLatest: goldPrice || null,
    excludedPreciousSeries: excludedPrecious?.n || 0,
    ghanaGoldExportsToUae2024: ghanaGold2024 || null,
    ghanaGoldExportsToUae2023: ghanaGold2023 || null,
    ghanaGoldExportsToUae2025: ghanaGold2025 || null,
    ghanaGoldExportsToIndia2024: ghanaIndiaGold || null,
    burkinaFasoGoldExportsToUae2024: burkinaGold || null,
    maliGoldExportsToUae2024: maliGold || null,
    tanzaniaGoldExportsToIndia2024: tanzaniaGold || null,
    ghanaGoldExportsToChina2023: goldFlow("GHA", "CHN", 2023) || null,
    egyptGoldExportsToUae2025: goldFlow("EGY", "ARE", 2025) || null,
    ugandaGoldExportsToUae2025: goldFlow("UGA", "ARE", 2025) || null,
    nigeriaGoldExportsToUae2025: goldFlow("NGA", "ARE", 2025) || null,
    platinumLatest: platinumPrice || null,
    southAfricaUnwroughtPlatinumExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711011") || null,
    southAfricaUnwroughtPlatinumExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711011") || null,
    southAfricaUnwroughtPlatinumExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711011") || null,
    southAfricaSemiManufacturedPlatinumExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711019") || null,
    southAfricaSemiManufacturedPlatinumExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711019") || null,
    southAfricaSemiManufacturedPlatinumExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711019") || null,
    southAfricaSemiManufacturedPlatinumExportsToChina2024: platinumFlow("ZAF", "CHN", 2024, "711019") || null,
    southAfricaUnwroughtPlatinumExportsToIndia2023: platinumFlow("ZAF", "IND", 2023, "711011") || null,
    tanzaniaUnwroughtPlatinumExportsToIndia2024: platinumFlow("TZA", "IND", 2024, "711011") || null,
    tanzaniaSemiManufacturedPlatinumExportsToIndia2024: platinumFlow("TZA", "IND", 2024, "711019") || null,
    tanzaniaUnwroughtPlatinumExportsToIndia2025: platinumFlow("TZA", "IND", 2025, "711011") || null,
    uaeUnwroughtPlatinumExportsToSouthAfrica2023: platinumFlow("ARE", "ZAF", 2023, "711011") || null,
    silverLatest: silverPrice || null,
    moroccoSilverExportsToUae2024: silverFlow("MAR", "ARE", 2024) || null,
    moroccoSilverExportsToUae2023: silverFlow("MAR", "ARE", 2023) || null,
    moroccoSilverExportsToUae2025: silverFlow("MAR", "ARE", 2025) || null,
    southAfricaSilverExportsToIndia2024: silverFlow("ZAF", "IND", 2024) || null,
    southAfricaSilverExportsToIndia2025: silverFlow("ZAF", "IND", 2025) || null,
    southAfricaSilverExportsToHongKong2024: silverFlow("ZAF", "HKG", 2024) || null,
    southAfricaSilverExportsToUae2025: silverFlow("ZAF", "ARE", 2025) || null,
    turkiyeSilverExportsToLibya2025: silverFlow("TUR", "LBY", 2025) || null,
    ghanaSilverExportsToKorea2024: silverFlow("GHA", "KOR", 2024) || null,
    ghanaSilverExportsToKorea2023: silverFlow("GHA", "KOR", 2023) || null,
    ugandaSilverExportsToUae2025: silverFlow("UGA", "ARE", 2025) || null,
    tanzaniaSilverExportsToUae2025: silverFlow("TZA", "ARE", 2025) || null,
    uaeSilverExportsToEgypt2023: silverFlow("ARE", "EGY", 2023) || null,
    palladiumPriceSeries: db.prepare(`
      SELECT COUNT(*) AS n FROM commodity_series
      WHERE series LIKE '%alladium%' OR series LIKE '%hodium%'
    `).get().n,
    southAfricaUnwroughtPalladiumExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711021") || null,
    southAfricaUnwroughtPalladiumExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711021") || null,
    southAfricaUnwroughtPalladiumExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711021") || null,
    southAfricaSemiManufacturedPalladiumExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711029") || null,
    southAfricaSemiManufacturedPalladiumExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711029") || null,
    southAfricaSemiManufacturedPalladiumExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711029") || null,
    southAfricaUnwroughtPalladiumExportsToChina2024: platinumFlow("ZAF", "CHN", 2024, "711021") || null,
    southAfricaSemiManufacturedPalladiumExportsToChina2023: platinumFlow("ZAF", "CHN", 2023, "711029") || null,
    southAfricaSemiManufacturedPalladiumExportsToKorea2025: platinumFlow("ZAF", "KOR", 2025, "711029") || null,
    uaeUnwroughtPalladiumExportsToSouthAfrica2023: platinumFlow("ARE", "ZAF", 2023, "711021") || null,
    southAfricaUnwroughtRhodiumExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711031") || null,
    southAfricaUnwroughtRhodiumExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711031") || null,
    southAfricaUnwroughtRhodiumExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711031") || null,
    southAfricaSemiManufacturedRhodiumExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711039") || null,
    southAfricaSemiManufacturedRhodiumExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711039") || null,
    southAfricaSemiManufacturedRhodiumExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711039") || null,
    southAfricaUnwroughtRhodiumExportsToHongKong2024: platinumFlow("ZAF", "HKG", 2024, "711031") || null,
    southAfricaUnwroughtRhodiumExportsToChina2025: platinumFlow("ZAF", "CHN", 2025, "711031") || null,
    southAfricaUnwroughtRhodiumExportsToIndia2023: platinumFlow("ZAF", "IND", 2023, "711031") || null,
    iridiumGroupPriceSeries: db.prepare(`
      SELECT COUNT(*) AS n FROM commodity_series
      WHERE series LIKE '%ridium%' OR series LIKE '%smium%' OR series LIKE '%uthenium%'
    `).get().n,
    southAfricaUnwroughtIridiumGroupExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711041") || null,
    southAfricaUnwroughtIridiumGroupExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711041") || null,
    southAfricaUnwroughtIridiumGroupExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711041") || null,
    southAfricaSemiManufacturedIridiumGroupExportsToJapan2024: platinumFlow("ZAF", "JPN", 2024, "711049") || null,
    southAfricaSemiManufacturedIridiumGroupExportsToJapan2023: platinumFlow("ZAF", "JPN", 2023, "711049") || null,
    southAfricaSemiManufacturedIridiumGroupExportsToJapan2025: platinumFlow("ZAF", "JPN", 2025, "711049") || null,
    southAfricaUnwroughtIridiumGroupExportsToHongKong2024: platinumFlow("ZAF", "HKG", 2024, "711041") || null,
    southAfricaUnwroughtIridiumGroupExportsToChina2024: platinumFlow("ZAF", "CHN", 2024, "711041") || null,
    southAfricaUnwroughtIridiumGroupExportsToIndia2023: platinumFlow("ZAF", "IND", 2023, "711041") || null,
    note: "A missing trade row is not zero trade. Flows under USD 1 million are omitted. Commodity prices are international benchmarks, not bilateral contracts. Crop figures are production, area, or yield, not available stock. Fish figures are live weight of aquatic animals, not export weight. Groundnut production is in shell, not HS 1202 customs weight and not the groundnut-oil price. Maize production is grain, not HS 1005 customs weight and not the US Gulf price. Tobacco production is unmanufactured leaf, not HS 2401 customs weight and not the US import unit value. A missing tobacco price month is not zero. Sugar cane and sugar beet are not raw sugar and must not be added. Raw centrifugal sugar is not HS 1701 customs weight and not the ISA world price. Phosphate rock trade is HS 2510 customs weight, not mine production and not the DAP, TSP, or urea price. The phosphate benchmark is f.o.b. North Africa. Copper ore (HS 2603) and refined copper cathodes (HS 740311) must not be added. Mine production is absent, not zero. The copper benchmark is the LME grade A cathode price, not a concentrate price. Cobalt oxides and hydroxides (HS 282200) are not cobalt ores (HS 2605), not unwrought cobalt (HS 810520), and not copper. Customs weight is not contained cobalt metal. No cobalt price is stored. Iron ore trade is HS 2601 customs weight, including agglomerated ore, not pig iron, not steel, and not mine production. The iron-ore benchmark is 62% Fe fines, c.f.r. China, in US dollars per dry metric ton, not the customs unit value. Manganese ore trade is HS 2602 customs weight, including ferruginous manganese ores with a manganese content of 20% or more, calculated on the dry weight. It is not ferromanganese (HS 7202), not manganese oxides (HS 2820), and not contained manganese metal. No manganese price is stored. Chromium ore trade is HS 2610 customs weight. It is not ferrochromium (HS 720241 or HS 720249), not chromium oxides and hydroxides (HS 2819), and not contained chromium metal. No chromium price is stored. Bauxite trade is HS 2606 customs weight, aluminium ores and concentrates. It is not alumina (HS 281820), not unwrought aluminium (HS 7601), and not contained aluminium metal. Net weight and quantity can both be kilograms and still differ. No bauxite price is stored. The Pink Sheet Aluminum series is metal and is not stored. Titanium ore trade is HS 2614 customs weight, titanium ores and concentrates. It is not titanium oxides (HS 2823), not titanium dioxide pigments (HS 320611), not unwrought titanium (HS 8108), not ferrotitanium (HS 720291), and not slag or ash (HS 2620). Customs weight is not contained titanium metal. Net weight and quantity can both be kilograms and still differ. No titanium-ore price is stored. Crude petroleum trade is HS 2709 customs weight in kilograms, not barrels, not refined petroleum (HS 2710), and not petroleum gases (HS 2711). The stored benchmarks are UK Brent, 38 API, and Dubai Fateh, 32 API, in US dollars per barrel. They are not the customs unit value. WTI and the equal-weighted average are not stored. Coal trade is HS 2701 customs weight in kilograms. It is not lignite (HS 2702), not coke (HS 2704), not crude petroleum, and not petroleum gases. The stored benchmark is South African thermal coal, f.o.b. Richards Bay, NAR 6,000 kcal/kg, in US dollars per metric ton. It is not Australian Newcastle coal and not the customs unit value. Petroleum-gas trade is HS 2711 customs weight in kilograms. The heading includes liquefied natural gas, other liquefied petroleum gases, and natural gas in the gaseous state. It is not crude petroleum, not refined petroleum (HS 2710), and not coal. The stored benchmark is Japan LNG, c.i.f. import price, in US dollars per million Btu. It is not the customs unit value. US Henry Hub, Europe TTF, and the natural-gas index are not stored. Mozambique’s 2023 petroleum-gas net weight and quantity to China both use unit code 8 and differ, so they must not be substituted. Nigeria’s 2024 petroleum-gas net weight and quantity to India both use unit code 8 and match. That implied unit value is not the Japan LNG price and was stored as reported. Mozambique’s 2023 net weight and quantity to India both use unit code 8 and differ, so they must not be substituted. A null net weight is not zero. Quantity 0 with unit code -1 is not a measured kilogram weight. Refined petroleum trade is HS 2710 customs weight in kilograms, not barrels. The heading includes light oils, other oils, oils containing biodiesel, and waste oils. It is not crude petroleum (HS 2709) and not petroleum gases (HS 2711). India to South Africa in 2024, 2023, and 2025 differ, so those years must not be substituted. Within each year the net weight and quantity use unit code 8 and match. Algeria to China in 2024 is an Africa-to-Asia flow. Algeria returned no HS 2710 rows against Asia in 2023 and in 2025. Those missing years are not zero and must not be filled from 2024. China to Liberia in 2024 differs from 2023. No gasoline, diesel, gasoil, jet fuel, kerosene, or fuel-oil price is stored. Brent, Dubai, WTI, and the crude average are not refined-product prices and are not the HS 2710 customs unit value. Refinery output is absent, not zero. Türkiye to Morocco in 2025 has quantity 0 with unit code 8. That is a reported zero quantity in kilograms, not unit code -1, and it must not replace the net weight. Mozambique to the United Arab Emirates in 2023 has two kilogram weights that differ, so they must not be substituted. Nigeria to Singapore in 2025 has a null net weight and quantity 0 with unit code -1. Egypt to Saudi Arabia in 2023 has a net weight of zero, not null, and quantity 0 with unit code -1. Nigeria to Saudi Arabia in 2025 has both weight fields at 90,000 kg. That implied unit value is not a refined-product benchmark and was stored as reported. Gold trade is HS 7108 customs weight in kilograms, not troy ounces. The heading includes gold plated with platinum, unwrought forms, semi-manufactured forms, powder, and monetary gold. The six-digit parts are not stored separately. It is not precious-metal ores (HS 2616), not waste and scrap (HS 7112), and not jewelry (HS 7113). Ghana to the United Arab Emirates in 2024, 2023, and 2025 differ, so those years must not be substituted. Within each of those years the net weight and quantity both use unit code 8 and differ, so they must not be substituted. Ghana to India in 2024 also has two kilogram weights that differ. Burkina Faso to the United Arab Emirates in 2024 and Mali to the United Arab Emirates in 2024 each have matching kilogram weights. Tanzania to India in 2024 has a measured net weight and quantity 0 with unit code -1. Ghana to China in 2023 was kept and the two kilogram weights differ. Ghana to China in 2024 was reported under USD 1 million and is not kept. Ghana to China in 2025 returned no HS 7108 row. Those years must not be substituted. South Africa, Sudan, and Libya returned no HS 7108 rows against Asia in 2023, 2024, and 2025. Mali returned no HS 7108 rows against Asia in 2025. The United Arab Emirates returned no HS 7108 rows against Africa in 2024 and 2025. United Arab Emirates 2023 kept 15 flows, and those years must not be filled from 2023. Nigeria to the United Arab Emirates in 2025 has a null net weight and quantity 0 with unit code -1. Egypt to the United Arab Emirates in 2025 has matching kilogram weights. Uganda to the United Arab Emirates in 2025 has two kilogram weights that differ. A missing pair is not zero trade. The stored benchmark is gold, in US dollars per troy ounce. It is not silver, not platinum, and not the customs unit value. Silver is stored as its own series. Mine production is absent, not zero. Platinum trade is HS 711011, unwrought or in powder form, and HS 711019, other semi-manufactured forms. The two codes are stored separately and must not be added. They are not the HS 7110 heading, which also includes palladium, rhodium, iridium, osmium, and ruthenium. Palladium is stored separately as HS 711021 and HS 711029 and must not be added to these platinum codes. Rhodium is stored separately as HS 711031 and HS 711039 and must not be added to these platinum codes. Iridium, osmium, and ruthenium are stored separately as HS 711041 and HS 711049 and must not be added to platinum, palladium, or rhodium. A row is not iridium alone, not osmium alone, and not ruthenium alone. South Africa to Japan in 2024, 2023, and 2025 differ, so those years must not be substituted. Within each code and year the net weight and quantity use unit code 8 and match. South Africa to China in 2024 kept HS 711019 and returned no HS 711011 row. Zimbabwe returned no platinum rows against Asia in 2023 and 2025. Zimbabwe 2024 returned one row and kept none. Tanzania to India in 2024 kept both codes. Each has a measured net weight and quantity 0 with unit code -1. Tanzania returned no platinum rows in 2023. Tanzania to India in 2025 kept HS 711011 and reported HS 711019 under USD 1 million, so that code is not kept. Those years must not be substituted. The United Arab Emirates to South Africa in 2023 is the only kept Asia-to-Africa flow, and both weight fields are 146 kg, unit code 8. The United Arab Emirates returned no platinum rows against Africa in 2024 and 2025, so those years must not be filled from 2023. South Africa to India in 2023 for HS 711011 has matching kilogram weights. That implied unit value is not the platinum benchmark and was stored as reported. Customs weight is kilograms, not troy ounces. The stored benchmark is platinum, 99.95% minimum purity, plate or ingot form, in US dollars per troy ounce. It is not gold, not silver, not palladium, and not the customs unit value. The Pink Sheet has no palladium or rhodium series. Palladium trade is stored separately and is not this platinum price. A missing pair is not zero trade. Silver trade is HS 7106, the heading aggregate for silver, including silver plated with gold or platinum, unwrought or semi-manufactured forms, and powder. The six-digit parts are not stored separately. It is not precious-metal ores (HS 2616), not base metals clad with silver (HS 7107), not silver compounds (HS 2843), not waste and scrap (HS 7112), not jewelry (HS 7113), not gold (HS 7108), and not platinum (HS 711011 or HS 711019). Morocco to the United Arab Emirates in 2024, 2023, and 2025 differ, so those years must not be substituted. Within each year the net weight and quantity use unit code 8 and match. South Africa to India in 2024 and 2025 differ, so those years must not be substituted. Within each year the net weight and quantity use unit code 8 and match. South Africa to India in 2023 was reported under USD 1 million and is not kept. South Africa to the United Arab Emirates in 2023 and 2024 were reported under USD 1 million and are not kept. South Africa to the United Arab Emirates in 2025 was kept, and both weight fields match. South Africa to Hong Kong in 2024 was kept, and both weight fields match. Morocco to Türkiye in 2024 was reported under USD 1 million and is not kept. Customs weight is kilograms, not troy ounces. The stored benchmark is silver, 99.9% refined, London afternoon fixing, in US dollars per troy ounce. Prior to July 1976 the series was Handy & Harman. Grade prior to 1962 was unrefined silver. It is not gold, not platinum, not palladium, and not the HS 7106 customs unit value. A missing pair is not zero trade. Mine production is absent, not zero. Türkiye to Libya in 2025 is the only kept Türkiye flow. Its net weight and quantity both use unit code 8 and differ, so they must not be substituted. Türkiye kept no silver flows in 2023 or 2024. The United Arab Emirates kept three flows to Africa in 2023. The United Arab Emirates to Egypt in 2023 has matching kilogram weights. The United Arab Emirates returned no HS 7106 rows against Africa in 2024 and 2025, so those years must not be filled from 2023. Ghana to Korea in 2023 and 2024 each have a measured net weight and quantity 0 with unit code -1. Ghana returned no HS 7106 rows against Asia in 2025. Uganda to the United Arab Emirates in 2024 and 2025 each have two kilogram weights that differ. Tanzania to the United Arab Emirates in 2025 has a measured net weight and quantity 0 with unit code -1. China, India, Japan, and Korea returned HS 7106 rows and kept none. A reported row under USD 1 million is not zero trade. Palladium trade is the customs weight of HS 711021, unwrought or in powder form, and HS 711029, other semi-manufactured forms. The two codes are stored separately and must not be added. They are not the HS 7110 heading, not platinum (HS 711011 or HS 711019). Rhodium is stored separately as HS 711031 and HS 711039 and must not be added to these palladium codes. It is not iridium, osmium, and ruthenium (HS 711041 or HS 711049), not precious-metal ores (HS 2616), not waste and scrap (HS 7112), not jewelry (HS 7113), not gold (HS 7108), and not silver (HS 7106). South Africa to Japan in 2024, 2023, and 2025 differ, so those years must not be substituted. Within each code and year the net weight and quantity use unit code 8 and match. South Africa to China in 2024 kept both codes, and both weight fields match. South Africa to China in 2023 and 2025 kept HS 711029 and returned no HS 711021 row. Those years must not be filled from 2024. Zimbabwe and Botswana returned no palladium rows against Asia in 2023, 2024, and 2025. The only kept Asia-to-Africa flow is the United Arab Emirates unwrought palladium to South Africa in 2023, and both weight fields are 127 kg, unit code 8. The United Arab Emirates returned no palladium rows against Africa in 2024 and 2025, so those years must not be filled from 2023. South Africa to Singapore in 2023, 2024, and 2025 for HS 711021 was reported under USD 1 million and is not kept. South Africa to Vietnam in 2025 for HS 711021 was reported under USD 1 million, with quantity 0 and unit code -1, and is not kept. Customs weight is kilograms, not troy ounces. The Pink Sheet has no palladium series, so no palladium price is stored. The platinum benchmark is not a palladium price. A missing pair is not zero trade. Mine production is absent, not zero. Rhodium trade is the customs weight of HS 711031, unwrought or in powder form, and HS 711039, other semi-manufactured forms. The two codes are stored separately and must not be added. They are not the HS 7110 heading, not platinum, not palladium, and not iridium, osmium, and ruthenium. South Africa to Japan in 2024, 2023, and 2025 differ, so those years must not be substituted. Within each code and year the net weight and quantity use unit code 8 and match. South Africa unwrought rhodium to China in 2023 was under USD 1 million and is not stored. South Africa returned no rhodium row to China in 2024. South Africa unwrought rhodium to China in 2025 was kept. South Africa returned no semi-manufactured rhodium row to China in 2025. South Africa to India in 2023 has both weight fields at 3.8 kg. That row was stored as reported and was not corrected. It is not a rhodium benchmark. Zimbabwe returned no rhodium rows against Asia in 2023, 2024, and 2025. Those years must not be filled from South Africa. No Asia-to-Africa flow reached USD 1 million. The United Arab Emirates returned no rhodium rows against Africa in 2023, 2024, and 2025. Customs weight is kilograms, not troy ounces. The Pink Sheet has no rhodium series, so no rhodium price is stored. The platinum benchmark is not a rhodium price. A missing pair is not zero trade. Mine production is absent, not zero. Iridium, osmium, and ruthenium trade is the customs weight of HS 711041, unwrought or in powder form, and HS 711049, other semi-manufactured forms. The two codes are stored separately and must not be added. Each code is a combined customs category. A stored row is not iridium alone, not osmium alone, and not ruthenium alone. They are not the HS 7110 heading, not platinum, not palladium, and not rhodium. South Africa to Japan in 2024, 2023, and 2025 differ, so those years must not be substituted. Within each of those code-years the net weight and quantity use unit code 8 and match. South Africa unwrought HS 711041 to India in 2023 was kept. The same code to India in 2024 and 2025 was under USD 1 million and is not stored. Those years must not be substituted. Customs weight is kilograms, not troy ounces. The Pink Sheet has no iridium, osmium, or ruthenium series, so no price is stored. The platinum benchmark is not this customs unit value. A missing pair is not zero trade. Mine production is absent, not zero. The 12 November 2026 sweep kept 19 flows, all South Africa to Asia, 13 of HS 711041 and 6 of HS 711049. Every kept row has matching kilogram weights, unit code 8. No Asia-to-Africa flow reached USD 1 million. Zimbabwe and the United Arab Emirates returned no rows. China, India, and Rwanda returned rows under USD 1 million and those rows are not stored. Rwanda to China in 2024 has a null net weight and quantity 0 with unit code -1. India to Nigeria in 2024 has a net weight of 0, not null, and quantity 0 with unit code 8.",
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
      note: "Monthly international benchmarks. Tea is the Mombasa auction price. Tobacco is the US import unit value, and a missing month is not zero. Copper is the LME grade A cathode price, not copper ore. Phosphate rock is f.o.b. North Africa, not DAP, TSP, or urea. This extract has no cobalt series. Iron ore is 62% Fe fines, c.f.r. China, in US dollars per dry metric ton, not HS 2601 customs value. This extract has no manganese series. This extract has no chromium series. This extract has no bauxite series. Aluminum metal is not stored. This extract has no titanium ore, ilmenite, or rutile series. Brent is UK Brent, 38 API, and Dubai is Dubai Fateh, 32 API, both in US dollars per barrel. Neither is WTI, the equal-weighted average, or the HS 2709 customs unit value. Coal, South African is thermal coal, f.o.b. Richards Bay, NAR 6,000 kcal/kg, in US dollars per metric ton. It is not Australian Newcastle coal, not natural gas, and not the HS 2701 customs unit value. Gold is the spot average of daily rates, in US dollars per troy ounce. It is not silver, not platinum, and not the HS 7108 customs unit value. Silver is 99.9% refined, London afternoon fixing, in US dollars per troy ounce. Prior to July 1976 the series was Handy & Harman. It is not gold, not platinum, not palladium, and not the HS 7106 customs unit value. Platinum is 99.95% minimum purity, plate or ingot form, in US dollars per troy ounce. It is not gold, not silver, not palladium, and not the HS 711011 or HS 711019 customs unit value. The two platinum codes must not be added. The Pink Sheet has no palladium or rhodium series. No palladium price is stored. No rhodium price is stored. Palladium trade is HS 711021 and HS 711029, stored separately from platinum. Rhodium trade is HS 711031 and HS 711039, stored separately from platinum and palladium. The Pink Sheet has no iridium, osmium, or ruthenium series. No price is stored for HS 711041 or HS 711049. Those codes are a combined customs category, stored separately, and are not iridium alone. The platinum benchmark is not that customs unit value.",
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
