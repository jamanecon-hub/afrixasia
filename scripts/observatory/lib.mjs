import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const paths = {
  root,
  data: path.join(root, "data"),
  collected: path.join(root, "data", "collected"),
  database: path.join(root, "data", "observatory.sqlite"),
  wdi: path.join(root, "data", "wdi.json"),
  observations: path.join(root, "data", "observations.json"),
  market: path.join(root, "data", "market.json"),
  wdiExtra: path.join(root, "data", "collected", "wdi-extra.json"),
  tradeFlows: path.join(root, "data", "collected", "trade-flows.json"),
  tradeHorticulture: path.join(root, "data", "collected", "trade-horticulture.json"),
  tradeSpecialty: path.join(root, "data", "collected", "trade-specialty.json"),
  tradeFishery: path.join(root, "data", "collected", "trade-fishery.json"),
  tradeRubber: path.join(root, "data", "collected", "trade-rubber.json"),
  tradeGroundnuts: path.join(root, "data", "collected", "trade-groundnuts.json"),
  tradeMaize: path.join(root, "data", "collected", "trade-maize.json"),
  tradeTobacco: path.join(root, "data", "collected", "trade-tobacco.json"),
  tradeSugar: path.join(root, "data", "collected", "trade-sugar.json"),
  tradePhosphate: path.join(root, "data", "collected", "trade-phosphate.json"),
  tradeCopper: path.join(root, "data", "collected", "trade-copper.json"),
  tradeCobalt: path.join(root, "data", "collected", "trade-cobalt.json"),
  tradeIron: path.join(root, "data", "collected", "trade-iron.json"),
  clientState: path.join(root, "data", "collected", "client.json"),
  commodityPrices: path.join(root, "data", "collected", "commodity-prices.json"),
  production: path.join(root, "data", "collected", "production.json"),
  fishProduction: path.join(root, "data", "collected", "fish-production.json"),
};

export const snapshotDatasetId = "afrixasia-wdi";
export const extraDatasetId = "worldbank-wdi-extra";
export const tradeDatasetId = "un-comtrade-africa-asia";
export const horticultureDatasetId = "un-comtrade-horticulture";
export const specialtyDatasetId = "un-comtrade-specialty";
export const fisheryDatasetId = "un-comtrade-fishery";
export const rubberDatasetId = "un-comtrade-rubber";
export const groundnutDatasetId = "un-comtrade-groundnuts";
export const maizeDatasetId = "un-comtrade-maize";
export const tobaccoDatasetId = "un-comtrade-tobacco";
export const sugarDatasetId = "un-comtrade-sugar";
export const phosphateDatasetId = "un-comtrade-phosphate";
export const copperDatasetId = "un-comtrade-copper";
export const cobaltDatasetId = "un-comtrade-cobalt";
export const ironDatasetId = "un-comtrade-iron";
export const priceDatasetId = "worldbank-pink-sheet";
export const productionDatasetId = "faostat-qcl";
export const fishProductionDatasetId = "fao-fishstat";
export const marketDatasetId = "afrixasia-market";

export const tradeYears = [2023, 2024, 2025];
export const minTradeUsd = 1_000_000;
export const seriesStart = 2015;
export const seriesEnd = 2025;

