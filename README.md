# AfriXAsia Market Observatory

Source rebuild of the AfriXAsia market intelligence site: home, interactive globe, economic series, media brief, membership, and the public data API.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build
npm run preview
```

## What is included

- Pages: `/`, `/data-pasar`, `/open-data`, `/daily-brief`, `/marketplace`, `/daftar`, `/kualitas-data`, `/api-docs`, `/privasi`, `/anggota/:id`
- English, Indonesian, and French copy, with the language stored in the browser
- Research filters carried across pages in the URL (`ctx=1`) and session storage
- World Bank WDI snapshot (2015–2025, 104 economies, 17 indicators) and the 10 October 2026 market reference snapshot
- Public JSON/CSV endpoints under `/api/*`
- Circle membership on `/daftar` accepts a local Google sign-in (sample profiles, no Google API and no client secret) or a manual identity form. Interest, segment, and capabilities are stored on the member and shown publicly. Email and phone stay private unless the member opts in.

Market figures are historical references, not live orders or inventory. A missing row is not zero demand.

## Observatory database

`data/observatory.sqlite` is a SQLite copy of the JSON snapshot, built with Node's built-in `node:sqlite`. The React pages keep reading the JSON modules. Existing HTTP responses (`/api/country`, `/api/market`, `/api/providers`, `/api/reference`, `/api/brief`) stay on those files so their JSON shapes do not change. The `/api/db/*` routes read the database.

Rebuild from the JSON snapshot. The loader deletes and rewrites the file:

```bash
node server/load-db.mjs
```

Circle members are not loaded. `POST /api/registration` writes `data/members.json`, and that file stays the only membership store. Email and phone remain private unless the member opts in.

### Tables

| Table | What it holds |
| --- | --- |
| `countries` | 104 economies: iso2, iso3, name, source name, region, capital, income group, lat, lon |
| `indicators` | 17 WDI indicators: code, name, label, unit, category, source URL, definition |
| `observations` | Reported annual values for 2015–2025. Nulls stay NULL. Missing country–indicator–years are omitted, not filled with zero |
| `coverage` | Pair status plus `missing_years` for those gaps |
| `latest_observations` | Most recent reported value per country–indicator, as stored in the WDI snapshot |
| `market_records` | 818 historical demand/supply references: origin, target, category, side, value, unit, period, source |
| `providers` | 78 official-source organization profiles, not members |
| `headlines` | Media-brief RSS headlines, with `headline_countries` for the country names on each item |
| `country_briefs` | Per-country media notes from the brief |
| `market_news` | Short curated market headlines shipped in `market.json` |
| `corridors` | Historical product corridor references |
| `regional_evidence` | Regional music figures. These are not country measurements |
| `datasets` | Catalog entries for the WDI, market, and provider snapshots |
| `retrievals` | World Bank API requests recorded with the WDI snapshot |
| `snapshot` | Version `2026-10-10-wdi-v1`, licenses, and load time |

### Read endpoints

These routes take named filters. They do not accept SQL.

- `GET /api/db/summary` — version and row counts
- `GET /api/db/country?code=KEN` — one economy by ISO2, ISO3, or name. With no code, the full country list
- `GET /api/db/series?country=KEN&indicator=SP.POP.TOTL&start=2015&end=2025` — one indicator series. Missing years are absent
- `GET /api/db/market?country=Kenya&category=Food%20%26%20agriculture&side=supply&origin=Kenya&target=World&q=tea` — market reference search. `id=` returns one record
- `GET /api/db/providers?id=ASP1` — one organization, or a search with `country`, `category`, `region`, and `q`
- `GET /api/db/headlines?country=Kenya&region=Africa&q=trade`
- `GET /api/db/brief?country=KEN` — one country media note
- `GET /api/db/coverage?country=KEN&indicator=IT.NET.USER.ZS` — reported span and missing years
- `GET /api/db/corridors` and `GET /api/db/regional`

`server/db.mjs` exposes the same reads: `findCountry`, `indicatorSeries`, `searchMarket`, `providerById`, `tableCounts`, and `summary`.

Values in this database are historical references, not live orders or inventory.
