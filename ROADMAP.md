# DevSeed API Roadmap

Hosting: Render (origin) behind Cloudflare (DNS/proxy). The API has active users, so `/api/v1` behaviour changes must stay backwards compatible.

Order matters: protect existing users → get found (SEO) → make packs cheap to add → ship packs one at a time → growth.

## Phase 1: Protect existing users

- [x] **Rate limiting keyed by real client IP.** Traffic arrives via Cloudflare → Render, so without proxy handling every user can share one 200-req/15-min bucket. Key on `CF-Connecting-IP` and set `trust proxy`.
- [x] **Regression test suite** (Vitest + Supertest) covering the query contract: pagination, filters (exact, nested, range), search, sort, `include`, simulation params, response shape, 404 and error handling.
- [x] **Usage logging**: one structured log line per API request (endpoint, query-param *names*, status, duration; no IPs or values) so Render logs show which endpoints and features are used.
- [x] **Stop cold starts.** Render's free instance sleeps after ~15 min idle and takes 30–60 s to wake. Fix: a free uptime monitor (UptimeRobot) that requests `https://<service>.onrender.com/health` every 5 min. Use the onrender URL, not the Cloudflare domain, so pings don't inflate Cloudflare analytics. *(manual)*

## Phase 1.5: SEO (get found on Google)

**Setup (manual)**
- [x] **Google Search Console**: verify devseedapi.com through Cloudflare DNS, then submit `https://www.devseedapi.com/sitemap.xml` once the technical fixes are deployed.
- [x] **Bing Webmaster Tools**: import the site from Search Console.

**Technical**
- [x] **Prerender every route at build time** (home and each docs page) so crawlers and link previews get real HTML instead of an empty `<div id="root">`.
- [x] **Per-page title, description, canonical URL and Open Graph/Twitter tags**, generated from `domains.ts`.
- [x] **`robots.txt` and a generated `sitemap.xml`** (today both URLs return the homepage HTML with status 200).
- [x] **Real 404s**: unknown pages return HTTP 404 with a "not found" page instead of 200.
- [x] **Homepage cleanup**: one `<h1>`, one set of meta tags (currently duplicated in `Home.tsx` and `Hero.tsx`); replace unmaintained `react-helmet`.
- [x] **Social preview image** (1200×630) for shared links.
- [x] **Long-lived caching** for hashed assets (`/assets/*`) to improve page speed.

**Content and links (ongoing)**
- [ ] Guide pages targeting real searches: "mock API for React", "fake e-commerce API", "JSONPlaceholder alternative with relations", "test loading/error states".
- [ ] A landing page for each new domain pack as it ships.
- [ ] Listings and backlinks: public-apis GitHub list and awesome lists; tutorials on dev.to/Hashnode; launch posts on Reddit (r/webdev, r/reactjs) and Product Hunt.

## User feedback (Tally)

Set this up early: answers about which pack people want next should decide the Phase 3 order.

- [ ] **Create a short Tally form** (free plan, about 5 questions, under a minute to fill in): what are you building with DevSeed, which pack you want next (Social Media / FinTech / EdTech / other), what's missing or annoying, how you found the site, and an optional email for follow-up. *(manual, tally.so)*
- [ ] **Add feedback links to the site**: a "Feedback" link in the header or footer, a "Was this page helpful? / Request an endpoint" prompt on each docs page, and a link on the 404 page. Pass the current page as a Tally hidden field so answers show which page they came from. Open the form as a popup or link rather than embedding it in prerendered HTML, so SEO and page speed aren't affected.
- [ ] **Mention it in the README** and in API docs ("Missing something? Tell us").
- [ ] **Review responses monthly** and feed them into this roadmap.

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

- [ ] **OpenAPI spec**: importable into Postman/Insomnia; could drive the docs.
- [ ] **Changelog and stability policy** for `/api/v1`.
