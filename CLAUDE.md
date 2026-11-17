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

# Frontend (src/frontend)
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build -> src/frontend/dist
npm run lint           # eslint (frontend only; the backend has no linter)
```

There is no test suite or test runner in either project. To check behavior, run `npm run dev` and send requests, e.g. `curl "localhost:3000/api/v1/ecommerce/products?include=category,reviews&limit=2"`.

The Vite config has **no proxy**. The frontend's API calls use relative `/api/v1/...` URLs, so the console only works when the Express server serves the built SPA. To try the frontend against a live API, build it (`npm run build:frontend`) and use the Express server, or add a `server.proxy` to `vite.config.ts`.

## Backend architecture

Request flow: `server.ts` → `app.ts` (cors, body-parser, `apiLimiter` rate limit of 200 req / 15 min per IP on `/api/v1` only, `/health`, static SPA from `src/frontend/dist` with an `index.html` fallback for non-`/api` paths, then the 404 and error middleware) → `api/api.module.ts`. That module mounts:
- `/` → `core/core.module.ts` (currently just `/users`)
- `/ecommerce` → `packs/ecommerce/routes`
- `/startup` → `packs/startup/routes`

Each domain "pack" (`src/api/packs/<pack>/`) follows a generic three-layer pattern from `src/api/shared/`:
1. **services**: `new BaseService(jsonData)` for each JSON file in the pack's `data/` folder. `BaseService.getAll(query, relations)` runs a fixed pipeline: search → filter → sort → include → paginate.
2. **controllers**: `createGetAllController(service, relations)` wraps the service with the simulation step (`delay`, `error`, `errorRate` query params) and returns `{ success, data, meta }`. A `relations` map (`{ includeKey: otherService.getAllData() }`) is built here for each entity.
3. **routes**: `router.use("/<entity>", createBaseRoute(controller))`. Only `GET /` exists; there are no by-id or write endpoints.

To add an entity: add the JSON file, a `BaseService` in the pack's services file, a controller (with relations if needed), and a route line. Then add a matching entry to `src/frontend/src/config/domains.ts` so it appears in the docs. A new pack also needs a `router.use` in `api.module.ts`.

`BaseService` takes an optional second argument, `{ searchFields, rangeFilters }` (see below). Every endpoint, including `core/` users, goes through `BaseService` and `createGetAllController`.

### Query semantics (shared/utils)
- **Filtering**: every query param not in `RESERVED_PARAMS` (in `base.service.ts`) and not a configured range filter is an exact string-equality filter (`String(itemValue) === value`). Dot paths like `address.city=Toronto` reach nested fields. A new control param must be added to `RESERVED_PARAMS`, or it will filter everything out.
- **Range filters**: set per service with `rangeFilters`, e.g. products map `minPrice`/`maxPrice` → `price` `gte`/`lte`. Non-numeric values are ignored.
- **Search**: case-insensitive substring match over `searchFields` (dot paths allowed). The default is every top-level key of the first record. Set `searchFields` when records have nested objects (users use `name.first`, `name.last`, `email`).
- **Sort**: `sortBy` (dot paths allowed) plus `order=asc|desc`. Null values sort last.
- **Include** (`utils/include.ts`): each entry in a controller's `Relations` map is either an array, a one-to-one link resolved through the item's `${key}Id` field (`category` → `categoryId`, `owner` → `ownerId`), or `{ data, foreignKey }`, a one-to-many link returning related records where `record[foreignKey] === item.id` (e.g. products → `reviews` via `productId`). Unknown include keys are ignored.
- **Simulation**: `delay` (ms), `error` (forces that HTTP status; `error.middleware.ts` honours `statusCode`/`status` in 400–599, anything else becomes 500), `errorRate` (0–100 % chance of a 500).

### Notes
- The startup pack reuses `core/data/users.json` for its `owner`/`assignee`/`user` relations.
- JSON is imported directly (`resolveJsonModule`), so data is in memory and immutable per process. Edits to `data/*.json` need a restart (nodemon handles this in dev).

## Frontend (src/frontend)

A docs site with routes `/` (Home) and `/docs/:domain/:entity` (inside `DocsLayout`). `src/config/domains.ts` is the single source of truth for documented domains/entities, their query params, and production `baseUrl`s. `ApiConsole.tsx` sends live requests to the relative `/api/v1{endpoint}`. Root `tsconfig.json` excludes `src/frontend`, which has its own tsconfigs.

## Environment

`.env` (gitignored) holds `PORT` and `NODE_ENV` and is read in `src/api/config/env.ts`. The README targets Node 22.15.
