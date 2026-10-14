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

`data/observatory.sqlite` is the queryable copy of the market observatory: the published WDI snapshot, twelve extra annual indicators, Africa–Asia export flows, monthly commodity benchmarks, and the curated market records.

```bash
npm run observatory:collect
npm run observatory:build
npm run observatory:query -- status
npm run observatory:query -- trade --reporter KEN --partner PAK --hs 0902 --year 2024
```

`observatory:collect` refreshes World Bank indicators and commodity prices, then resumes UN Comtrade reporter-years that are not already marked finished. `observatory:build` reloads the database from those files. The same views are public at `/api/observatory`.

Collected trade rows are reporter exports to the other region for coffee, tea, wheat, rice, cocoa, cashew, palm oil, cotton, and cotton t-shirts in 2023–2025. Values under USD 1 million are omitted. A missing pair is not zero trade. Commodity prices are World Bank Pink Sheet benchmarks, including the Mombasa tea auction.

## What is included

- Pages: `/`, `/data-pasar`, `/open-data`, `/daily-brief`, `/marketplace`, `/daftar`, `/kualitas-data`, `/api-docs`, `/privasi`, `/anggota/:id`
- English, Indonesian, and French copy, with the language stored in the browser
- Research filters carried across pages in the URL (`ctx=1`) and session storage
- World Bank WDI snapshot (2015–2025, 104 economies, 17 indicators) and the 10 October 2026 market reference snapshot
- Public JSON/CSV endpoints under `/api/*`
- Circle membership on `/daftar` accepts a local Google sign-in (sample profiles, no Google API and no client secret) or a manual identity form. Interest, segment, and capabilities are stored on the member and shown publicly. Email and phone stay private unless the member opts in.

Market figures are historical references, not live orders or inventory. A missing row is not zero demand.
