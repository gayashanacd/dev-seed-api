import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../src/app"
import { nextId } from "../src/api/shared/services/write.service"

const api = (path: string) => `/api/v1${path}`

/** The id the next POST to an entity will get */
const expectedNextId = async (path: string) =>
    nextId((await request(app).get(api(`${path}?limit=1000`))).body.data)

const product = { name: "Desk Lamp", price: 24.5, categoryId: "c1" }

const user = {
    name: { first: "Ada", last: "Lovelace" },
    gender: "female",
    email: "ada@example.com",
    role: "customer",
    address: { street: "1 Main St", city: "London", state: "LDN", country: "UK", postcode: "N1" },
    profile: { avatar: "https://example.com/ada.png" }
}

describe("POST (create)", () => {
    it("returns 201 with the new record, the next id, createdAt and a Location header", async () => {
        const id = await expectedNextId("/ecommerce/products")
        expect(id).toMatch(/^p\d+$/)
        const res = await request(app).post(api("/ecommerce/products")).send(product)
        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toMatchObject({ id, ...product })
        expect(res.body.data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
        expect(res.headers.location).toBe(`/api/v1/ecommerce/products/${id}`)
    })

    it("does not persist anything", async () => {
        const before = await request(app).get(api("/ecommerce/products"))
        await request(app).post(api("/ecommerce/products")).send(product)
        const after = await request(app).get(api("/ecommerce/products"))
        expect(after.body.meta.total).toBe(before.body.meta.total)
        expect((await request(app).get(api(`/ecommerce/products/${await expectedNextId("/ecommerce/products")}`))).status).toBe(404)
    })

    it("continues numeric id sequences", async () => {
        const all = await request(app).get(api("/ecommerce/reviews?limit=1000"))
        const max = Math.max(...all.body.data.map((r: any) => r.id))
        const res = await request(app).post(api("/ecommerce/reviews"))
            .send({ productId: "p1", userId: "u1", rating: 5, comment: "Great" })
        expect(res.status).toBe(201)
        expect(res.body.data.id).toBe(max + 1)
    })

    it("ignores id and createdAt sent by the client", async () => {
        const res = await request(app).post(api("/ecommerce/products"))
            .send({ ...product, id: "mine", createdAt: "1999-01-01T00:00:00Z" })
        expect(res.status).toBe(201)
        expect(res.body.data.id).toBe(await expectedNextId("/ecommerce/products"))
        expect(res.body.data.createdAt).not.toBe("1999-01-01T00:00:00Z")
    })

    it("validates nested objects", async () => {
        expect((await request(app).post(api("/users")).send(user)).status).toBe(201)

        const res = await request(app).post(api("/users"))
            .send({ ...user, name: { last: "Lovelace" }, address: { ...user.address, city: 7 } })
        expect(res.status).toBe(422)
        expect(res.body.errors).toEqual(expect.arrayContaining([
            { field: "name.first", message: "is required" },
            { field: "address.city", message: "must be a string" }
        ]))
    })

    it("validates array elements", async () => {
        const order = { userId: "u1", products: [{ productId: "p1", quantity: "two" }], total: 10 }
        const res = await request(app).post(api("/ecommerce/orders")).send(order)
        expect(res.status).toBe(422)
        expect(res.body.errors).toEqual([{ field: "products[0].quantity", message: "must be a number" }])
    })

    it("allows optional fields to be left out", async () => {
        // couponId only appears on some orders
        const order = { userId: "u1", products: [{ productId: "p1", quantity: 1 }], total: 29.99 }
        expect((await request(app).post(api("/ecommerce/orders")).send(order)).status).toBe(201)
    })
})

describe("validation errors", () => {
    it("returns 422 with every problem listed", async () => {
        const res = await request(app).post(api("/ecommerce/products"))
            .send({ price: "cheap", categoryId: "c1", colour: "red" })
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toBe("Validation failed")
        expect(res.body.errors).toEqual(expect.arrayContaining([
            { field: "name", message: "is required" },
            { field: "price", message: "must be a number" },
            { field: "colour", message: "is not a known field" }
        ]))
        expect(res.body.errors).toHaveLength(3)
    })

    it("rejects foreign keys that point at missing records", async () => {
        const res = await request(app).post(api("/ecommerce/products")).send({ ...product, categoryId: "nope" })
        expect(res.status).toBe(422)
        expect(res.body.errors).toEqual([{ field: "categoryId", message: 'no categories record with id "nope"' }])
    })

    it("checks foreign keys across packs", async () => {
        const res = await request(app).patch(api("/startup/projects/proj1")).send({ ownerId: "u999" })
        expect(res.status).toBe(422)
        expect(res.body.errors).toEqual([{ field: "ownerId", message: 'no users record with id "u999"' }])
        expect((await request(app).patch(api("/startup/projects/proj1")).send({ ownerId: "u2" })).status).toBe(200)
    })

    it("returns 400 when the body is not a JSON object", async () => {
        const array = await request(app).post(api("/ecommerce/products")).send([product])
        expect(array.status).toBe(400)
        expect(array.body.success).toBe(false)

        const text = await request(app).post(api("/ecommerce/products")).set("Content-Type", "text/plain").send("hi")
        expect(text.status).toBe(400)

        const empty = await request(app).post(api("/ecommerce/products"))
        expect(empty.status).toBe(400)
        expect(empty.body.message).toMatch(/JSON object/)
    })

    it("returns 400 for malformed JSON", async () => {
        const res = await request(app).post(api("/ecommerce/products"))
            .set("Content-Type", "application/json").send("{ not json")
        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })
})

describe("PUT (replace)", () => {
    it("replaces the record, keeping its id and createdAt", async () => {
        const original = (await request(app).get(api("/ecommerce/products/p1"))).body.data
        const res = await request(app).put(api("/ecommerce/products/p1")).send({ ...product, id: "other" })
        expect(res.status).toBe(200)
        expect(res.body.data).toEqual({ id: "p1", ...product, createdAt: original.createdAt })
    })

    it("requires a full record", async () => {
        const res = await request(app).put(api("/ecommerce/products/p1")).send({ price: 10 })
        expect(res.status).toBe(422)
        expect(res.body.errors).toEqual(expect.arrayContaining([{ field: "name", message: "is required" }]))
    })

    it("returns 404 for an unknown id", async () => {
        const res = await request(app).put(api("/ecommerce/products/nope")).send(product)
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ success: false, message: 'No products record with id "nope"' })
    })
})

