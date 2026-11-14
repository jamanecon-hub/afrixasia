import assert from "node:assert/strict";
import { openObservatory, queryPrices, queryTrade } from "../shared/observatory-db.mjs";

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
db.close();

console.log("observatory tests passed", {
  teaUsd: tea.rows[0].valueUsd,
  riceUsd: senegalImport.valueUsd,
  cottonUsd: cotton.rows[0].valueUsd,
  cocoaUsdPerKg: cocoa.rows[0].priceUsd,
  flows: flows.length,
  prices: prices.length,
});