export const extraIndicators = [
  {
    code: "NY.GDP.MKTP.CD",
    label: "PDB",
    unit: "current US$",
    category: "Market context",
    side: "context",
    interpretation: "Size of the economy. Historical scale, not product demand.",
  },
  {
    code: "FP.CPI.TOTL.ZG",
    label: "Inflasi",
    unit: "annual %",
    category: "Market context",
    side: "context",
    interpretation: "Consumer-price context for contracts. Not a commodity quote.",
  },
  {
    code: "PA.NUS.FCRF",
    label: "Nilai tukar resmi",
    unit: "LCU per US$",
    category: "Market context",
    side: "context",
    interpretation: "Official annual average exchange rate. Not a spot market quote.",
  },
  {
    code: "TX.VAL.MRCH.CD.WT",
    label: "Ekspor barang",
    unit: "current US$",
    category: "Market context",
    side: "supply",
    interpretation: "Merchandise export value. Not an order book or available stock.",
  },
  {
    code: "TM.VAL.MRCH.CD.WT",
    label: "Impor barang",
    unit: "current US$",
    category: "Market context",
    side: "demand",
    interpretation: "Merchandise import value. Not a live purchase order.",
  },
  {
    code: "BX.KLT.DINV.CD.WD",
    label: "Arus masuk FDI",
    unit: "current US$",
    category: "Market context",
    side: "context",
    interpretation: "FDI net inflows. Not a project pipeline.",
  },
  {
    code: "NV.AGR.TOTL.ZS",
    label: "Porsi nilai tambah pertanian",
    unit: "% of GDP",
    category: "Food & agriculture",
    side: "context",
    interpretation: "Agriculture share of GDP. Not harvested volume or export supply.",
  },
  {
    code: "AG.PRD.FOOD.XD",
    label: "Indeks produksi pangan",
    unit: "index, 2014-2016 = 100",
    category: "Food & agriculture",
    side: "supply",
    interpretation: "Food production index. Not available inventory.",
  },
  {
    code: "NV.IND.MANF.ZS",
    label: "Porsi nilai tambah manufaktur",
    unit: "% of GDP",
    category: "Apparel & textiles",
    side: "context",
    interpretation: "Manufacturing share of GDP. Apparel is one part of manufacturing.",
  },
  {
    code: "TX.VAL.MANF.ZS.UN",
    label: "Porsi ekspor manufaktur",
    unit: "% of merchandise exports",
    category: "Apparel & textiles",
    side: "supply",
    interpretation: "Manufactures share of merchandise exports. Not factory capacity.",
  },
  {
    code: "BX.TRF.PWKR.CD.DT",
    label: "Remitansi diterima",
    unit: "current US$",
    category: "Workforce",
    side: "context",
    interpretation: "Personal remittances received. Not a count of placed workers.",
  },
  {
    code: "IT.CEL.SETS.P2",
    label: "Langganan seluler",
    unit: "per 100 people",
    category: "Digital access",
    side: "context",
    interpretation: "Mobile subscriptions per 100 people. Not digital-service revenue.",
  },
  {
    code: "IT.NET.BBND.P2",
    label: "Langganan broadband tetap",
    unit: "per 100 people",
    category: "Business & IT services",
    side: "context",
    interpretation: "Fixed broadband subscriptions per 100 people. Access context for digital services, not IT contract revenue.",
  },
  {
    code: "NV.MNF.TXTL.ZS.UN",
    label: "Tekstil dan pakaian",
    unit: "% of value added in manufacturing",
    category: "Apparel & textiles",
    side: "supply",
    interpretation: "Textiles, apparel, and leather as a share of manufacturing value added. Not factory capacity or open orders.",
  },
  {
    code: "SL.AGR.EMPL.ZS",
    label: "Pekerjaan di pertanian",
    unit: "% of total employment",
    category: "Food & agriculture",
    side: "context",
    interpretation: "Modeled employment share in agriculture. Not a count of workers available for placement.",
  },
  {
    code: "SL.IND.EMPL.ZS",
    label: "Pekerjaan di industri",
    unit: "% of total employment",
    category: "Workforce",
    side: "context",
    interpretation: "Industry employment share. Broader than apparel factories, and not a vacancy count.",
  },
  {
    code: "SL.SRV.EMPL.ZS",
    label: "Pekerjaan di jasa",
    unit: "% of total employment",
    category: "Services (aggregate)",
    side: "context",
    interpretation: "Services employment share. Not demand for a specific service contract.",
  },
  {
    code: "SE.SEC.ENRR",
    label: "Partisipasi sekolah menengah",
    unit: "% gross",
    category: "Education & courses",
    side: "context",
    interpretation: "Secondary enrollment context for skills pipelines. Not course seats or tuition demand.",
  },
  {
    code: "SE.ADT.LITR.ZS",
    label: "Melek huruf dewasa",
    unit: "% of people ages 15 and above",
    category: "Education & courses",
    side: "context",
    interpretation: "Adult literacy rate. Not training enrollment.",
  },
  {
    code: "BX.GSR.TRVL.ZS",
    label: "Jasa perjalanan",
    unit: "% of service exports",
    category: "Services (aggregate)",
    side: "supply",
    interpretation: "Travel services as a share of service exports. Not visitor spending available to a seller.",
  },
  {
    code: "ST.INT.ARVL",
    label: "Kunjungan wisatawan",
    unit: "arrivals",
    category: "Film & media",
    side: "demand",
    interpretation: "Inbound international visitor arrivals. Audience and destination context, not cinema admissions or confirmed bookings.",
  },
];

