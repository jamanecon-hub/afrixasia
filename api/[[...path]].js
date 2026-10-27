import { dispatch } from "../server/prod.mjs";

export default function handler(req, res) {
  const host = req.headers.host || "localhost";
  const current = new URL(req.url || "/", `http://${host}`);
  if (!current.pathname.startsWith("/api/")) {
    const parts = [].concat(req.query?.path || []).filter(Boolean);
    req.url = `/api/${parts.map((part) => encodeURIComponent(part)).join("/")}${current.search}`;
  }
  return dispatch(req, res);
}
