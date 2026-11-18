import { describe, it, expect } from "vitest"
import { execSync } from "child_process"

import { generate, keptRecords, readDatasets, FILES, KEEP } from "../scripts/generate-data"

const data = readDatasets()
const ids = (entity: keyof typeof data) => new Set(data[entity].map(r => r.id))
const byId = <K extends keyof typeof data>(entity: K) => new Map(data[entity].map(r => [r.id, r]))

describe("seeded data", () => {
    it("is exactly what the generator produces (run `npm run generate:data` after changing it)", () => {
        expect(generate(keptRecords(data))).toEqual(data)
    })

    it("never changes the hand-written records", () => {
        // They are the first KEEP[entity] records of the version that introduced the generator
        const original = (file: string) =>
            JSON.parse(execSync(`git show 42144e7:src/api/packs/${file}`, { encoding: "utf8" }))
        for (const [entity, file] of Object.entries(FILES)) {
            const kept = data[entity as keyof typeof data].slice(0, KEEP[entity as keyof typeof KEEP])
            expect(kept, entity).toEqual(original(file))
        }
    })

    it("has unique ids and emails", () => {
        for (const entity of Object.keys(data) as (keyof typeof data)[]) {
            expect(ids(entity).size, entity).toBe(data[entity].length)
        }
        expect(new Set(data.users.map(u => u.email)).size).toBe(data.users.length)
    })

    it.each([
        ["products", "categoryId", "categories"],
        ["reviews", "productId", "products"],
        ["reviews", "userId", "users"],
        ["orders", "userId", "users"],
        ["orders", "couponId", "coupons"],
        ["cart", "userId", "users"],
        ["organizations", "ownerId", "users"],
        ["projects", "organizationId", "organizations"],
        ["projects", "ownerId", "users"],
        ["tasks", "projectId", "projects"],
        ["tasks", "assigneeId", "users"],
        ["subscriptions", "organizationId", "organizations"],
        ["invoices", "organizationId", "organizations"],
        ["invoices", "subscriptionId", "subscriptions"],
        ["notifications", "userId", "users"]
    ] as const)("%s.%s points at existing %s", (entity, field, target) => {
        const targetIds = ids(target)
        const broken = data[entity].filter(r => r[field] !== undefined && !targetIds.has(r[field]))
        expect(broken.map(r => r.id)).toEqual([])
    })

    it("orders and carts reference existing products, and order totals add up", () => {
        const products = byId("products")
        for (const order of data.orders) {
            const sum = order.products.reduce((s: number, i: any) => s + products.get(i.productId)!.price * i.quantity, 0)
            expect(order.total, order.id).toBe(Math.round(sum * 100) / 100)
        }
        for (const cart of data.cart) {
            expect(cart.items.every((i: any) => products.has(i.productId)), cart.id).toBe(true)
        }
    })

    it("never dates a record before the records it refers to", () => {
        const users = byId("users"), products = byId("products"), projects = byId("projects")
        for (const order of data.orders) {
            expect(users.get(order.userId)!.createdAt <= order.createdAt, order.id).toBe(true)
            for (const item of order.products) {
                expect(products.get(item.productId)!.createdAt <= order.createdAt, order.id).toBe(true)
            }
        }
        for (const task of data.tasks.slice(KEEP.tasks)) {
            expect(projects.get(task.projectId)!.createdAt <= task.dueDate, task.id).toBe(true)
        }
    })

    it("gives each organization one subscription on its plan, billed at the subscription price", () => {
        const orgs = byId("organizations"), subs = byId("subscriptions")
        expect(new Set(data.subscriptions.map(s => s.organizationId)).size).toBe(data.organizations.length)
        for (const sub of data.subscriptions) expect(sub.plan, sub.id).toBe(orgs.get(sub.organizationId)!.plan)
        for (const invoice of data.invoices) {
            const sub = subs.get(invoice.subscriptionId)!
            expect(invoice.amount, invoice.id).toBe(sub.price)
            expect(invoice.organizationId, invoice.id).toBe(sub.organizationId)
            expect(invoice.issuedAt >= sub.startedAt, invoice.id).toBe(true)
        }
    })
})
