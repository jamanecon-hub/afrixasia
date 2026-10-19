export function CorridorDiagram({ label, caption, africaLabel, asiaLabel, axes }) {
  const cx = 210;
  const cy = 128;
  const radius = 78;
  const africa = [0.82, 0.64, 0.7, 0.56, 0.68, 0.86];
  const asia = [0.58, 0.84, 0.74, 0.72, 0.5, 0.66];
  const point = (index, scale) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axes.length;
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale];
  };
  const polygon = (values) =>
    `${values
      .map((value, index) => {
        const [x, y] = point(index, value);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ")} Z`;

  return (
    <figure className="corridor-figure">
      <svg viewBox="0 0 420 300" role="img" aria-label={label}>
        <title>{label}</title>
        <rect width="420" height="300" rx="12" fill="#0c1624" />
        {[1, 0.75, 0.5, 0.25].map((level) => (
          <polygon
            key={level}
            points={axes
              .map((_, index) => point(index, level).map((value) => value.toFixed(1)).join(","))
              .join(" ")}
            fill="none"
            stroke="#1d3148"
          />
        ))}
        {axes.map((axis, index) => {
          const [x, y] = point(index, 1);
          const [lx, ly] = point(index, 1.28);
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axes.length;
          const anchor = Math.cos(angle) > 0.35 ? "start" : Math.cos(angle) < -0.35 ? "end" : "middle";
          return (
            <g key={axis}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#31445d" />
              <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fill="#d5deea" fontSize="11" fontFamily="DM Sans, sans-serif">
                {axis}
              </text>
            </g>
          );
        })}
        <path d={polygon(asia)} fill="rgba(47,91,255,0.18)" stroke="#2f5bff" strokeWidth="2" />
        <path d={polygon(africa)} fill="rgba(61,206,74,0.16)" stroke="#3dce4a" strokeWidth="2" />
        {asia.map((value, index) => {
          const [x, y] = point(index, value);
          return <circle key={`asia-${axes[index]}`} cx={x} cy={y} r="3" fill="#2f5bff" />;
        })}
        {africa.map((value, index) => {
          const [x, y] = point(index, value);
          return <circle key={`africa-${axes[index]}`} cx={x} cy={y} r="3" fill="#3dce4a" />;
        })}
        <rect x={cx - 5} y={cy - 5} width="10" height="10" transform={`rotate(45 ${cx} ${cy})`} fill="#101820" stroke="#d7e2ea" />
        <circle cx="24" cy="276" r="4" fill="#3dce4a" />
        <text x="34" y="280" fill="#d5deea" fontSize="11" fontFamily="DM Sans, sans-serif">
          {africaLabel}
        </text>
        <circle cx="118" cy="276" r="4" fill="#2f5bff" />
        <text x="128" y="280" fill="#d5deea" fontSize="11" fontFamily="DM Sans, sans-serif">
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
