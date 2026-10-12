import { useState } from "react";

export default function CountryFlag({ iso2 }) {
  const code = String(iso2 || "").toLowerCase();
  const [failed, setFailed] = useState(false);
  if (!/^[a-z]{2}$/.test(code) || failed) return null;
  return (
    <img
      className="country-flag"
      src={`/flags/${code}.svg`}
      alt=""
      width={22}
      height={16}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
