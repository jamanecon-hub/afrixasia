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

`data/observatory.sqlite` is the query database. It holds the published JSON snapshot plus two collected supplements:

- Eleven extra World Bank WDI series for 2015–2025 (merchandise trade levels, manufactures shares, agriculture/manufacturing/services value added, inflation, the official exchange rate, electricity access, and mobile subscriptions). Null source values are omitted.
- UN Comtrade bilateral goods exports between Africa and Asia for HS 0901 coffee, 0902 tea, 1801 cocoa beans, 1006 rice, 080131 cashew nuts in shell, 1511 palm oil, 5201 cotton, and 6109 knitted T-shirts. Rows under USD 1 million are omitted. A missing pair is not zero trade.

The React pages keep reading the JSON snapshot. `/api/db/*` and the query script read SQLite. Circle members stay in `data/members.json`.

```bash
npm run observatory:collect
npm run observatory:build
npm run observatory:query -- status
npm run observatory:query -- series --country KEN --indicator TX.VAL.MRCH.CD.WT
npm run observatory:query -- trade --hs 0902 --origin Kenya --year 2024
```

`observatory:collect` refreshes the WDI supplement, then continues unfinished Comtrade reporter-years. Resume state is `data/collected/client.json` (`completedQueries`), which is gitignored. The committed file `data/collected/trade-flows.json` carries the same list, so a fresh checkout can continue. The public preview quota can stop a run before every reporter is finished.

Read routes, with named filters and no SQL:

- `GET /api/db/summary`
- `GET /api/db/country?code=KEN`
- `GET /api/db/series?country=KEN&indicator=TX.VAL.MRCH.CD.WT&start=2015&end=2025`
- `GET /api/db/trade?hs=0902&origin=Kenya&target=Pakistan&year=2024`
- `GET /api/db/market`, `/api/db/providers`, `/api/db/headlines`, `/api/db/brief`, `/api/db/coverage`, `/api/db/corridors`, `/api/db/regional`

Values in this database are historical references, not live orders or inventory.