export const tradeProducts = [
  { hs: "0901", name: "Coffee", category: "Food & agriculture", observatoryProduct: "Kopi" },
  { hs: "0902", name: "Tea", category: "Food & agriculture", observatoryProduct: "Teh" },
  { hs: "1001", name: "Wheat and meslin", category: "Food & agriculture", observatoryProduct: "Gandum dan meslin" },
  { hs: "1006", name: "Rice", category: "Food & agriculture", observatoryProduct: "Beras" },
  { hs: "1801", name: "Cocoa beans", category: "Food & agriculture", observatoryProduct: "Biji kakao" },
  { hs: "080131", name: "Cashew nuts, in shell", category: "Food & agriculture", observatoryProduct: "Kacang mete" },
  { hs: "080132", name: "Cashew nuts, shelled", category: "Food & agriculture", observatoryProduct: "Kacang mete" },
  { hs: "1511", name: "Palm oil", category: "Food & agriculture", observatoryProduct: "Palm oil" },
  { hs: "5201", name: "Cotton, not carded or combed", category: "Apparel & textiles", observatoryProduct: "Cotton" },
  { hs: "610910", name: "T-shirts and singlets of cotton", category: "Apparel & textiles", observatoryProduct: "Kaos dan singlet katun" },
];

export const horticultureProducts = [
  { hs: "0702", name: "Tomatoes, fresh or chilled", category: "Food & agriculture", observatoryProduct: "Tomat segar" },
  { hs: "080510", name: "Oranges, fresh or dried", category: "Food & agriculture", observatoryProduct: "Jeruk" },
];

export const specialtyProducts = [
  { hs: "120740", name: "Sesame seeds", category: "Food & agriculture", observatoryProduct: "Wijen" },
  { hs: "0905", name: "Vanilla", category: "Food & agriculture", observatoryProduct: "Vanila" },
  { hs: "0907", name: "Cloves", category: "Food & agriculture", observatoryProduct: "Cengkeh" },
  { hs: "090411", name: "Pepper, neither crushed nor ground", category: "Food & agriculture", observatoryProduct: "Lada" },
  { hs: "090412", name: "Pepper, crushed or ground", category: "Food & agriculture", observatoryProduct: "Lada" },
];

export const fisheryProducts = [
  { hs: "0303", name: "Fish, frozen, excluding fillets", category: "Food & agriculture", observatoryProduct: "Produk perikanan" },
  { hs: "0304", name: "Fish fillets and other fish meat", category: "Food & agriculture", observatoryProduct: "Produk perikanan" },
  { hs: "160414", name: "Prepared or preserved tunas", category: "Food & agriculture", observatoryProduct: "Produk perikanan" },
];

export const rubberProducts = [
  { hs: "4001", name: "Natural rubber, in primary forms", category: "Food & agriculture", observatoryProduct: "Karet alam" },
];

