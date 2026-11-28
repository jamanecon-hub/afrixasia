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

const maize = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["1005"],
  page: 1,
  perPage: 5,
});
assert.equal(maize.total, 1);
assert.equal(maize.rows[0].product, "Maize");
assert.equal(maize.rows[0].category, "Food & agriculture");
assert.ok(Math.abs(maize.rows[0].valueUsd - 4678490.638) < 0.01, maize.rows[0].valueUsd);

const groundnuts = queryTrade(db, {
  reporterIso3: "SEN",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["1202"],
  page: 1,
  perPage: 5,
});
assert.equal(groundnuts.total, 1);
assert.equal(groundnuts.rows[0].product, "Groundnuts");
assert.ok(Math.abs(groundnuts.rows[0].valueUsd - 92525200.621) < 0.01, groundnuts.rows[0].valueUsd);

const sugar = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "SDN",
  flow: "export",
  year: 2024,
  hsCodes: ["1701"],
  page: 1,
  perPage: 5,
});
assert.equal(sugar.total, 1);
assert.equal(sugar.rows[0].product, "Cane or beet sugar");
assert.ok(Math.abs(sugar.rows[0].valueUsd - 284509889.827) < 0.01, sugar.rows[0].valueUsd);

const rubber = queryTrade(db, {
  reporterIso3: "CIV",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["4001"],
  page: 1,
  perPage: 5,
});
assert.equal(rubber.total, 1);
assert.equal(rubber.rows[0].product, "Natural rubber");
assert.equal(rubber.rows[0].category, "Agricultural raw materials");
assert.ok(Math.abs(rubber.rows[0].valueUsd - 578969668.137) < 0.01, rubber.rows[0].valueUsd);

const ironOre = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2601"],
  page: 1,
  perPage: 5,
});
assert.equal(ironOre.total, 1);
assert.equal(ironOre.rows[0].product, "Iron ores and concentrates");
assert.equal(ironOre.rows[0].category, "Minerals & energy");
assert.ok(Math.abs(ironOre.rows[0].valueUsd - 3315436104.443) < 0.01, ironOre.rows[0].valueUsd);
assert.equal(ironOre.rows[0].quantityUnit, "kg");

const coal = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["2701"],
  page: 1,
  perPage: 5,
});
assert.equal(coal.total, 1);
assert.equal(coal.rows[0].product, "Coal");
assert.ok(Math.abs(coal.rows[0].valueUsd - 2780458353.603) < 0.01, coal.rows[0].valueUsd);

const angolaCrude = queryTrade(db, {
  reporterIso3: "AGO",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2709"],
  page: 1,
  perPage: 5,
});
assert.equal(angolaCrude.total, 1);
assert.equal(angolaCrude.rows[0].product, "Crude petroleum");
assert.ok(Math.abs(angolaCrude.rows[0].valueUsd - 16194452099.296) < 0.01, angolaCrude.rows[0].valueUsd);

const chinaCrude = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "AGO",
  flow: "import",
  year: 2024,
  hsCodes: ["2709"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaCrude.total, 1);
assert.notEqual(chinaCrude.rows[0].valueUsd, angolaCrude.rows[0].valueUsd);

const nigeriaCrude = queryTrade(db, {
  reporterIso3: "NGA",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["2709"],
  page: 1,
  perPage: 5,
});
assert.equal(nigeriaCrude.total, 1);
assert.equal(nigeriaCrude.rows[0].netWeightKg, null);
assert.equal(nigeriaCrude.rows[0].quantity, null);
assert.ok(Math.abs(nigeriaCrude.rows[0].valueUsd - 2211847998.896) < 0.01, nigeriaCrude.rows[0].valueUsd);

const copperOre = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2603"],
  page: 1,
  perPage: 5,
});
assert.equal(copperOre.total, 1);
assert.equal(copperOre.rows[0].product, "Copper ores and concentrates");
assert.ok(Math.abs(copperOre.rows[0].valueUsd - 2141522675.196) < 0.01, copperOre.rows[0].valueUsd);

const cathodes = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["740311"],
  page: 1,
  perPage: 5,
});
assert.equal(cathodes.total, 1);
assert.equal(cathodes.rows[0].product, "Copper cathodes");
assert.ok(Math.abs(cathodes.rows[0].valueUsd - 14303219693.7) < 0.01, cathodes.rows[0].valueUsd);
assert.notEqual(cathodes.rows[0].valueUsd, copperOre.rows[0].valueUsd);

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

