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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const membersPath = path.join(root, "data", "members.json");
const indicatorByCode = new Map(wdi.indicators.map((item) => [item.code, item]));
const countryByIso3 = new Map(wdi.countries.map((item) => [item.iso3, item]));

function readMembers() {
  try {
    return JSON.parse(fs.readFileSync(membersPath, "utf8"));
  } catch {
    return [];
  }
}

function writeMembers(members) {
  fs.writeFileSync(membersPath, JSON.stringify(members, null, 2));
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
  if (member.publicContact) {
    profile.email = member.email;
    profile.phone = member.phone;
  }
  return profile;
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
  if (url.pathname === "/api/market" && req.method === "GET") {
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
      send(res, 200, toCsv(members.map(publicMember)), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, { listings: rows, cursor: next ? next.publicKey : null });
    return;
  }
  if (url.pathname === "/api/session" && req.method === "GET") {
    const email = sessionEmail(req);
    const member = email ? readMembers().find((item) => item.email === email) : null;
    send(res, 200, {
      email,
      member: member ? { ...member, profilePath: `/anggota/${member.publicKey}` } : null,
    });
    return;
  }
  if (url.pathname === "/api/session" && req.method === "POST") {
    const body = await readForm(req);
    if (body.action === "signout") {
      res.setHeader("set-cookie", "axa_email=; Path=/; Max-Age=0; SameSite=Lax");
      send(res, 200, { ok: true });
      return;
    }
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      send(res, 400, { error: "Enter a valid email to open a local member session." });
      return;
    }
    res.setHeader(
      "set-cookie",
      `axa_email=${encodeURIComponent(email)}; Path=/; Max-Age=2592000; SameSite=Lax`,
    );
    send(res, 200, { email });
    return;
  }
  if (url.pathname === "/api/registration" && req.method === "POST") {
    const email = sessionEmail(req);
    if (!email) {
      send(res, 401, { error: "Sign in before saving a membership." });
      return;
    }
    const body = await readForm(req);
    const members = readMembers();
    const index = members.findIndex((item) => item.email === email);
    if (body.action === "delete") {
      if (index >= 0) members.splice(index, 1);
      writeMembers(members);
      send(res, 200, { deleted: true });
      return;
    }
    const required = ["name", "country", "title", "description", "quantity", "category", "role"];
    if (required.some((key) => !String(body[key] || "").trim())) {
      send(res, 400, { error: "Required membership fields are missing." });
      return;
    }
    if (body.publishConsent !== "on" && body.publishConsent !== "true" && body.publishConsent !== true) {
      send(res, 400, { error: "Publication consent is required." });
      return;
    }
    if (body.membershipConsent !== "on" && body.membershipConsent !== "true" && body.membershipConsent !== true) {
      send(res, 400, { error: "Membership consent is required." });
      return;
    }
    const now = new Date().toISOString();
    const previous = index >= 0 ? members[index] : null;
    const publicKey = previous?.publicKey || `axa-${Math.random().toString(36).slice(2, 10)}`;
    const membershipId = previous?.membershipId || `AXA-${new Date().getFullYear()}-${String(members.length + 1).padStart(4, "0")}`;
    const member = {
      ...previous,
      ...body,
      email,
      publicContact: body.publicContact === "on" || body.publicContact === "true" || body.publicContact === true,
      publishConsent: true,
      membershipConsent: true,
      publicKey,
      membershipId,
      id: previous?.id || publicKey,
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    };
    if (index >= 0) members[index] = member;
    else members.push(member);
    writeMembers(members);
    send(res, 200, {
      saved: true,
      membershipId,
      profilePath: `/anggota/${publicKey}`,
    });
    return;
  }
  send(res, 404, { error: "Unknown API route." });
}
