import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoContains, geoDistance, geoGraticule, geoOrthographic, geoPath, geoRotation } from "d3-geo";
import { wdi } from "../../shared/reference.mjs";
import { useLanguage } from "../i18n.jsx";

const isoToName = new Map(wdi.countries.map((country) => [country.iso2, country.name]));

function visible(lonLat, rotation) {
  const [lon, lat] = geoRotation(rotation)(lonLat);
  return Math.cos((lon * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) > 1e-6;
}

function projectionFor(rotation, scale) {
  return geoOrthographic().translate([350, 268]).scale(scale).rotate(rotation).clipAngle(90).precision(0.6);
}

function Globe({ selected, onSelect, active }) {
  const { t } = useLanguage();
  const [world, setWorld] = useState(null);
  const [points, setPoints] = useState([]);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState({ rotation: [-60, -12], scale: 205 });
  const [hover, setHover] = useState("");
  const viewRef = useRef(view);
  const frame = useRef(0);
  const anim = useRef(0);
  const svgRef = useRef(null);
  const drag = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const commit = useCallback((next) => {
    viewRef.current = next;
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        setView(viewRef.current);
      });
    }
  }, []);

  const animateTo = useCallback(
    (rotation, scale = viewRef.current.scale) => {
      cancelAnimationFrame(anim.current);
      const start = viewRef.current;
      const delta = ((((rotation[0] - start.rotation[0] + 540) % 360) + 360) % 360) - 180;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        commit({ rotation, scale });
        return;
      }
      const started = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - started) / 450);
        const eased = progress * progress * (3 - 2 * progress);
        commit({
          rotation: [
            start.rotation[0] + delta * eased,
            start.rotation[1] + (rotation[1] - start.rotation[1]) * eased,
          ],
          scale: start.scale + (scale - start.scale) * eased,
        });
        if (progress < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [commit],
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      ["/world.json", "/country-points.json"].map((url) =>
        fetch(url, { signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("map");
          return response.json();
        }),
      ),
    )
      .then(([land, dots]) => {
        setWorld(land);
        setPoints(dots);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });
    return () => {
      controller.abort();
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(anim.current);
    };
  }, []);

  useEffect(() => {
    const point = points.find((item) => item.name === selected);
    if (point) animateTo([-point.lon, -point.lat]);
  }, [selected, points, animateTo]);

  const projection = useMemo(
    () => projectionFor(view.rotation, view.scale),
    [view],
  );
  const activeNames = useMemo(() => new Set(active), [active]);
  const landPaths = useMemo(() => {
    const path = geoPath(projection);
    return world?.features.map((feature) => ({ feature, path: path(feature) || "" })) || [];
  }, [world, projection]);
  const visiblePoints = useMemo(
    () => points.filter((point) => visible([point.lon, point.lat], view.rotation)),
    [points, view.rotation],
  );
  const graticule = useMemo(() => geoPath(projection)(geoGraticule()()) || "", [projection]);

  function toSvg(event) {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    return [local.x, local.y];
  }

  function countryAt(point) {
    if (!world || Math.hypot(point[0] - 350, point[1] - 268) > viewRef.current.scale) return null;
    const lonLat = projectionFor(viewRef.current.rotation, viewRef.current.scale).invert(point);
    if (!lonLat) return null;
    for (const feature of world.features) {
      if (geoContains(feature, lonLat)) {
        const name = isoToName.get(feature.properties["ISO3166-1-Alpha-2"]);
        if (name) return name;
      }
    }
    let nearest = null;
    let best = Math.min(0.025, 7 / viewRef.current.scale);
    for (const item of points) {
      if (!visible([item.lon, item.lat], viewRef.current.rotation)) continue;
      const distance = geoDistance(lonLat, [item.lon, item.lat]);
      if (distance < best) {
        best = distance;
        nearest = item;
      }
    }
    return nearest?.name || null;
  }

  function endDrag(event) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.moved) {
      const point = toSvg(event);
      const name = point && countryAt(point);
      if (name) onSelectRef.current(name);
    }
    drag.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="globe-panel">
      <div className="globe-top">
        <h2>{t("Connected markets", "Pasar yang saling terhubung", "Des marchés connectés")}</h2>
        <p className="small muted">
          {t(
            "Drag to rotate · select a country · use + / − to zoom",
            "Geser untuk memutar · pilih negara · gunakan + / − untuk zoom",
            "Glissez pour tourner · sélectionnez un pays · utilisez + / −",
          )}
        </p>
      </div>
      <div
        className="globe-wrap"
        onPointerDown={(event) => {
          if (drag.current) return;
          const point = toSvg(event);
          if (!point) return;
          cancelAnimationFrame(anim.current);
          drag.current = {
            id: event.pointerId,
            x: point[0],
            y: point[1],
            rotation: viewRef.current.rotation,
            moved: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const point = toSvg(event);
          if (!point) return;
          const current = drag.current;
          if (current && current.id === event.pointerId) {
            const dx = point[0] - current.x;
            const dy = point[1] - current.y;
            if (Math.hypot(dx, dy) > 4) current.moved = true;
            if (current.moved) {
              setHover("");
              const scale = 57.3 / viewRef.current.scale;
              commit({
                ...viewRef.current,
                rotation: [
                  current.rotation[0] + dx * scale,
                  Math.max(-85, Math.min(85, current.rotation[1] - dy * scale)),
                ],
              });
            }
          } else if (!current) setHover(countryAt(point) || "");
        }}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onPointerLeave={() => setHover("")}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 700 550"
          role="img"
          aria-label={t(
            "Interactive country globe. The country filter provides keyboard access.",
            "Globe negara interaktif. Filter negara tersedia untuk akses keyboard.",
            "Globe interactif des pays. Le filtre pays permet l’accès au clavier.",
          )}
        >
          <defs>
            <radialGradient id="ocean" cx="40%" cy="35%">
              <stop offset="0" stopColor="#182c58" />
              <stop offset="1" stopColor="#080f1c" />
            </radialGradient>
          </defs>
          <circle cx="350" cy="268" r={view.scale} fill="url(#ocean)" stroke="#47615d" />
          <path d={graticule} fill="none" stroke="#54756b" strokeOpacity=".23" strokeWidth=".6" />
          {landPaths.map(({ feature, path }, index) => {
            const name = isoToName.get(feature.properties["ISO3166-1-Alpha-2"]);
            const label = name || feature.properties.name;
            return (
              <path
                key={feature.properties["ISO3166-1-Alpha-3"] || index}
                d={path}
                fill={name === selected ? "#62d643" : name && activeNames.has(name) ? "#4055e8" : "#26364c"}
                stroke="#111d30"
                strokeWidth=".6"
                vectorEffect="non-scaling-stroke"
                data-country={name || undefined}
                role={name && path ? "button" : undefined}
                tabIndex={name && path ? 0 : undefined}
                aria-label={name}
                aria-pressed={name ? name === selected : undefined}
                onKeyDown={(event) => {
                  if (name && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onSelectRef.current(name);
                  }
                }}
              >
                <title>{label}</title>
              </path>
            );
          })}
          {visiblePoints
            .filter((point) => activeNames.has(point.name) || selected === point.name)
            .map((point) => {
              const position = projection([point.lon, point.lat]);
              if (!position) return null;
              return (
                <g key={point.iso2} pointerEvents="none">
                  <circle
                    cx={position[0]}
                    cy={position[1]}
                    r={selected === point.name ? 5 : 3}
                    fill={selected === point.name ? "#fff" : "#62d643"}
                    stroke="#102030"
                    strokeWidth="1"
                  />
                  <title>{point.name}</title>
                </g>
              );
            })}
        </svg>
      </div>
      {!world && (
        <div className="globe-message" role="status">
          {failed
            ? t(
                "Map unavailable. Use the country filter above.",
                "Peta tidak tersedia. Gunakan filter negara di atas.",
                "Carte indisponible. Utilisez le filtre pays ci-dessus.",
              )
            : t("Loading country boundaries…", "Memuat batas negara…", "Chargement des frontières…")}
        </div>
      )}
      <div className="globe-legend">
        <span>
          <i className="green" />
          {t("Matching references", "Referensi cocok", "Références correspondantes")}
        </span>
        <span>
          {t(
            "Dots sit within mapped land areas; not capitals.",
            "Titik berada di wilayah daratan peta; bukan ibu kota.",
            "Les points représentent les terres cartographiées, pas les capitales.",
          )}
        </span>
      </div>
      <div className="globe-controls">
        <button aria-label={t("Rotate left", "Putar kiri", "Tourner à gauche")} onClick={() => animateTo([viewRef.current.rotation[0] - 20, viewRef.current.rotation[1]])}>
          ←
        </button>
        <button aria-label={t("Rotate right", "Putar kanan", "Tourner à droite")} onClick={() => animateTo([viewRef.current.rotation[0] + 20, viewRef.current.rotation[1]])}>
          →
        </button>
        <button aria-label={t("Zoom in", "Perbesar", "Agrandir")} onClick={() => animateTo(viewRef.current.rotation, Math.min(235, viewRef.current.scale + 15))}>
          +
        </button>
        <button aria-label={t("Zoom out", "Perkecil", "Réduire")} onClick={() => animateTo(viewRef.current.rotation, Math.max(155, viewRef.current.scale - 15))}>
          −
        </button>
      </div>
      {hover && (
        <span className="tooltip" role="status">
          {hover}
        </span>
      )}
    </div>
  );
}

export default memo(Globe);
