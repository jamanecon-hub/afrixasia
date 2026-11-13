import assert from "node:assert/strict";
import { openObservatory, queryTrade } from "../shared/observatory-db.mjs";

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

const flows = db.prepare("SELECT value_usd, quantity, net_weight_kg FROM trade_flows").all();
assert.ok(flows.length > 0);
for (const row of flows) {
  assert.ok(row.value_usd > 0);
  if (row.quantity != null) assert.ok(row.quantity > 0);
  if (row.net_weight_kg != null) assert.ok(row.net_weight_kg > 0);
}

db.close();
console.log("observatory tests passed", {
  teaUsd: tea.rows[0].valueUsd,
  riceUsd: senegalImport.valueUsd,
  flows: flows.length,
});
