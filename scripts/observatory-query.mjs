import { indicatorSeries, searchTrade, summary } from "../server/db.mjs";

function flags(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next == null || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      index += 1;
    }
  }
  return out;
}

function printStatus() {
  const body = summary();
  const tables = body.tables;
  const quietReporters = body.reportersWithoutTradeRows || [];
  console.log("AfriXAsia market observatory");
  console.log(`Database\t${body.database}`);
  console.log(`Snapshot\t${body.version}\t${tables.countries} countries\t${tables.indicators} indicators\t${tables.observations} observations`);
  console.log(`Market references\t${tables.market_records}`);
  console.log(`Curated corridors\t${tables.corridors}`);
  console.log(`WDI supplement\t${tables.supplement_indicators} indicators\t${tables.supplement_observations} observations`);
  console.log(`Trade flows\t${tables.trade_flows} rows at or above USD 1 million`);
  console.log(`Trade queries\t${tables.trade_queries} finished reporter-years`);
  if (quietReporters.length) {
    console.log(`No preview rows\t${quietReporters.join(", ")}`);
  }
  console.log("A missing year or trade pair is not zero. Trade values under USD 1 million are omitted.");
}

const [command, ...rest] = process.argv.slice(2);
const args = flags(rest);

if (!command || command === "help") {
  console.log(`Usage:
  npm run observatory:query -- status
  npm run observatory:query -- series --country KEN --indicator TX.VAL.MRCH.CD.WT
  npm run observatory:query -- trade --hs 0902 --origin Kenya --year 2024`);
  process.exit(command === "help" ? 0 : 1);
}

if (command === "status") {
  printStatus();
} else if (command === "series") {
  const result = indicatorSeries({
    country: args.country,
    indicator: args.indicator,
    start: args.start,
    end: args.end,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(JSON.stringify(result, null, 2));
} else if (command === "trade") {
  const result = searchTrade(args);
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(JSON.stringify(result, null, 2));
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
