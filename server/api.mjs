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
  if (url.pathname === "/api/observatory" && req.method === "GET") {
    const { queryObservatory } = await import("../scripts/observatory/read.mjs");
    const result = queryObservatory(Object.fromEntries(url.searchParams));
    if (result.status !== 200) {
      send(res, result.status, result.body);
      return;
    }
    if (format === "csv") {
      const rows = result.body.rows || result.body.countries || result.body.datasets || [result.body.counts];
      send(res, 200, toCsv(rows), "text/csv; charset=utf-8");
      return;
    }
    send(res, 200, result.body);
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