export const groundnutProducts = [
  { hs: "1202", name: "Groundnuts, not roasted", category: "Food & agriculture", observatoryProduct: "Kacang tanah" },
];

export const maizeProducts = [
  { hs: "1005", name: "Maize (corn)", category: "Food & agriculture", observatoryProduct: "Jagung" },
];

export const tobaccoProducts = [
  { hs: "2401", name: "Unmanufactured tobacco; tobacco refuse", category: "Food & agriculture", observatoryProduct: "Tembakau" },
];

export const sugarProducts = [
  {
    hs: "1701",
    name: "Cane or beet sugar and chemically pure sucrose, in solid form",
    category: "Food & agriculture",
    observatoryProduct: "Gula",
  },
];

export const phosphateProducts = [
  {
    hs: "2510",
    name: "Natural calcium phosphates, natural aluminium calcium phosphates and phosphatic chalk",
    category: "Fertilizers & minerals",
    observatoryProduct: "Batuan fosfat",
  },
];

export const copperProducts = [
  {
    hs: "2603",
    name: "Copper ores and concentrates",
    category: "Metals & minerals",
    observatoryProduct: "Tembaga",
  },
  {
    hs: "740311",
    name: "Refined copper cathodes",
    category: "Metals & minerals",
    observatoryProduct: "Tembaga",
  },
];

export const cobaltProducts = [
  {
    hs: "282200",
    name: "Cobalt oxides and hydroxides; commercial cobalt oxides",
    category: "Metals & minerals",
    observatoryProduct: "Kobalt",
  },
];

export const ironProducts = [
  {
    hs: "2601",
    name: "Iron ores and concentrates, including roasted iron pyrites",
    category: "Metals & minerals",
    observatoryProduct: "Bijih besi",
  },
];

export const fishProductionItems = [
  {
    itemCode: "FISH-CAPTURE",
    name: "Capture fisheries, aquatic animals",
    category: "Food & agriculture",
    observatoryProduct: "Produk perikanan",
    detail: "Live weight of fish, crustaceans, and molluscs from capture. Excludes algae, crocodiles, aquatic mammals, pearls, corals, and sponges. Not export weight and not HS 0303, 0304, or 160414 trade.",
  },
  {
    itemCode: "FISH-AQUA",
    name: "Aquaculture, aquatic animals",
    category: "Food & agriculture",
    observatoryProduct: "Produk perikanan",
    detail: "Live weight of fish, crustaceans, and molluscs from freshwater, brackishwater, and marine aquaculture. Not export weight. Do not add this to capture.",
  },
];

