# Repository Guidelines

## Project Structure & Module Organization

`src/App.jsx` defines routes; `src/pages/` holds pages, `src/components/` holds reusable UI, and `src/styles.css` contains site styles. `server/api.mjs` handles API requests in Vite and the production server (`server/prod.mjs`). Helpers live in `shared/`, snapshots in `data/`, and assets in `public/`.

## Build, Test, and Development Commands

- Use Node.js 22 or newer; `npm ci` installs the versions recorded in `package-lock.json`.
- `npm run dev` starts the Vite development server at `http://localhost:3000`, including `/api/*` routes.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built bundle on port 3000 with the local API attached.
- `npm start` serves the built site and API through `server/prod.mjs`.

## Coding Style & Naming Conventions

Follow the existing JavaScript and JSX style: two-space indentation, double-quoted strings, semicolons, and ES modules. Name React components and files in PascalCase, such as `TimeSeriesChart.jsx`; use camelCase for functions and variables. When editing visible copy, maintain the English, Indonesian, and French variants used by `src/i18n.jsx`.

## Testing Guidelines

No automated test framework, lint script, or coverage target is configured. Run `npm run build`, then manually exercise affected pages or API endpoints. Check URL filters, language switching, and JSON/CSV output when affected. Name new tests `*.test.js` or `*.test.jsx`.

## Commit & Pull Request Guidelines

Git history has descriptive subjects but no established format. Use a concise imperative subject. In pull requests, explain the change, list checks actually run, and include screenshots for UI changes. For data changes, identify the source and snapshot date.

## Data & Configuration Safety

Market figures are historical references, not live inventory or orders. Preserve provenance and missing-data distinctions. The Google sign-in flow uses local sample profiles, not production OAuth. Do not add real member personal data or secrets to tracked JSON files.

## Agent Working Style & Context

Mondo recommends Fajar's agent inspect `PROJECT_CONTEXT.md`, code, and Git changes; challenge unsupported premises. Preserve concurrent work. Verify behavior. Report edited, tested, committed, merged, and deployed states separately. Never claim unrun checks.

Apply Ponytail to coding tasks if available. Read the flow; reuse code, standard libraries, or platform features before adding dependencies or abstractions. Make the smallest correct change without skipping validation, error handling, accessibility, or verification. If unavailable, follow these rules. Caveman and `ask-matt` are request-only; skip `setup-matt-pocock-skills` by default. Use `project-context` only when asked to update `PROJECT_CONTEXT.md`; otherwise use repository evidence and Fajar's decisions.
