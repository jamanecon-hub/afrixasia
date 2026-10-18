export function CorridorDiagram({ label, caption, africaLabel, asiaLabel }) {
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const africa = [168, 160, 154, 146, null, 136, 128, 122, 116, 108, 100];
  const asia = [96, 104, 92, null, 108, 116, 110, 128, 120, 136, 128];
  const x = (index) => 48 + index * 36;
  const segments = (series, color) =>
    series.slice(1).map((value, index) => {
      const previous = series[index];
      if (value == null || previous == null) return null;
      return (
        <line
          key={`${color}-${years[index]}`}
          x1={x(index)}
          y1={previous}
          x2={x(index + 1)}
          y2={value}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    });

  return (
    <figure className="corridor-figure">
      <svg viewBox="0 0 480 280" role="img" aria-label={label}>
        <title>{label}</title>
        <rect width="480" height="280" rx="12" fill="#0c1624" />
        {Array.from({ length: 12 }, (_, index) => (
          <line key={`v${index}`} x1={24 + index * 40} x2={24 + index * 40} y1="16" y2="248" stroke="#1a2940" />
        ))}
        {Array.from({ length: 7 }, (_, index) => (
          <line key={`h${index}`} x1="20" x2="460" y1={28 + index * 36} y2={28 + index * 36} stroke="#1a2940" />
        ))}
        <line x1="48" x2="408" y1="214" y2="214" stroke="#31445d" />
        {segments(africa, "#3dce4a")}
        {segments(asia, "#2f5bff")}
        {africa.map((value, index) =>
          value == null ? (
            <line key={`gap-a-${index}`} x1={x(index)} x2={x(index)} y1="206" y2="214" stroke="#8ea0b5" strokeDasharray="2 2" />
          ) : (
            <circle key={`a-${index}`} cx={x(index)} cy={value} r="3.5" fill="#3dce4a" />
          ),
        )}
        {asia.map((value, index) =>
          value == null ? (
            <line key={`gap-s-${index}`} x1={x(index)} x2={x(index)} y1="206" y2="214" stroke="#8ea0b5" strokeDasharray="2 2" />
          ) : (
            <circle key={`s-${index}`} cx={x(index)} cy={value} r="3.5" fill="#2f5bff" />
          ),
        )}
        <rect x="228" y="132" width="18" height="18" transform="rotate(45 237 141)" fill="#101820" stroke="#d7e2ea" strokeWidth="1.5" />
        {years.map((year, index) =>
          index % 2 === 0 ? (
            <text key={year} x={x(index)} y="234" textAnchor="middle" fill="#8ea0b5" fontSize="10" fontFamily="DM Sans, sans-serif">
              {year}
            </text>
          ) : null,
        )}
        <circle cx="52" cy="256" r="4" fill="#3dce4a" />
        <text x="62" y="260" fill="#d5deea" fontSize="11" fontFamily="DM Sans, sans-serif">
          {africaLabel}
        </text>
        <circle cx="128" cy="256" r="4" fill="#2f5bff" />
        <text x="138" y="260" fill="#d5deea" fontSize="11" fontFamily="DM Sans, sans-serif">
          {asiaLabel}
        </text>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function AreaGlyph({ type }) {
  if (type === "research") {
    return (
      <svg viewBox="0 0 160 72" aria-hidden="true">
        <line x1="12" y1="60" x2="148" y2="60" stroke="#d5dee8" />
        <polyline points="16,48 40,40 64,44 88,28 112,24 136,16" fill="none" stroke="#2f5bff" strokeWidth="2.5" />
        <polyline points="16,52 40,46 64,50" fill="none" stroke="#3dce4a" strokeWidth="2.5" />
        <polyline points="100,34 124,30 148,22" fill="none" stroke="#3dce4a" strokeWidth="2.5" />
        <line x1="82" x2="82" y1="54" y2="60" stroke="#8ea0b5" strokeDasharray="2 2" />
      </svg>
    );
  }
  if (type === "advisory") {
    return (
      <svg viewBox="0 0 160 72" aria-hidden="true">
        <line x1="28" y1="22" x2="80" y2="40" stroke="#d5dee8" />
        <line x1="80" y1="18" x2="80" y2="40" stroke="#d5dee8" />
        <line x1="132" y1="22" x2="80" y2="40" stroke="#d5dee8" />
        <circle cx="28" cy="22" r="7" fill="#3dce4a" />
        <circle cx="80" cy="18" r="7" fill="#234f44" />
        <circle cx="132" cy="22" r="7" fill="#2f5bff" />
        <rect x="71" y="40" width="18" height="18" transform="rotate(45 80 49)" fill="#101d32" />
      </svg>
    );
  }
  if (type === "education") {
    return (
      <svg viewBox="0 0 160 72" aria-hidden="true">
        <rect x="16" y="12" width="92" height="8" rx="2" fill="#dbe7ea" />
        <rect x="16" y="30" width="116" height="8" rx="2" fill="#2f5bff" />
        <rect x="16" y="48" width="70" height="8" rx="2" fill="#3dce4a" />
        <circle cx="140" cy="34" r="8" fill="none" stroke="#234f44" strokeWidth="2" />
        <path d="M136 34 l3 3 6-7" fill="none" stroke="#234f44" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 72" aria-hidden="true">
      <line x1="36" y1="20" x2="80" y2="36" stroke="#d5dee8" />
      <line x1="124" y1="20" x2="80" y2="36" stroke="#d5dee8" />
      <line x1="36" y1="54" x2="80" y2="36" stroke="#d5dee8" />
      <line x1="124" y1="54" x2="80" y2="36" stroke="#d5dee8" />
      <line x1="36" y1="20" x2="124" y2="20" stroke="#d5dee8" />
      <line x1="36" y1="54" x2="124" y2="54" stroke="#d5dee8" />
      <circle cx="36" cy="20" r="6" fill="#3dce4a" />
      <circle cx="124" cy="20" r="6" fill="#2f5bff" />
      <circle cx="36" cy="54" r="6" fill="#234f44" />
      <circle cx="124" cy="54" r="6" fill="#101d32" />
      <rect x="72" y="28" width="16" height="16" fill="#101d32" transform="rotate(45 80 36)" />
    </svg>
  );
}