describe("PATCH (update)", () => {
    it("merges the changes into the record, including nested objects", async () => {
        const original = (await request(app).get(api("/users/u1"))).body.data
        const res = await request(app).patch(api("/users/u1")).send({ role: "admin", name: { first: "Jon" } })
        expect(res.status).toBe(200)
        expect(res.body.data).toEqual({ ...original, role: "admin", name: { ...original.name, first: "Jon" } })
    })

    it("validates only the fields that are sent", async () => {
        expect((await request(app).patch(api("/ecommerce/products/p1")).send({ price: 1 })).status).toBe(200)

        const res = await request(app).patch(api("/ecommerce/products/p1")).send({ price: "1", nope: true })
        expect(res.status).toBe(422)
        expect(res.body.errors).toEqual([
            { field: "price", message: "must be a number" },
            { field: "nope", message: "is not a known field" }
        ])
    })

    it("does not change what GET returns", async () => {
        await request(app).patch(api("/ecommerce/products/p1")).send({ name: "Changed" })
        const res = await request(app).get(api("/ecommerce/products/p1"))
        expect(res.body.data.name).not.toBe("Changed")
    })

    it("returns 404 for an unknown id", async () => {
        expect((await request(app).patch(api("/users/nope")).send({ role: "admin" })).status).toBe(404)
    })
})

describe("DELETE (remove)", () => {
    it("returns the deleted record without removing it", async () => {
        const original = (await request(app).get(api("/startup/tasks/task1"))).body.data
        const res = await request(app).delete(api("/startup/tasks/task1"))
        expect(res.status).toBe(200)
        expect(res.body).toEqual({ success: true, data: original })
        expect((await request(app).get(api("/startup/tasks/task1"))).status).toBe(200)
    })

    it("returns 404 for an unknown id", async () => {
        const res = await request(app).delete(api("/startup/tasks/nope"))
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ success: false, message: 'No tasks record with id "nope"' })
    })
})

describe("writes and simulation", () => {
    it("support delay, error and errorRate", async () => {
        expect((await request(app).post(api("/ecommerce/products?error=503")).send(product)).status).toBe(503)
        expect((await request(app).delete(api("/users/u1?errorRate=100"))).status).toBe(500)

        const start = Date.now()
        await request(app).patch(api("/users/u1?delay=150")).send({ role: "admin" })
        expect(Date.now() - start).toBeGreaterThanOrEqual(140)
    })

    it("answers CORS preflight for write methods", async () => {
        const res = await request(app).options(api("/users/u1"))
            .set("Origin", "http://localhost:5173")
            .set("Access-Control-Request-Method", "PATCH")
        expect(res.status).toBe(204)
        expect(res.headers["access-control-allow-methods"]).toMatch(/PATCH/)
    })
})

describe("nextId", () => {
    it("follows the dataset's id pattern", () => {
        expect(nextId([{ id: "u1" }, { id: "u25" }, { id: "u3" }])).toBe("u26")
        expect(nextId([{ id: 101 }, { id: 115 }])).toBe(116)
        expect(nextId([{ id: "a1" }, { id: "b2" }])).toBe("3")
        expect(nextId([])).toBe("1")
    })
})
