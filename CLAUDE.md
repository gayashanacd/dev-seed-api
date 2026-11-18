# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

DevSeed API is a read-only mock-data REST API for frontend developers (live at https://www.devseedapi.com). It serves static JSON datasets (Users, E-Commerce, Startup/SaaS). Every endpoint supports pagination, search, filtering, sorting, relational `include`, and failure simulation. One Express server serves both the API (`/api/v1`) and a React docs site (an SPA with a live API console).

## Commands

Two separate npm projects: the root (Express backend) and `src/frontend` (Vite + React 19 + Tailwind v4). Each has its own `package.json` and `node_modules`.

```bash
# Backend (repo root)
npm install
npm run dev            # nodemon + ts-node on src/server.ts (PORT from .env, default 3000)
npm run build          # tsc -> dist/, then installs and builds the frontend into src/frontend/dist
npm start              # node dist/server.js (needs a prior build)
npx tsc --noEmit       # type-check backend only
npm test               # Vitest + Supertest suite in tests/ (runs against the Express app in-process)
npx vitest run tests/query.test.ts -t "include"   # single file / test name filter

# Frontend (src/frontend)
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build -> src/frontend/dist
npm run lint           # eslint (frontend only; the backend has no linter)
```

Tests cover the public query contract (`tests/query.test.ts`) and the rate limiter (`tests/rateLimit.test.ts`). The API has real users, so add or update tests whenever `/api/v1` behavior changes. The frontend has no tests.

The Vite config has **no proxy**. The frontend's API calls use relative `/api/v1/...` URLs, so the console only works when the Express server serves the built SPA. To try the frontend against a live API, build it (`npm run build:frontend`) and use the Express server, or add a `server.proxy` to `vite.config.ts`.

## Backend architecture

Production runs on Render behind Cloudflare. `app.ts` sets `trust proxy` to 1, and the rate limiter keys on the `CF-Connecting-IP` header (falling back to `req.ip`). Without that, every user would share one bucket.

Request flow: `server.ts` → `app.ts` (cors, body-parser, `requestLogMiddleware` (one JSON line per request with param names only and no IPs, silent when `NODE_ENV=test`), `apiLimiter` rate limit of 200 req / 15 min per client on `/api/v1` only, `/health`, static SPA from `src/frontend/dist` with an `index.html` fallback for non-`/api` paths, then the 404 and error middleware) → `api/api.module.ts`, which is just `buildPacksRouter(packDefinitions, packData)`.

**Pack definitions are the single source of truth** for every entity. Both the API routes and the docs site are generated from them. Each pack (`src/api/packs/<pack>/`, including `core` with users) has:
- `pack.ts`: a data-free `PackDefinition` (types in `packs/types.ts`) with `key`, sidebar `title`, SEO `label`, `basePath` (`""` for core, so users live at `/api/v1/users`), and per-entity `title`, `description`, `searchFields`, `rangeFilters`, `relations`, documented `filters` and docs `examples`. **The frontend imports these files**, so they must not import JSON or Node/Express code (use `import type`).
- `data.ts`: maps entity keys to the imported JSON. `satisfies PackData<keyof typeof xPack.entities>` makes a missing or extra dataset a compile error.
- `data/*.json`: the datasets.

`packs/definitions.ts` lists the packs in mount and sidebar order (shared). `packs/data.ts` maps pack key → data (backend only). `packs/router.ts` creates one `BaseService` per entity, resolves relations (cross-pack via `{ pack, entity }`), and mounts `GET <basePath>/<entity>` with `createGetAllController` + `createBaseRoute`. It throws at startup on a missing dataset, an unknown relation target or a duplicate path, and `tests/packs.test.ts` checks that every entity is served and every relation resolves. `BaseService.getAll(query, relations)` runs a fixed pipeline: search → filter → sort → include → paginate. The controller adds the simulation step (`delay`, `error`, `errorRate`) and returns `{ success, data, meta }`. Only `GET /` exists; there are no by-id or write endpoints yet.

To add an entity: add the JSON file, an entry in the pack's `pack.ts`, and a line in its `data.ts`. The route, docs page, SEO tags and sitemap entry follow automatically. To add a pack: create those files and list the pack in `definitions.ts` and `data.ts`.

### Query semantics (shared/utils)
- **Filtering**: every query param not in `RESERVED_PARAMS` (in `base.service.ts`) and not a configured range filter is an exact string-equality filter (`String(itemValue) === value`). Dot paths like `address.city=Toronto` reach nested fields. A new control param must be added to `RESERVED_PARAMS`, or it will filter everything out.
- **Range filters**: set per entity with `rangeFilters`, e.g. products map `minPrice`/`maxPrice` → `price` `gte`/`lte`. Non-numeric values are ignored.
- **Search**: case-insensitive substring match over `searchFields` (dot paths allowed). The default is every top-level key of the first record. Set `searchFields` when records have nested objects (users use `name.first`, `name.last`, `email`).
- **Sort**: `sortBy` (dot paths allowed) plus `order=asc|desc`. Null values sort last.
- **Include** (`utils/include.ts`): each entry in an entity's `relations` is either one-to-one (no `foreignKey`), resolved through the item's `${key}Id` field (`category` → `categoryId`, `owner` → `ownerId`), or has a `foreignKey`, a one-to-many link returning related records where `record[foreignKey] === item.id` (e.g. products → `reviews` via `productId`). Unknown include keys are ignored.
- **Simulation**: `delay` (ms), `error` (forces that HTTP status; `error.middleware.ts` honours `statusCode`/`status` in 400–599, anything else becomes 500), `errorRate` (0–100 % chance of a 500).

### Notes
- The startup pack's `owner`/`assignee`/`user` relations point at `{ pack: "core", entity: "users" }`.
- Tests: run Vitest from an uppercase `D:\` path on Windows. A lowercase `d:\` cwd makes Vitest load itself twice and every suite fails with "failed to find the runner".
- JSON is imported directly (`resolveJsonModule`), so data is in memory and immutable per process. Edits to `data/*.json` need a restart (nodemon handles this in dev).

## Frontend (src/frontend)

A docs site with routes `/` (Home) and `/docs/:domain/:entity` (inside `DocsLayout`). `src/config/domains.ts` generates the documented domains/entities, their query params and production `baseUrl`s from the backend pack definitions (`../../../api/packs/definitions`). Don't hand-edit entities there. `vite.config.ts` adds `../api/packs` to `server.fs.allow` so the dev server can serve them. `ApiConsole.tsx` sends live requests to the relative `/api/v1{endpoint}`. Root `tsconfig.json` excludes `src/frontend`, which has its own tsconfigs.

### Prerendering and SEO
`npm run build` (frontend) runs the client build, an SSR build of `src/entry-server.tsx`, then `scripts/prerender.mjs`. The prerender step writes one static HTML file per route (`dist/index.html`, `dist/docs/<domain>/<entity>.html`), plus `dist/404.html` and `dist/sitemap.xml`. Each file contains real markup and per-page `<head>` tags, and `main.tsx` hydrates it in the browser.
- `src/seo.ts` is the single source for page titles, descriptions, canonical URLs and the list of indexable routes (derived from `domains.ts`, so new entities are picked up automatically). `<Seo />` reuses it to update `<head>` on client-side navigation. Don't add per-page `<title>`/`<meta>` in components.
- `App.tsx` exports `AppShell` (router-agnostic), used by both `BrowserRouter` (browser) and `StaticRouter` (prerender). A route that isn't listed in `getIndexableRoutes()` is served with HTTP 404 on a hard load.
- Components must be renderable on the server: touch `window`/`document` only inside effects or event handlers, and keep the first render deterministic, or hydration will mismatch.
- Express (`src/app.ts`) serves `dist` with `extensions: ["html"]` for clean URLs. It 301-redirects trailing slashes and `/docs`, returns `404.html` with status 404 for unknown pages, and caches `/assets/*` as immutable. `FRONTEND_DIST` overrides the build path (used by `tests/frontend.test.ts`).
- `public/og-image.png` is the 1200×630 social preview image.

## Environment

`.env` (gitignored) holds `PORT` and `NODE_ENV` and is read in `src/api/config/env.ts`. The README targets Node 22.15.