const maizePrice = queryPrices(db, {
  codes: ["maize"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(maizePrice.total, 1);
assert.equal(maizePrice.rows[0].priceUsd, 226.5);
assert.equal(maizePrice.rows[0].unit, "USD/mt");
assert.equal(maizePrice.rows[0].relatedHs, "1005");

const sugarQuotes = queryPrices(db, {
  hsCode: "1701",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 10,
});
assert.equal(sugarQuotes.total, 3);
const sugarWorld = sugarQuotes.rows.find((row) => row.seriesCode === "sugar-world");
assert.equal(sugarWorld.priceUsd, 0.43);
assert.equal(sugarWorld.unit, "USD/kg");

const groundnutPrice = queryPrices(db, {
  codes: ["groundnuts"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(groundnutPrice.rows[0].priceUsd, 1600);

const rubberQuotes = queryPrices(db, {
  hsCode: "4001",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 10,
});
assert.equal(rubberQuotes.total, 2);
const tsr20 = rubberQuotes.rows.find((row) => row.seriesCode === "rubber-tsr20");
const rss3 = rubberQuotes.rows.find((row) => row.seriesCode === "rubber-rss3");
assert.equal(tsr20.priceUsd, 2.55);
assert.equal(rss3.priceUsd, 2.83);
assert.equal(tsr20.name, "Rubber, TSR20");

const brent = queryPrices(db, {
  codes: ["crude-brent"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(brent.total, 1);
assert.equal(brent.rows[0].priceUsd, 125);
assert.equal(brent.rows[0].unit, "USD/bbl");
assert.equal(brent.rows[0].relatedHs, "2709");

const crudeQuotes = queryPrices(db, {
  hsCode: "2709",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 10,
});
assert.equal(crudeQuotes.total, 2);
const dubai = crudeQuotes.rows.find((row) => row.seriesCode === "crude-dubai");
assert.equal(dubai.priceUsd, 102.7);
assert.equal(dubai.unit, "USD/bbl");

const ironPrice = queryPrices(db, {
  codes: ["iron-ore"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(ironPrice.rows[0].priceUsd, 90.8);
assert.equal(ironPrice.rows[0].unit, "USD/dry mt");
assert.equal(ironPrice.rows[0].relatedHs, "2601");

const copperPrice = queryPrices(db, {
  hsCode: "740311",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(copperPrice.total, 1);
assert.equal(copperPrice.rows[0].priceUsd, 14508);
assert.equal(copperPrice.rows[0].unit, "USD/mt");

const chinaGold = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["710812"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaGold.total, 1);
assert.equal(chinaGold.rows[0].product, "Gold, unwrought");
assert.equal(chinaGold.rows[0].category, "Precious metals");
assert.equal(chinaGold.rows[0].quantityUnit, "kg");
assert.ok(Math.abs(chinaGold.rows[0].valueUsd - 8851243166) < 0.01, chinaGold.rows[0].valueUsd);

const saGoldExport = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["710812"],
  page: 1,
  perPage: 5,
});
assert.equal(saGoldExport.total, 0);

const ghanaGold = queryTrade(db, {
  reporterIso3: "GHA",
  partnerIso3: "ARE",
  flow: "export",
  year: 2024,
  hsCodes: ["710813"],
  page: 1,
  perPage: 5,
});
assert.equal(ghanaGold.total, 1);
assert.equal(ghanaGold.rows[0].product, "Gold, semi-manufactured");
assert.ok(Math.abs(ghanaGold.rows[0].valueUsd - 4067603545.566) < 0.01, ghanaGold.rows[0].valueUsd);
assert.notEqual(ghanaGold.rows[0].valueUsd, chinaGold.rows[0].valueUsd);

const saPlatinum = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "JPN",
  flow: "export",
  year: 2024,
  hsCodes: ["711011"],
  page: 1,
  perPage: 5,
});
assert.equal(saPlatinum.total, 1);
assert.equal(saPlatinum.rows[0].product, "Platinum, unwrought");
assert.ok(Math.abs(saPlatinum.rows[0].valueUsd - 544774293.664) < 0.01, saPlatinum.rows[0].valueUsd);

const saPlatinumChina = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["711011"],
  page: 1,
  perPage: 5,
});
assert.equal(saPlatinumChina.total, 0);

const chinaPlatinum = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["711011"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaPlatinum.total, 1);
assert.ok(Math.abs(chinaPlatinum.rows[0].valueUsd - 2106514761) < 0.01, chinaPlatinum.rows[0].valueUsd);

const saSilver = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["710691"],
  page: 1,
  perPage: 5,
});
assert.equal(saSilver.total, 1);
assert.equal(saSilver.rows[0].product, "Silver, unwrought");
assert.ok(Math.abs(saSilver.rows[0].valueUsd - 13484597.359) < 0.01, saSilver.rows[0].valueUsd);

const goldPrice = queryPrices(db, {
  codes: ["gold"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(goldPrice.total, 1);
assert.equal(goldPrice.rows[0].priceUsd, 4105);
assert.equal(goldPrice.rows[0].unit, "USD/troy oz");
assert.equal(goldPrice.rows[0].relatedHs, "710812");

const platinumPrice = queryPrices(db, {
  codes: ["platinum"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(platinumPrice.rows[0].priceUsd, 1621);
assert.equal(platinumPrice.rows[0].unit, "USD/troy oz");
assert.equal(platinumPrice.rows[0].relatedHs, "711011");

const silverPrice = queryPrices(db, {
  codes: ["silver"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(silverPrice.rows[0].priceUsd, 57);
assert.equal(silverPrice.rows[0].relatedHs, "710691");

const chinaLogs = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "CMR",
  flow: "import",
  year: 2024,
  hsCodes: ["4403"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaLogs.total, 1);
assert.equal(chinaLogs.rows[0].product, "Wood in the rough");
assert.equal(chinaLogs.rows[0].category, "Forestry");
assert.equal(chinaLogs.rows[0].quantityUnit, "m3");
assert.equal(chinaLogs.rows[0].quantity, 331308);
assert.equal(chinaLogs.rows[0].netWeightKg, 323716223);
assert.ok(Math.abs(chinaLogs.rows[0].valueUsd - 91630634) < 0.01, chinaLogs.rows[0].valueUsd);
assert.notEqual(chinaLogs.rows[0].quantity, chinaLogs.rows[0].netWeightKg);

const cameroonLogExport = queryTrade(db, {
  reporterIso3: "CMR",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["4403"],
  page: 1,
  perPage: 5,
});
assert.equal(cameroonLogExport.total, 0);

const congoLogs = queryTrade(db, {
  reporterIso3: "COG",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["4403"],
  page: 1,
  perPage: 5,
});
assert.equal(congoLogs.total, 1);
assert.equal(congoLogs.rows[0].quantity, null);
assert.equal(congoLogs.rows[0].quantityUnit, null);
assert.equal(congoLogs.rows[0].netWeightKg, 148648458);
assert.ok(Math.abs(congoLogs.rows[0].valueUsd - 52257757.52) < 0.01, congoLogs.rows[0].valueUsd);

const chinaCongoLogs = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "COG",
  flow: "import",
  year: 2024,
  hsCodes: ["4403"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaCongoLogs.total, 1);
assert.notEqual(chinaCongoLogs.rows[0].valueUsd, congoLogs.rows[0].valueUsd);
assert.ok(Math.abs(chinaCongoLogs.rows[0].valueUsd - 118245378) < 0.01, chinaCongoLogs.rows[0].valueUsd);

const gabonSawn = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "GAB",
  flow: "import",
  year: 2024,
  hsCodes: ["4407"],
  page: 1,
  perPage: 5,
});
assert.equal(gabonSawn.total, 1);
assert.equal(gabonSawn.rows[0].product, "Sawnwood");
assert.equal(gabonSawn.rows[0].quantityUnit, "m3");
assert.equal(gabonSawn.rows[0].quantity, 768491);
assert.ok(Math.abs(gabonSawn.rows[0].valueUsd - 274106985) < 0.01, gabonSawn.rows[0].valueUsd);
assert.notEqual(gabonSawn.rows[0].valueUsd, chinaLogs.rows[0].valueUsd);

const gabonSawnExport = queryTrade(db, {
  reporterIso3: "GAB",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["4407"],
  page: 1,
  perPage: 5,
});
assert.equal(gabonSawnExport.total, 0);

const logQuotes = queryPrices(db, {
  hsCode: "4403",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 10,
});
assert.equal(logQuotes.total, 2);
const cameroonLogsPrice = logQuotes.rows.find((row) => row.seriesCode === "logs-cameroon");
const malaysianLogsPrice = logQuotes.rows.find((row) => row.seriesCode === "logs-malaysian");
assert.equal(cameroonLogsPrice.priceUsd, 392.1);
assert.equal(malaysianLogsPrice.priceUsd, 188.5);
assert.equal(cameroonLogsPrice.unit, "USD/cubic meter");
assert.equal(cameroonLogsPrice.relatedHs, "4403");
assert.notEqual(cameroonLogsPrice.priceUsd, malaysianLogsPrice.priceUsd);

const sawnQuotes = queryPrices(db, {
  hsCode: "4407",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 10,
});
assert.equal(sawnQuotes.total, 2);
const cameroonSawnPrice = sawnQuotes.rows.find((row) => row.seriesCode === "sawnwood-cameroon");
const malaysianSawnPrice = sawnQuotes.rows.find((row) => row.seriesCode === "sawnwood-malaysian");
assert.equal(cameroonSawnPrice.priceUsd, 636.8);
assert.equal(malaysianSawnPrice.priceUsd, 724.3);
assert.equal(cameroonSawnPrice.unit, "USD/cubic meter");
assert.equal(cameroonSawnPrice.relatedHs, "4407");
assert.notEqual(cameroonSawnPrice.priceUsd, cameroonLogsPrice.priceUsd);

const chinaBauxite = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "GIN",
  flow: "import",
  year: 2024,
  hsCodes: ["2606"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaBauxite.total, 1);
assert.equal(chinaBauxite.rows[0].product, "Aluminum ores and concentrates");
assert.equal(chinaBauxite.rows[0].category, "Minerals & energy");
assert.equal(chinaBauxite.rows[0].quantityUnit, "kg");
assert.equal(chinaBauxite.rows[0].quantity, 110091480000);
assert.equal(chinaBauxite.rows[0].netWeightKg, 110091480000);
assert.ok(Math.abs(chinaBauxite.rows[0].valueUsd - 7589399727) < 0.01, chinaBauxite.rows[0].valueUsd);

const guineaBauxiteExport = queryTrade(db, {
  reporterIso3: "GIN",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2606"],
  page: 1,
  perPage: 5,
});
assert.equal(guineaBauxiteExport.total, 0);

const chinaAluminum = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "TZA",
  flow: "export",
  year: 2024,
  hsCodes: ["760110"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaAluminum.total, 1);
assert.equal(chinaAluminum.rows[0].product, "Aluminum, unwrought, not alloyed");
assert.equal(chinaAluminum.rows[0].quantityUnit, "kg");
assert.equal(chinaAluminum.rows[0].quantity, 4259810);
assert.ok(Math.abs(chinaAluminum.rows[0].valueUsd - 12230380) < 0.01, chinaAluminum.rows[0].valueUsd);
assert.notEqual(chinaAluminum.rows[0].valueUsd, chinaBauxite.rows[0].valueUsd);

const mozambiqueAlloy = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["760120"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueAlloy.total, 1);
assert.equal(mozambiqueAlloy.rows[0].product, "Aluminum alloys, unwrought");
assert.equal(mozambiqueAlloy.rows[0].quantity, 315534);
assert.ok(Math.abs(mozambiqueAlloy.rows[0].valueUsd - 2328628.5) < 0.01, mozambiqueAlloy.rows[0].valueUsd);

const mozambiqueUnalloyed = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["760110"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueUnalloyed.total, 1);
assert.notEqual(mozambiqueUnalloyed.rows[0].valueUsd, mozambiqueAlloy.rows[0].valueUsd);
assert.ok(Math.abs(mozambiqueUnalloyed.rows[0].valueUsd - 97902.8) < 0.01, mozambiqueUnalloyed.rows[0].valueUsd);

const aluminumPrice = queryPrices(db, {
  codes: ["aluminum"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(aluminumPrice.total, 1);
assert.equal(aluminumPrice.rows[0].priceUsd, 3061);
assert.equal(aluminumPrice.rows[0].unit, "USD/mt");
assert.equal(aluminumPrice.rows[0].relatedHs, "760110");

const bauxitePrice = queryPrices(db, {
  hsCode: "2606",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(bauxitePrice.total, 0);
const alloyPrice = queryPrices(db, {
  hsCode: "760120",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(alloyPrice.total, 0);

const semiGoldPrice = queryPrices(db, {
  hsCode: "710813",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(semiGoldPrice.total, 0);

const orePrice = queryPrices(db, {
  hsCode: "2603",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(orePrice.total, 0);

const coalPrice = queryPrices(db, {
  codes: ["coal-south-african"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(coalPrice.rows[0].priceUsd, 100);
assert.equal(coalPrice.rows[0].name, "Coal, South African");
assert.equal(coalPrice.rows[0].relatedHs, "2701");

const potash = queryPrices(db, {
  codes: ["potassium-chloride"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(potash.rows[0].priceUsd, 357.5);
assert.equal(potash.rows[0].name, "Potassium chloride");

const southAfricaManganese = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2602"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaManganese.total, 1);
assert.equal(southAfricaManganese.rows[0].product, "Manganese ores and concentrates");
assert.equal(southAfricaManganese.rows[0].category, "Minerals & energy");
assert.equal(southAfricaManganese.rows[0].quantityUnit, "kg");
assert.equal(southAfricaManganese.rows[0].quantity, 15727923706);
assert.equal(southAfricaManganese.rows[0].netWeightKg, 15727923706);
assert.ok(Math.abs(southAfricaManganese.rows[0].valueUsd - 1796078789.258) < 0.01, southAfricaManganese.rows[0].valueUsd);

const chinaManganese = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["2602"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaManganese.total, 1);
assert.equal(chinaManganese.rows[0].quantity, 15919700000);
assert.equal(chinaManganese.rows[0].valueUsd, 2294343551);
assert.notEqual(chinaManganese.rows[0].valueUsd, southAfricaManganese.rows[0].valueUsd);

const gabonManganeseExport = queryTrade(db, {
  reporterIso3: "GAB",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2602"],
  page: 1,
  perPage: 5,
});
assert.equal(gabonManganeseExport.total, 0);

const chinaGabonManganese = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "GAB",
  flow: "import",
  year: 2024,
  hsCodes: ["2602"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaGabonManganese.total, 1);
assert.equal(chinaGabonManganese.rows[0].quantity, 4161535700);
assert.equal(chinaGabonManganese.rows[0].valueUsd, 837431559);

const ghanaManganese = queryTrade(db, {
  reporterIso3: "GHA",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2602"],
  page: 1,
  perPage: 5,
});
assert.equal(ghanaManganese.total, 1);
assert.ok(Math.abs(ghanaManganese.rows[0].quantity - 1773100209.54) < 0.01, ghanaManganese.rows[0].quantity);
assert.ok(Math.abs(ghanaManganese.rows[0].netWeightKg - 3833806022.22) < 0.01, ghanaManganese.rows[0].netWeightKg);
assert.notEqual(ghanaManganese.rows[0].quantity, ghanaManganese.rows[0].netWeightKg);
assert.ok(Math.abs(ghanaManganese.rows[0].valueUsd - 237863347.401) < 0.01, ghanaManganese.rows[0].valueUsd);

const southAfricaChromium = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2610"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaChromium.total, 1);
assert.equal(southAfricaChromium.rows[0].product, "Chromium ores and concentrates");
assert.equal(southAfricaChromium.rows[0].quantityUnit, "kg");
assert.ok(Math.abs(southAfricaChromium.rows[0].quantity - 10112636146.12) < 0.01, southAfricaChromium.rows[0].quantity);
assert.ok(Math.abs(southAfricaChromium.rows[0].valueUsd - 2245975887.595) < 0.01, southAfricaChromium.rows[0].valueUsd);
assert.notEqual(southAfricaChromium.rows[0].valueUsd, southAfricaManganese.rows[0].valueUsd);

const chinaChromium = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["2610"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaChromium.total, 1);
assert.equal(chinaChromium.rows[0].quantity, 16998620000);
assert.equal(chinaChromium.rows[0].valueUsd, 4724628862);
assert.notEqual(chinaChromium.rows[0].valueUsd, southAfricaChromium.rows[0].valueUsd);

const drcHydroxide = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["282200"],
  page: 1,
  perPage: 5,
});
assert.equal(drcHydroxide.total, 1);
assert.equal(drcHydroxide.rows[0].product, "Cobalt oxides and hydroxides");
assert.equal(drcHydroxide.rows[0].quantityUnit, "kg");
assert.equal(drcHydroxide.rows[0].quantity, 368551016);
assert.equal(drcHydroxide.rows[0].netWeightKg, 368551016);
assert.ok(Math.abs(drcHydroxide.rows[0].valueUsd - 3319809009.513) < 0.01, drcHydroxide.rows[0].valueUsd);

const chinaHydroxide = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "COD",
  flow: "import",
  year: 2024,
  hsCodes: ["282200"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaHydroxide.total, 0);

const drcUnwrought = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["810520"],
  page: 1,
  perPage: 5,
});
assert.equal(drcUnwrought.total, 0);

const chinaUnwroughtCobalt = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "COD",
  flow: "import",
  year: 2024,
  hsCodes: ["810520"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaUnwroughtCobalt.total, 1);
assert.equal(chinaUnwroughtCobalt.rows[0].product, "Cobalt, unwrought, mattes, and powders");
assert.equal(chinaUnwroughtCobalt.rows[0].quantity, 628191018);
assert.equal(chinaUnwroughtCobalt.rows[0].valueUsd, 3019487639);
assert.notEqual(chinaUnwroughtCobalt.rows[0].valueUsd, drcHydroxide.rows[0].valueUsd);

const zimbabweChromium = queryTrade(db, {
  reporterIso3: "ZWE",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2610"],
  page: 1,
  perPage: 5,
});
assert.equal(zimbabweChromium.total, 1);
assert.equal(zimbabweChromium.rows[0].quantity, null);
assert.equal(zimbabweChromium.rows[0].quantityUnit, null);
assert.ok(Math.abs(zimbabweChromium.rows[0].netWeightKg - 843.8) < 0.01, zimbabweChromium.rows[0].netWeightKg);
assert.ok(Math.abs(zimbabweChromium.rows[0].valueUsd - 84.377) < 0.01, zimbabweChromium.rows[0].valueUsd);

for (const code of ["2602", "2610", "2605", "282200", "810520"]) {
  const quote = queryPrices(db, { hsCode: code, from: "2015-01", to: "2026-10", page: 1, perPage: 5 });
  assert.equal(quote.total, 0, code);
}

const nigeriaLng = queryTrade(db, {
  reporterIso3: "NGA",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(nigeriaLng.total, 1);
assert.equal(nigeriaLng.rows[0].product, "Liquefied natural gas");
assert.equal(nigeriaLng.rows[0].quantityUnit, "kg");
assert.equal(nigeriaLng.rows[0].quantity, 93786150);
assert.equal(nigeriaLng.rows[0].netWeightKg, 93786150);
assert.ok(Math.abs(nigeriaLng.rows[0].valueUsd - 575504965.914) < 0.01, nigeriaLng.rows[0].valueUsd);

const chinaLng = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "NGA",
  flow: "import",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaLng.total, 1);
assert.equal(chinaLng.rows[0].quantity, 1373241700);
assert.equal(chinaLng.rows[0].valueUsd, 822467736);
assert.notEqual(chinaLng.rows[0].valueUsd, nigeriaLng.rows[0].valueUsd);
assert.notEqual(chinaLng.rows[0].quantity, nigeriaLng.rows[0].quantity);

const angolaLng = queryTrade(db, {
  reporterIso3: "AGO",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(angolaLng.total, 1);
assert.equal(angolaLng.rows[0].quantity, 1901549675);
assert.ok(Math.abs(angolaLng.rows[0].valueUsd - 1090986397.99) < 0.01, angolaLng.rows[0].valueUsd);

const angolaLngToChina = queryTrade(db, {
  reporterIso3: "AGO",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(angolaLngToChina.total, 1);
assert.ok(Math.abs(angolaLngToChina.rows[0].valueUsd - 49115786.27) < 0.01, angolaLngToChina.rows[0].valueUsd);

const chinaLngFromAngola = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "AGO",
  flow: "import",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaLngFromAngola.total, 0);

const chinaPropaneFromAngola = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "AGO",
  flow: "import",
  year: 2024,
  hsCodes: ["271112"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaPropaneFromAngola.total, 1);
assert.equal(chinaPropaneFromAngola.rows[0].product, "Propane, liquefied");
assert.equal(chinaPropaneFromAngola.rows[0].quantityUnit, "kg");
assert.equal(chinaPropaneFromAngola.rows[0].valueUsd, 311035655);
assert.notEqual(chinaPropaneFromAngola.rows[0].valueUsd, angolaLngToChina.rows[0].valueUsd);

const nigeriaButane = queryTrade(db, {
  reporterIso3: "NGA",
  partnerIso3: "THA",
  flow: "export",
  year: 2024,
  hsCodes: ["271113"],
  page: 1,
  perPage: 5,
});
assert.equal(nigeriaButane.total, 1);
assert.equal(nigeriaButane.rows[0].product, "Butanes, liquefied");
assert.ok(Math.abs(nigeriaButane.rows[0].quantity - 51572.2) < 0.01, nigeriaButane.rows[0].quantity);
assert.ok(Math.abs(nigeriaButane.rows[0].valueUsd - 33886728.137) < 0.01, nigeriaButane.rows[0].valueUsd);

const nigeriaLngToThailand = queryTrade(db, {
  reporterIso3: "NGA",
  partnerIso3: "THA",
  flow: "export",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(nigeriaLngToThailand.total, 1);
assert.notEqual(nigeriaLngToThailand.rows[0].valueUsd, nigeriaButane.rows[0].valueUsd);

const nigeriaGaseous = queryTrade(db, {
  reporterIso3: "NGA",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["271121"],
  page: 1,
  perPage: 5,
});
assert.equal(nigeriaGaseous.total, 0);

const chinaMozambiqueLng = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "MOZ",
  flow: "import",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaMozambiqueLng.total, 1);
assert.equal(chinaMozambiqueLng.rows[0].valueUsd, 439450173);
assert.equal(chinaMozambiqueLng.rows[0].quantity, 842273300);

const mozambiqueLng = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["271111"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueLng.total, 1);
assert.equal(mozambiqueLng.rows[0].quantity, null);
assert.equal(mozambiqueLng.rows[0].netWeightKg, null);
assert.ok(Math.abs(mozambiqueLng.rows[0].valueUsd - 312000604.6) < 0.01, mozambiqueLng.rows[0].valueUsd);
assert.notEqual(mozambiqueLng.rows[0].valueUsd, chinaMozambiqueLng.rows[0].valueUsd);

const mozambiqueGaseous = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["271121"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueGaseous.total, 1);
assert.equal(mozambiqueGaseous.rows[0].product, "Natural gas, gaseous");
assert.equal(mozambiqueGaseous.rows[0].quantity, null);
assert.ok(Math.abs(mozambiqueGaseous.rows[0].valueUsd - 259233773.2) < 0.01, mozambiqueGaseous.rows[0].valueUsd);
assert.notEqual(mozambiqueGaseous.rows[0].valueUsd, mozambiqueLng.rows[0].valueUsd);

const chinaGaseousFromMozambique = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "MOZ",
  flow: "import",
  year: 2024,
  hsCodes: ["271121"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaGaseousFromMozambique.total, 0);

const japanLng = queryPrices(db, {
  codes: ["lng-japan"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(japanLng.total, 1);
assert.equal(japanLng.rows[0].priceUsd, 16.59);
assert.equal(japanLng.rows[0].unit, "USD/mmbtu");
assert.equal(japanLng.rows[0].relatedHs, "271111");

const usGas = queryPrices(db, {
  codes: ["gas-us"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(usGas.total, 1);
assert.equal(usGas.rows[0].priceUsd, 2.96);
assert.equal(usGas.rows[0].relatedHs, null);

const europeGas = queryPrices(db, {
  codes: ["gas-europe"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(europeGas.total, 1);
assert.equal(europeGas.rows[0].priceUsd, 28.5);
assert.equal(europeGas.rows[0].relatedHs, null);
assert.notEqual(europeGas.rows[0].priceUsd, japanLng.rows[0].priceUsd);
assert.notEqual(usGas.rows[0].priceUsd, europeGas.rows[0].priceUsd);

const lngByHs = queryPrices(db, {
  hsCode: "271111",
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 10,
});
assert.equal(lngByHs.total, 1);
assert.equal(lngByHs.rows[0].seriesCode, "lng-japan");

for (const code of ["271112", "271113", "271121"]) {
  const quote = queryPrices(db, { hsCode: code, from: "2015-01", to: "2026-10", page: 1, perPage: 5 });
  assert.equal(quote.total, 0, code);
}
const gasIndex = queryPrices(db, {
  codes: ["natural-gas-index"],
  from: "2015-01",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(gasIndex.total, 0);
for (const code of ["gas-us", "gas-europe", "lng-japan"]) {
  const series = queryPrices(db, { codes: [code], from: "2015-01", to: "2026-10", page: 1, perPage: 1 });
  assert.equal(series.total, 142, code);
}

const nickelPrice = queryPrices(db, {
  codes: ["nickel"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(nickelPrice.total, 1);
assert.equal(nickelPrice.rows[0].priceUsd, 15436);
assert.equal(nickelPrice.rows[0].unit, "USD/mt");
assert.equal(nickelPrice.rows[0].relatedHs, "750210");

const tinPrice = queryPrices(db, {
  codes: ["tin"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(tinPrice.total, 1);
assert.equal(tinPrice.rows[0].priceUsd, 51696);
assert.equal(tinPrice.rows[0].unit, "USD/mt");
assert.equal(tinPrice.rows[0].relatedHs, "800110");
assert.notEqual(tinPrice.rows[0].priceUsd, nickelPrice.rows[0].priceUsd);

for (const code of ["2604", "2609"]) {
  const quote = queryPrices(db, { hsCode: code, from: "2015-01", to: "2026-10", page: 1, perPage: 5 });
  assert.equal(quote.total, 0, code);
}
for (const code of ["nickel", "tin"]) {
  const series = queryPrices(db, { codes: [code], from: "2015-01", to: "2026-10", page: 1, perPage: 1 });
  assert.equal(series.total, 142, code);
}

const zincPrice = queryPrices(db, {
  codes: ["zinc"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(zincPrice.total, 1);
assert.equal(zincPrice.rows[0].priceUsd, 3818);
assert.equal(zincPrice.rows[0].unit, "USD/mt");
assert.equal(zincPrice.rows[0].relatedHs, "790111");

const leadPrice = queryPrices(db, {
  codes: ["lead"],
  from: "2026-10",
  to: "2026-10",
  page: 1,
  perPage: 5,
});
assert.equal(leadPrice.total, 1);
assert.equal(leadPrice.rows[0].priceUsd, 1860);
assert.equal(leadPrice.rows[0].unit, "USD/mt");
assert.equal(leadPrice.rows[0].relatedHs, "780110");
assert.notEqual(leadPrice.rows[0].priceUsd, zincPrice.rows[0].priceUsd);

for (const code of ["2608", "2607"]) {
  const quote = queryPrices(db, { hsCode: code, from: "2015-01", to: "2026-10", page: 1, perPage: 5 });
  assert.equal(quote.total, 0, code);
}
for (const code of ["zinc", "lead"]) {
  const series = queryPrices(db, { codes: [code], from: "2015-01", to: "2026-10", page: 1, perPage: 1 });
  assert.equal(series.total, 142, code);
}

const madagascarNickel = queryTrade(db, {
  reporterIso3: "MDG",
  partnerIso3: "KOR",
  flow: "export",
  year: 2024,
  hsCodes: ["750210"],
  page: 1,
  perPage: 5,
});
assert.equal(madagascarNickel.total, 1);
assert.equal(madagascarNickel.rows[0].product, "Nickel, unwrought, not alloyed");
assert.equal(madagascarNickel.rows[0].category, "Minerals & energy");
assert.equal(madagascarNickel.rows[0].quantityUnit, "kg");
assert.equal(madagascarNickel.rows[0].quantity, 10652000);
assert.equal(madagascarNickel.rows[0].netWeightKg, 10652000);
assert.ok(Math.abs(madagascarNickel.rows[0].valueUsd - 181564590.09) < 0.01, madagascarNickel.rows[0].valueUsd);

const madagascarOre = queryTrade(db, {
  reporterIso3: "MDG",
  partnerIso3: "KOR",
  flow: "export",
  year: 2024,
  hsCodes: ["2604"],
  page: 1,
  perPage: 5,
});
assert.equal(madagascarOre.total, 0);

const madagascarToChina = queryTrade(db, {
  reporterIso3: "MDG",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["750210"],
  page: 1,
  perPage: 5,
});
assert.equal(madagascarToChina.total, 0);

const chinaMadagascarNickel = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "MDG",
  flow: "import",
  year: 2024,
  hsCodes: ["750210"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaMadagascarNickel.total, 1);
assert.equal(chinaMadagascarNickel.rows[0].valueUsd, 28498);
assert.equal(chinaMadagascarNickel.rows[0].quantity, 1585);
assert.notEqual(chinaMadagascarNickel.rows[0].valueUsd, madagascarNickel.rows[0].valueUsd);

const drcTinOre = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2609"],
  page: 1,
  perPage: 5,
});
assert.equal(drcTinOre.total, 1);
assert.equal(drcTinOre.rows[0].product, "Tin ores and concentrates");
assert.equal(drcTinOre.rows[0].quantityUnit, "kg");
assert.equal(drcTinOre.rows[0].quantity, 1982262423);
assert.equal(drcTinOre.rows[0].netWeightKg, 1982262423);
assert.ok(Math.abs(drcTinOre.rows[0].valueUsd - 409381623.32) < 0.01, drcTinOre.rows[0].valueUsd);

const drcTinMetal = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["800110"],
  page: 1,
  perPage: 5,
});
assert.equal(drcTinMetal.total, 0);

const chinaTinOre = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "COD",
  flow: "import",
  year: 2024,
  hsCodes: ["2609"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaTinOre.total, 1);
assert.equal(chinaTinOre.rows[0].valueUsd, 601163279);
assert.equal(chinaTinOre.rows[0].quantity, 33902580);
assert.notEqual(chinaTinOre.rows[0].valueUsd, drcTinOre.rows[0].valueUsd);
assert.notEqual(chinaTinOre.rows[0].netWeightKg, drcTinOre.rows[0].netWeightKg);

const southAfricaNickelOre = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2604"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaNickelOre.total, 1);
assert.equal(southAfricaNickelOre.rows[0].product, "Nickel ores and concentrates");
assert.equal(southAfricaNickelOre.rows[0].quantity, 185165);
assert.ok(Math.abs(southAfricaNickelOre.rows[0].valueUsd - 386927.523) < 0.01, southAfricaNickelOre.rows[0].valueUsd);

const southAfricaNickel = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["750210"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaNickel.total, 1);
assert.equal(southAfricaNickel.rows[0].quantity, 631172);
assert.ok(Math.abs(southAfricaNickel.rows[0].valueUsd - 10288491.296) < 0.01, southAfricaNickel.rows[0].valueUsd);
assert.notEqual(southAfricaNickel.rows[0].valueUsd, southAfricaNickelOre.rows[0].valueUsd);

const chinaSouthAfricaOre = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["2604"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaOre.total, 1);
assert.equal(chinaSouthAfricaOre.rows[0].valueUsd, 39149);
assert.notEqual(chinaSouthAfricaOre.rows[0].valueUsd, southAfricaNickelOre.rows[0].valueUsd);

const chinaSouthAfricaNickel = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["750210"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaNickel.total, 1);
assert.equal(chinaSouthAfricaNickel.rows[0].valueUsd, 58108611);
assert.equal(chinaSouthAfricaNickel.rows[0].quantity, 3741851);
assert.notEqual(chinaSouthAfricaNickel.rows[0].valueUsd, southAfricaNickel.rows[0].valueUsd);

const rwandaTinOre = queryTrade(db, {
  reporterIso3: "RWA",
  partnerIso3: "THA",
  flow: "export",
  year: 2024,
  hsCodes: ["2609"],
  page: 1,
  perPage: 5,
});
assert.equal(rwandaTinOre.total, 1);
assert.ok(Math.abs(rwandaTinOre.rows[0].quantity - 751575.06) < 0.01, rwandaTinOre.rows[0].quantity);
assert.ok(Math.abs(rwandaTinOre.rows[0].valueUsd - 13747356.724) < 0.01, rwandaTinOre.rows[0].valueUsd);

const rwandaTin = queryTrade(db, {
  reporterIso3: "RWA",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["800110"],
  page: 1,
  perPage: 5,
});
assert.equal(rwandaTin.total, 1);
assert.equal(rwandaTin.rows[0].product, "Tin, unwrought, not alloyed");
assert.ok(Math.abs(rwandaTin.rows[0].quantity - 24895.6) < 0.01, rwandaTin.rows[0].quantity);
assert.ok(Math.abs(rwandaTin.rows[0].valueUsd - 586798.861) < 0.01, rwandaTin.rows[0].valueUsd);
assert.notEqual(rwandaTin.rows[0].valueUsd, rwandaTinOre.rows[0].valueUsd);

const zimbabweNickelOre = queryTrade(db, {
  reporterIso3: "ZWE",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2604"],
  page: 1,
  perPage: 5,
});
assert.equal(zimbabweNickelOre.total, 0);

const chinaZimbabweOre = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZWE",
  flow: "import",
  year: 2024,
  hsCodes: ["2604"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaZimbabweOre.total, 1);
assert.equal(chinaZimbabweOre.rows[0].valueUsd, 1722032);
assert.equal(chinaZimbabweOre.rows[0].quantity, 1569992);

const southAfricaZincOre = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2608"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaZincOre.total, 1);
assert.equal(southAfricaZincOre.rows[0].product, "Zinc ores and concentrates");
assert.equal(southAfricaZincOre.rows[0].category, "Minerals & energy");
assert.equal(southAfricaZincOre.rows[0].quantityUnit, "kg");
assert.equal(southAfricaZincOre.rows[0].quantity, 277550200);
assert.equal(southAfricaZincOre.rows[0].netWeightKg, 277550200);
assert.ok(Math.abs(southAfricaZincOre.rows[0].valueUsd - 250809025.388) < 0.01, southAfricaZincOre.rows[0].valueUsd);

const chinaSouthAfricaZinc = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["2608"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaZinc.total, 1);
assert.equal(chinaSouthAfricaZinc.rows[0].valueUsd, 265673278);
assert.equal(chinaSouthAfricaZinc.rows[0].quantity, 254096200);
assert.notEqual(chinaSouthAfricaZinc.rows[0].valueUsd, southAfricaZincOre.rows[0].valueUsd);
assert.notEqual(chinaSouthAfricaZinc.rows[0].netWeightKg, southAfricaZincOre.rows[0].netWeightKg);

const southAfricaZincMetal = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaZincMetal.total, 0);

const namibiaZinc = queryTrade(db, {
  reporterIso3: "NAM",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2608"],
  page: 1,
  perPage: 5,
});
assert.equal(namibiaZinc.total, 1);
assert.ok(Math.abs(namibiaZinc.rows[0].quantity - 32727810.3) < 0.01, namibiaZinc.rows[0].quantity);
assert.equal(namibiaZinc.rows[0].netWeightKg, namibiaZinc.rows[0].quantity);
assert.ok(Math.abs(namibiaZinc.rows[0].valueUsd - 25684347.682) < 0.01, namibiaZinc.rows[0].valueUsd);

const namibiaLead = queryTrade(db, {
  reporterIso3: "NAM",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(namibiaLead.total, 1);
assert.equal(namibiaLead.rows[0].product, "Lead ores and concentrates");
assert.equal(namibiaLead.rows[0].quantity, 28023100);
assert.ok(Math.abs(namibiaLead.rows[0].valueUsd - 30970560.93) < 0.01, namibiaLead.rows[0].valueUsd);
assert.notEqual(namibiaLead.rows[0].valueUsd, namibiaZinc.rows[0].valueUsd);

const chinaNamibiaLead = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "NAM",
  flow: "import",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaNamibiaLead.total, 1);
assert.equal(chinaNamibiaLead.rows[0].valueUsd, 27505014);
assert.equal(chinaNamibiaLead.rows[0].quantity, 18975810);
assert.notEqual(chinaNamibiaLead.rows[0].valueUsd, namibiaLead.rows[0].valueUsd);

const namibiaMetal = queryTrade(db, {
  reporterIso3: "NAM",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["790111", "780110"],
  page: 1,
  perPage: 5,
});
assert.equal(namibiaMetal.total, 0);

const moroccoLead = queryTrade(db, {
  reporterIso3: "MAR",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(moroccoLead.total, 1);
assert.equal(moroccoLead.rows[0].quantity, 54063390);
assert.ok(Math.abs(moroccoLead.rows[0].valueUsd - 81259821.199) < 0.01, moroccoLead.rows[0].valueUsd);

const chinaMoroccoLead = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "MAR",
  flow: "import",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaMoroccoLead.total, 1);
assert.equal(chinaMoroccoLead.rows[0].valueUsd, 58662603);
assert.equal(chinaMoroccoLead.rows[0].quantity, 39395138);
assert.notEqual(chinaMoroccoLead.rows[0].valueUsd, moroccoLead.rows[0].valueUsd);

const moroccoZinc = queryTrade(db, {
  reporterIso3: "MAR",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2608"],
  page: 1,
  perPage: 5,
});
assert.equal(moroccoZinc.total, 1);
assert.ok(Math.abs(moroccoZinc.rows[0].valueUsd - 49479464.033) < 0.01, moroccoZinc.rows[0].valueUsd);
assert.notEqual(moroccoZinc.rows[0].valueUsd, moroccoLead.rows[0].valueUsd);

const eritreaZinc = queryTrade(db, {
  reporterIso3: "ERI",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2608"],
  page: 1,
  perPage: 5,
});
assert.equal(eritreaZinc.total, 0);

const chinaEritreaZinc = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ERI",
  flow: "import",
  year: 2024,
  hsCodes: ["2608"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaEritreaZinc.total, 1);
assert.equal(chinaEritreaZinc.rows[0].valueUsd, 179716804);
assert.equal(chinaEritreaZinc.rows[0].quantity, 165116600);

const southAfricaLeadToChina = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaLeadToChina.total, 0);

const chinaSouthAfricaLead = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaLead.total, 1);
assert.equal(chinaSouthAfricaLead.rows[0].valueUsd, 10384412);
assert.equal(chinaSouthAfricaLead.rows[0].quantity, 5263500);

const southAfricaLeadOre = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "KOR",
  flow: "export",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaLeadOre.total, 1);
assert.equal(southAfricaLeadOre.rows[0].quantity, 30000000);
assert.ok(Math.abs(southAfricaLeadOre.rows[0].valueUsd - 51715096.363) < 0.01, southAfricaLeadOre.rows[0].valueUsd);

const koreaSouthAfricaLead = queryTrade(db, {
  reporterIso3: "KOR",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(koreaSouthAfricaLead.total, 1);
assert.equal(koreaSouthAfricaLead.rows[0].valueUsd, 41735321);
assert.equal(koreaSouthAfricaLead.rows[0].quantity, 22754160);
assert.notEqual(koreaSouthAfricaLead.rows[0].valueUsd, southAfricaLeadOre.rows[0].valueUsd);

const southAfricaZincToKorea = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "KOR",
  flow: "export",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaZincToKorea.total, 0);

const koreaZinc = queryTrade(db, {
  reporterIso3: "KOR",
  partnerIso3: "ZAF",
  flow: "export",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(koreaZinc.total, 1);
assert.equal(koreaZinc.rows[0].product, "Zinc, unwrought, at least 99.99%");
assert.equal(koreaZinc.rows[0].quantity, 4600945);
assert.equal(koreaZinc.rows[0].valueUsd, 12953160);
assert.notEqual(koreaZinc.rows[0].valueUsd, southAfricaLeadOre.rows[0].valueUsd);

const southAfricaZincImport = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "KOR",
  flow: "import",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaZincImport.total, 1);
assert.equal(southAfricaZincImport.rows[0].quantity, 401498);
assert.ok(Math.abs(southAfricaZincImport.rows[0].valueUsd - 1208307.544) < 0.01, southAfricaZincImport.rows[0].valueUsd);
assert.notEqual(southAfricaZincImport.rows[0].valueUsd, koreaZinc.rows[0].valueUsd);

const indiaZinc = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "KEN",
  flow: "export",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(indiaZinc.total, 1);
assert.equal(indiaZinc.rows[0].quantity, 4846000);
assert.ok(Math.abs(indiaZinc.rows[0].valueUsd - 13799916.908) < 0.01, indiaZinc.rows[0].valueUsd);

const kenyaZinc = queryTrade(db, {
  reporterIso3: "KEN",
  partnerIso3: "IND",
  flow: "import",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(kenyaZinc.total, 1);
assert.equal(kenyaZinc.rows[0].quantity, 796938);
assert.ok(Math.abs(kenyaZinc.rows[0].valueUsd - 2379361.369) < 0.01, kenyaZinc.rows[0].valueUsd);
assert.notEqual(kenyaZinc.rows[0].valueUsd, indiaZinc.rows[0].valueUsd);

const indiaEgyptZinc = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "EGY",
  flow: "export",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(indiaEgyptZinc.total, 1);
assert.equal(indiaEgyptZinc.rows[0].quantity, 649577);
assert.ok(Math.abs(indiaEgyptZinc.rows[0].valueUsd - 1857156.791) < 0.01, indiaEgyptZinc.rows[0].valueUsd);

const egyptZinc = queryTrade(db, {
  reporterIso3: "EGY",
  partnerIso3: "IND",
  flow: "import",
  year: 2024,
  hsCodes: ["790111"],
  page: 1,
  perPage: 5,
});
assert.equal(egyptZinc.total, 1);
assert.equal(egyptZinc.rows[0].quantity, null);
assert.equal(egyptZinc.rows[0].netWeightKg, null);
assert.ok(Math.abs(egyptZinc.rows[0].valueUsd - 3045352.46) < 0.01, egyptZinc.rows[0].valueUsd);
assert.notEqual(egyptZinc.rows[0].valueUsd, indiaEgyptZinc.rows[0].valueUsd);

const ghanaLead = queryTrade(db, {
  reporterIso3: "GHA",
  partnerIso3: "TUR",
  flow: "export",
  year: 2024,
  hsCodes: ["780110"],
  page: 1,
  perPage: 5,
});
assert.equal(ghanaLead.total, 1);
assert.equal(ghanaLead.rows[0].product, "Lead, unwrought, refined");
assert.equal(ghanaLead.rows[0].quantityUnit, "kg");
assert.ok(Math.abs(ghanaLead.rows[0].quantity - 1686331.186) < 0.01, ghanaLead.rows[0].quantity);
assert.equal(ghanaLead.rows[0].netWeightKg, 8700496);
assert.notEqual(ghanaLead.rows[0].quantity, ghanaLead.rows[0].netWeightKg);
assert.ok(Math.abs(ghanaLead.rows[0].valueUsd - 17491814.703) < 0.01, ghanaLead.rows[0].valueUsd);

const ghanaLeadOre = queryTrade(db, {
  reporterIso3: "GHA",
  partnerIso3: "TUR",
  flow: "export",
  year: 2024,
  hsCodes: ["2607"],
  page: 1,
  perPage: 5,
});
assert.equal(ghanaLeadOre.total, 0);

const southAfricaRefinedLead = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "SGP",
  flow: "export",
  year: 2024,
  hsCodes: ["780110"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaRefinedLead.total, 1);
assert.equal(southAfricaRefinedLead.rows[0].quantity, 6141492);
assert.ok(Math.abs(southAfricaRefinedLead.rows[0].valueUsd - 13328643.328) < 0.01, southAfricaRefinedLead.rows[0].valueUsd);

const singaporeLead = queryTrade(db, {
  reporterIso3: "SGP",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["780110"],
  page: 1,
  perPage: 5,
});
assert.equal(singaporeLead.total, 1);
assert.equal(singaporeLead.rows[0].valueUsd, 9369127.893);
assert.equal(singaporeLead.rows[0].quantity, 4426800);
assert.notEqual(singaporeLead.rows[0].valueUsd, southAfricaRefinedLead.rows[0].valueUsd);

const botswanaRough = queryTrade(db, {
  reporterIso3: "BWA",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(botswanaRough.total, 1);
assert.equal(botswanaRough.rows[0].product, "Diamonds, non-industrial, unworked");
assert.equal(botswanaRough.rows[0].category, "Precious stones");
assert.equal(botswanaRough.rows[0].quantityUnit, "carat");
assert.equal(botswanaRough.rows[0].quantity, 3159900);
assert.equal(botswanaRough.rows[0].netWeightKg, 631.98);
assert.notEqual(botswanaRough.rows[0].quantity, botswanaRough.rows[0].netWeightKg);
assert.ok(Math.abs(botswanaRough.rows[0].valueUsd - 451944095.57) < 0.01, botswanaRough.rows[0].valueUsd);

const indiaRough = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "BWA",
  flow: "import",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(indiaRough.total, 1);
assert.equal(indiaRough.rows[0].quantity, 5378191);
assert.equal(indiaRough.rows[0].netWeightKg, 1075.635);
assert.ok(Math.abs(indiaRough.rows[0].valueUsd - 1140746274.389) < 0.01, indiaRough.rows[0].valueUsd);
assert.notEqual(indiaRough.rows[0].valueUsd, botswanaRough.rows[0].valueUsd);

const botswanaWorked = queryTrade(db, {
  reporterIso3: "BWA",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["710239"],
  page: 1,
  perPage: 5,
});
assert.equal(botswanaWorked.total, 1);
assert.equal(botswanaWorked.rows[0].product, "Diamonds, non-industrial, worked");
assert.equal(botswanaWorked.rows[0].quantityUnit, "carat");
assert.equal(botswanaWorked.rows[0].quantity, 1442800);
assert.equal(botswanaWorked.rows[0].netWeightKg, 288.56);
assert.ok(Math.abs(botswanaWorked.rows[0].valueUsd - 67363839.623) < 0.01, botswanaWorked.rows[0].valueUsd);
assert.notEqual(botswanaWorked.rows[0].valueUsd, botswanaRough.rows[0].valueUsd);

const indiaWorked = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "BWA",
  flow: "import",
  year: 2024,
  hsCodes: ["710239"],
  page: 1,
  perPage: 5,
});
assert.equal(indiaWorked.total, 1);
assert.equal(indiaWorked.rows[0].quantity, 5985);
assert.equal(indiaWorked.rows[0].netWeightKg, 1.197);
assert.ok(Math.abs(indiaWorked.rows[0].valueUsd - 13492376.917) < 0.01, indiaWorked.rows[0].valueUsd);
assert.notEqual(indiaWorked.rows[0].valueUsd, botswanaWorked.rows[0].valueUsd);

const botswanaChinaRough = queryTrade(db, {
  reporterIso3: "BWA",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(botswanaChinaRough.total, 0);

const chinaBotswanaRough = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "BWA",
  flow: "import",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaBotswanaRough.total, 1);
assert.equal(chinaBotswanaRough.rows[0].quantity, 2130);
assert.equal(chinaBotswanaRough.rows[0].netWeightKg, 0.426);
assert.equal(chinaBotswanaRough.rows[0].valueUsd, 632307);

const uaeBotswanaRough = queryTrade(db, {
  reporterIso3: "ARE",
  partnerIso3: "BWA",
  flow: "import",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(uaeBotswanaRough.total, 0);

const angolaIndustrial = queryTrade(db, {
  reporterIso3: "AGO",
  partnerIso3: "ARE",
  flow: "export",
  year: 2024,
  hsCodes: ["710221"],
  page: 1,
  perPage: 5,
});
assert.equal(angolaIndustrial.total, 1);
assert.equal(angolaIndustrial.rows[0].product, "Diamonds, industrial, unworked");
assert.equal(angolaIndustrial.rows[0].quantityUnit, "carat");
assert.ok(Math.abs(angolaIndustrial.rows[0].quantity - 7971432.63) < 0.01, angolaIndustrial.rows[0].quantity);
assert.equal(angolaIndustrial.rows[0].netWeightKg, null);
assert.ok(Math.abs(angolaIndustrial.rows[0].valueUsd - 1189265315.6) < 0.01, angolaIndustrial.rows[0].valueUsd);
assert.notEqual(angolaIndustrial.rows[0].valueUsd, botswanaRough.rows[0].valueUsd);

const angolaGem = queryTrade(db, {
  reporterIso3: "AGO",
  partnerIso3: "ARE",
  flow: "export",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(angolaGem.total, 0);

const uaeAngolaIndustrial = queryTrade(db, {
  reporterIso3: "ARE",
  partnerIso3: "AGO",
  flow: "import",
  year: 2024,
  hsCodes: ["710221"],
  page: 1,
  perPage: 5,
});
assert.equal(uaeAngolaIndustrial.total, 0);

const southAfricaRough = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "IND",
  flow: "export",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaRough.total, 1);
assert.equal(southAfricaRough.rows[0].quantity, 24752.9);
assert.equal(southAfricaRough.rows[0].netWeightKg, 4.951);
assert.ok(Math.abs(southAfricaRough.rows[0].valueUsd - 10934523.395) < 0.01, southAfricaRough.rows[0].valueUsd);

const indiaSouthAfricaRough = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(indiaSouthAfricaRough.total, 1);
assert.equal(indiaSouthAfricaRough.rows[0].quantity, 1760967);
assert.equal(indiaSouthAfricaRough.rows[0].netWeightKg, 352.193);
assert.ok(Math.abs(indiaSouthAfricaRough.rows[0].valueUsd - 427651142.36) < 0.01, indiaSouthAfricaRough.rows[0].valueUsd);
assert.notEqual(indiaSouthAfricaRough.rows[0].valueUsd, southAfricaRough.rows[0].valueUsd);

const southAfricaChinaRough = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaChinaRough.total, 0);

const chinaSouthAfricaRough = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaRough.total, 1);
assert.equal(chinaSouthAfricaRough.rows[0].quantity, 103513);
assert.equal(chinaSouthAfricaRough.rows[0].netWeightKg, 20.703);
assert.equal(chinaSouthAfricaRough.rows[0].valueUsd, 31363508);

const indiaWorkedToSouthAfrica = queryTrade(db, {
  reporterIso3: "IND",
  partnerIso3: "ZAF",
  flow: "export",
  year: 2024,
  hsCodes: ["710239"],
  page: 1,
  perPage: 5,
});
assert.equal(indiaWorkedToSouthAfrica.total, 1);
assert.equal(indiaWorkedToSouthAfrica.rows[0].product, "Diamonds, non-industrial, worked");
assert.equal(indiaWorkedToSouthAfrica.rows[0].quantityUnit, "carat");
assert.equal(indiaWorkedToSouthAfrica.rows[0].quantity, 15928);
assert.equal(indiaWorkedToSouthAfrica.rows[0].netWeightKg, 3.186);
assert.ok(Math.abs(indiaWorkedToSouthAfrica.rows[0].valueUsd - 16423585.868) < 0.01, indiaWorkedToSouthAfrica.rows[0].valueUsd);
assert.notEqual(indiaWorkedToSouthAfrica.rows[0].valueUsd, indiaSouthAfricaRough.rows[0].valueUsd);

const botswanaUnsorted = queryTrade(db, {
  reporterIso3: "BWA",
  partnerIso3: "ARE",
  flow: "export",
  year: 2024,
  hsCodes: ["710210"],
  page: 1,
  perPage: 5,
});
assert.equal(botswanaUnsorted.total, 1);
assert.equal(botswanaUnsorted.rows[0].product, "Diamonds, unsorted");
assert.equal(botswanaUnsorted.rows[0].quantityUnit, "carat");
assert.equal(botswanaUnsorted.rows[0].quantity, 60000);
assert.equal(botswanaUnsorted.rows[0].netWeightKg, 12);
assert.ok(Math.abs(botswanaUnsorted.rows[0].valueUsd - 937558.188) < 0.01, botswanaUnsorted.rows[0].valueUsd);
assert.notEqual(botswanaUnsorted.rows[0].valueUsd, botswanaRough.rows[0].valueUsd);

const drcRough = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "ARE",
  flow: "export",
  year: 2023,
  hsCodes: ["710231"],
  page: 1,
  perPage: 5,
});
assert.equal(drcRough.total, 1);
assert.equal(drcRough.rows[0].quantity, null);
assert.equal(drcRough.rows[0].quantityUnit, null);
assert.equal(drcRough.rows[0].netWeightKg, 781);
assert.ok(Math.abs(drcRough.rows[0].valueUsd - 35893737.57) < 0.01, drcRough.rows[0].valueUsd);

const centralAfricanIndustrial = queryTrade(db, {
  reporterIso3: "CAF",
  partnerIso3: "ARE",
  flow: "export",
  year: 2023,
  hsCodes: ["710221"],
  page: 1,
  perPage: 5,
});
assert.equal(centralAfricanIndustrial.total, 1);
assert.equal(centralAfricanIndustrial.rows[0].quantity, null);
assert.equal(centralAfricanIndustrial.rows[0].netWeightKg, null);
assert.ok(Math.abs(centralAfricanIndustrial.rows[0].valueUsd - 13446226.434) < 0.01, centralAfricanIndustrial.rows[0].valueUsd);

const tanzaniaGraphite = queryTrade(db, {
  reporterIso3: "TZA",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2504"],
  page: 1,
  perPage: 5,
});
assert.equal(tanzaniaGraphite.total, 1);
assert.equal(tanzaniaGraphite.rows[0].product, "Natural graphite");
assert.equal(tanzaniaGraphite.rows[0].category, "Minerals & energy");
assert.equal(tanzaniaGraphite.rows[0].quantityUnit, "kg");
assert.equal(tanzaniaGraphite.rows[0].quantity, 31372970);
assert.equal(tanzaniaGraphite.rows[0].netWeightKg, 31372970);
assert.ok(Math.abs(tanzaniaGraphite.rows[0].valueUsd - 14198079.359) < 0.01, tanzaniaGraphite.rows[0].valueUsd);

const chinaTanzaniaGraphite = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "TZA",
  flow: "import",
  year: 2024,
  hsCodes: ["2504"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaTanzaniaGraphite.total, 1);
assert.equal(chinaTanzaniaGraphite.rows[0].quantity, 25340300);
assert.equal(chinaTanzaniaGraphite.rows[0].valueUsd, 13557966);
assert.notEqual(chinaTanzaniaGraphite.rows[0].valueUsd, tanzaniaGraphite.rows[0].valueUsd);

const madagascarGraphite = queryTrade(db, {
  reporterIso3: "MDG",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2504"],
  page: 1,
  perPage: 5,
});
assert.equal(madagascarGraphite.total, 1);
assert.equal(madagascarGraphite.rows[0].quantity, 20124900);
assert.ok(Math.abs(madagascarGraphite.rows[0].valueUsd - 7896859.457) < 0.01, madagascarGraphite.rows[0].valueUsd);
assert.notEqual(madagascarGraphite.rows[0].valueUsd, tanzaniaGraphite.rows[0].valueUsd);

const chinaMadagascarGraphite = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "MDG",
  flow: "import",
  year: 2024,
  hsCodes: ["2504"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaMadagascarGraphite.total, 1);
assert.equal(chinaMadagascarGraphite.rows[0].quantity, 11886365);
assert.equal(chinaMadagascarGraphite.rows[0].valueUsd, 8307840);
assert.notEqual(chinaMadagascarGraphite.rows[0].valueUsd, madagascarGraphite.rows[0].valueUsd);

const mozambiqueGraphite = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2504"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueGraphite.total, 1);
assert.equal(mozambiqueGraphite.rows[0].quantity, 655084);
assert.ok(Math.abs(mozambiqueGraphite.rows[0].valueUsd - 2252387.4) < 0.01, mozambiqueGraphite.rows[0].valueUsd);

const chinaMozambiqueGraphite = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "MOZ",
  flow: "import",
  year: 2024,
  hsCodes: ["2504"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaMozambiqueGraphite.total, 1);
assert.equal(chinaMozambiqueGraphite.rows[0].quantity, 11771149);
assert.equal(chinaMozambiqueGraphite.rows[0].valueUsd, 5022606);
assert.notEqual(chinaMozambiqueGraphite.rows[0].valueUsd, mozambiqueGraphite.rows[0].valueUsd);

const mozambiqueTitanium = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2614"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueTitanium.total, 1);
assert.equal(mozambiqueTitanium.rows[0].product, "Titanium ores and concentrates");
assert.equal(mozambiqueTitanium.rows[0].quantityUnit, "kg");
assert.equal(mozambiqueTitanium.rows[0].quantity, 743042000);
assert.equal(mozambiqueTitanium.rows[0].netWeightKg, 743042000);
assert.ok(Math.abs(mozambiqueTitanium.rows[0].valueUsd - 148311867.3) < 0.01, mozambiqueTitanium.rows[0].valueUsd);
assert.notEqual(mozambiqueTitanium.rows[0].valueUsd, mozambiqueGraphite.rows[0].valueUsd);

const chinaMozambiqueTitanium = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "MOZ",
  flow: "import",
  year: 2024,
  hsCodes: ["2614"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaMozambiqueTitanium.total, 1);
assert.equal(chinaMozambiqueTitanium.rows[0].quantity, 2296356000);
assert.equal(chinaMozambiqueTitanium.rows[0].valueUsd, 716334689);
assert.notEqual(chinaMozambiqueTitanium.rows[0].valueUsd, mozambiqueTitanium.rows[0].valueUsd);

const mozambiqueTitanium2023 = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2023,
  hsCodes: ["2614"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueTitanium2023.total, 1);
assert.equal(mozambiqueTitanium2023.rows[0].quantity, 706982300);
assert.equal(mozambiqueTitanium2023.rows[0].netWeightKg, 710696200);
assert.notEqual(mozambiqueTitanium2023.rows[0].quantity, mozambiqueTitanium2023.rows[0].netWeightKg);
assert.equal(mozambiqueTitanium2023.rows[0].valueUsd, 194785000);

const southAfricaTitanium = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2614"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaTitanium.total, 1);
assert.equal(southAfricaTitanium.rows[0].quantity, 211153690);
assert.ok(Math.abs(southAfricaTitanium.rows[0].valueUsd - 76896528.874) < 0.01, southAfricaTitanium.rows[0].valueUsd);

const chinaSouthAfricaTitanium = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["2614"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaTitanium.total, 1);
assert.equal(chinaSouthAfricaTitanium.rows[0].quantity, null);
assert.equal(chinaSouthAfricaTitanium.rows[0].netWeightKg, null);
assert.equal(chinaSouthAfricaTitanium.rows[0].quantityUnit, null);
assert.equal(chinaSouthAfricaTitanium.rows[0].valueUsd, 13288021);
assert.notEqual(chinaSouthAfricaTitanium.rows[0].valueUsd, southAfricaTitanium.rows[0].valueUsd);

const sierraLeoneTitanium = queryTrade(db, {
  reporterIso3: "SLE",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["2614"],
  page: 1,
  perPage: 5,
});
assert.equal(sierraLeoneTitanium.total, 0);

const chinaSierraLeoneTitanium = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "SLE",
  flow: "import",
  year: 2024,
  hsCodes: ["2614"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSierraLeoneTitanium.total, 1);
assert.equal(chinaSierraLeoneTitanium.rows[0].quantity, 111920410);
assert.equal(chinaSierraLeoneTitanium.rows[0].valueUsd, 72790939);

const southAfricaZircon = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["261510"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaZircon.total, 1);
assert.equal(southAfricaZircon.rows[0].product, "Zirconium ores and concentrates");
assert.equal(southAfricaZircon.rows[0].quantityUnit, "kg");
assert.ok(Math.abs(southAfricaZircon.rows[0].quantity - 431390704.9) < 0.01, southAfricaZircon.rows[0].quantity);
assert.ok(Math.abs(southAfricaZircon.rows[0].valueUsd - 382947659.104) < 0.01, southAfricaZircon.rows[0].valueUsd);
assert.notEqual(southAfricaZircon.rows[0].valueUsd, southAfricaTitanium.rows[0].valueUsd);

const chinaSouthAfricaZircon = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["261510"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaZircon.total, 1);
assert.equal(chinaSouthAfricaZircon.rows[0].quantity, 429139800);
assert.equal(chinaSouthAfricaZircon.rows[0].valueUsd, 403893158);
assert.notEqual(chinaSouthAfricaZircon.rows[0].valueUsd, southAfricaZircon.rows[0].valueUsd);

const mozambiqueZircon = queryTrade(db, {
  reporterIso3: "MOZ",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["261510"],
  page: 1,
  perPage: 5,
});
assert.equal(mozambiqueZircon.total, 1);
assert.equal(mozambiqueZircon.rows[0].quantity, 75189700);
assert.ok(Math.abs(mozambiqueZircon.rows[0].valueUsd - 63367222.1) < 0.01, mozambiqueZircon.rows[0].valueUsd);
assert.notEqual(mozambiqueZircon.rows[0].valueUsd, mozambiqueTitanium.rows[0].valueUsd);

const rwandaResidual = queryTrade(db, {
  reporterIso3: "RWA",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(rwandaResidual.total, 1);
assert.equal(rwandaResidual.rows[0].product, "Niobium, tantalum, or vanadium ores");
assert.equal(rwandaResidual.rows[0].quantityUnit, "kg");
assert.ok(Math.abs(rwandaResidual.rows[0].quantity - 1197201.48) < 0.01, rwandaResidual.rows[0].quantity);
assert.ok(Math.abs(rwandaResidual.rows[0].valueUsd - 48976328.857) < 0.01, rwandaResidual.rows[0].valueUsd);

const chinaRwandaResidual = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "RWA",
  flow: "import",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaRwandaResidual.total, 1);
assert.equal(chinaRwandaResidual.rows[0].quantity, 2286483);
assert.equal(chinaRwandaResidual.rows[0].valueUsd, 107655109);
assert.notEqual(chinaRwandaResidual.rows[0].valueUsd, rwandaResidual.rows[0].valueUsd);

const drcResidual = queryTrade(db, {
  reporterIso3: "COD",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(drcResidual.total, 1);
assert.equal(drcResidual.rows[0].quantity, 352659);
assert.ok(Math.abs(drcResidual.rows[0].valueUsd - 9759036.912) < 0.01, drcResidual.rows[0].valueUsd);
assert.notEqual(drcResidual.rows[0].valueUsd, rwandaResidual.rows[0].valueUsd);

const chinaDrcResidual = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "COD",
  flow: "import",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaDrcResidual.total, 1);
assert.equal(chinaDrcResidual.rows[0].quantity, 1087935);
assert.equal(chinaDrcResidual.rows[0].valueUsd, 54922619);
assert.notEqual(chinaDrcResidual.rows[0].valueUsd, drcResidual.rows[0].valueUsd);
assert.notEqual(chinaDrcResidual.rows[0].valueUsd, chinaRwandaResidual.rows[0].valueUsd);

const nigeriaResidual = queryTrade(db, {
  reporterIso3: "NGA",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(nigeriaResidual.total, 1);
assert.equal(nigeriaResidual.rows[0].quantity, 2248378);
assert.ok(Math.abs(nigeriaResidual.rows[0].valueUsd - 2430483.393) < 0.01, nigeriaResidual.rows[0].valueUsd);
assert.notEqual(nigeriaResidual.rows[0].valueUsd, rwandaResidual.rows[0].valueUsd);

const chinaNigeriaResidual = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "NGA",
  flow: "import",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaNigeriaResidual.total, 1);
assert.equal(chinaNigeriaResidual.rows[0].quantity, 6066874);
assert.equal(chinaNigeriaResidual.rows[0].valueUsd, 111459995);
assert.notEqual(chinaNigeriaResidual.rows[0].valueUsd, nigeriaResidual.rows[0].valueUsd);
assert.notEqual(chinaNigeriaResidual.rows[0].valueUsd, chinaRwandaResidual.rows[0].valueUsd);

const southAfricaResidual = queryTrade(db, {
  reporterIso3: "ZAF",
  partnerIso3: "CHN",
  flow: "export",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(southAfricaResidual.total, 0);

const chinaSouthAfricaResidual = queryTrade(db, {
  reporterIso3: "CHN",
  partnerIso3: "ZAF",
  flow: "import",
  year: 2024,
  hsCodes: ["261590"],
  page: 1,
  perPage: 5,
});
assert.equal(chinaSouthAfricaResidual.total, 1);
assert.equal(chinaSouthAfricaResidual.rows[0].quantity, 31999000);
assert.equal(chinaSouthAfricaResidual.rows[0].valueUsd, 3186331);
assert.notEqual(chinaSouthAfricaResidual.rows[0].valueUsd, southAfricaZircon.rows[0].valueUsd);
assert.notEqual(chinaSouthAfricaResidual.rows[0].valueUsd, southAfricaTitanium.rows[0].valueUsd);

for (const code of ["710210", "710221", "710231", "710239", "2504", "2614", "261510", "261590"]) {
  const quote = queryPrices(db, { hsCode: code, from: "2015-01", to: "2026-10", page: 1, perPage: 5 });
  assert.equal(quote.total, 0, code);
}

for (const code of ["720260", "750110", "750220", "800120", "790112", "790120", "780191", "780199", "710229", "710421", "710429", "710510", "3801", "2823", "320611", "8108"]) {
  const product = db.prepare("SELECT hs_code FROM products WHERE hs_code = ?").get(code);
  assert.equal(product, undefined, code);
}

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
  ironOreUsd: ironOre.rows[0].valueUsd,
  brentUsdPerBbl: brent.rows[0].priceUsd,
  cathodeUsd: cathodes.rows[0].valueUsd,
  chinaGoldUsd: chinaGold.rows[0].valueUsd,
  goldUsdPerOz: goldPrice.rows[0].priceUsd,
  chinaLogsUsd: chinaLogs.rows[0].valueUsd,
  cameroonLogsUsdPerM3: cameroonLogsPrice.priceUsd,
  gabonSawnwoodUsd: gabonSawn.rows[0].valueUsd,
  chinaBauxiteUsd: chinaBauxite.rows[0].valueUsd,
  chinaAluminumUsd: chinaAluminum.rows[0].valueUsd,
  aluminumUsdPerMt: aluminumPrice.rows[0].priceUsd,
  manganeseUsd: southAfricaManganese.rows[0].valueUsd,
  chromiumUsd: southAfricaChromium.rows[0].valueUsd,
  cobaltHydroxideUsd: drcHydroxide.rows[0].valueUsd,
  chinaCobaltUsd: chinaUnwroughtCobalt.rows[0].valueUsd,
  nigeriaLngUsd: nigeriaLng.rows[0].valueUsd,
  chinaLngUsd: chinaLng.rows[0].valueUsd,
  angolaLngUsd: angolaLng.rows[0].valueUsd,
  japanLngUsdPerMmbtu: japanLng.rows[0].priceUsd,
  madagascarNickelUsd: madagascarNickel.rows[0].valueUsd,
  drcTinOreUsd: drcTinOre.rows[0].valueUsd,
  chinaTinOreUsd: chinaTinOre.rows[0].valueUsd,
  nickelUsdPerMt: nickelPrice.rows[0].priceUsd,
  tinUsdPerMt: tinPrice.rows[0].priceUsd,
  zincUsdPerMt: zincPrice.rows[0].priceUsd,
  leadUsdPerMt: leadPrice.rows[0].priceUsd,
  southAfricaZincUsd: southAfricaZincOre.rows[0].valueUsd,
  moroccoLeadUsd: moroccoLead.rows[0].valueUsd,
  chinaEritreaZincUsd: chinaEritreaZinc.rows[0].valueUsd,
  botswanaDiamondUsd: botswanaRough.rows[0].valueUsd,
  indiaDiamondUsd: indiaRough.rows[0].valueUsd,
  angolaIndustrialDiamondUsd: angolaIndustrial.rows[0].valueUsd,
  tanzaniaGraphiteUsd: tanzaniaGraphite.rows[0].valueUsd,
  mozambiqueTitaniumUsd: mozambiqueTitanium.rows[0].valueUsd,
  chinaMozambiqueTitaniumUsd: chinaMozambiqueTitanium.rows[0].valueUsd,
  southAfricaZirconUsd: southAfricaZircon.rows[0].valueUsd,
  rwandaResidualUsd: rwandaResidual.rows[0].valueUsd,
  chinaNigeriaResidualUsd: chinaNigeriaResidual.rows[0].valueUsd,
});
