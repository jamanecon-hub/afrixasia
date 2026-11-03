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

`data/observatory.sqlite` is the queryable copy of the market observatory: the published WDI snapshot, extra annual sector indicators, Africa–Asia export flows (including sesame, vanilla, cloves, pepper, frozen fish, fillets, prepared tuna, natural rubber, groundnuts, maize, unmanufactured tobacco, sugar, phosphate rock, copper ore, refined copper cathodes, cobalt oxides and hydroxides, iron ore, manganese ore, chromium ore, bauxite, titanium ore, and crude petroleum), monthly commodity benchmarks, FAO crop production, and FAO FishStat aquatic-animal production.

```bash
npm run observatory:collect
npm run observatory:query -- status
npm run observatory:query -- production --country KEN --item 667 --element 5510
```

`GET /api/observatory` reads the same database. A missing trade or production row is not zero. Flows under USD 1 million are omitted. Tea production is fresh leaves, not made tea and not the Mombasa auction price. Fish production is live weight, not customs weight. Natural rubber production is not HS 4001 trade and not the TSR20 futures price. Groundnut production is in shell, not HS 1202 trade and not the Pink Sheet groundnut or groundnut-oil price. Maize production is grain, not HS 1005 trade and not the US Gulf No. 2 yellow price. Unmanufactured tobacco production is not HS 2401 trade and not the US import unit value. Sugar cane and sugar beet are not raw sugar and must not be added. Raw centrifugal sugar is not HS 1701 trade and not the ISA world price. Phosphate rock trade is HS 2510, not mine production and not the DAP, TSP, or urea price. The phosphate benchmark is f.o.b. North Africa. Copper ore (HS 2603) and refined copper cathodes (HS 740311) must not be added. Cathode trade is not mine production and not the LME price. The copper benchmark is the LME grade A cathode settlement. Cobalt oxides and hydroxides (HS 282200) are not cobalt ores (HS 2605), not unwrought cobalt (HS 810520), and not copper. Customs weight is not contained cobalt metal. Mine production is absent, not zero. This Pink Sheet extract has no cobalt price. Iron ore trade is HS 2601, including agglomerated ore. It is not pig iron (HS 7201), not steel, and not mine production. The iron-ore benchmark is 62% Fe fines, c.f.r. China, in US dollars per dry metric ton. The Monthly Prices header prints ($/dmtu); the Description sheet defines the spot series as US dollars per dry ton. A missing price month is not zero. Manganese ore trade is HS 2602, including ferruginous manganese ores with a manganese content of 20% or more, calculated on the dry weight. It is not ferromanganese (HS 7202), not manganese oxides (HS 2820), and not mine production. Customs weight is not contained manganese metal. This Pink Sheet extract has no manganese price. Chromium ore trade is HS 2610. It is not ferrochromium (HS 720241 or HS 720249), not chromium oxides and hydroxides (HS 2819), and not mine production. Customs weight is not contained chromium metal. This Pink Sheet extract has no chromium price. Bauxite trade is HS 2606, aluminium ores and concentrates. It is not alumina (HS 281820), not unwrought aluminium (HS 7601), and not mine production. Customs weight is not contained aluminium metal. Ghana’s 2024 net weight and quantity both use unit code 8 and differ, so they must not be substituted. This Pink Sheet extract has no bauxite series. The Aluminum series is metal, not bauxite, and is not stored. Titanium ore trade is HS 2614, titanium ores and concentrates. It is not titanium oxides (HS 2823), not titanium dioxide pigments (HS 320611), not unwrought titanium (HS 8108), not ferrotitanium (HS 720291), and not slag or ash (HS 2620). Customs weight is not contained titanium metal and is not mine production. Mozambique’s 2024 net weight and quantity to China both use unit code 8 and match. Mozambique’s 2023 net weight and quantity to China both use unit code 8 and differ, so they must not be substituted. This Pink Sheet extract has no titanium ore, ilmenite, or rutile series. Crude petroleum trade is HS 2709. It is not refined petroleum (HS 2710), not petroleum gases (HS 2711), and not a barrel count. Customs weight is kilograms. The stored benchmarks are UK Brent, 38 API, and Dubai Fateh, 32 API, in US dollars per barrel. They are not the customs unit value. WTI and the equal-weighted average of Brent, Dubai, and WTI are not stored. A missing price is not zero.

## What is included

- Pages: `/`, `/data-pasar`, `/open-data`, `/daily-brief`, `/marketplace`, `/daftar`, `/kualitas-data`, `/api-docs`, `/privasi`, `/anggota/:id`
- English, Indonesian, and French copy, with the language stored in the browser
- Research filters carried across pages in the URL (`ctx=1`) and session storage
- World Bank WDI snapshot (2015–2025, 104 economies, 17 indicators) and the 10 October 2026 market reference snapshot
- Public JSON/CSV endpoints under `/api/*`
- Circle membership on `/daftar` accepts a local Google sign-in (sample profiles, no Google API and no client secret) or a manual identity form. Interest, segment, and capabilities are stored on the member and shown publicly. Email and phone stay private unless the member opts in.

Market figures are historical references, not live orders or inventory. A missing row is not zero demand.
