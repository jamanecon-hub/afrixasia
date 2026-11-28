import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import observations from "../data/observations.json" with { type: "json" };
import brief from "../data/brief.json" with { type: "json" };
import catalog from "../data/catalog.json" with { type: "json" };
import {
  wdi,
  market,
  findCountry,
  summary,
  countrySectors,
  filterMarket,
  filterProviders,
  toCsv,
  intelligence,
} from "../shared/reference.mjs";
import { dossier } from "./dossier.mjs";
import {
  knownCategory,
  knownHs,
  knownLogisticsSeries,
  knownPriceSeries,
  observatoryStatus,
  openObservatory,
  queryExchangeRates,
  queryLogistics,
  queryPrices,
  queryTrade,
} from "../shared/observatory-db.mjs";
import { sendWelcomeEmail } from "./welcome-mail.mjs";
import { localGoogleProfiles } from "../shared/google-local.mjs";
import { membershipCardPdf } from "../shared/card-pdf.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedMembersPath = path.join(root, "data", "members.json");
const membersPath = process.env.MEMBERS_FILE
  ? path.resolve(process.env.MEMBERS_FILE)
  : process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "members.json")
    : seedMembersPath;
const indicatorByCode = new Map(wdi.indicators.map((item) => [item.code, item]));
const countryByIso3 = new Map(wdi.countries.map((item) => [item.iso3, item]));

function ensureMembersFile() {
  if (fs.existsSync(membersPath)) return;
  fs.mkdirSync(path.dirname(membersPath), { recursive: true });
  if (membersPath !== seedMembersPath && fs.existsSync(seedMembersPath)) {
    fs.copyFileSync(seedMembersPath, membersPath);
    return;
  }
  fs.writeFileSync(membersPath, "[]\n");
}

function readMembers() {
  try {
    ensureMembersFile();
    return JSON.parse(fs.readFileSync(membersPath, "utf8"));
  } catch {
    return [];
  }
}

function writeMembers(members) {
  ensureMembersFile();
  fs.writeFileSync(membersPath, `${JSON.stringify(members, null, 2)}\n`);
}

function cookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function sessionEmail(req) {
  const email = cookies(req).axa_email || "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function sessionProvider(req) {
  const provider = cookies(req).axa_provider || "";
  return provider === "google-local" || provider === "manual" ? provider : "";
}

function identityFor(email, provider) {
  if (provider !== "google-local") return null;
  const profile = localGoogleProfiles.find((item) => item.email === email);
  if (!profile) return null;
  return {
    name: profile.name,
    email: profile.email,
    country: profile.country,
    entityType: profile.entityType,
    organization: profile.organization || "",
  };
}

function googleAuthInfo() {
  return {
    mode: "local",
    clientConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    profiles: localGoogleProfiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      country: profile.country,
      entityType: profile.entityType,
      organization: profile.organization || "",
    })),
  };
}

function setSession(res, email, provider) {
  const base = "Path=/; Max-Age=2592000; SameSite=Lax";
  res.setHeader("set-cookie", [
    `axa_email=${encodeURIComponent(email)}; ${base}`,
    `axa_provider=${encodeURIComponent(provider)}; ${base}`,
  ]);
}

function clearSession(res) {
  res.setHeader("set-cookie", [
    "axa_email=; Path=/; Max-Age=0; SameSite=Lax",
    "axa_provider=; Path=/; Max-Age=0; SameSite=Lax",
  ]);
}

function flag(value) {
  return value === "on" || value === "true" || value === true || value === "1";
}

function clip(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function parseIntents(value, role) {
  const allowed = ["buy", "supply", "research", "partnership"];
  const raw = Array.isArray(value) ? value.join(",") : String(value || "");
  const intents = [];
  for (const part of raw.split(/[,|]/)) {
    const token = part.trim().toLowerCase();
    if (allowed.includes(token) && !intents.includes(token)) intents.push(token);
  }
  if (role === "buyer" && !intents.includes("buy")) intents.unshift("buy");
  if (role === "supplier" && !intents.includes("supply")) intents.unshift("supply");
  return intents;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseMultipart(raw, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!match) return {};
  const boundary = match[1] || match[2];
  const fields = {};
  for (const part of raw.split(`--${boundary}`)) {
    const name = /name="([^"]+)"/.exec(part);
    if (!name) continue;
    const value = part.split("\r\n\r\n").slice(1).join("\r\n\r\n").replace(/\r\n--$/, "").replace(/\r\n$/, "");
    fields[name[1]] = value;
  }
  return fields;
}

