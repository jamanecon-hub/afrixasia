# Project Context

## Purpose

AfriXAsia Market Observatory is a market-intelligence site spanning Africa and Asia. This repository is its runnable React/Vite source rebuild, with an interactive globe, economic series, media brief, membership pages, and a public data API. See [README.md](README.md).

## Current State

The repository has page routes in [src/App.jsx](src/App.jsx) and local API handlers in [server/api.mjs](server/api.mjs), attached to Vite development and preview by [vite.config.js](vite.config.js). No automated test or lint scripts are configured in [package.json](package.json). On 15 October 2026, a direct HTTPS check of `afrixasia.org` returned 200 with a Railway request header through Cloudflare; `www.afrixasia.org` returned a 301 to the apex. This checks routing, not feature quality or human acceptance.

## Major Capabilities

- Pages cover market data, evidence, country and corridor views, open data, media, membership, methodology, privacy, and API documentation ([src/App.jsx](src/App.jsx)).
- The UI offers English, Indonesian, and French copy ([src/i18n.jsx](src/i18n.jsx)); research filters persist in the URL and session storage ([src/research.jsx](src/research.jsx)).
- JSON/CSV API responses draw on reference snapshots and shared data helpers ([server/api.mjs](server/api.mjs), [shared/reference.mjs](shared/reference.mjs), [data/](data/)).

## Decisions

- The README presents market figures as historical references, not live orders or inventory. Missing data must not be treated as zero demand.
- Membership uses local sample Google profiles or a manual identity form; the repo does not implement real Google OAuth ([README.md](README.md), [shared/google-local.mjs](shared/google-local.mjs)).
- The public apex domain is routed through Cloudflare to the Railway service; `www` redirects to the apex, as established in the domain handoff discussion and checked on 15 October 2026.

## Constraints

The checked-in WDI and market datasets are snapshots, not live feeds. The API reads and writes member records in [data/members.json](data/members.json); persistence and backup behavior on Railway are not documented here. Jaman had Railway project access during the domain handoff; repository access alone does not grant it. Do not treat local sample sign-in as production authentication or commit real member personal data.

## Open Questions

- How are member registrations persisted and backed up in production?
- What deployment checks and data-quality review are required before accepting future releases?

## Important References

[README.md](README.md) describes product scope; [src/App.jsx](src/App.jsx) lists routes; [server/api.mjs](server/api.mjs) defines API behavior; [shared/reference.mjs](shared/reference.mjs) holds reference-data logic.
