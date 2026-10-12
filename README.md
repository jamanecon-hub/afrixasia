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
- Collected supplement: textile value added, food production, employment, education, mobile access, travel services, tourism arrivals, and UN Comtrade Asia–Africa export corridors
- SQLite database at `data/observatory.sqlite`, queried by `/api/reference`, `/api/market`, `/api/providers`, `/api/corridors`, and `/api/db`
- Public JSON/CSV endpoints under `/api/*`

Refresh the collected series and rebuild the database with:

```bash
npm run observatory:collect
npm run observatory:build
npm run observatory:query -- status
```
- Circle membership on `/daftar` accepts a local Google sign-in (sample profiles, no Google API and no client secret) or a manual identity form. Interest, segment, and capabilities are stored on the member and shown publicly. Email and phone stay private unless the member opts in.

Market figures are historical references, not live orders or inventory. A missing row is not zero demand.
