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
});
