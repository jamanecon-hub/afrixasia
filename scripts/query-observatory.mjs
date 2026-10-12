import { selectCorridors, selectMarket, selectObservations, observatoryStatus } from "../server/observatory-db.mjs";

const [command, ...rest] = process.argv.slice(2);
const args = {};
for (let index = 0; index < rest.length; index += 1) {
  const token = rest[index];
  if (!token.startsWith("--")) continue;
  args[token.slice(2)] = rest[index + 1];
  index += 1;
}

if (!command || command === "status") {
  console.log(JSON.stringify(observatoryStatus(), null, 2));
  process.exit(0);
}

if (command === "series") {
  const rows = selectObservations({
    view: "series",
    countries: args.country ? [args.country.toUpperCase()] : null,
    indicators: args.indicator ? [args.indicator] : null,
    start: Number(args.start || 2015),
    end: Number(args.end || 2025),
  });
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

if (command === "market") {
  console.log(JSON.stringify(selectMarket(args), null, 2));
  process.exit(0);
}

if (command === "corridors") {
  console.log(JSON.stringify(selectCorridors(args), null, 2));
  process.exit(0);
}

console.error("Commands: status, series, market, corridors");
process.exit(1);
