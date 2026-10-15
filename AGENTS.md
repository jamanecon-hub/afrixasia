# Repository Guidelines

## Project Structure & Module Organization

`src/App.jsx` defines routes; `src/pages/` holds pages, `src/components/` holds reusable UI, and `src/styles.css` contains site styles. `server/api.mjs` attaches API handlers to Vite development and preview servers. Shared helpers live in `shared/`, reference snapshots in `data/`, and static assets in `public/`.

## Build, Test, and Development Commands

- `npm ci` installs the versions recorded in `package-lock.json`.
- `npm run dev` starts the Vite development server at `http://localhost:3000`, including `/api/*` routes.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built bundle on port 3000 with the local API attached.

## Coding Style & Naming Conventions

Follow the existing JavaScript and JSX style: two-space indentation, double-quoted strings, semicolons, and ES modules. Name React components and files in PascalCase, such as `TimeSeriesChart.jsx`; use camelCase for functions and variables. When editing visible copy, maintain the English, Indonesian, and French variants used by `src/i18n.jsx`.

## Testing Guidelines

No automated test framework, lint script, or coverage target is configured. Run `npm run build`, then manually exercise affected pages or API endpoints. Check URL filters, language switching, and JSON/CSV output when affected. Name new tests `*.test.js` or `*.test.jsx`.

## Commit & Pull Request Guidelines

The short Git history has descriptive commit subjects but no established format. Use a concise imperative subject. In pull requests, explain the behavior changed, list checks actually run, and include screenshots for visible UI changes. For data changes, identify the source and snapshot date.

## Data & Configuration Safety

Market figures are historical references, not live inventory or orders. Preserve provenance and missing-data distinctions. The Google sign-in flow uses local sample profiles, not production OAuth. Do not add real member personal data or secrets to tracked JSON files.

## Agent Skills & Project Context

Mondo recommends `setup-matt-pocock-skills` before the first engineering workflow in this repo, if the skill is available. Check for existing project-local setup; if absent, explain to Fajar that it configures the issue tracker, triage labels, and domain docs, then ask before running it or changing setup files. `ask-matt` is user-invoked only. Read `PROJECT_CONTEXT.md` for durable project state. Use the `project-context` skill when explicitly asked to update that document; separate implementation evidence from human decisions.
