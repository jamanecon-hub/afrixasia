import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { findCountry, inferType } from "../shared/reference.mjs";
import { useLanguage } from "./i18n.jsx";

const KEY = "afrixasia-research-context-v2";
const FIELDS = [
  "country",
  "region",
  "category",
  "side",
  "type",
  "origin",
  "target",
  "q",
  "role",
  "indicator",
  "compare",
];

const ResearchContext = createContext(null);

export function normalizeContext(input = {}) {
  const next = {};
  for (const field of FIELDS) {
    if (typeof input[field] === "string" && input[field]) next[field] = input[field].slice(0, 200);
  }
  for (const field of ["country", "origin", "target"]) {
    if (next[field]) next[field] = findCountry(next[field])?.name || next[field];
  }
  if (next.country && findCountry(next.country)) {
    const region = findCountry(next.country).region;
    if (next.region && next.region !== region) delete next.region;
  }
  return next;
}

export function patchContext(context, field, value) {
  const next = { ...context, [field]: value };
  if (!value) delete next[field];
  if (field === "country") {
    if (!value) delete next.country;
    else next.country = findCountry(value)?.name || value;
    if (next.region && findCountry(next.country)?.region !== next.region) delete next.region;
  }
  if (field === "region" && next.country && value && findCountry(next.country)?.region !== value) {
    delete next.country;
  }
  if (field === "category") delete next.indicator;
  if (field === "side") {
    if (value === "demand") next.role = "buyer";
    else if (value === "supply") next.role = "supplier";
    else delete next.role;
  }
  if (field === "role") {
    if (value === "buyer") next.side = "demand";
    else if (value === "supplier") next.side = "supply";
    else delete next.side;
  }
  if (field === "category" && value) next.type = inferType(value);
  if (field === "type" && value && next.category && value !== inferType(next.category)) delete next.category;
  for (const key of ["role", "side", "type"]) if (!next[key]) delete next[key];
  return normalizeContext(next);
}

export function contextSearch(path, context = {}) {
  const next = normalizeContext(context);
  const params = new URLSearchParams();
  for (const field of FIELDS) if (next[field]) params.set(field, next[field]);
  params.set("ctx", "1");
  return `${path}?${params.toString()}`;
}

export function registerSearch(context = {}, role) {
  const next = { ...context };
  if (role) {
    next.role = role === "choose" ? "" : role;
    if (role === "buyer" || role === "supplier") next.side = role === "buyer" ? "demand" : "supply";
    if (role === "choose") delete next.side;
  }
  return contextSearch("/daftar", next);
}

function readStored() {
  try {
    return normalizeContext(JSON.parse(sessionStorage.getItem(KEY) || "{}"));
  } catch {
    return {};
  }
}

export function ResearchProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [context, setContext] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const parsed = normalizeContext(Object.fromEntries(params));
    const initial = params.has("ctx") || Object.keys(parsed).length ? parsed : readStored();
    setContext(initial);
    setReady(true);
  }, [location.pathname]);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(context));
    } catch {
      /* ignore */
    }
    const next = contextSearch(location.pathname, context);
    const current = `${location.pathname}${location.search}`;
    if (current !== next) navigate(next, { replace: true });
  }, [context, ready, location.pathname]);

  const value = useMemo(() => ({ context, setContext }), [context]);
  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
}

export function useResearch() {
  const value = useContext(ResearchContext);
  if (!value) throw new Error("ResearchProvider missing");
  return [value.context, value.setContext];
}

export function ResearchBar({ scope }) {
  const { t } = useLanguage();
  const [context] = useResearch();
  const chips = [
    context.country,
    context.category,
    context.origin && context.target ? `${context.origin} → ${context.target}` : context.origin || context.target,
    context.side,
    context.type,
    context.q,
  ].filter(Boolean);
  if (!chips.length) return null;
  const note =
    scope === "analysis"
      ? t(
          "Annual analysis uses country and indicator. Sector and corridor filters stay with you for other tabs.",
          "Analisis tahunan memakai negara dan indikator. Filter sektor dan koridor tetap dibawa ke tab lain.",
          "L’analyse annuelle utilise le pays et l’indicateur. Les filtres secteur et corridor sont conservés.",
        )
      : scope === "media"
        ? t(
            "News uses country, region and keywords. Other filters are retained for your return to markets.",
            "Berita memakai negara, kawasan, dan kata kunci. Filter lainnya tetap disimpan untuk kembali ke pasar.",
            "L’actualité utilise pays, région et mots-clés. Les autres filtres sont conservés pour votre retour aux marchés.",
          )
        : t(
            "Company references use country, region, sector and keywords. Direction and corridor apply to member listings.",
            "Referensi perusahaan memakai negara, kawasan, sektor, dan kata kunci. Arah dan koridor berlaku pada listing anggota.",
            "Les références d’entreprises utilisent pays, région, secteur et mots-clés. Direction et corridor s’appliquent aux annonces des membres.",
          );
  return (
    <div className="research-context-bar">
      <b>{t("Your research context", "Konteks riset Anda", "Votre contexte de recherche")}</b>
      <span>{chips.join(" · ")}</span>
      <small>{note}</small>
    </div>
  );
}
