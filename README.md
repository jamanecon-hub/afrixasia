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

## Observatory database

`data/observatory.sqlite` is the queryable copy of the market observatory: the published WDI snapshot, extra annual sector indicators, Africa–Asia export flows (including sesame, vanilla, cloves, and pepper), monthly commodity benchmarks, and FAO crop production.

```bash
npm run observatory:collect
npm run observatory:query -- status
npm run observatory:query -- production --country KEN --item 667 --element 5510
```

`GET /api/observatory` reads the same database. A missing trade or production row is not zero. Flows under USD 1 million are omitted. Tea production is fresh leaves, not made tea and not the Mombasa auction price.

## What is included

- Pages: `/`, `/data-pasar`, `/open-data`, `/daily-brief`, `/marketplace`, `/daftar`, `/kualitas-data`, `/api-docs`, `/privasi`, `/anggota/:id`
- English, Indonesian, and French copy, with the language stored in the browser
- Research filters carried across pages in the URL (`ctx=1`) and session storage
- World Bank WDI snapshot (2015–2025, 104 economies, 17 indicators) and the 10 October 2026 market reference snapshot
- Public JSON/CSV endpoints under `/api/*`
- Circle membership on `/daftar` accepts a local Google sign-in (sample profiles, no Google API and no client secret) or a manual identity form. Interest, segment, and capabilities are stored on the member and shown publicly. Email and phone stay private unless the member opts in.

Market figures are historical references, not live orders or inventory. A missing row is not zero demand.
