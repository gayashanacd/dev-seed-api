# DevSeed API Roadmap

Hosting: Render (origin) behind Cloudflare (DNS/proxy). The API has active users, so `/api/v1` behaviour changes must stay backwards compatible.

Order matters: protect existing users → make packs cheap to add → ship packs one at a time → growth.

## Phase 1: Protect existing users

- [x] **Rate limiting keyed by real client IP.** Traffic arrives via Cloudflare → Render, so without proxy handling every user can share one 200-req/15-min bucket. Key on `CF-Connecting-IP` and set `trust proxy`.
- [x] **Regression test suite** (Vitest + Supertest) covering the query contract: pagination, filters (exact, nested, range), search, sort, `include`, simulation params, response shape, 404 and error handling.
- [x] **Usage logging**: one structured log line per API request (endpoint, query-param *names*, status, duration; no IPs or values) so Render logs show which endpoints and features are used.
- [ ] **Stop cold starts.** Render's free instance sleeps after ~15 min idle and takes 30–60 s to wake. Fix: a free uptime monitor (UptimeRobot) that requests `https://<service>.onrender.com/health` every 5 min. Use the onrender URL, not the Cloudflare domain, so pings don't inflate Cloudflare analytics. *(manual)*

## Phase 2: Make packs cheap to add

- [ ] **Single pack definition**: one config per pack (data, relations, search fields, range filters, docs text) that generates both the Express routes and the frontend docs entry, replacing today's four-place edit (services, controllers, routes, `domains.ts`).
- [ ] **`GET /:id`** on every entity, with `include` support.
- [ ] **Fake write endpoints**: `POST`/`PUT`/`PATCH`/`DELETE` that validate and echo a realistic response without persisting (JSONPlaceholder-style).
- [ ] **Seeded data generator**: a script that produces larger, deterministic datasets with consistent foreign keys, committed as JSON. Current sets are small (e.g. 2 invoices, 3 tasks).
- [ ] **Frontend on Cloudflare Pages (free)**: the docs site loads instantly from the edge, independent of Render's state; the API stays on Render.
- [ ] *(Later, if usage grows)* **Evaluate moving the API to Cloudflare Workers** (free tier, no sleeping). The data is static JSON, so it fits well. Do this after the single-pack-definition refactor.

## Phase 3: New domain packs (one at a time, each released separately)

- [ ] **Social Media**: users/profiles, posts, comments, likes, follows, feed (pagination and infinite scroll).
- [ ] **FinTech**: accounts, transactions, cards, budgets, categories (dashboards and charts).
- [ ] **EdTech**: courses, lessons, enrollments, progress, quizzes.

For each pack: data + relations, tests, docs entry, remove "Coming Soon" in `DomainPacks.tsx`, changelog entry.

## Phase 4: Growth

- [ ] **SEO**: prerender docs pages with per-page titles and meta tags (today they're client-rendered, and tags are duplicated in `Home.tsx` and `Hero.tsx`). Add a sitemap.
- [ ] **OpenAPI spec**: importable into Postman/Insomnia; could drive the docs.
- [ ] **Changelog and stability policy** for `/api/v1`.