export const productionItems = [
  {
    itemCode: "656",
    name: "Coffee, green",
    category: "Food & agriculture",
    observatoryProduct: "Kopi",
    detail: "Green coffee. Not roasted coffee and not export supply.",
  },
  {
    itemCode: "667",
    name: "Tea leaves",
    category: "Food & agriculture",
    observatoryProduct: "Teh",
    detail: "Fresh tea leaves. Not made tea, not the Mombasa auction price, and not export weight.",
  },
  {
    itemCode: "27",
    name: "Rice",
    category: "Food & agriculture",
    observatoryProduct: "Beras",
    detail: "FAO rice item. Not milled-rice trade under HS 1006.",
  },
  {
    itemCode: "15",
    name: "Wheat",
    category: "Food & agriculture",
    observatoryProduct: "Gandum dan meslin",
    detail: "FAO wheat. Not HS 1001 trade.",
  },
  {
    itemCode: "661",
    name: "Cocoa beans",
    category: "Food & agriculture",
    observatoryProduct: "Biji kakao",
    detail: "Cocoa beans. Not liquor, butter, or export shipments.",
  },
  {
    itemCode: "217",
    name: "Cashew nuts, in shell",
    category: "Food & agriculture",
    observatoryProduct: "Kacang mete",
    detail: "In-shell cashew. Not shelled nuts under HS 080132.",
  },
  {
    itemCode: "254",
    name: "Oil palm fruit",
    category: "Food & agriculture",
    observatoryProduct: "Palm oil",
    detail: "Fresh fruit bunches. Do not add this to palm oil production.",
  },
  {
    itemCode: "257",
    name: "Palm oil",
    category: "Food & agriculture",
    observatoryProduct: "Palm oil",
    detail: "Processed palm oil. Separate from oil-palm fruit.",
  },
  {
    itemCode: "767",
    name: "Cotton lint",
    category: "Apparel & textiles",
    observatoryProduct: "Cotton",
    detail: "Ginned lint. Closer to raw cotton trade than seed cotton.",
  },
  {
    itemCode: "490",
    name: "Oranges",
    category: "Food & agriculture",
    observatoryProduct: "Jeruk",
    detail: "Orange production. Not HS 080510 exports.",
  },
  {
    itemCode: "388",
    name: "Tomatoes",
    category: "Food & agriculture",
    observatoryProduct: "Tomat segar",
    detail: "Tomato production. Not HS 0702 exports.",
  },
  {
    itemCode: "289",
    name: "Sesame seed",
    category: "Food & agriculture",
    observatoryProduct: "Wijen",
    detail: "Sesame seed. Not HS 120740 exports.",
  },
  {
    itemCode: "687",
    name: "Pepper (piper spp.)",
    category: "Food & agriculture",
    observatoryProduct: "Lada",
    detail: "Piper pepper. Not Capsicum, and not HS 090411 or 090412 exports.",
  },
  {
    itemCode: "692",
    name: "Vanilla",
    category: "Food & agriculture",
    observatoryProduct: "Vanila",
    detail: "Vanilla beans. Not HS 0905 exports.",
  },
  {
    itemCode: "698",
    name: "Cloves",
    category: "Food & agriculture",
    observatoryProduct: "Cengkeh",
    detail: "Cloves. Not HS 0907 exports.",
  },
  {
    itemCode: "836",
    name: "Natural rubber",
    category: "Food & agriculture",
    observatoryProduct: "Karet alam",
    detail: "Natural rubber production. Not HS 4001 export weight and not the TSR20 benchmark.",
  },
  {
    itemCode: "242",
    name: "Groundnuts, excluding shelled",
    category: "Food & agriculture",
    observatoryProduct: "Kacang tanah",
    detail: "In-shell groundnuts. Not shelled nuts, not HS 1202 export weight, and not the Pink Sheet groundnut or groundnut-oil price.",
  },
  {
    itemCode: "56",
    name: "Maize (corn)",
    category: "Food & agriculture",
    observatoryProduct: "Jagung",
    detail: "FAO maize grain. Not HS 1005 customs weight, not seed trade alone, and not the US Gulf No. 2 yellow benchmark.",
  },
  {
    itemCode: "826",
    name: "Unmanufactured tobacco",
    category: "Food & agriculture",
    observatoryProduct: "Tembakau",
    detail: "Unmanufactured tobacco. Not manufactured tobacco, not HS 2401 customs weight, and not the US import unit value.",
  },
  {
    itemCode: "156",
    name: "Sugar cane",
    category: "Food & agriculture",
    observatoryProduct: "Gula",
    detail: "Sugar cane. Not sugar beet, not raw or refined sugar, not HS 1701 customs weight, and not the ISA world price.",
  },
  {
    itemCode: "157",
    name: "Sugar beet",
    category: "Food & agriculture",
    observatoryProduct: "Gula",
    detail: "Sugar beet. Not sugar cane. Do not add beet to cane. Not HS 1701 customs weight and not the ISA world price.",
  },
  {
    itemCode: "162",
    name: "Raw cane or beet sugar (centrifugal only)",
    category: "Food & agriculture",
    observatoryProduct: "Gula",
    detail: "Raw centrifugal sugar from cane or beet. Not refined sugar, not sugar-cane or sugar-beet tonnage, not HS 1701 customs weight, and not the ISA world price.",
  },
];

