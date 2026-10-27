import { dispatch } from "../server/prod.mjs";

export default function handler(req, res) {
  const host = req.headers.host || "localhost";
  const current = new URL(req.url || "/", `http://${host}`);
  const captured = current.searchParams.get("__path") || "";
  current.searchParams.delete("__path");
  if (captured) {
    req.url = `/api/${captured}${current.search}`;
  }
  return dispatch(req, res);
}
