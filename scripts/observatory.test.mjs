import assert from "node:assert/strict";
import { openObservatory, queryExchangeRates, queryLogistics, queryPrices, queryTrade } from "../shared/observatory-db.mjs";

const db = openObservatory({ readOnly: true });
assert.ok(db, "observatory database is missing");

const tea = queryTrade(db, {
  reporterIso3: "KEN",
  partnerIso3: "PAK",
  flow: "export",
  year: 2024,
  hsCodes: ["0902"],
  page: 1,
  perPage: 5,
});
assert.equal(tea.total, 1);
assert.ok(Math.abs(tea.rows[0].valueUsd - 554186717.21) < 1, tea.rows[0].valueUsd);
assert.equal(tea.rows[0].quantityUnit, "kg");
assert.equal(tea.rows[0].status, "reported");
assert.ok(tea.rows[0].quantity > 0);
assert.equal(tea.rows[0].netWeightKg, tea.rows[0].quantity);

const rice = queryTrade(db, {
  originIso3: "THA",
  targetIso3: "SEN",
  year: 2024,
  hsCodes: ["1006"],
  page: 1,
  perPage: 10,
});
const senegalImport = rice.rows.find((row) => row.flow === "import" && row.reporterIso3 === "SEN");
assert.ok(senegalImport, "Senegal rice import from Thailand is missing");
assert.ok(Math.abs(senegalImport.valueUsd - 158288000) / 158288000 < 0.002, senegalImport.valueUsd);

const cashew = queryTrade(db, {
  reporterIso3: "TZA",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["080131"],
  page: 1,
  perPage: 5,
});
assert.equal(cashew.total, 1);
assert.ok(Math.abs(cashew.rows[0].valueUsd - 251850942.99) < 1, cashew.rows[0].valueUsd);
assert.equal(cashew.rows[0].product, "Cashew nuts, in shell");
assert.equal(cashew.rows[0].status, "reported");

const shirt = queryTrade(db, {
  hsCodes: ["610910"],
  page: 1,
  perPage: 1,
});
assert.equal(shirt.rows[0]?.parentHs, "61");

const cotton = queryTrade(db, {
  reporterIso3: "BEN",
  partnerIso3: "BGD",
  flow: "export",
  year: 2024,
  hsCodes: ["5201"],
  page: 1,
  perPage: 5,
});
assert.equal(cotton.total, 1);
assert.equal(cotton.rows[0].product, "Cotton, not carded or combed");
assert.ok(Math.abs(cotton.rows[0].valueUsd - 480431716.16) < 0.01, cotton.rows[0].valueUsd);

const sesame = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "SDN",
  flow: "import",
  year: 2024,
  hsCodes: ["120740"],
  page: 1,
  perPage: 5,
});
assert.equal(sesame.total, 1);
assert.ok(Math.abs(sesame.rows[0].valueUsd - 27618437.18) < 0.01, sesame.rows[0].valueUsd);

const paste = queryTrade(db, {
  reporterIso3: "CIV",
  partnerIso3: "SGP",
  flow: "export",
  year: 2024,
  hsCodes: ["1803"],
  page: 1,
  perPage: 5,
});
assert.equal(paste.total, 1);
assert.equal(paste.rows[0].product, "Cocoa paste");
assert.ok(Math.abs(paste.rows[0].valueUsd - 1245225.41) < 0.01, paste.rows[0].valueUsd);

const dapTrade = queryTrade(db, {
  reporterIso3: "MAR",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["310530"],
  page: 1,
  perPage: 5,
});
assert.equal(dapTrade.total, 1);
assert.equal(dapTrade.rows[0].product, "Diammonium phosphate");
assert.equal(dapTrade.rows[0].category, "Fertilizers");
assert.ok(Math.abs(dapTrade.rows[0].valueUsd - 1206751491.601) < 0.01, dapTrade.rows[0].valueUsd);

const phosphateRock = queryTrade(db, {
  reporterIso3: "MAR",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["2510"],
  page: 1,
  perPage: 5,
});
assert.equal(phosphateRock.total, 1);
assert.equal(phosphateRock.rows[0].product, "Phosphate rock");
assert.ok(Math.abs(phosphateRock.rows[0].valueUsd - 217187614.907) < 0.01, phosphateRock.rows[0].valueUsd);

