import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { pathToFileURL } from "node:url";
import {
  extraDatasetId,
  fishProductionDatasetId,
  fisheryDatasetId,
  fisheryProducts,
  rubberDatasetId,
  rubberProducts,
  groundnutDatasetId,
  groundnutProducts,
  maizeDatasetId,
  maizeProducts,
  tobaccoDatasetId,
  tobaccoProducts,
  sugarDatasetId,
  sugarProducts,
  phosphateDatasetId,
  phosphateProducts,
  copperDatasetId,
  copperProducts,
  cobaltDatasetId,
  cobaltProducts,
  ironDatasetId,
  ironProducts,
  manganeseDatasetId,
  manganeseProducts,
  chromiumDatasetId,
  chromiumProducts,
  bauxiteDatasetId,
  bauxiteProducts,
  titaniumDatasetId,
  titaniumProducts,
  crudeDatasetId,
  crudeProducts,
  coalDatasetId,
  coalProducts,
  gasDatasetId,
  gasProducts,
  refinedDatasetId,
  refinedProducts,
  goldDatasetId,
  goldProducts,
  platinumDatasetId,
  platinumProducts,
  horticultureDatasetId,
  horticultureProducts,
  marketDatasetId,
  specialtyDatasetId,
  specialtyProducts,
  paths,
  priceDatasetId,
  productionDatasetId,
  readJson,
  schema,
  snapshotDatasetId,
  tradeDatasetId,
  tradeProducts,
} from "./lib.mjs";

