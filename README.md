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
- Local email session for Circle membership. The hosted site used ChatGPT sign-in; this source build keeps the same application, directory, and privacy rules with a local account so the flow can run without that host.

Market figures are historical references, not live orders or inventory. A missing row is not zero demand.