async function readForm(req) {
  const type = req.headers["content-type"] || "";
  const raw = await readBody(req);
  if (type.includes("application/json")) return JSON.parse(raw || "{}");
  if (type.includes("multipart/form-data")) return parseMultipart(raw, type);
  return Object.fromEntries(new URLSearchParams(raw));
}

function issueCardToken(members, member) {
  if (member.cardToken) return member.cardToken;
  member.cardToken = randomBytes(18).toString("hex");
  writeMembers(members);
  return member.cardToken;
}

function sendPdf(res, pdf, filename) {
  res.statusCode = 200;
  res.setHeader("content-type", "application/pdf");
  res.setHeader("content-disposition", `attachment; filename="${filename}"`);
  res.setHeader("cache-control", "no-store");
  res.end(Buffer.from(pdf));
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  const payload = type.startsWith("application/json") ? JSON.stringify(body) : body;
  res.statusCode = status;
  res.setHeader("content-type", type);
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("cache-control", "no-store");
  res.end(payload);
}

function publicMember(member) {
  const profile = {
    id: member.id,
    name: member.name,
    organization: member.organization || "",
    title: member.title,
    description: member.description,
    country: member.country,
    category: member.category,
    role: member.role,
    entityType: member.entityType,
    listingType: member.listingType,
    originCountry: member.originCountry,
    targetCountry: member.targetCountry,
    quantity: member.quantity,
    website: member.website,
    membershipId: member.membershipId,
    publicKey: member.publicKey,
    profilePath: `/anggota/${member.publicKey}`,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
  if (member.interest) profile.interest = member.interest;
  if (member.segment) profile.segment = member.segment;
  if (member.capabilities) profile.capabilities = member.capabilities;
  if (member.publicContact) {
    profile.email = member.email;
    if (member.phone) profile.phone = member.phone;
  }
  return profile;
}

function listingCsvRow(member) {
  const profile = publicMember(member);
  const row = {
    id: profile.id,
    name: profile.name,
    organization: profile.organization || "",
    title: profile.title,
    description: profile.description,
    country: profile.country,
    category: profile.category,
    role: profile.role,
    entityType: profile.entityType,
    listingType: profile.listingType,
    originCountry: profile.originCountry || "",
    targetCountry: profile.targetCountry || "",
    quantity: profile.quantity || "",
    website: profile.website || "",
    membershipId: profile.membershipId,
    publicKey: profile.publicKey,
    profilePath: profile.profilePath,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    interestRole: profile.interest?.role || "",
    interestIntents: (profile.interest?.intents || []).join("|"),
    interestStatement: profile.interest?.statement || "",
    segmentCategory: profile.segment?.category || "",
    segmentListingType: profile.segment?.listingType || "",
    segmentOrigin: profile.segment?.originCountry || "",
    segmentTarget: profile.segment?.targetCountry || "",
    capabilityOffer: profile.capabilities?.offer || "",
    capabilityCapacity: profile.capabilities?.capacity || "",
    capabilityCertifications: profile.capabilities?.certifications || "",
    capabilityLeadTime: profile.capabilities?.leadTime || "",
  };
  if (profile.email) row.email = profile.email;
  if (profile.phone) row.phone = profile.phone;
  return row;
}

function countryParam(url, name) {
  const token = url.searchParams.get(name);
  if (!token) return { iso3: null };
  const country = findCountry(token);
  if (!country) return { error: `Unknown country: ${token}` };
  return { iso3: country.iso3 };
}

function pageParams(url) {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const perPage = Math.min(500, Math.max(1, Number(url.searchParams.get("per_page") || 50)));
  if (!Number.isFinite(page) || !Number.isFinite(perPage)) return null;
  return { page, perPage };
}

function observatoryTrade(url) {
  const db = openObservatory({ readOnly: true });
  if (!db) return { status: 503, body: { error: "Observatory database is not built." } };
  try {
    const reporter = countryParam(url, "reporter");
    const partner = countryParam(url, "partner");
    const origin = countryParam(url, "origin");
    const target = countryParam(url, "target");
    const unknown = [reporter, partner, origin, target].find((item) => item.error);
    if (unknown) return { status: 400, body: { error: unknown.error } };
    const flow = url.searchParams.get("flow") || "";
    if (flow && flow !== "export" && flow !== "import") {
      return { status: 400, body: { error: "flow must be export or import." } };
    }
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? Number(yearParam) : null;
    if (yearParam && (!Number.isInteger(year) || year < 1990 || year > 2100)) {
      return { status: 400, body: { error: "year must be an integer." } };
    }
    const hsCodes = (url.searchParams.get("hs") || url.searchParams.get("hsCode") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    for (const code of hsCodes) {
      if (!knownHs(db, code)) return { status: 400, body: { error: `Unknown HS code: ${code}` } };
    }
    const category = url.searchParams.get("category") || "";
    if (category && !knownCategory(db, category)) {
      return { status: 400, body: { error: "Unknown category for the trade database." } };
    }
    const paging = pageParams(url);
    if (!paging) return { status: 400, body: { error: "Invalid page." } };
    const filters = {
      reporterIso3: reporter.iso3,
      partnerIso3: partner.iso3,
      originIso3: origin.iso3,
      targetIso3: target.iso3,
      flow: flow || null,
      year,
      category: category || null,
      hsCodes,
      page: paging.page,
      perPage: paging.perPage,
    };
    const queried = queryTrade(db, filters);
    if (url.searchParams.get("format") === "csv" && queried.total > 20000) {
      return {
        status: 400,
        body: { error: "More than 20000 rows. Filter by reporter, partner, origin, target, hs, category, year, or flow." },
      };
    }
    const csv = url.searchParams.get("format") === "csv"
      ? queryTrade(db, { ...filters, page: 1, perPage: Math.max(1, queried.total) }).rows
      : queried.rows;
    const retrievedAt = db.prepare("SELECT value FROM meta WHERE key = 'retrieved_at'").get()?.value || null;
    return {
      status: 200,
      csv,
      body: {
        datasetId: "afrixasia-observatory-trade",
        retrievedAt,
        total: queried.total,
        page: queried.page,
        perPage: queried.perPage,
        pages: queried.pages,
        flows: queried.rows,
        note: "Historical UN Comtrade extracts for Africa–Asia corridors. A missing row is not zero trade. The USD figure is the reported trade value. Quantity or weight flagged as estimated is omitted. Do not add an export statement to the mirror import, HS 610910 to chapter 61, shelled cashew 080132 to in-shell 080131, cocoa paste, butter, or powder to cocoa beans, phosphate rock, urea, triple superphosphate, potassium chloride, and diammonium phosphate to one another, maize, groundnuts, cane or beet sugar, and natural rubber to one another, crude petroleum, coal, iron ore, copper ore, and copper cathodes to one another, unwrought gold, semi-manufactured gold, unwrought platinum, semi-manufactured platinum, and unwrought silver to one another, wood in the rough to sawnwood, bauxite, unwrought unalloyed aluminum, and unwrought aluminum alloys to one another, or manganese ore, chromium ore, cobalt ore, cobalt oxides and hydroxides, and unwrought cobalt, mattes, and powders to one another, or liquefied natural gas, propane, butanes, and gaseous natural gas to one another or to crude petroleum, or nickel ore to unwrought unalloyed nickel, or tin ore to unwrought unalloyed tin, or nickel to tin, or zinc ore to unwrought zinc, or lead ore to refined unwrought lead, or zinc to lead, or unsorted diamonds, industrial unworked diamonds, non-industrial unworked diamonds, and non-industrial worked diamonds to one another or to gold. A cubic-meter volume is not the net weight. A carat is not a kilogram. A kilogram of liquefied natural gas is not a million British thermal units. Customs weight of nickel ore, tin ore, zinc ore, or lead ore is not contained metal. Worked industrial diamonds, synthetic diamonds, and diamond powder are not stored. Natural graphite, titanium ores, zirconium ores, and the residual niobium, tantalum, and vanadium ore line are separate lines. Do not add them. Customs weight is not contained carbon or contained metal. The residual line is not pure tantalum. Synthetic graphite, titanium oxides, titanium pigment, and unwrought titanium are not stored. Values are not orders or inventory.",
      },
    };
  } finally {
    db.close();
  }
}

function yearWindow(url) {
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : null;
  if (yearParam && (!Number.isInteger(year) || year < 1990 || year > 2100)) {
    return { error: "year must be an integer." };
  }
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const from = fromParam ? Number(fromParam) : null;
  const to = toParam ? Number(toParam) : null;
  if ((fromParam && (!Number.isInteger(from) || from < 1990 || from > 2100))
    || (toParam && (!Number.isInteger(to) || to < 1990 || to > 2100))) {
    return { error: "from and to must be calendar years." };
  }
  return { year, from, to };
}

function observatoryExchangeRates(url) {
  const db = openObservatory({ readOnly: true });
  if (!db) return { status: 503, body: { error: "Observatory database is not built." } };
  try {
    const country = countryParam(url, "country");
    if (country.error) return { status: 400, body: { error: country.error } };
    const window = yearWindow(url);
    if (window.error) return { status: 400, body: { error: window.error } };
    const paging = pageParams(url);
    if (!paging) return { status: 400, body: { error: "Invalid page." } };
    const filters = {
      iso3: country.iso3,
      year: window.year,
      from: window.from,
      to: window.to,
      page: paging.page,
      perPage: paging.perPage,
    };
    const queried = queryExchangeRates(db, filters);
    if (!queried) return { status: 503, body: { error: "Exchange rates are not loaded." } };
    if (url.searchParams.get("format") === "csv" && queried.total > 20000) {
      return { status: 400, body: { error: "More than 20000 rows. Filter by country, year, from, or to." } };
    }
    const csv = url.searchParams.get("format") === "csv"
      ? queryExchangeRates(db, { ...filters, page: 1, perPage: Math.max(1, queried.total) }).rows
      : queried.rows;
    return {
      status: 200,
      csv,
      body: {
        datasetId: "afrixasia-observatory-exchange-rates",
        updatedOn: db.prepare("SELECT value FROM meta WHERE key = 'fx_updated_on'").get()?.value || null,
        total: queried.total,
        page: queried.page,
        perPage: queried.perPage,
        pages: queried.pages,
        rates: queried.rows,
        note: "World Bank official exchange rate, local currency units per US dollar, annual average, for the observatory economies. A missing year was not published and is not zero. This is not a spot rate for a contract date, a forecast, or a bilateral trade unit value. Economies that share a currency can show the same rate.",
      },
    };
  } finally {
    db.close();
  }
}

function observatoryLogistics(url) {
  const db = openObservatory({ readOnly: true });
  if (!db) return { status: 503, body: { error: "Observatory database is not built." } };
  try {
    const country = countryParam(url, "country");
    if (country.error) return { status: 400, body: { error: country.error } };
    const codes = (url.searchParams.get("series") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    for (const code of codes) {
      if (!knownLogisticsSeries(db, code)) return { status: 400, body: { error: `Unknown logistics series: ${code}` } };
    }
    const window = yearWindow(url);
    if (window.error) return { status: 400, body: { error: window.error } };
    const paging = pageParams(url);
    if (!paging) return { status: 400, body: { error: "Invalid page." } };
    const filters = {
      iso3: country.iso3,
      codes,
      year: window.year,
      from: window.from,
      to: window.to,
      page: paging.page,
      perPage: paging.perPage,
    };
    const queried = queryLogistics(db, filters);
    if (!queried) return { status: 503, body: { error: "Logistics series are not loaded." } };
    if (url.searchParams.get("format") === "csv" && queried.total > 20000) {
      return { status: 400, body: { error: "More than 20000 rows. Filter by country, series, year, from, or to." } };
    }
    const csv = url.searchParams.get("format") === "csv"
      ? queryLogistics(db, { ...filters, page: 1, perPage: Math.max(1, queried.total) }).rows
      : queried.rows;
    return {
      status: 200,
      csv,
      body: {
        datasetId: "afrixasia-observatory-logistics",
        updatedOn: db.prepare("SELECT value FROM meta WHERE key = 'logistics_updated_on'").get()?.value || null,
        total: queried.total,
        page: queried.page,
        perPage: queried.perPage,
        pages: queried.pages,
        observations: queried.rows,
        note: "Liner shipping connectivity is an index with 2004 = 100. The logistics performance score runs from 1 to 5; its 2022 column is the September–November 2022 survey. Neither series is a freight rate or a transit time. A missing economy-year was not published. Do not add scores across economies.",
      },
    };
  } finally {
    db.close();
  }
}

function observatoryPrices(url) {
  const db = openObservatory({ readOnly: true });
  if (!db) return { status: 503, body: { error: "Observatory database is not built." } };
  try {
    const codes = (url.searchParams.get("series") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    for (const code of codes) {
      if (!knownPriceSeries(db, code)) return { status: 400, body: { error: `Unknown price series: ${code}` } };
    }
    const hs = (url.searchParams.get("hs") || url.searchParams.get("hsCode") || "").trim();
    if (hs.includes(",")) return { status: 400, body: { error: "prices accepts one hs code." } };
    if (hs && !knownHs(db, hs)) return { status: 400, body: { error: `Unknown HS code: ${hs}` } };
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";
    const period = /^\d{4}-(0[1-9]|1[0-2])$/;
    if ((from && !period.test(from)) || (to && !period.test(to))) {
      return { status: 400, body: { error: "from and to must be YYYY-MM." } };
    }
    const paging = pageParams(url);
    if (!paging) return { status: 400, body: { error: "Invalid page." } };
    const filters = {
      codes,
      hsCode: hs || null,
      from: from || null,
      to: to || null,
      page: paging.page,
      perPage: paging.perPage,
    };
    const queried = queryPrices(db, filters);
    if (!queried) return { status: 503, body: { error: "Price series are not loaded." } };
    if (url.searchParams.get("format") === "csv" && queried.total > 20000) {
      return { status: 400, body: { error: "More than 20000 rows. Filter by series, hs, from, or to." } };
    }
    const csv = url.searchParams.get("format") === "csv"
      ? queryPrices(db, { ...filters, page: 1, perPage: Math.max(1, queried.total) }).rows
      : queried.rows;
    return {
      status: 200,
      csv,
      body: {
        datasetId: "afrixasia-observatory-prices",
        updatedOn: db.prepare("SELECT value FROM meta WHERE key = 'price_updated_on'").get()?.value || null,
        total: queried.total,
        page: queried.page,
        perPage: queried.perPage,
        pages: queried.pages,
        prices: queried.rows,
        note: "World Bank Pink Sheet monthly nominal US dollars, January 2015 onward, for commodities the observatory tracks. A missing month was not published. These are reference quotes, not bilateral unit values, orders, or inventory. Rice, wheat, tea, coffee, fertilizer, sugar, rubber, and crude quotes for the same month are alternative benchmarks and are not added together. Iron ore is dollars per dry metric ton. The copper quote is refined metal, not copper ore. Gold, platinum, and silver are US dollars per troy ounce and are not added together. The gold quote is linked to unwrought gold, not semi-manufactured gold. Cameroon and Malaysian log quotes are dollars per cubic meter and are not added together or to the sawnwood quotes. The aluminum quote is LME unalloyed metal in dollars per metric ton, not bauxite and not aluminum alloys. The Pink Sheet has no manganese, chromium, or cobalt series. US, Europe, and Japan gas quotes are dollars per million British thermal units and are not added together. The Japan quote is liquefied natural gas, not propane, butanes, or gaseous natural gas. The natural gas index is not stored. The nickel quote is LME cathodes of at least 99.8 percent purity in dollars per metric ton, linked to unwrought unalloyed nickel, not nickel ore and not ferronickel. The tin quote is LME refined tin of 99.85 percent purity in dollars per metric ton, linked to unwrought unalloyed tin, not tin ore. Nickel and tin quotes are not added together. The zinc quote is LME high grade, minimum 99.95 percent purity, in dollars per metric ton, linked to unwrought zinc of at least 99.99 percent, not zinc ore and not zinc under 99.99 percent. The lead quote is LME refined lead of 99.97 percent purity in dollars per metric ton, linked to refined unwrought lead, not lead ore. Zinc and lead quotes are not added together. The Pink Sheet has no diamond series. The Pink Sheet has no graphite, titanium, zirconium, or niobium, tantalum, and vanadium ore series.",
      },
    };
  } finally {
    db.close();
  }
}

function enrichObservation(row) {
  const country = countryByIso3.get(row.country);
  const indicator = indicatorByCode.get(row.indicator);
  return {
    ...row,
    countryName: country?.name || row.country,
    iso2: country?.iso2 || "",
    region: country?.region || "",
    indicatorName: indicator?.name || row.indicator,
    unit: indicator?.unit || "",
    sourceUrl: indicator?.sourceUrl || "",
    version: wdi.version,
  };
}

function referencePayload(url) {
  const view = url.searchParams.get("view") || "series";
  const countryParam = url.searchParams.get("country");
  const countriesParam = url.searchParams.get("countries");
  const indicatorParam = url.searchParams.get("indicator");
  const start = Number(url.searchParams.get("start") || 2015);
  const end = Number(url.searchParams.get("end") || 2025);
  if (view !== "latest" && view !== "series" && view !== "metadata") {
    return { status: 400, body: { error: "view must be latest, series or metadata." } };
  }
  let countries = null;
  if (countriesParam || countryParam) {
    const tokens = (countriesParam || countryParam).split(",").map((item) => item.trim()).filter(Boolean);
    countries = [];
    for (const token of tokens) {
      const country = findCountry(token);
      if (!country) return { status: 400, body: { error: `Unknown country: ${token}` } };
      countries.push(country.iso3);
    }
  }
  let indicators = null;
  if (indicatorParam) {
    indicators = indicatorParam.split(",").map((item) => item.trim()).filter(Boolean);
    for (const code of indicators) {
      if (!indicatorByCode.has(code)) return { status: 400, body: { error: `Unknown indicator: ${code}` } };
    }
  }
  if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
    return { status: 400, body: { error: "Invalid year range." } };
  }
  const source = view === "latest" ? wdi.latest : observations;
  let rows = source.filter((row) => {
    if (countries && !countries.includes(row.country)) return false;
    if (indicators && !indicators.includes(row.indicator)) return false;
    if (view === "series" && (row.year < start || row.year > end)) return false;
    return true;
  });
  if (view === "metadata") rows = [];
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const perPage = Math.min(20000, Math.max(1, Number(url.searchParams.get("per_page") || 500)));
  const enriched = rows.map(enrichObservation);
  return {
    status: 200,
    csv: enriched,
    body: {
      datasetId: wdi.id,
      version: wdi.version,
      retrievedAt: wdi.retrievedAt,
      sourceUpdatedAt: wdi.sourceUpdatedAt,
      license: wdi.license,
      licenseUrl: wdi.licenseUrl,
      checksum: wdi.checksum,
      frequency: "Annual",
      countries: wdi.countries,
      indicators: wdi.indicators,
      coverage: wdi.coverage,
      view,
      total: enriched.length,
      page,
      perPage,
      pages: Math.max(1, Math.ceil(enriched.length / perPage)),
      observations: enriched.slice((page - 1) * perPage, page * perPage),
      note: "Null source values are not converted to zero. Latest selects the most recent reported observation per country–indicator; years can differ.",
    },
  };
}

export function attachApi(middlewares) {
  middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/api/")) return next();
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("access-control-allow-origin", "*");
      res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
      res.setHeader("access-control-allow-headers", "content-type,accept");
      res.end();
      return;
    }
    try {
      await route(req, res, url);
    } catch (error) {
      send(res, 500, { error: error.message || "Server error" });
    }
  });
}