function insertDataset(db, row) {
  db.prepare(`
    INSERT INTO datasets (id, title, source, source_url, license, license_url, frequency, updated_at, retrieved_at, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.id,
    row.title,
    row.source,
    row.sourceUrl || "",
    row.license || "",
    row.licenseUrl || "",
    row.frequency || "",
    row.updatedAt || "",
    row.retrievedAt || "",
    row.note || "",
  );
}

export function buildDatabase() {
  fs.mkdirSync(paths.data, { recursive: true });
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = `${paths.database}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  const db = new DatabaseSync(paths.database);
  db.exec(schema);

  const wdi = readJson(paths.wdi);
  const observations = readJson(paths.observations);
  const market = readJson(paths.market);
  const extra = fs.existsSync(paths.wdiExtra) ? readJson(paths.wdiExtra) : null;
  const trade = fs.existsSync(paths.tradeFlows) ? readJson(paths.tradeFlows) : null;
  const horticulture = fs.existsSync(paths.tradeHorticulture) ? readJson(paths.tradeHorticulture) : null;
  const specialty = fs.existsSync(paths.tradeSpecialty) ? readJson(paths.tradeSpecialty) : null;
  const fishery = fs.existsSync(paths.tradeFishery) ? readJson(paths.tradeFishery) : null;
  const rubber = fs.existsSync(paths.tradeRubber) ? readJson(paths.tradeRubber) : null;
  const groundnuts = fs.existsSync(paths.tradeGroundnuts) ? readJson(paths.tradeGroundnuts) : null;
  const maize = fs.existsSync(paths.tradeMaize) ? readJson(paths.tradeMaize) : null;
  const tobacco = fs.existsSync(paths.tradeTobacco) ? readJson(paths.tradeTobacco) : null;
  const sugar = fs.existsSync(paths.tradeSugar) ? readJson(paths.tradeSugar) : null;
  const phosphate = fs.existsSync(paths.tradePhosphate) ? readJson(paths.tradePhosphate) : null;
  const copper = fs.existsSync(paths.tradeCopper) ? readJson(paths.tradeCopper) : null;
  const cobalt = fs.existsSync(paths.tradeCobalt) ? readJson(paths.tradeCobalt) : null;
  const iron = fs.existsSync(paths.tradeIron) ? readJson(paths.tradeIron) : null;
  const manganese = fs.existsSync(paths.tradeManganese) ? readJson(paths.tradeManganese) : null;
  const chromium = fs.existsSync(paths.tradeChromium) ? readJson(paths.tradeChromium) : null;
  const bauxite = fs.existsSync(paths.tradeBauxite) ? readJson(paths.tradeBauxite) : null;
  const titanium = fs.existsSync(paths.tradeTitanium) ? readJson(paths.tradeTitanium) : null;
  const crude = fs.existsSync(paths.tradeCrude) ? readJson(paths.tradeCrude) : null;
  const coal = fs.existsSync(paths.tradeCoal) ? readJson(paths.tradeCoal) : null;
  const gas = fs.existsSync(paths.tradeGas) ? readJson(paths.tradeGas) : null;
  const refined = fs.existsSync(paths.tradeRefined) ? readJson(paths.tradeRefined) : null;
  const gold = fs.existsSync(paths.tradeGold) ? readJson(paths.tradeGold) : null;
  const platinum = fs.existsSync(paths.tradePlatinum) ? readJson(paths.tradePlatinum) : null;
  const prices = fs.existsSync(paths.commodityPrices) ? readJson(paths.commodityPrices) : null;
  const production = fs.existsSync(paths.production) ? readJson(paths.production) : null;
  const fish = fs.existsSync(paths.fishProduction) ? readJson(paths.fishProduction) : null;

  insertDataset(db, {
    id: snapshotDatasetId,
    title: "Asia–Africa World Development Indicators snapshot",
    source: "World Bank — World Development Indicators",
    sourceUrl: "https://data.worldbank.org/",
    license: wdi.license,
    licenseUrl: wdi.licenseUrl,
    frequency: "Annual",
    updatedAt: wdi.sourceUpdatedAt,
    retrievedAt: wdi.retrievedAt,
    note: "Published observatory snapshot. Null source values are omitted.",
  });
  insertDataset(db, {
    id: marketDatasetId,
    title: "Historical product and service references",
    source: "Sources retained on each record",
    sourceUrl: "",
    license: "Source-specific terms apply",
    licenseUrl: "",
    frequency: "Published snapshot",
    updatedAt: market.asOf,
    retrievedAt: market.asOf,
    note: "Curated references and WDI trade proxies already shown in the market file.",
  });
  if (extra) {
    insertDataset(db, {
      id: extra.datasetId || extraDatasetId,
      title: extra.title,
      source: extra.source,
      sourceUrl: extra.sourceUrl,
      license: extra.license,
      licenseUrl: extra.licenseUrl,
      frequency: extra.frequency,
      updatedAt: extra.sourceUpdatedAt,
      retrievedAt: extra.retrievedAt,
      note: extra.note,
    });
  }
  if (trade) {
    insertDataset(db, {
      id: trade.datasetId || tradeDatasetId,
      title: trade.title,
      source: trade.source,
      sourceUrl: trade.sourceUrl,
      license: trade.license,
      licenseUrl: trade.licenseUrl,
      frequency: trade.frequency,
      updatedAt: trade.retrievedAt,
      retrievedAt: trade.retrievedAt,
      note: trade.note,
    });
  }
  if (prices) {
    insertDataset(db, {
      id: prices.datasetId || priceDatasetId,
      title: prices.title,
      source: prices.source,
      sourceUrl: prices.sourceUrl,
      license: prices.license,
      licenseUrl: prices.licenseUrl,
      frequency: prices.frequency,
      updatedAt: prices.sourceUpdatedAt || prices.retrievedAt,
      retrievedAt: prices.retrievedAt,
      note: prices.note,
    });
  }
  if (horticulture) {
    insertDataset(db, {
      id: horticulture.datasetId || horticultureDatasetId,
      title: horticulture.title,
      source: horticulture.source,
      sourceUrl: horticulture.sourceUrl,
      license: horticulture.license,
      licenseUrl: horticulture.licenseUrl,
      frequency: horticulture.frequency,
      updatedAt: horticulture.retrievedAt,
      retrievedAt: horticulture.retrievedAt,
      note: horticulture.note,
    });
  }
  if (specialty) {
    insertDataset(db, {
      id: specialty.datasetId || specialtyDatasetId,
      title: specialty.title,
      source: specialty.source,
      sourceUrl: specialty.sourceUrl,
      license: specialty.license,
      licenseUrl: specialty.licenseUrl,
      frequency: specialty.frequency,
      updatedAt: specialty.retrievedAt,
      retrievedAt: specialty.retrievedAt,
      note: specialty.note,
    });
  }
  if (fishery) {
    insertDataset(db, {
      id: fishery.datasetId || fisheryDatasetId,
      title: fishery.title,
      source: fishery.source,
      sourceUrl: fishery.sourceUrl,
      license: fishery.license,
      licenseUrl: fishery.licenseUrl,
      frequency: fishery.frequency,
      updatedAt: fishery.retrievedAt,
      retrievedAt: fishery.retrievedAt,
      note: fishery.note,
    });
  }
  if (rubber) {
    insertDataset(db, {
      id: rubber.datasetId || rubberDatasetId,
      title: rubber.title,
      source: rubber.source,
      sourceUrl: rubber.sourceUrl,
      license: rubber.license,
      licenseUrl: rubber.licenseUrl,
      frequency: rubber.frequency,
      updatedAt: rubber.retrievedAt,
      retrievedAt: rubber.retrievedAt,
      note: rubber.note,
    });
  }
  if (groundnuts) {
    insertDataset(db, {
      id: groundnuts.datasetId || groundnutDatasetId,
      title: groundnuts.title,
      source: groundnuts.source,
      sourceUrl: groundnuts.sourceUrl,
      license: groundnuts.license,
      licenseUrl: groundnuts.licenseUrl,
      frequency: groundnuts.frequency,
      updatedAt: groundnuts.retrievedAt,
      retrievedAt: groundnuts.retrievedAt,
      note: groundnuts.note,
    });
  }
  if (maize) {
    insertDataset(db, {
      id: maize.datasetId || maizeDatasetId,
      title: maize.title,
      source: maize.source,
      sourceUrl: maize.sourceUrl,
      license: maize.license,
      licenseUrl: maize.licenseUrl,
      frequency: maize.frequency,
      updatedAt: maize.retrievedAt,
      retrievedAt: maize.retrievedAt,
      note: maize.note,
    });
  }
  if (tobacco) {
    insertDataset(db, {
      id: tobacco.datasetId || tobaccoDatasetId,
      title: tobacco.title,
      source: tobacco.source,
      sourceUrl: tobacco.sourceUrl,
      license: tobacco.license,
      licenseUrl: tobacco.licenseUrl,
      frequency: tobacco.frequency,
      updatedAt: tobacco.retrievedAt,
      retrievedAt: tobacco.retrievedAt,
      note: tobacco.note,
    });
  }
  if (sugar) {
    insertDataset(db, {
      id: sugar.datasetId || sugarDatasetId,
      title: sugar.title,
      source: sugar.source,
      sourceUrl: sugar.sourceUrl,
      license: sugar.license,
      licenseUrl: sugar.licenseUrl,
      frequency: sugar.frequency,
      updatedAt: sugar.retrievedAt,
      retrievedAt: sugar.retrievedAt,
      note: sugar.note,
    });
  }
  if (phosphate) {
    insertDataset(db, {
      id: phosphate.datasetId || phosphateDatasetId,
      title: phosphate.title,
      source: phosphate.source,
      sourceUrl: phosphate.sourceUrl,
      license: phosphate.license,
      licenseUrl: phosphate.licenseUrl,
      frequency: phosphate.frequency,
      updatedAt: phosphate.retrievedAt,
      retrievedAt: phosphate.retrievedAt,
      note: phosphate.note,
    });
  }
  if (copper) {
    insertDataset(db, {
      id: copper.datasetId || copperDatasetId,
      title: copper.title,
      source: copper.source,
      sourceUrl: copper.sourceUrl,
      license: copper.license,
      licenseUrl: copper.licenseUrl,
      frequency: copper.frequency,
      updatedAt: copper.retrievedAt,
      retrievedAt: copper.retrievedAt,
      note: copper.note,
    });
  }
  if (cobalt) {
    insertDataset(db, {
      id: cobalt.datasetId || cobaltDatasetId,
      title: cobalt.title,
      source: cobalt.source,
      sourceUrl: cobalt.sourceUrl,
      license: cobalt.license,
      licenseUrl: cobalt.licenseUrl,
      frequency: cobalt.frequency,
      updatedAt: cobalt.retrievedAt,
      retrievedAt: cobalt.retrievedAt,
      note: cobalt.note,
    });
  }
  if (iron) {
    insertDataset(db, {
      id: iron.datasetId || ironDatasetId,
      title: iron.title,
      source: iron.source,
      sourceUrl: iron.sourceUrl,
      license: iron.license,
      licenseUrl: iron.licenseUrl,
      frequency: iron.frequency,
      updatedAt: iron.retrievedAt,
      retrievedAt: iron.retrievedAt,
      note: iron.note,
    });
  }
  if (manganese) {
    insertDataset(db, {
      id: manganese.datasetId || manganeseDatasetId,
      title: manganese.title,
      source: manganese.source,
      sourceUrl: manganese.sourceUrl,
      license: manganese.license,
      licenseUrl: manganese.licenseUrl,
      frequency: manganese.frequency,
      updatedAt: manganese.retrievedAt,
      retrievedAt: manganese.retrievedAt,
      note: manganese.note,
    });
  }
  if (chromium) {
    insertDataset(db, {
      id: chromium.datasetId || chromiumDatasetId,
      title: chromium.title,
      source: chromium.source,
      sourceUrl: chromium.sourceUrl,
      license: chromium.license,
      licenseUrl: chromium.licenseUrl,
      frequency: chromium.frequency,
      updatedAt: chromium.retrievedAt,
      retrievedAt: chromium.retrievedAt,
      note: chromium.note,
    });
  }
  if (bauxite) {
    insertDataset(db, {
      id: bauxite.datasetId || bauxiteDatasetId,
      title: bauxite.title,
      source: bauxite.source,
      sourceUrl: bauxite.sourceUrl,
      license: bauxite.license,
      licenseUrl: bauxite.licenseUrl,
      frequency: bauxite.frequency,
      updatedAt: bauxite.retrievedAt,
      retrievedAt: bauxite.retrievedAt,
      note: bauxite.note,
    });
  }
  if (titanium) {
    insertDataset(db, {
      id: titanium.datasetId || titaniumDatasetId,
      title: titanium.title,
      source: titanium.source,
      sourceUrl: titanium.sourceUrl,
      license: titanium.license,
      licenseUrl: titanium.licenseUrl,
      frequency: titanium.frequency,
      updatedAt: titanium.retrievedAt,
      retrievedAt: titanium.retrievedAt,
      note: titanium.note,
    });
  }
  if (crude) {
    insertDataset(db, {
      id: crude.datasetId || crudeDatasetId,
      title: crude.title,
      source: crude.source,
      sourceUrl: crude.sourceUrl,
      license: crude.license,
      licenseUrl: crude.licenseUrl,
      frequency: crude.frequency,
      updatedAt: crude.retrievedAt,
      retrievedAt: crude.retrievedAt,
      note: crude.note,
    });
  }
  if (coal) {
    insertDataset(db, {
      id: coal.datasetId || coalDatasetId,
      title: coal.title,
      source: coal.source,
      sourceUrl: coal.sourceUrl,
      license: coal.license,
      licenseUrl: coal.licenseUrl,
      frequency: coal.frequency,
      updatedAt: coal.retrievedAt,
      retrievedAt: coal.retrievedAt,
      note: coal.note,
    });
  }
  if (gas) {
    insertDataset(db, {
      id: gas.datasetId || gasDatasetId,
      title: gas.title,
      source: gas.source,
      sourceUrl: gas.sourceUrl,
      license: gas.license,
      licenseUrl: gas.licenseUrl,
      frequency: gas.frequency,
      updatedAt: gas.retrievedAt,
      retrievedAt: gas.retrievedAt,
      note: gas.note,
    });
  }
  if (refined) {
    insertDataset(db, {
      id: refined.datasetId || refinedDatasetId,
      title: refined.title,
      source: refined.source,
      sourceUrl: refined.sourceUrl,
      license: refined.license,
      licenseUrl: refined.licenseUrl,
      frequency: refined.frequency,
      updatedAt: refined.retrievedAt,
      retrievedAt: refined.retrievedAt,
      note: refined.note,
    });
  }
  if (gold) {
    insertDataset(db, {
      id: gold.datasetId || goldDatasetId,
      title: gold.title,
      source: gold.source,
      sourceUrl: gold.sourceUrl,
      license: gold.license,
      licenseUrl: gold.licenseUrl,
      frequency: gold.frequency,
      updatedAt: gold.retrievedAt,
      retrievedAt: gold.retrievedAt,
      note: gold.note,
    });
  }
  if (platinum) {
    insertDataset(db, {
      id: platinum.datasetId || platinumDatasetId,
      title: platinum.title,
      source: platinum.source,
      sourceUrl: platinum.sourceUrl,
      license: platinum.license,
      licenseUrl: platinum.licenseUrl,
      frequency: platinum.frequency,
      updatedAt: platinum.retrievedAt,
      retrievedAt: platinum.retrievedAt,
      note: platinum.note,
    });
  }
  if (production) {
    insertDataset(db, {
      id: production.datasetId || productionDatasetId,
      title: production.title,
      source: production.source,
      sourceUrl: production.sourceUrl,
      license: production.license,
      licenseUrl: production.licenseUrl,
      frequency: production.frequency,
      updatedAt: production.sourceUpdatedAt || production.retrievedAt,
      retrievedAt: production.retrievedAt,
      note: production.note,
    });
  }
  if (fish) {
    insertDataset(db, {
      id: fish.datasetId || fishProductionDatasetId,
      title: fish.title,
      source: fish.source,
      sourceUrl: fish.sourceUrl,
      license: fish.license,
      licenseUrl: fish.licenseUrl,
      frequency: fish.frequency,
      updatedAt: fish.sourceUpdatedAt || fish.retrievedAt,
      retrievedAt: fish.retrievedAt,
      note: fish.note,
    });
  }

  const insertCountry = db.prepare(`
    INSERT INTO countries (iso3, iso2, name, region, capital, income_group, lat, lon, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const country of wdi.countries) {
    insertCountry.run(country.iso3, country.iso2, country.name, country.region, country.capital, country.incomeGroup, country.lat, country.lon, country.sourceUrl);
  }

  const insertIndicator = db.prepare(`
    INSERT INTO indicators (
      code, name, label, unit, category, side, frequency, definition, source_organization, source_url, interpretation, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const indicator of wdi.indicators) {
    insertIndicator.run(
      indicator.code,
      indicator.name,
      indicator.label,
      indicator.unit,
      indicator.category,
      indicator.side,
      indicator.frequency,
      indicator.definition,
      indicator.sourceOrganization,
      indicator.sourceUrl,
      indicator.interpretation,
      snapshotDatasetId,
    );
  }
  for (const indicator of extra?.indicators || []) {
    insertIndicator.run(
      indicator.code,
      indicator.name,
      indicator.label,
      indicator.unit,
      indicator.category,
      indicator.side,
      "Annual",
      indicator.definition,
      indicator.sourceOrganization,
      indicator.sourceUrl,
      indicator.interpretation,
      extra.datasetId || extraDatasetId,
    );
  }

  const insertObservation = db.prepare(`
    INSERT INTO observations (country_iso3, indicator_code, year, value, status, decimal, dataset_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const countryIds = new Set(wdi.countries.map((country) => country.iso3));
  db.exec("BEGIN");
  for (const row of observations) {
    if (!countryIds.has(row.country) || row.value == null) continue;
    insertObservation.run(row.country, row.indicator, row.year, row.value, row.status || "", row.decimal ?? null, snapshotDatasetId);
  }
  for (const row of extra?.observations || []) {
    if (!countryIds.has(row.country) || row.value == null) continue;
    insertObservation.run(row.country, row.indicator, row.year, row.value, row.status || "", row.decimal ?? null, extra.datasetId || extraDatasetId);
  }
  db.exec("COMMIT");

  const insertProduct = db.prepare(`
    INSERT INTO hs_products (hs_code, name, category, observatory_product) VALUES (?, ?, ?, ?)
  `);
  const productList = [...tradeProducts, ...horticultureProducts, ...specialtyProducts, ...fisheryProducts, ...rubberProducts, ...groundnutProducts, ...maizeProducts, ...tobaccoProducts, ...sugarProducts, ...phosphateProducts, ...copperProducts, ...cobaltProducts, ...ironProducts, ...manganeseProducts, ...chromiumProducts, ...bauxiteProducts, ...titaniumProducts, ...crudeProducts, ...coalProducts, ...gasProducts, ...refinedProducts, ...goldProducts, ...platinumProducts];
  for (const product of productList) {
    insertProduct.run(product.hs, product.name, product.category, product.observatoryProduct);
  }

  const insertFlow = db.prepare(`
    INSERT OR REPLACE INTO trade_flows (
      reporter_iso3, partner_iso3, hs_code, year, flow, trade_value_usd, net_weight_kg, qty, qty_unit_code, query_key, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const knownHs = new Set(productList.map((product) => product.hs));
  function insertFlows(source, fallbackDatasetId) {
    for (const flow of source?.flows || []) {
      if (!countryIds.has(flow.reporterIso3) || !countryIds.has(flow.partnerIso3) || !knownHs.has(flow.hsCode)) continue;
      insertFlow.run(
        flow.reporterIso3,
        flow.partnerIso3,
        flow.hsCode,
        flow.year,
        flow.flow,
        flow.tradeValueUsd,
        flow.netWeightKg,
        flow.qty,
        flow.qtyUnitCode,
        flow.queryKey,
        source.datasetId || fallbackDatasetId,
      );
    }
  }
  db.exec("BEGIN");
  insertFlows(trade, tradeDatasetId);
  insertFlows(horticulture, horticultureDatasetId);
  insertFlows(specialty, specialtyDatasetId);
  insertFlows(fishery, fisheryDatasetId);
  insertFlows(rubber, rubberDatasetId);
  insertFlows(groundnuts, groundnutDatasetId);
  insertFlows(maize, maizeDatasetId);
  insertFlows(tobacco, tobaccoDatasetId);
  insertFlows(sugar, sugarDatasetId);
  insertFlows(phosphate, phosphateDatasetId);
  insertFlows(copper, copperDatasetId);
  insertFlows(cobalt, cobaltDatasetId);
  insertFlows(iron, ironDatasetId);
  insertFlows(manganese, manganeseDatasetId);
  insertFlows(chromium, chromiumDatasetId);
  insertFlows(bauxite, bauxiteDatasetId);
  insertFlows(titanium, titaniumDatasetId);
  insertFlows(crude, crudeDatasetId);
  insertFlows(coal, coalDatasetId);
  insertFlows(gas, gasDatasetId);
  insertFlows(refined, refinedDatasetId);
  insertFlows(gold, goldDatasetId);
  insertFlows(platinum, platinumDatasetId);
  db.exec("COMMIT");

  const insertQuery = db.prepare(`
    INSERT INTO collection_queries (
      dataset_id, query_key, reporter_iso3, year, status, http_status, row_count, kept_count, detail, finished_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  function insertQueries(source, fallbackDatasetId) {
    for (const [key, query] of Object.entries(source?.completedQueries || {})) {
      insertQuery.run(
        source.datasetId || fallbackDatasetId,
        key,
        query.reporterIso3,
        query.year,
        query.status,
        query.httpStatus,
        query.rowCount,
        query.keptCount,
        query.detail || "",
        query.finishedAt,
      );
    }
  }
  insertQueries(trade, tradeDatasetId);
  insertQueries(horticulture, horticultureDatasetId);
  insertQueries(specialty, specialtyDatasetId);
  insertQueries(fishery, fisheryDatasetId);
  insertQueries(rubber, rubberDatasetId);
  insertQueries(groundnuts, groundnutDatasetId);
  insertQueries(maize, maizeDatasetId);
  insertQueries(tobacco, tobaccoDatasetId);
  insertQueries(sugar, sugarDatasetId);
  insertQueries(phosphate, phosphateDatasetId);
  insertQueries(copper, copperDatasetId);
  insertQueries(cobalt, cobaltDatasetId);
  insertQueries(iron, ironDatasetId);
  insertQueries(manganese, manganeseDatasetId);
  insertQueries(chromium, chromiumDatasetId);
  insertQueries(bauxite, bauxiteDatasetId);
  insertQueries(titanium, titaniumDatasetId);
  insertQueries(crude, crudeDatasetId);
  insertQueries(coal, coalDatasetId);
  insertQueries(gas, gasDatasetId);
  insertQueries(refined, refinedDatasetId);
  insertQueries(gold, goldDatasetId);
  insertQueries(platinum, platinumDatasetId);

  const insertSeries = db.prepare(`
    INSERT INTO commodity_series (series, product, category, observatory_product, unit, detail)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const series of prices?.series || []) {
    insertSeries.run(series.series, series.product, series.category, series.observatoryProduct, series.unit, series.detail || "");
  }
  const insertPrice = db.prepare(`
    INSERT INTO commodity_prices (series, period, price, dataset_id) VALUES (?, ?, ?, ?)
  `);
  db.exec("BEGIN");
  for (const price of prices?.prices || []) {
    insertPrice.run(price.series, price.period, price.price, prices.datasetId || priceDatasetId);
  }
  db.exec("COMMIT");
  if (prices?.series?.some((series) => series.series === "Rubber, TSR20")) {
    const rubberPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Rubber, TSR20' AND period = '2026-09'
    `).get();
    if (!rubberPrice) throw new Error("September 2026 TSR20 rubber price is missing from the database.");
    if (Math.abs(rubberPrice.price - 2.41) > 0.001) {
      throw new Error(`TSR20 rubber price ${rubberPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Groundnuts")) {
    const groundnutPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Groundnuts' AND period = '2026-09'
    `).get();
    if (!groundnutPrice) throw new Error("September 2026 groundnut price is missing from the database.");
    if (Math.abs(groundnutPrice.price - 1563) > 0.001) {
      throw new Error(`Groundnut price ${groundnutPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Maize")) {
    const maizePrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Maize' AND period = '2026-09'
    `).get();
    if (!maizePrice) throw new Error("September 2026 maize price is missing from the database.");
    if (Math.abs(maizePrice.price - 239.6) > 0.001) {
      throw new Error(`Maize price ${maizePrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Tobacco, US import u.v.")) {
    const tobaccoPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Tobacco, US import u.v.' AND period = '2026-07'
    `).get();
    if (!tobaccoPrice) throw new Error("July 2026 tobacco price is missing from the database.");
    if (Math.abs(tobaccoPrice.price - 6775) > 0.001) {
      throw new Error(`Tobacco price ${tobaccoPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Sugar, world")) {
    const sugarPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Sugar, world' AND period = '2026-09'
    `).get();
    if (!sugarPrice) throw new Error("September 2026 world sugar price is missing from the database.");
    if (Math.abs(sugarPrice.price - 0.41) > 0.001) {
      throw new Error(`World sugar price ${sugarPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Phosphate rock")) {
    const phosphatePrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Phosphate rock' AND period = '2026-09'
    `).get();
    if (!phosphatePrice) throw new Error("September 2026 phosphate rock price is missing from the database.");
    if (Math.abs(phosphatePrice.price - 170) > 0.001) {
      throw new Error(`Phosphate rock price ${phosphatePrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Copper")) {
    const copperPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Copper' AND period = '2026-09'
    `).get();
    if (!copperPrice) throw new Error("September 2026 copper price is missing from the database.");
    if (Math.abs(copperPrice.price - 14474) > 0.001) {
      throw new Error(`Copper price ${copperPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Crude oil, Brent")) {
    const brent = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Crude oil, Brent' AND period = '2026-09'
    `).get();
    if (!brent) throw new Error("September 2026 Brent crude price is missing from the database.");
    if (Math.abs(brent.price - 116.8) > 0.001) {
      throw new Error(`Brent crude price ${brent.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Crude oil, Dubai")) {
    const dubai = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Crude oil, Dubai' AND period = '2026-09'
    `).get();
    if (!dubai) throw new Error("September 2026 Dubai crude price is missing from the database.");
    if (Math.abs(dubai.price - 93.3) > 0.001) {
      throw new Error(`Dubai crude price ${dubai.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  const excludedCrude = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series IN ('Crude oil, WTI', 'Crude oil, average')
  `).get();
  if (excludedCrude.n !== 0) {
    throw new Error("WTI or the Pink Sheet crude-oil average was stored. Those series are not the Africa–Asia benchmarks kept in this database.");
  }
  if (prices?.series?.some((series) => series.series === "Coal, South African")) {
    const coalPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Coal, South African' AND period = '2026-09'
    `).get();
    if (!coalPrice) throw new Error("September 2026 South African coal price is missing from the database.");
    if (Math.abs(coalPrice.price - 98.2) > 0.001) {
      throw new Error(`South African coal price ${coalPrice.price} does not match the 3 November 2026 Pink Sheet.`);
    }
  }
  const excludedCoal = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series = 'Coal, Australian'
  `).get();
  if (excludedCoal.n !== 0) {
    throw new Error("Australian coal was stored. That series is not the South African coal benchmark kept in this database.");
  }
  if (prices?.series?.some((series) => series.series === "Liquefied natural gas, Japan")) {
    const lng = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Liquefied natural gas, Japan' AND period = '2026-09'
    `).get();
    if (!lng) throw new Error("September 2026 Japan LNG price is missing from the database.");
    if (Math.abs(lng.price - 16.26) > 0.001) {
      throw new Error(`Japan LNG price ${lng.price} does not match the 3 November 2026 Pink Sheet.`);
    }
  }
  const excludedGas = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series IN (
      'Natural gas, US',
      'Natural gas, Europe',
      'Natural gas index'
    )
  `).get();
  if (excludedGas.n !== 0) {
    throw new Error("US natural gas, European natural gas, or the natural-gas index was stored. Those series are not the Japan LNG benchmark kept in this database.");
  }
  if (prices?.series?.some((series) => series.series === "Gold")) {
    const goldPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Gold' AND period = '2026-09'
    `).get();
    if (!goldPrice) throw new Error("September 2026 gold price is missing from the database.");
    if (Math.abs(goldPrice.price - 4319) > 0.001) {
      throw new Error(`Gold price ${goldPrice.price} does not match the 3 November 2026 Pink Sheet.`);
    }
    const goldMonths = db.prepare(`
      SELECT COUNT(*) AS n, MIN(period) AS firstPeriod, MAX(period) AS lastPeriod
      FROM commodity_prices WHERE series = 'Gold'
    `).get();
    if (goldMonths.n !== 142 || goldMonths.firstPeriod !== "2015-01" || goldMonths.lastPeriod !== "2026-10") {
      throw new Error(`Gold price coverage ${goldMonths.n} from ${goldMonths.firstPeriod} to ${goldMonths.lastPeriod} is not the 2015-01 through 2026-10 series.`);
    }
  }
  const excludedPrecious = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series IN ('Silver', 'Palladium', 'Rhodium')
  `).get();
  if (excludedPrecious.n) {
    throw new Error("Silver, palladium, or rhodium was stored. Those series are not the gold or platinum benchmark kept in this database.");
  }
  if (prices?.series?.some((series) => series.series === "Platinum")) {
    const platinumPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Platinum' AND period = '2026-09'
    `).get();
    if (!platinumPrice) throw new Error("September 2026 platinum price is missing from the database.");
    if (Math.abs(platinumPrice.price - 1784) > 0.001) {
      throw new Error(`Platinum price ${platinumPrice.price} does not match the 3 November 2026 Pink Sheet.`);
    }
    const platinumMonths = db.prepare(`
      SELECT COUNT(*) AS n, MIN(period) AS firstPeriod, MAX(period) AS lastPeriod
      FROM commodity_prices WHERE series = 'Platinum'
    `).get();
    if (platinumMonths.n !== 142 || platinumMonths.firstPeriod !== "2015-01" || platinumMonths.lastPeriod !== "2026-10") {
      throw new Error(`Platinum price coverage ${platinumMonths.n} from ${platinumMonths.firstPeriod} to ${platinumMonths.lastPeriod} is not the 2015-01 through 2026-10 series.`);
    }
  }
  if (prices?.series?.some((series) => series.series === "Iron ore, cfr spot")) {
    const ironPrice = db.prepare(`
      SELECT price FROM commodity_prices WHERE series = 'Iron ore, cfr spot' AND period = '2026-09'
    `).get();
    if (!ironPrice) throw new Error("September 2026 iron ore price is missing from the database.");
    if (Math.abs(ironPrice.price - 97.7) > 0.001) {
      throw new Error(`Iron ore price ${ironPrice.price} does not match the 2 October 2026 Pink Sheet.`);
    }
  }
  const metalNotOre = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series LIKE '%auxite%' OR series = 'Aluminum' OR series = 'Aluminium'
  `).get();
  if (metalNotOre.n !== 0) {
    throw new Error("Bauxite or aluminum metal was stored as a price series. The Pink Sheet Aluminum series is metal, not HS 2606.");
  }
  const titaniumPrice = db.prepare(`
    SELECT COUNT(*) AS n FROM commodity_series
    WHERE series LIKE '%itanium%' OR series LIKE '%lmenite%' OR series LIKE '%utile%'
  `).get();
  if (titaniumPrice.n !== 0) {
    throw new Error("A titanium, ilmenite, or rutile series was stored as a price. This Pink Sheet extract has no titanium-ore benchmark.");
  }

  const insertProductionItem = db.prepare(`
    INSERT INTO production_items (item_code, name, category, observatory_product, detail)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const item of [...(production?.items || []), ...(fish?.items || [])]) {
    insertProductionItem.run(item.itemCode, item.name, item.category, item.observatoryProduct, item.detail || "");
  }
  const insertProduction = db.prepare(`
    INSERT INTO production (
      country_iso3, item_code, element_code, element_name, year, value, unit, flag, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const productionItems = new Set([...(production?.items || []), ...(fish?.items || [])].map((item) => item.itemCode));
  db.exec("BEGIN");
  for (const row of production?.rows || []) {
    if (!countryIds.has(row.country) || !productionItems.has(row.itemCode) || row.value == null) continue;
    insertProduction.run(
      row.country,
      row.itemCode,
      row.elementCode,
      row.element,
      row.year,
      row.value,
      row.unit,
      row.flag || "",
      production.datasetId || productionDatasetId,
    );
  }
  for (const row of fish?.rows || []) {
    if (!countryIds.has(row.country) || !productionItems.has(row.itemCode) || row.value == null) continue;
    insertProduction.run(
      row.country,
      row.itemCode,
      row.elementCode,
      row.element,
      row.year,
      row.value,
      row.unit,
      row.flag || "",
      fish.datasetId || fishProductionDatasetId,
    );
  }
  db.exec("COMMIT");
  if (production) {
    const teaLeaves = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'KEN' AND item_code = '667' AND element_code = '5510' AND year = 2023
    `).get();
    if (!teaLeaves) throw new Error("Kenya 2023 tea-leaf production is missing from the database.");
    if (teaLeaves.value !== 2577800 || teaLeaves.unit !== "t" || teaLeaves.flag !== "A") {
      throw new Error(`Kenya tea-leaf production ${teaLeaves.value} ${teaLeaves.unit} flag ${teaLeaves.flag} does not match the FAOSTAT extract.`);
    }
    const rubberOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'CIV' AND item_code = '836' AND element_code = '5510' AND year = 2023
    `).get();
    if (!rubberOutput) throw new Error("Côte d'Ivoire 2023 natural rubber production is missing from the database.");
    if (rubberOutput.value !== 1624824 || rubberOutput.unit !== "t" || rubberOutput.flag !== "A") {
      throw new Error(`Côte d'Ivoire rubber ${rubberOutput.value} ${rubberOutput.unit} flag ${rubberOutput.flag} does not match the FAOSTAT extract.`);
    }
    const groundnutOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'SEN' AND item_code = '242' AND element_code = '5510' AND year = 2023
    `).get();
    if (!groundnutOutput) throw new Error("Senegal 2023 groundnut production is missing from the database.");
    if (groundnutOutput.value !== 1675329 || groundnutOutput.unit !== "t" || groundnutOutput.flag !== "A") {
      throw new Error(`Senegal groundnuts ${groundnutOutput.value} ${groundnutOutput.unit} flag ${groundnutOutput.flag} does not match the FAOSTAT extract.`);
    }
    const maizeOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'ZAF' AND item_code = '56' AND element_code = '5510' AND year = 2023
    `).get();
    if (!maizeOutput) throw new Error("South Africa 2023 maize production is missing from the database.");
    if (maizeOutput.value !== 16430000 || maizeOutput.unit !== "t" || maizeOutput.flag !== "A") {
      throw new Error(`South Africa maize ${maizeOutput.value} ${maizeOutput.unit} flag ${maizeOutput.flag} does not match the FAOSTAT extract.`);
    }
    const tobaccoOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'ZWE' AND item_code = '826' AND element_code = '5510' AND year = 2023
    `).get();
    if (!tobaccoOutput) throw new Error("Zimbabwe 2023 unmanufactured tobacco production is missing from the database.");
    if (Math.abs(tobaccoOutput.value - 194828.2) > 0.001 || tobaccoOutput.unit !== "t" || tobaccoOutput.flag !== "A") {
      throw new Error(`Zimbabwe tobacco ${tobaccoOutput.value} ${tobaccoOutput.unit} flag ${tobaccoOutput.flag} does not match the FAOSTAT extract.`);
    }
    const caneOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'IND' AND item_code = '156' AND element_code = '5510' AND year = 2023
    `).get();
    if (!caneOutput) throw new Error("India 2023 sugar-cane production is missing from the database.");
    if (Math.abs(caneOutput.value - 490533351.06) > 0.001 || caneOutput.unit !== "t" || caneOutput.flag !== "A") {
      throw new Error(`India sugar cane ${caneOutput.value} ${caneOutput.unit} flag ${caneOutput.flag} does not match the FAOSTAT extract.`);
    }
    const beetOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'CHN' AND item_code = '157' AND element_code = '5510' AND year = 2023
    `).get();
    if (!beetOutput) throw new Error("China 2023 sugar-beet production is missing from the database.");
    if (beetOutput.value !== 9160200 || beetOutput.unit !== "t" || beetOutput.flag !== "A") {
      throw new Error(`China sugar beet ${beetOutput.value} ${beetOutput.unit} flag ${beetOutput.flag} does not match the FAOSTAT extract.`);
    }
    const rawSugarOutput = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'ZAF' AND item_code = '162' AND element_code = '5510' AND year = 2023
    `).get();
    if (!rawSugarOutput) throw new Error("South Africa 2023 raw sugar production is missing from the database.");
    if (rawSugarOutput.value !== 2075000 || rawSugarOutput.unit !== "t" || rawSugarOutput.flag !== "A") {
      throw new Error(`South Africa raw sugar ${rawSugarOutput.value} ${rawSugarOutput.unit} flag ${rawSugarOutput.flag} does not match the FAOSTAT extract.`);
    }
  }
  if (fish) {
    const egyptAqua = db.prepare(`
      SELECT value, unit, flag FROM production
      WHERE country_iso3 = 'EGY' AND item_code = 'FISH-AQUA' AND element_code = 'Q_tlw' AND year = 2022
    `).get();
    if (!egyptAqua) throw new Error("Egypt 2022 aquaculture production is missing from the database.");
    if (egyptAqua.value !== 1552430 || egyptAqua.unit !== "t" || egyptAqua.flag !== "AI") {
      throw new Error(`Egypt aquaculture ${egyptAqua.value} ${egyptAqua.unit} flag ${egyptAqua.flag} does not match the FishStat extract.`);
    }
  }

  const insertRecord = db.prepare(`
    INSERT INTO market_records (
      id, country, iso2, region, category, product, side, indicator_type, value, unit, period,
      origin, target, summary, source_url, source, checked_at, hs_code, record_type, dataset_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const record of market.records) {
    insertRecord.run(
      record.id,
      record.country,
      record.iso2,
      record.region,
      record.category,
      record.product,
      record.side,
      record.indicatorType,
      typeof record.value === "number" ? record.value : null,
      record.unit,
      record.period,
      record.origin,
      record.target,
      record.summary,
      record.sourceUrl,
      record.source,
      record.checkedAt,
      record.hsCode,
      record.type,
      marketDatasetId,
    );
  }
  const insertCorridor = db.prepare(`
    INSERT INTO published_corridors (origin, target, product, hs_code, period, value_usd, quantity_kg, reporter, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const corridor of market.corridors) {
    insertCorridor.run(
      corridor.origin,
      corridor.target,
      corridor.product,
      corridor.hsCode,
      corridor.period,
      corridor.valueUSD,
      corridor.quantityKg,
      corridor.reporter,
      corridor.sourceUrl,
    );
  }

  const sesameQuery = specialty?.completedQueries?.["NGA:2024"];
  if (sesameQuery?.status === "ok") {
    const sesame = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'CHN' AND hs_code = '120740' AND year = 2024 AND flow = 'export'
    `).get();
    if (!sesame) throw new Error("Nigeria 2024 sesame export to China is missing from the database.");
    if (Math.abs(sesame.trade_value_usd - 144016173.881) > 1) {
      throw new Error(`Nigeria sesame value ${sesame.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (sesame.net_weight_kg !== 115969260) {
      throw new Error(`Nigeria sesame quantity ${sesame.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const groundnutQuery = groundnuts?.completedQueries?.["SEN:2024"];
  if (groundnutQuery?.status === "ok") {
    const groundnutTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'SEN' AND partner_iso3 = 'CHN' AND hs_code = '1202' AND year = 2024 AND flow = 'export'
    `).get();
    if (!groundnutTrade) throw new Error("Senegal 2024 groundnut export to China is missing from the database.");
    if (Math.abs(groundnutTrade.trade_value_usd - 92525200.621) > 1) {
      throw new Error(`Senegal groundnut value ${groundnutTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (groundnutTrade.net_weight_kg !== 101953500) {
      throw new Error(`Senegal groundnut quantity ${groundnutTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const maizeQuery = maize?.completedQueries?.["ZAF:2023"];
  if (maizeQuery?.status === "ok") {
    const maizeTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'KOR' AND hs_code = '1005' AND year = 2023 AND flow = 'export'
    `).get();
    if (!maizeTrade) throw new Error("South Africa 2023 maize export to Korea is missing from the database.");
    if (Math.abs(maizeTrade.trade_value_usd - 160080574.428) > 1) {
      throw new Error(`South Africa maize value ${maizeTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (maizeTrade.net_weight_kg !== 601540980) {
      throw new Error(`South Africa maize quantity ${maizeTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const tobaccoQuery = tobacco?.completedQueries?.["ZWE:2024"];
  if (tobaccoQuery?.status === "ok") {
    const tobaccoTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'ZWE' AND partner_iso3 = 'CHN' AND hs_code = '2401' AND year = 2024 AND flow = 'export'
    `).get();
    if (!tobaccoTrade) throw new Error("Zimbabwe 2024 unmanufactured tobacco export to China is missing from the database.");
    if (Math.abs(tobaccoTrade.trade_value_usd - 627946907.139) > 1) {
      throw new Error(`Zimbabwe tobacco value ${tobaccoTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (tobaccoTrade.net_weight_kg !== 68738674) {
      throw new Error(`Zimbabwe tobacco quantity ${tobaccoTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const sugarQuery = sugar?.completedQueries?.["IND:2024"];
  if (sugarQuery?.status === "ok") {
    const sugarTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'IND' AND partner_iso3 = 'LBY' AND hs_code = '1701' AND year = 2024 AND flow = 'export'
    `).get();
    if (!sugarTrade) throw new Error("India 2024 sugar export to Libya is missing from the database.");
    if (Math.abs(sugarTrade.trade_value_usd - 295754311.572) > 1) {
      throw new Error(`India sugar value ${sugarTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (sugarTrade.net_weight_kg !== 476420000) {
      throw new Error(`India sugar quantity ${sugarTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const phosphateQuery = phosphate?.completedQueries?.["MAR:2024"];
  if (phosphateQuery?.status === "ok") {
    const phosphateTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'MAR' AND partner_iso3 = 'IND' AND hs_code = '2510' AND year = 2024 AND flow = 'export'
    `).get();
    if (!phosphateTrade) throw new Error("Morocco 2024 phosphate rock export to India is missing from the database.");
    if (Math.abs(phosphateTrade.trade_value_usd - 217187614.907) > 1) {
      throw new Error(`Morocco phosphate value ${phosphateTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (phosphateTrade.net_weight_kg !== 1826611000) {
      throw new Error(`Morocco phosphate quantity ${phosphateTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const copperQuery = copper?.completedQueries?.["COD:2024"];
  if (copperQuery?.status === "ok") {
    const copperTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'COD' AND partner_iso3 = 'CHN' AND hs_code = '740311' AND year = 2024 AND flow = 'export'
    `).get();
    if (!copperTrade) throw new Error("DRC 2024 refined copper cathode export to China is missing from the database.");
    if (Math.abs(copperTrade.trade_value_usd - 14303219693.7) > 1) {
      throw new Error(`DRC copper cathode value ${copperTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (copperTrade.net_weight_kg !== 1559389994) {
      throw new Error(`DRC copper cathode quantity ${copperTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
    const copperOre = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'COD' AND partner_iso3 = 'CHN' AND hs_code = '2603' AND year = 2024 AND flow = 'export'
    `).get();
    if (!copperOre) throw new Error("DRC 2024 copper-ore export to China is missing from the database.");
    if (Math.abs(copperOre.trade_value_usd - 2141522675.196) > 1) {
      throw new Error(`DRC copper-ore value ${copperOre.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (copperOre.net_weight_kg !== 725941930.5) {
      throw new Error(`DRC copper-ore quantity ${copperOre.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const chromiumQuery = chromium?.completedQueries?.["ZAF:2024"];
  if (chromiumQuery?.status === "ok") {
    const chromiumTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'CHN' AND hs_code = '2610' AND year = 2024 AND flow = 'export'
    `).get();
    if (!chromiumTrade) throw new Error("South Africa 2024 chromium-ore export to China is missing from the database.");
    if (Math.abs(chromiumTrade.trade_value_usd - 2245975887.595) > 1) {
      throw new Error(`South Africa chromium-ore value ${chromiumTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (chromiumTrade.net_weight_kg !== 10112636146.12) {
      throw new Error(`South Africa chromium-ore quantity ${chromiumTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const bauxiteQuery = bauxite?.completedQueries?.["GHA:2024"];
  if (bauxiteQuery?.status === "ok") {
    const bauxiteTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'GHA' AND partner_iso3 = 'CHN' AND hs_code = '2606' AND year = 2024 AND flow = 'export'
    `).get();
    if (!bauxiteTrade) throw new Error("Ghana 2024 bauxite export to China is missing from the database.");
    if (Math.abs(bauxiteTrade.trade_value_usd - 44973457.13) > 1) {
      throw new Error(`Ghana bauxite value ${bauxiteTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (bauxiteTrade.net_weight_kg !== 1086922960) {
      throw new Error(`Ghana bauxite net weight ${bauxiteTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (bauxiteTrade.qty !== 948613378.03) {
      throw new Error(`Ghana bauxite quantity ${bauxiteTrade.qty} does not match the Comtrade preview.`);
    }
    if (bauxiteTrade.qty_unit_code !== 8) {
      throw new Error(`Ghana bauxite quantity unit ${bauxiteTrade.qty_unit_code} is not kilograms.`);
    }
  }

  const titaniumQuery = titanium?.completedQueries?.["MOZ:2024"];
  if (titaniumQuery?.status === "ok") {
    const titaniumTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'CHN' AND hs_code = '2614' AND year = 2024 AND flow = 'export'
    `).get();
    if (!titaniumTrade) throw new Error("Mozambique 2024 titanium-ore export to China is missing from the database.");
    if (Math.abs(titaniumTrade.trade_value_usd - 148311867.3) > 1) {
      throw new Error(`Mozambique titanium-ore value ${titaniumTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (titaniumTrade.net_weight_kg !== 743042000) {
      throw new Error(`Mozambique titanium-ore net weight ${titaniumTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (titaniumTrade.qty !== 743042000) {
      throw new Error(`Mozambique titanium-ore quantity ${titaniumTrade.qty} does not match the Comtrade preview.`);
    }
    if (titaniumTrade.qty_unit_code !== 8) {
      throw new Error(`Mozambique titanium-ore quantity unit ${titaniumTrade.qty_unit_code} is not kilograms.`);
    }
  }

  const titanium2023 = titanium?.completedQueries?.["MOZ:2023"];
  if (titanium2023?.status === "ok") {
    const earlier = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'CHN' AND hs_code = '2614' AND year = 2023 AND flow = 'export'
    `).get();
    if (!earlier) throw new Error("Mozambique 2023 titanium-ore export to China is missing from the database.");
    if (Math.abs(earlier.trade_value_usd - 194785000) > 1) {
      throw new Error(`Mozambique 2023 titanium-ore value ${earlier.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (earlier.net_weight_kg !== 710696200) {
      throw new Error(`Mozambique 2023 titanium-ore net weight ${earlier.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (earlier.qty !== 706982300) {
      throw new Error(`Mozambique 2023 titanium-ore quantity ${earlier.qty} does not match the Comtrade preview.`);
    }
    if (earlier.qty_unit_code !== 8) {
      throw new Error(`Mozambique 2023 titanium-ore quantity unit ${earlier.qty_unit_code} is not kilograms.`);
    }
  }

  const crudeQuery = crude?.completedQueries?.["AGO:2024"];
  if (crudeQuery?.status === "ok") {
    const crudeTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'AGO' AND partner_iso3 = 'CHN' AND hs_code = '2709' AND year = 2024 AND flow = 'export'
    `).get();
    if (!crudeTrade) throw new Error("Angola 2024 crude petroleum export to China is missing from the database.");
    if (Math.abs(crudeTrade.trade_value_usd - 16194452099.296) > 1) {
      throw new Error(`Angola crude value ${crudeTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (crudeTrade.net_weight_kg !== 32504672805.96) {
      throw new Error(`Angola crude net weight ${crudeTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (crudeTrade.qty !== 32504672805.96) {
      throw new Error(`Angola crude quantity ${crudeTrade.qty} does not match the Comtrade preview.`);
    }
    if (crudeTrade.qty_unit_code !== 8) {
      throw new Error(`Angola crude quantity unit ${crudeTrade.qty_unit_code} is not kilograms.`);
    }
  }

  const crude2023 = crude?.completedQueries?.["AGO:2023"];
  if (crude2023?.status === "ok") {
    const earlierCrude = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'AGO' AND partner_iso3 = 'CHN' AND hs_code = '2709' AND year = 2023 AND flow = 'export'
    `).get();
    if (!earlierCrude) throw new Error("Angola 2023 crude petroleum export to China is missing from the database.");
    if (Math.abs(earlierCrude.trade_value_usd - 17854239529.849) > 1) {
      throw new Error(`Angola 2023 crude value ${earlierCrude.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (earlierCrude.net_weight_kg !== 35081000457) {
      throw new Error(`Angola 2023 crude net weight ${earlierCrude.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (earlierCrude.qty !== 35081000457) {
      throw new Error(`Angola 2023 crude quantity ${earlierCrude.qty} does not match the Comtrade preview.`);
    }
    if (earlierCrude.qty_unit_code !== 8) {
      throw new Error(`Angola 2023 crude quantity unit ${earlierCrude.qty_unit_code} is not kilograms.`);
    }
  }

  const mozambiqueCrude = crude?.completedQueries?.["MOZ:2023"];
  if (mozambiqueCrude?.status === "ok") {
    const mozambique = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'CHN' AND hs_code = '2709' AND year = 2023 AND flow = 'export'
    `).get();
    if (!mozambique) throw new Error("Mozambique 2023 crude petroleum export to China is missing from the database.");
    if (Math.abs(mozambique.trade_value_usd - 72838000) > 1) {
      throw new Error(`Mozambique crude value ${mozambique.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (mozambique.net_weight_kg !== null) {
      throw new Error(`Mozambique crude net weight ${mozambique.net_weight_kg} is not null.`);
    }
    if (mozambique.qty !== 101029276.632) {
      throw new Error(`Mozambique crude quantity ${mozambique.qty} does not match the Comtrade preview.`);
    }
    if (mozambique.qty_unit_code !== 8) {
      throw new Error(`Mozambique crude quantity unit ${mozambique.qty_unit_code} is not kilograms.`);
    }
  }

  const nigeriaCrude = crude?.completedQueries?.["NGA:2025"];
  if (nigeriaCrude?.status === "ok") {
    const nigeria = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'IND' AND hs_code = '2709' AND year = 2025 AND flow = 'export'
    `).get();
    if (!nigeria) throw new Error("Nigeria 2025 crude petroleum export to India is missing from the database.");
    if (Math.abs(nigeria.trade_value_usd - 2816967484.864) > 1) {
      throw new Error(`Nigeria 2025 crude value ${nigeria.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (nigeria.net_weight_kg !== null) {
      throw new Error(`Nigeria 2025 crude net weight ${nigeria.net_weight_kg} is not null.`);
    }
    if (nigeria.qty !== 0) {
      throw new Error(`Nigeria 2025 crude quantity ${nigeria.qty} is not the reported zero.`);
    }
    if (nigeria.qty_unit_code !== -1) {
      throw new Error(`Nigeria 2025 crude quantity unit ${nigeria.qty_unit_code} is not the unspecified code -1.`);
    }
  }

  const coalQuery = coal?.completedQueries?.["ZAF:2024"];
  if (coalQuery?.status === "ok") {
    const coalTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'IND' AND hs_code = '2701' AND year = 2024 AND flow = 'export'
    `).get();
    if (!coalTrade) throw new Error("South Africa 2024 coal export to India is missing from the database.");
    if (Math.abs(coalTrade.trade_value_usd - 2780458353.603) > 1) {
      throw new Error(`South Africa coal value ${coalTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (coalTrade.net_weight_kg !== 32455066678) {
      throw new Error(`South Africa coal net weight ${coalTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (coalTrade.qty !== 32455066678) {
      throw new Error(`South Africa coal quantity ${coalTrade.qty} does not match the Comtrade preview.`);
    }
    if (coalTrade.qty_unit_code !== 8) {
      throw new Error(`South Africa coal quantity unit ${coalTrade.qty_unit_code} is not kilograms.`);
    }
    const vietnamCoal = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'VNM' AND hs_code = '2701' AND year = 2024 AND flow = 'export'
    `).get();
    if (!vietnamCoal) throw new Error("South Africa 2024 coal export to Vietnam is missing from the database.");
    if (Math.abs(vietnamCoal.trade_value_usd - 410235810.299) > 1) {
      throw new Error(`South Africa coal value to Vietnam ${vietnamCoal.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (vietnamCoal.net_weight_kg !== null) {
      throw new Error(`South Africa coal net weight to Vietnam ${vietnamCoal.net_weight_kg} is not null.`);
    }
    if (vietnamCoal.qty !== 0) {
      throw new Error(`South Africa coal quantity to Vietnam ${vietnamCoal.qty} is not the reported zero.`);
    }
    if (vietnamCoal.qty_unit_code !== -1) {
      throw new Error(`South Africa coal quantity unit to Vietnam ${vietnamCoal.qty_unit_code} is not the unspecified code -1.`);
    }
  }
  const coal2023 = coal?.completedQueries?.["ZAF:2023"];
  if (coal2023?.status === "ok") {
    const earlierCoal = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'IND' AND hs_code = '2701' AND year = 2023 AND flow = 'export'
    `).get();
    if (!earlierCoal) throw new Error("South Africa 2023 coal export to India is missing from the database.");
    if (Math.abs(earlierCoal.trade_value_usd - 3155773716.936) > 1) {
      throw new Error(`South Africa 2023 coal value ${earlierCoal.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (earlierCoal.net_weight_kg !== 30275549025) {
      throw new Error(`South Africa 2023 coal net weight ${earlierCoal.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (earlierCoal.qty !== 30275549025) {
      throw new Error(`South Africa 2023 coal quantity ${earlierCoal.qty} does not match the Comtrade preview.`);
    }
    if (earlierCoal.qty_unit_code !== 8) {
      throw new Error(`South Africa 2023 coal quantity unit ${earlierCoal.qty_unit_code} is not kilograms.`);
    }
  }
  const mozambiqueCoal = coal?.completedQueries?.["MOZ:2023"];
  if (mozambiqueCoal?.status === "ok") {
    const mozambique = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'IND' AND hs_code = '2701' AND year = 2023 AND flow = 'export'
    `).get();
    if (!mozambique) throw new Error("Mozambique 2023 coal export to India is missing from the database.");
    if (Math.abs(mozambique.trade_value_usd - 570030000) > 1) {
      throw new Error(`Mozambique coal value ${mozambique.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (mozambique.net_weight_kg !== 5023953000) {
      throw new Error(`Mozambique coal net weight ${mozambique.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (mozambique.qty !== 5363920000) {
      throw new Error(`Mozambique coal quantity ${mozambique.qty} does not match the Comtrade preview.`);
    }
    if (mozambique.qty_unit_code !== 8) {
      throw new Error(`Mozambique coal quantity unit ${mozambique.qty_unit_code} is not kilograms.`);
    }
  }

  const gasQuery = gas?.completedQueries?.["DZA:2024"];
  if (gasQuery?.status === "ok") {
    const algeriaGas = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'DZA' AND partner_iso3 = 'TUR' AND hs_code = '2711' AND year = 2024 AND flow = 'export'
    `).get();
    if (!algeriaGas) throw new Error("Algeria 2024 petroleum-gas export to Türkiye is missing from the database.");
    if (Math.abs(algeriaGas.trade_value_usd - 3074125894.613) > 1) {
      throw new Error(`Algeria petroleum-gas value ${algeriaGas.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (algeriaGas.net_weight_kg !== 4438707018.107) {
      throw new Error(`Algeria petroleum-gas net weight ${algeriaGas.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (algeriaGas.qty !== 4438707018.107) {
      throw new Error(`Algeria petroleum-gas quantity ${algeriaGas.qty} does not match the Comtrade preview.`);
    }
    if (algeriaGas.qty_unit_code !== 8) {
      throw new Error(`Algeria petroleum-gas quantity unit ${algeriaGas.qty_unit_code} is not kilograms.`);
    }
  }

  const nigeriaGas = gas?.completedQueries?.["NGA:2024"];
  if (nigeriaGas?.status === "ok") {
    const nigeria = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'IND' AND hs_code = '2711' AND year = 2024 AND flow = 'export'
    `).get();
    if (!nigeria) throw new Error("Nigeria 2024 petroleum-gas export to India is missing from the database.");
    if (Math.abs(nigeria.trade_value_usd - 1478396111.781) > 1) {
      throw new Error(`Nigeria petroleum-gas value ${nigeria.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (nigeria.net_weight_kg !== 71917476) {
      throw new Error(`Nigeria petroleum-gas net weight ${nigeria.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (nigeria.qty !== 71917476) {
      throw new Error(`Nigeria petroleum-gas quantity ${nigeria.qty} does not match the Comtrade preview.`);
    }
    if (nigeria.qty_unit_code !== 8) {
      throw new Error(`Nigeria petroleum-gas quantity unit ${nigeria.qty_unit_code} is not kilograms.`);
    }
  }

  const nigeriaGas2023 = gas?.completedQueries?.["NGA:2023"];
  if (nigeriaGas2023?.status === "ok") {
    const earlierGas = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'IND' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
    `).get();
    if (!earlierGas) throw new Error("Nigeria 2023 petroleum-gas export to India is missing from the database.");
    if (Math.abs(earlierGas.trade_value_usd - 324020075.849) > 1) {
      throw new Error(`Nigeria 2023 petroleum-gas value ${earlierGas.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (earlierGas.net_weight_kg !== 36941190) {
      throw new Error(`Nigeria 2023 petroleum-gas net weight ${earlierGas.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (earlierGas.qty !== 36941190) {
      throw new Error(`Nigeria 2023 petroleum-gas quantity ${earlierGas.qty} does not match the Comtrade preview.`);
    }
    if (earlierGas.qty_unit_code !== 8) {
      throw new Error(`Nigeria 2023 petroleum-gas quantity unit ${earlierGas.qty_unit_code} is not kilograms.`);
    }
  }

  const mozambiqueGas = gas?.completedQueries?.["MOZ:2023"];
  if (mozambiqueGas?.status === "ok") {
    const mozambiqueGasTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'CHN' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
    `).get();
    if (!mozambiqueGasTrade) throw new Error("Mozambique 2023 petroleum-gas export to China is missing from the database.");
    if (Math.abs(mozambiqueGasTrade.trade_value_usd - 337321000) > 1) {
      throw new Error(`Mozambique petroleum-gas value ${mozambiqueGasTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (mozambiqueGasTrade.net_weight_kg !== 11044872.598) {
      throw new Error(`Mozambique petroleum-gas net weight ${mozambiqueGasTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (mozambiqueGasTrade.qty !== 21706602.598) {
      throw new Error(`Mozambique petroleum-gas quantity ${mozambiqueGasTrade.qty} does not match the Comtrade preview.`);
    }
    if (mozambiqueGasTrade.qty_unit_code !== 8) {
      throw new Error(`Mozambique petroleum-gas quantity unit ${mozambiqueGasTrade.qty_unit_code} is not kilograms.`);
    }
    const mozambiqueTurkiye = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'MOZ' AND partner_iso3 = 'TUR' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
    `).get();
    if (!mozambiqueTurkiye) throw new Error("Mozambique 2023 petroleum-gas export to Türkiye is missing from the database.");
    if (Math.abs(mozambiqueTurkiye.trade_value_usd - 51924000) > 1) {
      throw new Error(`Mozambique petroleum-gas value to Türkiye ${mozambiqueTurkiye.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (mozambiqueTurkiye.net_weight_kg !== null) {
      throw new Error(`Mozambique petroleum-gas net weight to Türkiye ${mozambiqueTurkiye.net_weight_kg} is not null.`);
    }
    if (mozambiqueTurkiye.qty !== 5344000) {
      throw new Error(`Mozambique petroleum-gas quantity to Türkiye ${mozambiqueTurkiye.qty} does not match the Comtrade preview.`);
    }
    if (mozambiqueTurkiye.qty_unit_code !== 8) {
      throw new Error(`Mozambique petroleum-gas quantity unit to Türkiye ${mozambiqueTurkiye.qty_unit_code} is not kilograms.`);
    }
  }

  function expectRefined(query, reporter, partner, year, value, netWeight, qty, label) {
    if (query?.status !== "ok") return;
    const row = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = '2710' AND year = ? AND flow = 'export'
    `).get(reporter, partner, year);
    if (!row) throw new Error(`${label} is missing from the database.`);
    if (Math.abs(row.trade_value_usd - value) > 1) {
      throw new Error(`${label} value ${row.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (row.net_weight_kg !== netWeight) {
      throw new Error(`${label} net weight ${row.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (row.qty !== qty) {
      throw new Error(`${label} quantity ${row.qty} does not match the Comtrade preview.`);
    }
    if (row.qty_unit_code !== 8) {
      throw new Error(`${label} quantity unit ${row.qty_unit_code} is not kilograms.`);
    }
  }
  expectRefined(refined?.completedQueries?.["IND:2024"], "IND", "ZAF", 2024, 3563531699.767, 5084739934, 5084739934, "India 2024 refined-petroleum export to South Africa");
  expectRefined(refined?.completedQueries?.["IND:2023"], "IND", "ZAF", 2023, 3505230363.834, 4117627409.563, 4117627409.563, "India 2023 refined-petroleum export to South Africa");
  expectRefined(refined?.completedQueries?.["IND:2025"], "IND", "ZAF", 2025, 2030543522.97, 3007079617, 3007079617, "India 2025 refined-petroleum export to South Africa");
  expectRefined(refined?.completedQueries?.["DZA:2024"], "DZA", "CHN", 2024, 1643305932.352, 1850827118.026, 1850827118.026, "Algeria 2024 refined-petroleum export to China");
  expectRefined(refined?.completedQueries?.["CHN:2024"], "CHN", "LBR", 2024, 2186177684, 3590098856, 3590098856, "China 2024 refined-petroleum export to Liberia");
  expectRefined(refined?.completedQueries?.["CHN:2023"], "CHN", "LBR", 2023, 2460952806, 3886619694, 3886619694, "China 2023 refined-petroleum export to Liberia");
  expectRefined(refined?.completedQueries?.["TUR:2025"], "TUR", "MAR", 2025, 511879128, 1169745500, 0, "Türkiye 2025 refined-petroleum export to Morocco");
  expectRefined(refined?.completedQueries?.["MOZ:2023"], "MOZ", "ARE", 2023, 30787000, 47827107, 48197107, "Mozambique 2023 refined-petroleum export to the United Arab Emirates");
  expectRefined(refined?.completedQueries?.["NGA:2025"], "NGA", "SAU", 2025, 58805543.232, 90000, 90000, "Nigeria 2025 refined-petroleum export to Saudi Arabia");
  if (refined?.completedQueries?.["NGA:2025"]?.status === "ok") {
    const nigeriaSingapore = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'SGP' AND hs_code = '2710' AND year = 2025 AND flow = 'export'
    `).get();
    if (!nigeriaSingapore) throw new Error("Nigeria 2025 refined-petroleum export to Singapore is missing from the database.");
    if (Math.abs(nigeriaSingapore.trade_value_usd - 260940118.318) > 1) {
      throw new Error(`Nigeria refined-petroleum value to Singapore ${nigeriaSingapore.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (nigeriaSingapore.net_weight_kg !== null) {
      throw new Error(`Nigeria refined-petroleum net weight to Singapore ${nigeriaSingapore.net_weight_kg} is not null.`);
    }
    if (nigeriaSingapore.qty !== 0) {
      throw new Error(`Nigeria refined-petroleum quantity to Singapore ${nigeriaSingapore.qty} is not the reported zero.`);
    }
    if (nigeriaSingapore.qty_unit_code !== -1) {
      throw new Error(`Nigeria refined-petroleum quantity unit to Singapore ${nigeriaSingapore.qty_unit_code} is not the unspecified code -1.`);
    }
  }
  if (refined?.completedQueries?.["EGY:2023"]?.status === "ok") {
    const egyptSaudi = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'EGY' AND partner_iso3 = 'SAU' AND hs_code = '2710' AND year = 2023 AND flow = 'export'
    `).get();
    if (!egyptSaudi) throw new Error("Egypt 2023 refined-petroleum export to Saudi Arabia is missing from the database.");
    if (Math.abs(egyptSaudi.trade_value_usd - 311440380.2) > 1) {
      throw new Error(`Egypt refined-petroleum value to Saudi Arabia ${egyptSaudi.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (egyptSaudi.net_weight_kg !== 0) {
      throw new Error(`Egypt refined-petroleum net weight to Saudi Arabia ${egyptSaudi.net_weight_kg} is not the reported zero.`);
    }
    if (egyptSaudi.qty !== 0) {
      throw new Error(`Egypt refined-petroleum quantity to Saudi Arabia ${egyptSaudi.qty} is not the reported zero.`);
    }
    if (egyptSaudi.qty_unit_code !== -1) {
      throw new Error(`Egypt refined-petroleum quantity unit to Saudi Arabia ${egyptSaudi.qty_unit_code} is not the unspecified code -1.`);
    }
  }

  const egyptGas = gas?.completedQueries?.["EGY:2023"];
  if (egyptGas?.status === "ok") {
    const egypt = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'EGY' AND partner_iso3 = 'PSE' AND hs_code = '2711' AND year = 2023 AND flow = 'export'
    `).get();
    if (!egypt) throw new Error("Egypt 2023 petroleum-gas export to Palestine is missing from the database.");
    if (Math.abs(egypt.trade_value_usd - 19510000) > 1) {
      throw new Error(`Egypt petroleum-gas value ${egypt.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (egypt.net_weight_kg !== null) {
      throw new Error(`Egypt petroleum-gas net weight ${egypt.net_weight_kg} is not null.`);
    }
    if (egypt.qty !== 0) {
      throw new Error(`Egypt petroleum-gas quantity ${egypt.qty} is not the reported zero.`);
    }
    if (egypt.qty_unit_code !== -1) {
      throw new Error(`Egypt petroleum-gas quantity unit ${egypt.qty_unit_code} is not the unspecified code -1.`);
    }
  }

  const manganeseQuery = manganese?.completedQueries?.["ZAF:2024"];
  if (manganeseQuery?.status === "ok") {
    const manganeseTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'CHN' AND hs_code = '2602' AND year = 2024 AND flow = 'export'
    `).get();
    if (!manganeseTrade) throw new Error("South Africa 2024 manganese-ore export to China is missing from the database.");
    if (Math.abs(manganeseTrade.trade_value_usd - 1796078789.258) > 1) {
      throw new Error(`South Africa manganese-ore value ${manganeseTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (manganeseTrade.net_weight_kg !== 15727923706) {
      throw new Error(`South Africa manganese-ore quantity ${manganeseTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const ironQuery = iron?.completedQueries?.["ZAF:2024"];
  if (ironQuery?.status === "ok") {
    const ironTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'ZAF' AND partner_iso3 = 'CHN' AND hs_code = '2601' AND year = 2024 AND flow = 'export'
    `).get();
    if (!ironTrade) throw new Error("South Africa 2024 iron-ore export to China is missing from the database.");
    if (Math.abs(ironTrade.trade_value_usd - 3315436104.443) > 1) {
      throw new Error(`South Africa iron-ore value ${ironTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (ironTrade.net_weight_kg !== 33780474247.75) {
      throw new Error(`South Africa iron-ore quantity ${ironTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const cobaltQuery = cobalt?.completedQueries?.["COD:2024"];
  if (cobaltQuery?.status === "ok") {
    const cobaltTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'COD' AND partner_iso3 = 'CHN' AND hs_code = '282200' AND year = 2024 AND flow = 'export'
    `).get();
    if (!cobaltTrade) throw new Error("DRC 2024 cobalt oxide and hydroxide export to China is missing from the database.");
    if (Math.abs(cobaltTrade.trade_value_usd - 3319809009.513) > 1) {
      throw new Error(`DRC cobalt value ${cobaltTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (cobaltTrade.net_weight_kg !== 368551016) {
      throw new Error(`DRC cobalt quantity ${cobaltTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const rubberQuery = rubber?.completedQueries?.["CIV:2024"];
  if (rubberQuery?.status === "ok") {
    const rubberTrade = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'CIV' AND partner_iso3 = 'CHN' AND hs_code = '4001' AND year = 2024 AND flow = 'export'
    `).get();
    if (!rubberTrade) throw new Error("Côte d'Ivoire 2024 natural rubber export to China is missing from the database.");
    if (Math.abs(rubberTrade.trade_value_usd - 578969668.137) > 1) {
      throw new Error(`Côte d'Ivoire rubber value ${rubberTrade.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (rubberTrade.net_weight_kg !== 399042127) {
      throw new Error(`Côte d'Ivoire rubber quantity ${rubberTrade.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const fishQuery = fishery?.completedQueries?.["CHN:2024"];
  if (fishQuery?.status === "ok") {
    const frozenFish = db.prepare(`
      SELECT trade_value_usd, net_weight_kg FROM trade_flows
      WHERE reporter_iso3 = 'CHN' AND partner_iso3 = 'CIV' AND hs_code = '0303' AND year = 2024 AND flow = 'export'
    `).get();
    if (!frozenFish) throw new Error("China 2024 frozen-fish export to Côte d'Ivoire is missing from the database.");
    if (Math.abs(frozenFish.trade_value_usd - 140948284) > 1) {
      throw new Error(`China frozen-fish value ${frozenFish.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (frozenFish.net_weight_kg !== 76140821) {
      throw new Error(`China frozen-fish quantity ${frozenFish.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  function expectGold(query, reporter, partner, year, value, netWeight, qty, unitCode, label) {
    if (query?.status !== "ok") return;
    const row = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = '7108' AND year = ? AND flow = 'export'
    `).get(reporter, partner, year);
    if (!row) throw new Error(`${label} is missing from the database.`);
    if (Math.abs(row.trade_value_usd - value) > 1) {
      throw new Error(`${label} value ${row.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (row.net_weight_kg !== netWeight) {
      throw new Error(`${label} net weight ${row.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (row.qty !== qty) {
      throw new Error(`${label} quantity ${row.qty} does not match the Comtrade preview.`);
    }
    if (row.qty_unit_code !== unitCode) {
      throw new Error(`${label} quantity unit ${row.qty_unit_code} does not match the Comtrade preview.`);
    }
  }
  expectGold(gold?.completedQueries?.["GHA:2024"], "GHA", "ARE", 2024, 4067603545.566, 56417.671, 135360.422, 8, "Ghana 2024 gold export to the United Arab Emirates");
  expectGold(gold?.completedQueries?.["GHA:2023"], "GHA", "ARE", 2023, 1647817005.893, 27756.406, 443128.29, 8, "Ghana 2023 gold export to the United Arab Emirates");
  expectGold(gold?.completedQueries?.["GHA:2025"], "GHA", "ARE", 2025, 8232910492.331, 79754.034, 207757.976, 8, "Ghana 2025 gold export to the United Arab Emirates");
  expectGold(gold?.completedQueries?.["GHA:2024"], "GHA", "IND", 2024, 940442814.683, 13774.964, 318535.786, 8, "Ghana 2024 gold export to India");
  expectGold(gold?.completedQueries?.["BFA:2024"], "BFA", "ARE", 2024, 1439484532.634, 22392, 22392, 8, "Burkina Faso 2024 gold export to the United Arab Emirates");
  expectGold(gold?.completedQueries?.["MLI:2024"], "MLI", "ARE", 2024, 77662800.752, 1617.524, 1617.524, 8, "Mali 2024 gold export to the United Arab Emirates");
  expectGold(gold?.completedQueries?.["TZA:2024"], "TZA", "IND", 2024, 533441565.025, 8009.06, 0, -1, "Tanzania 2024 gold export to India");
  expectGold(gold?.completedQueries?.["GHA:2023"], "GHA", "CHN", 2023, 7735258.643, 139.02, 4050.15, 8, "Ghana 2023 gold export to China");
  expectGold(gold?.completedQueries?.["EGY:2025"], "EGY", "ARE", 2025, 5855457793.68, 61659.168, 61659.168, 8, "Egypt 2025 gold export to the United Arab Emirates");
  expectGold(gold?.completedQueries?.["UGA:2025"], "UGA", "ARE", 2025, 5083347961.12, 48443.82, 48523.875, 8, "Uganda 2025 gold export to the United Arab Emirates");
  if (gold?.completedQueries?.["GHA:2024"]?.status === "ok") {
    const ghanaChina = db.prepare(`
      SELECT trade_value_usd FROM trade_flows
      WHERE reporter_iso3 = 'GHA' AND partner_iso3 = 'CHN' AND hs_code = '7108' AND year = 2024 AND flow = 'export'
    `).get();
    if (ghanaChina) {
      throw new Error("Ghana 2024 gold export to China was kept. The preview is under USD 1 million and must not be stored.");
    }
  }
  if (gold?.completedQueries?.["GHA:2025"]?.status === "ok") {
    const ghanaChina = db.prepare(`
      SELECT trade_value_usd FROM trade_flows
      WHERE reporter_iso3 = 'GHA' AND partner_iso3 = 'CHN' AND hs_code = '7108' AND year = 2025 AND flow = 'export'
    `).get();
    if (ghanaChina) {
      throw new Error("Ghana 2025 gold export to China was stored. The Comtrade preview returned no HS 7108 row.");
    }
  }
  if (gold?.completedQueries?.["NGA:2025"]?.status === "ok") {
    const nigeria = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = 'NGA' AND partner_iso3 = 'ARE' AND hs_code = '7108' AND year = 2025 AND flow = 'export'
    `).get();
    if (!nigeria) throw new Error("Nigeria 2025 gold export to the United Arab Emirates is missing from the database.");
    if (Math.abs(nigeria.trade_value_usd - 2923456.55) > 1) {
      throw new Error(`Nigeria gold value ${nigeria.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (nigeria.net_weight_kg !== null) {
      throw new Error(`Nigeria gold net weight ${nigeria.net_weight_kg} is not null.`);
    }
    if (nigeria.qty !== 0) {
      throw new Error(`Nigeria gold quantity ${nigeria.qty} is not the reported zero.`);
    }
    if (nigeria.qty_unit_code !== -1) {
      throw new Error(`Nigeria gold quantity unit ${nigeria.qty_unit_code} is not the unspecified code -1.`);
    }
  }
  function expectNoGold(query, reporter, year, label) {
    if (query?.status !== "ok") return;
    const row = db.prepare(`
      SELECT COUNT(*) AS n FROM trade_flows
      WHERE reporter_iso3 = ? AND hs_code = '7108' AND year = ? AND flow = 'export'
    `).get(reporter, year);
    if (row.n) throw new Error(`${label} stored ${row.n} HS 7108 flows. The Comtrade preview returned no rows.`);
  }
  expectNoGold(gold?.completedQueries?.["ZAF:2023"], "ZAF", 2023, "South Africa 2023");
  expectNoGold(gold?.completedQueries?.["ZAF:2024"], "ZAF", 2024, "South Africa 2024");
  expectNoGold(gold?.completedQueries?.["ZAF:2025"], "ZAF", 2025, "South Africa 2025");
  expectNoGold(gold?.completedQueries?.["SDN:2023"], "SDN", 2023, "Sudan 2023");
  expectNoGold(gold?.completedQueries?.["SDN:2024"], "SDN", 2024, "Sudan 2024");
  expectNoGold(gold?.completedQueries?.["SDN:2025"], "SDN", 2025, "Sudan 2025");
  expectNoGold(gold?.completedQueries?.["LBY:2023"], "LBY", 2023, "Libya 2023");
  expectNoGold(gold?.completedQueries?.["LBY:2024"], "LBY", 2024, "Libya 2024");
  expectNoGold(gold?.completedQueries?.["LBY:2025"], "LBY", 2025, "Libya 2025");
  expectNoGold(gold?.completedQueries?.["MLI:2025"], "MLI", 2025, "Mali 2025");
  expectNoGold(gold?.completedQueries?.["ARE:2024"], "ARE", 2024, "United Arab Emirates 2024");
  expectNoGold(gold?.completedQueries?.["ARE:2025"], "ARE", 2025, "United Arab Emirates 2025");
  const sixDigitGold = db.prepare(`
    SELECT COUNT(*) AS n FROM trade_flows WHERE hs_code IN ('710811', '710812', '710813', '710820', '2616', '7112', '7113')
  `).get();
  if (sixDigitGold.n) {
    throw new Error("A gold subheading, gold ore, scrap, or jewelry code was stored. This database keeps the HS 7108 heading only.");
  }

  function expectPlatinum(query, reporter, partner, year, hs, value, netWeight, qty, unitCode, label) {
    if (query?.status !== "ok") return;
    const row = db.prepare(`
      SELECT trade_value_usd, net_weight_kg, qty, qty_unit_code FROM trade_flows
      WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = ? AND year = ? AND flow = 'export'
    `).get(reporter, partner, hs, year);
    if (!row) throw new Error(`${label} is missing from the database.`);
    if (Math.abs(row.trade_value_usd - value) > 1) {
      throw new Error(`${label} value ${row.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (row.net_weight_kg !== netWeight) {
      throw new Error(`${label} net weight ${row.net_weight_kg} does not match the Comtrade preview.`);
    }
    if (row.qty !== qty) {
      throw new Error(`${label} quantity ${row.qty} does not match the Comtrade preview.`);
    }
    if (row.qty_unit_code !== unitCode) {
      throw new Error(`${label} quantity unit ${row.qty_unit_code} does not match the Comtrade preview.`);
    }
  }
  function expectNoPlatinum(query, reporter, partner, year, hs, label) {
    if (query?.status !== "ok") return;
    const row = db.prepare(`
      SELECT trade_value_usd FROM trade_flows
      WHERE reporter_iso3 = ? AND partner_iso3 = ? AND hs_code = ? AND year = ? AND flow = 'export'
    `).get(reporter, partner, hs, year);
    if (row) throw new Error(`${label} was stored. The Comtrade preview must not be kept.`);
  }
  expectPlatinum(platinum?.completedQueries?.["ZAF:2024"], "ZAF", "JPN", 2024, "711011", 544774293.664, 18558.22, 18558.22, 8, "South Africa 2024 unwrought platinum export to Japan");
  expectPlatinum(platinum?.completedQueries?.["ZAF:2024"], "ZAF", "JPN", 2024, "711019", 454243564.711, 15006.55, 15006.55, 8, "South Africa 2024 semi-manufactured platinum export to Japan");
  expectPlatinum(platinum?.completedQueries?.["ZAF:2023"], "ZAF", "JPN", 2023, "711011", 626124127.352, 20629.8, 20629.8, 8, "South Africa 2023 unwrought platinum export to Japan");
  expectPlatinum(platinum?.completedQueries?.["ZAF:2023"], "ZAF", "JPN", 2023, "711019", 394210021.271, 12820.13, 12820.13, 8, "South Africa 2023 semi-manufactured platinum export to Japan");
  expectPlatinum(platinum?.completedQueries?.["ZAF:2025"], "ZAF", "JPN", 2025, "711011", 711322738.142, 18742.35, 18742.35, 8, "South Africa 2025 unwrought platinum export to Japan");
  expectPlatinum(platinum?.completedQueries?.["ZAF:2025"], "ZAF", "JPN", 2025, "711019", 648113833.064, 17551.74, 17551.74, 8, "South Africa 2025 semi-manufactured platinum export to Japan");
  expectPlatinum(platinum?.completedQueries?.["ZAF:2024"], "ZAF", "CHN", 2024, "711019", 172459849.797, 5500.24, 5500.24, 8, "South Africa 2024 semi-manufactured platinum export to China");
  expectNoPlatinum(platinum?.completedQueries?.["ZAF:2024"], "ZAF", "CHN", 2024, "711011", "South Africa 2024 unwrought platinum export to China");
  expectNoPlatinum(platinum?.completedQueries?.["ZWE:2024"], "ZWE", "JPN", 2024, "711011", "Zimbabwe 2024 unwrought platinum export to Japan");
  expectNoPlatinum(platinum?.completedQueries?.["ZWE:2024"], "ZWE", "JPN", 2024, "711019", "Zimbabwe 2024 semi-manufactured platinum export to Japan");
  expectNoPlatinum(platinum?.completedQueries?.["ZWE:2024"], "ZWE", "CHN", 2024, "711011", "Zimbabwe 2024 unwrought platinum export to China");
  expectNoPlatinum(platinum?.completedQueries?.["ZWE:2024"], "ZWE", "CHN", 2024, "711019", "Zimbabwe 2024 semi-manufactured platinum export to China");
  expectPlatinum(platinum?.completedQueries?.["TZA:2024"], "TZA", "IND", 2024, "711011", 26765874.149, 346.533, 0, -1, "Tanzania 2024 unwrought platinum export to India");
  expectPlatinum(platinum?.completedQueries?.["TZA:2024"], "TZA", "IND", 2024, "711019", 36393505.285, 499.472, 0, -1, "Tanzania 2024 semi-manufactured platinum export to India");
  expectPlatinum(platinum?.completedQueries?.["TZA:2025"], "TZA", "IND", 2025, "711011", 24433266.462, 288.962, 0, -1, "Tanzania 2025 unwrought platinum export to India");
  expectNoPlatinum(platinum?.completedQueries?.["TZA:2025"], "TZA", "IND", 2025, "711019", "Tanzania 2025 semi-manufactured platinum export to India");
  expectPlatinum(platinum?.completedQueries?.["ARE:2023"], "ARE", "ZAF", 2023, "711011", 5215250.773, 146, 146, 8, "United Arab Emirates 2023 unwrought platinum export to South Africa");
  expectPlatinum(platinum?.completedQueries?.["ZAF:2023"], "ZAF", "IND", 2023, "711011", 16699035.095, 1563.92, 1563.92, 8, "South Africa 2023 unwrought platinum export to India");
  function expectNoPlatinumYear(query, reporter, year, label) {
    if (query?.status !== "ok") return;
    const row = db.prepare(`
      SELECT COUNT(*) AS n FROM trade_flows
      WHERE reporter_iso3 = ? AND year = ? AND flow = 'export' AND hs_code IN ('711011', '711019')
    `).get(reporter, year);
    if (row.n) throw new Error(`${label} stored ${row.n} platinum flows. The Comtrade preview kept none.`);
  }
  expectNoPlatinumYear(platinum?.completedQueries?.["TZA:2023"], "TZA", 2023, "Tanzania 2023");
  expectNoPlatinumYear(platinum?.completedQueries?.["ZWE:2023"], "ZWE", 2023, "Zimbabwe 2023");
  expectNoPlatinumYear(platinum?.completedQueries?.["ZWE:2024"], "ZWE", 2024, "Zimbabwe 2024");
  expectNoPlatinumYear(platinum?.completedQueries?.["ZWE:2025"], "ZWE", 2025, "Zimbabwe 2025");
  expectNoPlatinumYear(platinum?.completedQueries?.["ARE:2024"], "ARE", 2024, "United Arab Emirates 2024");
  expectNoPlatinumYear(platinum?.completedQueries?.["ARE:2025"], "ARE", 2025, "United Arab Emirates 2025");
  const otherPlatinumGroup = db.prepare(`
    SELECT COUNT(*) AS n FROM trade_flows
    WHERE hs_code IN ('7110', '711021', '711029', '711031', '711039', '711041', '711049', '2616', '7112', '7113')
  `).get();
  if (otherPlatinumGroup.n) {
    throw new Error("A platinum-group heading, palladium, rhodium, iridium, ore, scrap, or jewelry code was stored. This database keeps HS 711011 and HS 711019 only.");
  }

  const tea = db.prepare(`
    SELECT trade_value_usd, net_weight_kg FROM trade_flows
    WHERE reporter_iso3 = 'KEN' AND partner_iso3 = 'PAK' AND hs_code = '0902' AND year = 2024 AND flow = 'export'
  `).get();
  const kenyaQuery = trade?.completedQueries?.["KEN:2024"];
  if (kenyaQuery?.status === "ok") {
    if (!tea) throw new Error("Kenya 2024 tea export to Pakistan is missing from the database.");
    if (Math.abs(tea.trade_value_usd - 554186717.21) > 1) {
      throw new Error(`Kenya tea value ${tea.trade_value_usd} does not match the Comtrade preview.`);
    }
    if (tea.net_weight_kg !== 221460000) {
      throw new Error(`Kenya tea quantity ${tea.net_weight_kg} does not match the Comtrade preview.`);
    }
  }

  const counts = {
    countries: db.prepare("SELECT COUNT(*) AS n FROM countries").get().n,
    indicators: db.prepare("SELECT COUNT(*) AS n FROM indicators").get().n,
    observations: db.prepare("SELECT COUNT(*) AS n FROM observations").get().n,
    tradeFlows: db.prepare("SELECT COUNT(*) AS n FROM trade_flows").get().n,
    prices: db.prepare("SELECT COUNT(*) AS n FROM commodity_prices").get().n,
    production: db.prepare("SELECT COUNT(*) AS n FROM production").get().n,
    marketRecords: db.prepare("SELECT COUNT(*) AS n FROM market_records").get().n,
  };
  db.close();
  console.log(`Built ${paths.database}`, counts);
  return counts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildDatabase();
}
