# Project Context

## Purpose

AfriXAsia Market Observatory is a market-intelligence site spanning Africa and Asia. This repository is its runnable React/Vite source rebuild, with an interactive globe, economic series, media brief, membership pages, and a public data API. See [README.md](README.md).

## Current State

The repository has page routes in [src/App.jsx](src/App.jsx) and API handlers in [server/api.mjs](server/api.mjs), attached to Vite development and preview by [vite.config.js](vite.config.js) and to the production server by [server/prod.mjs](server/prod.mjs). [package.json](package.json) requires Node.js 22 or newer and has no automated test or lint scripts. On 15 October 2026, a direct HTTPS check of `afrixasia.org` returned 200 with a Railway request header through Cloudflare; `www.afrixasia.org` returned a 301 to the apex. This checks routing, not feature quality or human acceptance.

## Major Capabilities

- Pages cover market data, evidence, country and corridor views, open data, media, membership, methodology, privacy, and API documentation ([src/App.jsx](src/App.jsx)).
- The UI offers English, Indonesian, and French copy ([src/i18n.jsx](src/i18n.jsx)); research filters persist in the URL and session storage ([src/research.jsx](src/research.jsx)).
- JSON/CSV API responses draw on reference snapshots and shared data helpers ([server/api.mjs](server/api.mjs), [shared/reference.mjs](shared/reference.mjs), [data/](data/)).
- Registration generates a membership card PDF and attempts a welcome email through a configured provider; source behavior does not establish successful delivery ([server/api.mjs](server/api.mjs), [server/welcome-mail.mjs](server/welcome-mail.mjs)).

## Decisions

- The README presents market figures as historical references, not live orders or inventory. Missing data must not be treated as zero demand.
- Membership uses local sample Google profiles or a manual identity form; the repo does not implement real Google OAuth ([README.md](README.md), [shared/google-local.mjs](shared/google-local.mjs)).
- The public apex domain is routed through Cloudflare to the Railway service; `www` redirects to the apex, as established in the domain handoff discussion and checked on 15 October 2026.

## Constraints

The checked-in WDI and market datasets are snapshots, not live feeds. The API seeds member records from [data/members.json](data/members.json) and writes to `MEMBERS_FILE`, a Railway volume path, or the seed file, in that order ([server/api.mjs](server/api.mjs)). Whether a volume is attached and backed up in Railway remains unverified. Jaman had Railway project access during the domain handoff; repository access alone does not grant it. Do not treat local sample sign-in as production authentication or commit real member personal data.

## Open Questions

- Is a Railway volume attached for member registrations, and how is it backed up?
- What deployment checks and data-quality review are required before accepting future releases?

## Important References

[README.md](README.md) describes product scope; [src/App.jsx](src/App.jsx) lists routes; [server/api.mjs](server/api.mjs) defines API behavior; [shared/reference.mjs](shared/reference.mjs) holds reference-data logic.
