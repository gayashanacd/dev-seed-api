import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../src/app"

const get = (url: string) => request(app).get(`/api/v1${url}`)

const ENDPOINTS = [
    "/users",
    "/ecommerce/products", "/ecommerce/categories", "/ecommerce/reviews",
    "/ecommerce/orders", "/ecommerce/cart", "/ecommerce/coupons",
    "/startup/organizations", "/startup/projects", "/startup/tasks",
    "/startup/subscriptions", "/startup/invoices", "/startup/notifications"
]

describe("response shape", () => {
    it.each(ENDPOINTS)("%s returns { success, data, meta }", async url => {
        const res = await get(url)
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBeGreaterThan(0)
        expect(res.body.meta).toMatchObject({
            total: expect.any(Number),
            page: 1,
            limit: 10,
            totalPages: expect.any(Number)
        })
    })
})

describe("pagination", () => {
    it("slices by page and limit", async () => {
        const all = await get("/users?limit=100")
        const res = await get("/users?page=2&limit=5")
        expect(res.body.data.map((u: any) => u.id))
            .toEqual(all.body.data.slice(5, 10).map((u: any) => u.id))
        expect(res.body.meta).toEqual({
            total: all.body.meta.total,
            page: 2,
            limit: 5,
            totalPages: Math.ceil(all.body.meta.total / 5)
        })
    })

    it("returns an empty page past the end", async () => {
        const res = await get("/users?page=999")
        expect(res.status).toBe(200)
        expect(res.body.data).toEqual([])
    })
})

describe("filtering", () => {
    it("filters by exact top-level field", async () => {
        const res = await get("/users?role=admin&limit=100")
        expect(res.body.data.length).toBeGreaterThan(0)
        expect(res.body.data.every((u: any) => u.role === "admin")).toBe(true)
    })

    it("filters by nested field with dot notation", async () => {
        const all = await get("/users?limit=100")
        const city = all.body.data[0].address.city
        const res = await get(`/users?address.city=${encodeURIComponent(city)}&limit=100`)
        expect(res.body.data.length).toBeGreaterThan(0)
        expect(res.body.data.every((u: any) => u.address.city === city)).toBe(true)
    })

    it("matches numeric fields against string query values", async () => {
        const res = await get("/ecommerce/reviews?rating=5&limit=100")
        expect(res.body.data.length).toBeGreaterThan(0)
        expect(res.body.data.every((r: any) => r.rating === 5)).toBe(true)
    })

    it("does not treat control params as filters", async () => {
        const res = await get("/users?delay=1&errorRate=0&include=x&order=asc")
        expect(res.body.meta.total).toBe(25)
    })

    it("applies minPrice/maxPrice as an inclusive range on products", async () => {
        const res = await get("/ecommerce/products?minPrice=50&maxPrice=200&limit=100")
        const prices = res.body.data.map((p: any) => p.price)
        expect(prices.length).toBeGreaterThan(0)
        expect(prices.every((p: number) => p >= 50 && p <= 200)).toBe(true)
    })

    it("ignores non-numeric range values", async () => {
        const all = await get("/ecommerce/products?limit=100")
        const res = await get("/ecommerce/products?minPrice=abc&limit=100")
        expect(res.body.meta.total).toBe(all.body.meta.total)
    })
})

describe("search", () => {
    it("matches users on name and email, case-insensitively", async () => {
        const res = await get("/users?search=JOHN&limit=100")
        expect(res.body.data.length).toBeGreaterThan(0)
        for (const u of res.body.data) {
            const haystack = `${u.name.first} ${u.name.last} ${u.email}`.toLowerCase()
            expect(haystack).toContain("john")
        }
    })

    it("does not match users on fields outside searchFields", async () => {
        const res = await get("/users?search=customer&limit=100")
        expect(res.body.data).toEqual([])
    })

    it("searches all top-level fields by default", async () => {
        const res = await get("/ecommerce/coupons?limit=100")
        const code = res.body.data[0].code
        const found = await get(`/ecommerce/coupons?search=${encodeURIComponent(code)}`)
        expect(found.body.data.map((c: any) => c.code)).toContain(code)
    })
})

describe("sorting", () => {
    it("sorts ascending and descending", async () => {
        const asc = await get("/ecommerce/products?sortBy=price&order=asc&limit=100")
        const desc = await get("/ecommerce/products?sortBy=price&order=desc&limit=100")
        const ascPrices = asc.body.data.map((p: any) => p.price)
        expect(ascPrices).toEqual([...ascPrices].sort((a: number, b: number) => a - b))
        expect(desc.body.data.map((p: any) => p.price)).toEqual([...ascPrices].reverse())
    })

    it("sorts by nested field", async () => {
        const res = await get("/users?sortBy=name.first&limit=100")
        const names = res.body.data.map((u: any) => u.name.first)
        expect(names).toEqual([...names].sort())
    })
})

describe("include", () => {
    it("resolves one-to-one relations via <key>Id", async () => {
        const res = await get("/ecommerce/products?include=category&limit=100")
        for (const p of res.body.data) {
            expect(p.category.id).toBe(p.categoryId)
        }
    })

    it("resolves one-to-many relations via foreign key", async () => {
        const res = await get("/startup/organizations?include=projects,subscriptions,invoices&limit=100")
        const org1 = res.body.data.find((o: any) => o.id === "org1")
        expect(org1.projects.length).toBeGreaterThan(0)
        for (const o of res.body.data) {
            for (const key of ["projects", "subscriptions", "invoices"]) {
                expect(Array.isArray(o[key])).toBe(true)
                expect(o[key].every((r: any) => r.organizationId === o.id)).toBe(true)
            }
        }
    })

    it("supports products -> reviews and projects -> tasks", async () => {
        const products = await get("/ecommerce/products?include=reviews&limit=100")
        expect(products.body.data.every((p: any) =>
            p.reviews.every((r: any) => r.productId === p.id))).toBe(true)

        const projects = await get("/startup/projects?include=tasks&limit=100")
        expect(projects.body.data.some((p: any) => p.tasks.length > 0)).toBe(true)
    })

    it("ignores unknown include keys", async () => {
        const res = await get("/ecommerce/products?include=nope&limit=1")
        expect(res.status).toBe(200)
        expect(res.body.data[0]).not.toHaveProperty("nope")
    })
})

describe("simulation", () => {
    it("forces the requested HTTP status with ?error=", async () => {
        for (const code of [400, 404, 418, 503]) {
            const res = await get(`/ecommerce/products?error=${code}`)
            expect(res.status).toBe(code)
            expect(res.body).toEqual({ success: false, message: "Simulated API Error" })
        }
    })

    it("falls back to 500 for out-of-range error codes", async () => {
        expect((await get("/users?error=200")).status).toBe(500)
        expect((await get("/users?error=999")).status).toBe(500)
    })

    it("errorRate=100 always fails, errorRate=0 never does", async () => {
        expect((await get("/users?errorRate=100")).status).toBe(500)
        expect((await get("/users?errorRate=0")).status).toBe(200)
    })

    it("delays the response", async () => {
        const start = Date.now()
        await get("/users?delay=150")
        expect(Date.now() - start).toBeGreaterThanOrEqual(140)
    })
})

describe("routing", () => {
    it("returns JSON 404 for unknown API routes", async () => {
        const res = await get("/does-not-exist")
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ success: false, message: "Route /api/v1/does-not-exist not found" })
    })

    it("serves /health", async () => {
        const res = await request(app).get("/health")
        expect(res.body).toEqual({ status: "ok" })
    })
})
