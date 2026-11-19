# DevSeed API Roadmap

Hosting: Render (origin) behind Cloudflare (DNS/proxy). The API has active users, so `/api/v1` behaviour changes must stay backwards compatible.

Order matters: protect existing users → get found (SEO) → make packs cheap to add → ship packs one at a time → growth.

## Now: get the first real users (do these in order)

On 2026-11-18, Cloudflare showed 1.89k requests in 24 hours, but Render logged only 4 `api_request` lines. Nearly all traffic is crawlers and bots. The API itself is in good shape (relations, `GET /:id`, simulated writes, larger datasets). The bottleneck is discovery, not features, so do this before more packs or hosting changes.

1. [x] **Turn on Cloudflare Web Analytics** (free). It counts page views from real browsers, so bots are mostly excluded and real visitors become measurable. *(Done 2026-11-19. Auto-injection never reached the HTML, probably because Render fronts custom domains with its own Cloudflare, so the manual snippet is in `src/frontend/index.html`.)*
2. [ ] **Get listed and launch** *(in progress: public-apis PR [#9246](https://github.com/public-apis/public-apis/pull/9246) opened 2026-11-19; dev.to tutorial [published](https://dev.to/indika_gayashan_u/mock-an-e-commerce-backend-for-your-react-app-in-5-minutes-1e8c) 2026-11-19; Reddit waits about two weeks while the new account builds karma, since its posts get auto-removed; awesome lists still to do)*: submit to [public-apis](https://github.com/public-apis/public-apis) and relevant awesome lists, write one launch post for r/webdev or r/reactjs, and one dev.to tutorial (e.g. "Mock an e-commerce backend for your React app in 5 minutes"). Lead with what JSONPlaceholder doesn't have: relations via `?include=`, simulated writes with realistic validation errors, and failure simulation. See *Content and links* below.
3. [x] **Add the Tally feedback link before the launch posts**, so the first visitors can say what they want. See *User feedback (Tally)* below.
4. [ ] **Guide pages** for real searches ("fake e-commerce API", "JSONPlaceholder alternative with relations", "mock API for React", "test loading/error states"). They pay off over months as Google indexes them. See *Content and links* below.

Track progress with Web Analytics visitors, `api_request` counts in Render logs, and Search Console clicks.

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

- [x] **Create a short Tally form** (https://tally.so/r/Z9OMa0) (free plan, about 5 questions, under a minute to fill in): what are you building with DevSeed, which pack you want next (Social Media / FinTech / EdTech / other), what's missing or annoying, how you found the site, and an optional email for follow-up. *(manual, tally.so)*
- [x] **Add feedback links to the site**: a "Feedback" link in the header or footer, a "Was this page helpful? / Request an endpoint" prompt on each docs page, and a link on the 404 page. Pass the current page as a Tally hidden field so answers show which page they came from. Open the form as a popup or link rather than embedding it in prerendered HTML, so SEO and page speed aren't affected.
- [x] **Mention it in the README** and in API docs ("Missing something? Tell us").
- [ ] **Review responses monthly** and feed them into this roadmap.

## Phase 2: Make packs cheap to add

- [x] **Single pack definition**: one config per pack (data, relations, search fields, range filters, docs text) that generates both the Express routes and the frontend docs entry, replacing today's four-place edit (services, controllers, routes, `domains.ts`).
- [x] **`GET /:id`** on every entity, with `include` support.
- [x] **Fake write endpoints**: `POST`/`PUT`/`PATCH`/`DELETE` that validate and echo a realistic response without persisting (JSONPlaceholder-style).
- [x] **Seeded data generator**: a script that produces larger, deterministic datasets with consistent foreign keys, committed as JSON. Current sets are small (e.g. 2 invoices, 3 tasks). *(`npm run generate:data`; the hand-written records are kept unchanged.)*
- [ ] *(Deferred 2026-11-18: very few real users yet; revisit once traffic grows, ideally just before launch posts)* **Frontend on Cloudflare Pages (free)**: the docs site loads instantly from the edge, independent of Render's state; the API stays on Render. Keep `www.devseedapi.com/api/v1/...` working by forwarding `/api/*` to Render, and move Express's redirects/cache headers to `_redirects`/`_headers`. Check whether Cloudflare now recommends Workers static assets over Pages.
- [ ] *(Deferred 2026-11-18: revisit if usage grows)* **Evaluate moving the API to Cloudflare Workers** (free tier, no sleeping). The data is static JSON, so it fits well. Its prerequisite, the single pack definition, is done.

## Phase 3: New domain packs (one at a time, each released separately)

- [ ] **Social Media**: users/profiles, posts, comments, likes, follows, feed (pagination and infinite scroll).
- [ ] **FinTech**: accounts, transactions, cards, budgets, categories (dashboards and charts).
- [ ] **EdTech**: courses, lessons, enrollments, progress, quizzes.

For each pack: data + relations, tests, docs entry, remove "Coming Soon" in `DomainPacks.tsx`, changelog entry.

## Phase 4: Growth

- [ ] **OpenAPI spec**: importable into Postman/Insomnia; could drive the docs.
- [ ] **Changelog and stability policy** for `/api/v1`.