export const pinkSheetUrl =
  "https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx";

export const commoditySeries = [
  {
    column: "Cocoa",
    series: "Cocoa",
    product: "Cocoa beans",
    category: "Food & agriculture",
    observatoryProduct: "Biji kakao",
    unit: "USD per kg",
    detail: "International Cocoa Organization price, nominal US dollars per kilogram.",
  },
  {
    column: "Coffee, Arabica",
    series: "Coffee, Arabica",
    product: "Coffee",
    category: "Food & agriculture",
    observatoryProduct: "Kopi",
    unit: "USD per kg",
    detail: "International Coffee Organization, Arabica.",
  },
  {
    column: "Coffee, Robusta",
    series: "Coffee, Robusta",
    product: "Coffee",
    category: "Food & agriculture",
    observatoryProduct: "Kopi",
    unit: "USD per kg",
    detail: "International Coffee Organization, Robusta.",
  },
  {
    column: "Tea, Mombasa",
    series: "Tea, Mombasa",
    product: "Tea",
    category: "Food & agriculture",
    observatoryProduct: "Teh",
    unit: "USD per kg",
    detail: "Mombasa auction. This is the Kenya tea benchmark in the Pink Sheet.",
  },
  {
    column: "Palm oil",
    series: "Palm oil",
    product: "Palm oil",
    category: "Food & agriculture",
    observatoryProduct: "Palm oil",
    unit: "USD per metric ton",
    detail: "World Bank Pink Sheet palm oil series.",
  },
  {
    column: "Rice, Thai 5%",
    series: "Rice, Thai 5%",
    product: "Rice",
    category: "Food & agriculture",
    observatoryProduct: "Beras",
    unit: "USD per metric ton",
    detail: "Thai rice, 5 percent broken.",
  },
  {
    column: "Rice, Viet Namese 5%",
    series: "Rice, Vietnamese 5%",
    product: "Rice",
    category: "Food & agriculture",
    observatoryProduct: "Beras",
    unit: "USD per metric ton",
    detail: "Vietnamese rice, 5 percent broken.",
  },
  {
    column: "Wheat, US HRW",
    series: "Wheat, US HRW",
    product: "Wheat",
    category: "Food & agriculture",
    observatoryProduct: "Gandum dan meslin",
    unit: "USD per metric ton",
    detail: "US hard red winter wheat.",
  },
  {
    column: "Orange",
    series: "Orange",
    product: "Oranges",
    category: "Food & agriculture",
    observatoryProduct: "Jeruk",
    unit: "USD per kg",
    detail: "World Bank Pink Sheet orange series.",
  },
  {
    column: "Cotton, A Index",
    series: "Cotton, A Index",
    product: "Cotton",
    category: "Apparel & textiles",
    observatoryProduct: "Cotton",
    unit: "USD per kg",
    detail: "Cotton Outlook A Index.",
  },
  {
    column: "Rubber, TSR20 **",
    series: "Rubber, TSR20",
    product: "Natural rubber",
    category: "Food & agriculture",
    observatoryProduct: "Karet alam",
    unit: "USD per kg",
    detail: "SGX/SICOM TSR20 nearby futures, nominal US dollars per kilogram. This is the grade West African exporters typically ship. Not a bilateral contract price.",
  },
  {
    column: "Groundnuts",
    series: "Groundnuts",
    product: "Groundnuts",
    category: "Food & agriculture",
    observatoryProduct: "Kacang tanah",
    unit: "USD per metric ton",
    detail: "World Bank Pink Sheet groundnuts series. Not groundnut oil and not a bilateral Africa–Asia contract price.",
  },
  {
    column: "Maize",
    series: "Maize",
    product: "Maize",
    category: "Food & agriculture",
    observatoryProduct: "Jagung",
    unit: "USD per metric ton",
    detail: "US No. 2 yellow maize, f.o.b. US Gulf ports. Not sorghum, not FAO production, and not a bilateral Africa–Asia contract price.",
  },
  {
    column: "Tobacco, US import u.v.",
    series: "Tobacco, US import u.v.",
    product: "Unmanufactured tobacco",
    category: "Food & agriculture",
    observatoryProduct: "Tembakau",
    unit: "USD per metric ton",
    detail: "US import unit value. Not a Zimbabwe auction price, not FAO production, and not a bilateral Africa–Asia contract price. A missing month is not a zero price.",
  },
  {
    column: "Sugar, world",
    series: "Sugar, world",
    product: "Sugar",
    category: "Food & agriculture",
    observatoryProduct: "Gula",
    unit: "USD per kg",
    detail: "International Sugar Agreement world price, nominal US dollars per kilogram. Not the EU or US sugar price, not FAO cane, beet, or raw-sugar production, and not a bilateral Africa–Asia contract price.",
  },
  {
    column: "Phosphate rock",
    series: "Phosphate rock",
    product: "Phosphate rock",
    category: "Fertilizers & minerals",
    observatoryProduct: "Batuan fosfat",
    unit: "USD per metric ton",
    detail: "Phosphate rock, f.o.b. North Africa. Not DAP, TSP, or urea, not HS 31 manufactured fertilizer, and not a bilateral Africa–Asia contract price.",
  },
  {
    column: "Copper",
    series: "Copper",
    product: "Refined copper cathodes",
    category: "Metals & minerals",
    observatoryProduct: "Tembaga",
    unit: "USD per metric ton",
    detail: "LME grade A copper cathode settlement, nominal US dollars per metric ton. Not copper ore or concentrate, not HS 2603, and not a bilateral Africa–Asia contract price.",
  },
  {
    column: "Iron ore, cfr spot",
    series: "Iron ore, cfr spot",
    product: "Iron ore",
    category: "Metals & minerals",
    observatoryProduct: "Bijih besi",
    unit: "USD per dry metric ton",
    detail: "Iron ore fines, spot, c.f.r. China, 62% Fe, nominal US dollars per dry metric ton. The Monthly Prices header prints ($/dmtu); the Description sheet defines this spot series as US dollars per dry ton. It is not a contract price in cents per Fe-unit, not HS 2601 customs value, and not a bilateral Africa–Asia contract price.",
  },
];

