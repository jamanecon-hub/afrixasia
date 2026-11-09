import { pathToFileURL } from "node:url";
import { queryObservatory } from "./read.mjs";

function parseArgs(argv) {
  const params = { view: argv[0] || "status" };
  for (let i = 1; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      params[key] = next;
      i += 1;
    } else params[key] = "true";
  }
  return params;
}

export function runQuery(argv = process.argv.slice(2)) {
  const result = queryObservatory(parseArgs(argv));
  if (result.status !== 200) {
    console.error(result.body.error);
    return result.status;
  }
  console.log(JSON.stringify(result.body, null, 2));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(runQuery());
}