const cocoa = queryPrices(db, {
  codes: ["cocoa"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(cocoa.total, 1);
assert.equal(cocoa.rows[0].priceUsd, 5.75);
assert.equal(cocoa.rows[0].unit, "USD/kg");
assert.equal(cocoa.rows[0].relatedHs, "180100");

const mombasa = queryPrices(db, {
  codes: ["tea-mombasa"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(mombasa.rows[0].priceUsd, 2.33);
assert.equal(mombasa.rows[0].unit, "USD/kg");

const riceQuotes = queryPrices(db, {
  hsCode: "1006",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 10,
});
assert.equal(riceQuotes.total, 4);

const urea = queryPrices(db, {
  codes: ["urea"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(urea.total, 1);
assert.equal(urea.rows[0].priceUsd, 420);
assert.equal(urea.rows[0].unit, "USD/mt");
assert.equal(urea.rows[0].relatedHs, "310210");

const dapPrice = queryPrices(db, {
  codes: ["dap"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(dapPrice.rows[0].priceUsd, 803.1);
assert.equal(dapPrice.rows[0].relatedHs, "310530");

const potash = queryPrices(db, {
  codes: ["potassium-chloride"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(potash.rows[0].priceUsd, 357.5);
assert.equal(potash.rows[0].name, "Potassium chloride");

const flows = db.prepare("SELECT value_usd, quantity, net_weight_kg FROM trade_flows").all();
assert.ok(flows.length > 0);
for (const row of flows) {
  assert.ok(row.value_usd > 0);
  if (row.quantity != null) assert.ok(row.quantity > 0);
  if (row.net_weight_kg != null) assert.ok(row.net_weight_kg > 0);
}

const prices = db.prepare("SELECT price_usd FROM commodity_prices").all();
assert.ok(prices.length > 0);
for (const row of prices) assert.ok(row.price_usd > 0);

const chinaRate = queryExchangeRates(db, { iso3: "CHN", year: 2025, page: 1, perPage: 5 });
assert.equal(chinaRate.total, 1);
assert.ok(Math.abs(chinaRate.rows[0].lcuPerUsd - 7.18984737402171) < 1e-9, chinaRate.rows[0].lcuPerUsd);
assert.equal(chinaRate.rows[0].unit, "LCU per USD, period average");

const kenyaRate = queryExchangeRates(db, { iso3: "KEN", year: 2025, page: 1, perPage: 5 });
assert.equal(kenyaRate.total, 1);
assert.ok(Math.abs(kenyaRate.rows[0].lcuPerUsd - 129.302572099377) < 1e-9);

const vietnamRate = queryExchangeRates(db, { iso3: "VNM", year: 2025, page: 1, perPage: 5 });
assert.equal(vietnamRate.total, 0);
const koreaRate = queryExchangeRates(db, { iso3: "PRK", from: 2015, to: 2025, page: 1, perPage: 5 });
assert.equal(koreaRate.total, 0);

const cfa = db.prepare(`
  SELECT a.lcu_per_usd AS benin, b.lcu_per_usd AS senegal
  FROM exchange_rates a
  JOIN exchange_rates b ON b.year = a.year AND b.iso3 = 'SEN'
  WHERE a.iso3 = 'BEN' AND a.year = 2025
`).get();
assert.equal(cfa.benin, cfa.senegal);

const singaporeShipping = queryLogistics(db, { iso3: "SGP", codes: ["lsci"], year: 2021, page: 1, perPage: 5 });
assert.equal(singaporeShipping.total, 1);
assert.ok(Math.abs(singaporeShipping.rows[0].value - 110.6756480462) < 1e-9, singaporeShipping.rows[0].value);
assert.equal(singaporeShipping.rows[0].unit, "index, 2004 = 100");

const chinaLogistics = queryLogistics(db, { iso3: "CHN", codes: ["lpi-overall"], year: 2022, page: 1, perPage: 5 });
assert.equal(chinaLogistics.total, 1);
assert.equal(chinaLogistics.rows[0].value, 3.7);

const kenyaLogistics = queryLogistics(db, { iso3: "KEN", codes: ["lpi-overall"], year: 2022, page: 1, perPage: 5 });
assert.equal(kenyaLogistics.total, 0);

const rateCount = db.prepare("SELECT COUNT(*) AS n FROM exchange_rates").get().n;
const logisticsCount = db.prepare("SELECT COUNT(*) AS n FROM logistics_observations").get().n;
assert.equal(rateCount, 1060);
assert.equal(logisticsCount, 757);
for (const row of db.prepare("SELECT lcu_per_usd AS value FROM exchange_rates").all()) assert.ok(row.value > 0);
for (const row of db.prepare("SELECT value FROM logistics_observations").all()) assert.ok(row.value > 0);
db.close();

console.log("observatory tests passed", {
  teaUsd: tea.rows[0].valueUsd,
  riceUsd: senegalImport.valueUsd,
  cottonUsd: cotton.rows[0].valueUsd,
  cocoaUsdPerKg: cocoa.rows[0].priceUsd,
  dapUsd: dapTrade.rows[0].valueUsd,
  ureaUsdPerMt: urea.rows[0].priceUsd,
  flows: flows.length,
  prices: prices.length,
  chinaLcuPerUsd: chinaRate.rows[0].lcuPerUsd,
  singaporeLsci: singaporeShipping.rows[0].value,
  rates: rateCount,
  logistics: logisticsCount,
});