export const schema = `
PRAGMA foreign_keys = ON;

CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  license_url TEXT,
  frequency TEXT,
  updated_at TEXT,
  retrieved_at TEXT,
  note TEXT
);

CREATE TABLE countries (
  iso3 TEXT PRIMARY KEY,
  iso2 TEXT NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  capital TEXT,
  income_group TEXT,
  lat REAL,
  lon REAL,
  source_url TEXT
);

CREATE TABLE indicators (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT,
  unit TEXT,
  category TEXT,
  side TEXT,
  frequency TEXT,
  definition TEXT,
  source_organization TEXT,
  source_url TEXT,
  interpretation TEXT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id)
);

CREATE TABLE observations (
  country_iso3 TEXT NOT NULL REFERENCES countries(iso3),
  indicator_code TEXT NOT NULL REFERENCES indicators(code),
  year INTEGER NOT NULL,
  value REAL,
  status TEXT,
  decimal INTEGER,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  PRIMARY KEY (country_iso3, indicator_code, year, dataset_id)
);

CREATE TABLE hs_products (
  hs_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  observatory_product TEXT NOT NULL
);

CREATE TABLE trade_flows (
  reporter_iso3 TEXT NOT NULL REFERENCES countries(iso3),
  partner_iso3 TEXT NOT NULL REFERENCES countries(iso3),
  hs_code TEXT NOT NULL REFERENCES hs_products(hs_code),
  year INTEGER NOT NULL,
  flow TEXT NOT NULL,
  trade_value_usd REAL NOT NULL,
  net_weight_kg REAL,
  qty REAL,
  qty_unit_code INTEGER,
  query_key TEXT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  PRIMARY KEY (reporter_iso3, partner_iso3, hs_code, year, flow, dataset_id)
);

CREATE TABLE collection_queries (
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  query_key TEXT NOT NULL,
  reporter_iso3 TEXT,
  year INTEGER,
  status TEXT NOT NULL,
  http_status INTEGER,
  row_count INTEGER,
  kept_count INTEGER,
  detail TEXT,
  finished_at TEXT,
  PRIMARY KEY (dataset_id, query_key)
);

CREATE TABLE commodity_series (
  series TEXT PRIMARY KEY,
  product TEXT NOT NULL,
  category TEXT NOT NULL,
  observatory_product TEXT,
  unit TEXT NOT NULL,
  detail TEXT
);

CREATE TABLE commodity_prices (
  series TEXT NOT NULL REFERENCES commodity_series(series),
  period TEXT NOT NULL,
  price REAL NOT NULL,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  PRIMARY KEY (series, period, dataset_id)
);

CREATE TABLE market_records (
  id TEXT PRIMARY KEY,
  country TEXT,
  iso2 TEXT,
  region TEXT,
  category TEXT,
  product TEXT,
  side TEXT,
  indicator_type TEXT,
  value REAL,
  unit TEXT,
  period TEXT,
  origin TEXT,
  target TEXT,
  summary TEXT,
  source_url TEXT,
  source TEXT,
  checked_at TEXT,
  hs_code TEXT,
  record_type TEXT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id)
);

CREATE TABLE published_corridors (
  origin TEXT,
  target TEXT,
  product TEXT,
  hs_code TEXT,
  period TEXT,
  value_usd REAL,
  quantity_kg REAL,
  reporter TEXT,
  source_url TEXT
);

CREATE TABLE production_items (
  item_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  observatory_product TEXT NOT NULL,
  detail TEXT
);

CREATE TABLE production (
  country_iso3 TEXT NOT NULL REFERENCES countries(iso3),
  item_code TEXT NOT NULL REFERENCES production_items(item_code),
  element_code TEXT NOT NULL,
  element_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  flag TEXT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id),
  PRIMARY KEY (country_iso3, item_code, element_code, year, dataset_id)
);

CREATE INDEX idx_observations_indicator ON observations(indicator_code, year);
CREATE INDEX idx_observations_country ON observations(country_iso3, indicator_code);
CREATE INDEX idx_trade_hs ON trade_flows(hs_code, year);
CREATE INDEX idx_trade_reporter ON trade_flows(reporter_iso3, year);
CREATE INDEX idx_trade_partner ON trade_flows(partner_iso3, year);
CREATE INDEX idx_prices_series ON commodity_prices(series, period);
CREATE INDEX idx_production_item ON production(item_code, element_code, year);

CREATE VIEW v_africa_asia_trade AS
SELECT
  t.reporter_iso3,
  r.name AS reporter_name,
  r.region AS reporter_region,
  t.partner_iso3,
  p.name AS partner_name,
  p.region AS partner_region,
  t.hs_code,
  h.name AS product_name,
  h.category,
  h.observatory_product,
  t.year,
  t.flow,
  t.trade_value_usd,
  t.net_weight_kg,
  t.qty,
  t.dataset_id
FROM trade_flows t
JOIN countries r ON r.iso3 = t.reporter_iso3
JOIN countries p ON p.iso3 = t.partner_iso3
JOIN hs_products h ON h.hs_code = t.hs_code
WHERE r.region <> p.region;
`;

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value)}\n`);
  fs.renameSync(temporary, file);
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => value !== ""));
}

export async function fetchText(url, { timeoutMs = 60000 } = {}) {
  const response = await fetch(url, {
    headers: { accept: "application/json,text/csv,text/plain,*/*", "user-agent": "AfriXAsia-Observatory/1.0" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  return { status: response.status, text, url };
}
