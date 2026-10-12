import { useState } from "react";

export default function CompanyLogo({ id, name }) {
  const [failed, setFailed] = useState(false);
  const letter = String(name || "?").trim().charAt(0).toUpperCase() || "?";
  if (failed) {
    return (
      <span className="company-logo company-logo-fallback" aria-hidden="true">
        {letter}
      </span>
    );
  }
  return (
    <img
      className="company-logo"
      src={`/logos/${id}.png`}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