async function route(req, res, url) {
  const format = url.searchParams.get("format");
  if (url.pathname === "/api/catalog" && req.method === "GET") {
    send(res, 200, catalog);
    return;
  }
  if (url.pathname === "/api/brief" && req.method === "GET") {
    send(res, 200, brief);
    return;
  }
  if (url.pathname === "/api/coverage" && req.method === "GET") {
    send(res, 200, {
      version: wdi.version,
      retrievedAt: wdi.retrievedAt,
      summary: summary(),
      countrySectors: countrySectors(),
      indicatorCoverage: wdi.coverage,
      definitions: {
        available: "At least one numerical observation is reported for 2015–2025.",
        not_reported: "The source did not report a numerical value for this pair.",
        stale: "The latest reported year is 2022 or older.",
        sectorEmpty: "No curated market record exists in this snapshot. This is not zero demand.",
      },
    });
    return;
  }
  if (url.pathname === "/api/country" && req.method === "GET") {
    const row = dossier(url.searchParams.get("code") || url.searchParams.get("country"));
    send(res, row ? 200 : 404, row || { error: "Country not found." });
    return;
  }
  if (url.pathname === "/api/market" && req.method === "GET") {
    const id = url.searchParams.get("id");
    if (id) {
      const row = market.records.find((item) => item.id === id);
      send(res, row ? 200 : 404, row || { error: "Record not found." });
      return;
    }
    const records = filterMarket(Object.fromEntries(url.searchParams));
    if (format === "csv") {
      send(res, 200, toCsv(records), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, {
      asOf: market.asOf,
      records,
      providers: market.providers,
      news: market.news,
      corridors: market.corridors,
      countries: market.countries,
      referenceVersion: market.referenceVersion,
      regionalEvidence: market.regionalEvidence,
      total: records.length,
      version: wdi.version,
      referenceApi: "/api/reference",
      catalog: "/api/catalog",
      coverage: "/api/coverage",
      methodology:
        "Curated historical trade and sector references. A missing record is not zero demand, and values are not live orders or inventory.",
    });
    return;
  }
  if (url.pathname === "/api/providers" && req.method === "GET") {
    const id = url.searchParams.get("id");
    if (id) {
      const row = market.providers.find((item) => item.id === id);
      send(res, row ? 200 : 404, row || { error: "Provider not found." });
      return;
    }
    const providers = filterProviders(Object.fromEntries(url.searchParams));
    if (format === "csv") {
      send(res, 200, toCsv(providers), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, {
      version: "2026-10-10",
      total: providers.length,
      providers,
      note: "Public organization references checked against official websites. Not registered members or endorsed partners.",
    });
    return;
  }
  if (url.pathname === "/api/observatory" && req.method === "GET") {
    const db = openObservatory({ readOnly: true });
    if (!db) {
      send(res, 503, { error: "Observatory database is not built." });
      return;
    }
    try {
      send(res, 200, observatoryStatus(db));
    } finally {
      db.close();
    }
    return;
  }
  if (url.pathname === "/api/observatory/trade" && req.method === "GET") {
    const result = observatoryTrade(url);
    if (result.status !== 200) {
      send(res, result.status, result.body);
      return;
    }
    if (format === "csv") {
      send(res, 200, toCsv(result.csv), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, result.body);
    return;
  }
  if (url.pathname === "/api/observatory/prices" && req.method === "GET") {
    const result = observatoryPrices(url);
    if (result.status !== 200) {
      send(res, result.status, result.body);
      return;
    }
    if (format === "csv") {
      send(res, 200, toCsv(result.csv), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, result.body);
    return;
  }
  if (url.pathname === "/api/observatory/exchange-rates" && req.method === "GET") {
    const result = observatoryExchangeRates(url);
    if (result.status !== 200) {
      send(res, result.status, result.body);
      return;
    }
    if (format === "csv") {
      send(res, 200, toCsv(result.csv), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, result.body);
    return;
  }
  if (url.pathname === "/api/observatory/logistics" && req.method === "GET") {
    const result = observatoryLogistics(url);
    if (result.status !== 200) {
      send(res, result.status, result.body);
      return;
    }
    if (format === "csv") {
      send(res, 200, toCsv(result.csv), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, result.body);
    return;
  }
  if (url.pathname === "/api/intelligence" && req.method === "GET") {
    const country = url.searchParams.get("country");
    if (!country) {
      send(res, 400, { error: "country is required. Use ISO2, ISO3 or a country name." });
      return;
    }
    const body = intelligence(country, url.searchParams.get("category") || "");
    send(res, body.error ? 400 : 200, body);
    return;
  }
  if (url.pathname === "/api/reference" && req.method === "GET") {
    const result = referencePayload(url);
    if (result.status !== 200) {
      send(res, result.status, result.body);
      return;
    }
    if (format === "csv") {
      send(res, 200, toCsv(result.csv), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, result.body);
    return;
  }
  if (url.pathname === "/api/listings" && req.method === "GET") {
    const members = readMembers().filter((member) => member.publishConsent !== false);
    const cursor = url.searchParams.get("cursor");
    const start = cursor ? members.findIndex((member) => member.publicKey === cursor) + 1 : 0;
    const page = members.slice(Math.max(0, start), Math.max(0, start) + 25);
    const next = members[Math.max(0, start) + 25];
    const rows = page.map(publicMember);
    if (format === "csv") {
      send(res, 200, toCsv(members.map(listingCsvRow)), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, { listings: rows, cursor: next ? next.publicKey : null });
    return;
  }
  if (url.pathname === "/api/session" && req.method === "GET") {
    const email = sessionEmail(req);
    const provider = email ? sessionProvider(req) : "";
    const members = readMembers();
    const member = email ? members.find((item) => item.email === email) : null;
    if (member) issueCardToken(members, member);
    send(res, 200, {
      email,
      provider,
      identity: email ? identityFor(email, provider) : null,
      google: googleAuthInfo(),
      member: member ? { ...member, profilePath: `/anggota/${member.publicKey}` } : null,
    });
    return;
  }
  if (url.pathname === "/api/session" && req.method === "POST") {
    const body = await readForm(req);
    if (body.action === "signout") {
      clearSession(res);
      send(res, 200, { ok: true });
      return;
    }
    if (body.provider === "google-local" || body.profileId) {
      const profile = localGoogleProfiles.find((item) => item.id === String(body.profileId || ""));
      if (!profile) {
        send(res, 400, { code: "bad_profile", error: "Choose a sample profile from the local Google sign-in." });
        return;
      }
      setSession(res, profile.email, "google-local");
      send(res, 200, {
        email: profile.email,
        provider: "google-local",
        identity: identityFor(profile.email, "google-local"),
        local: true,
      });
      return;
    }
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      send(res, 400, { error: "Enter a valid email to open a local member session." });
      return;
    }
    setSession(res, email, "manual");
    send(res, 200, { email, provider: "manual" });
    return;
  }
  if (url.pathname === "/api/membership-card" && req.method === "GET") {
    const members = readMembers();
    const token = url.searchParams.get("token") || "";
    const email = sessionEmail(req);
    const member = (token && members.find((item) => item.cardToken && item.cardToken === token)) || (email && members.find((item) => item.email === email));
    if (!member) {
      send(res, 404, { error: "Membership card not found." });
      return;
    }
    issueCardToken(members, member);
    const pdf = membershipCardPdf(member);
    sendPdf(res, pdf, `AfriXAsia-${member.membershipId || "card"}.pdf`);
    return;
  }
  if (url.pathname === "/api/registration" && req.method === "POST") {
    const sessionMail = sessionEmail(req);
    const body = await readForm(req);
    const members = readMembers();
    if (body.action === "delete") {
      if (!sessionMail) {
        send(res, 401, { code: "need_session", error: "Sign in before deleting a membership." });
        return;
      }
      const index = members.findIndex((item) => item.email === sessionMail);
      if (index >= 0) members.splice(index, 1);
      writeMembers(members);
      send(res, 200, { deleted: true });
      return;
    }
    const authPath =
      body.authPath === "google" ? "google" : body.authPath === "manual" ? "manual" : sessionMail ? "google" : "manual";
    let email = "";
    let authProvider = "manual";
    if (authPath === "google") {
      if (!sessionMail) {
        send(res, 400, {
          code: "need_path",
          error: "Choose a local Google profile or submit the manual form. A session is not required for manual registration.",
        });
        return;
      }
      email = sessionMail;
      authProvider = sessionProvider(req) === "manual" ? "manual" : "google-local";
    } else {
      email = clip(body.email, 200).toLowerCase();
      authProvider = "manual";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      send(res, 400, { code: "need_email", error: "A valid contact email is required." });
      return;
    }
    const index = members.findIndex((item) => item.email === email);
    if (authPath === "manual" && index >= 0 && sessionMail !== email) {
      send(res, 409, {
        code: "email_taken",
        error: "This email already has a membership. Sign in with the same address to update it.",
      });
      return;
    }
    const role = clip(body.role, 20);
    if (role !== "buyer" && role !== "supplier") {
      send(res, 400, { code: "bad_role", error: "Choose a buyer or supplier role." });
      return;
    }
    if (!flag(body.publishConsent) || !flag(body.membershipConsent)) {
      send(res, 400, { code: "need_consent", error: "Publication and membership consent are required." });
      return;
    }
    const name = clip(body.name, 120);
    const country = clip(body.country, 80);
    const statement = clip(body.interestStatement, 280) || clip(body.title, 140);
    const offer = clip(body.description, 2000);
    const capacity = clip(body.quantity, 160);
    const category = clip(body.category, 80);
    const leadTime = clip(body.leadTime, 160) || clip(body.supplierLeadTime, 160) || clip(body.buyerTimeline, 160);
    const certifications = clip(body.certifications, 500) || clip(body.supplierCertifications, 500);
    if (name.length < 2 || country.length < 2 || statement.length < 5 || offer.length < 20 || !capacity || !category || !leadTime) {
      send(res, 400, { code: "missing_fields", error: "Required membership fields are missing." });
      return;
    }
    const entityType = body.entityType === "individual" ? "individual" : "entity";
    const listingType = body.listingType === "service" ? "service" : "product";
    const interest = { role, intents: parseIntents(body.interestIntents, role), statement };
    const segment = {
      category,
      listingType,
      originCountry: clip(body.originCountry, 100),
      targetCountry: clip(body.targetCountry, 100),
    };
    const capabilities = { offer, capacity, certifications, leadTime };
    const now = new Date().toISOString();
    const previous = index >= 0 ? members[index] : null;
    const publicKey = previous?.publicKey || `axa-${Math.random().toString(36).slice(2, 10)}`;
    const membershipId =
      previous?.membershipId || `AXA-${new Date().getFullYear()}-${String(members.length + 1).padStart(4, "0")}`;
    const member = {
      id: previous?.id || publicKey,
      publicKey,
      membershipId,
      authProvider,
      role,
      entityType,
      name,
      organization: entityType === "entity" ? clip(body.organization, 160) : "",
      country,
      email,
      phone: clip(body.phone, 40),
      website: clip(body.website, 300),
      title: statement.slice(0, 140),
      description: offer,
      quantity: capacity,
      category,
      listingType,
      originCountry: segment.originCountry,
      targetCountry: segment.targetCountry,
      interest,
      segment,
      capabilities,
      buyerPurpose: clip(body.buyerPurpose, 40),
      buyerBudget: clip(body.buyerBudget, 150),
      buyerCriteria: clip(body.buyerCriteria, 1000),
      supplierBusinessType: clip(body.supplierBusinessType, 40),
      supplierMOQ: clip(body.supplierMOQ, 150),
      supplierExperience: clip(body.supplierExperience, 40),
      publicContact: flag(body.publicContact),
      publishConsent: true,
      membershipConsent: true,
      cardToken: previous?.cardToken || randomBytes(18).toString("hex"),
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    };
    if (index >= 0) members[index] = member;
    else members.push(member);
    writeMembers(members);
    let mail = { sent: false, reason: "mail_not_configured" };
    try {
      mail = await sendWelcomeEmail(member, membershipCardPdf(member));
    } catch (error) {
      console.error("welcome mail", error instanceof Error ? error.message : "failed");
      mail = { sent: false, reason: "mail_failed" };
    }
    if (authPath === "manual" && sessionMail !== email) setSession(res, email, "manual");
    send(res, 200, {
      saved: true,
      membershipId,
      profilePath: `/anggota/${publicKey}`,
      email,
      cardToken: member.cardToken,
      authProvider,
      mail,
    });
    return;
  }
  send(res, 404, { error: "Unknown API route." });
}
