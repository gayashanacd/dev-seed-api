import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../src/app"

const remaining = (res: request.Response) => Number(res.headers["ratelimit-remaining"])

describe("rate limiting", () => {
    it("counts requests per Cloudflare client IP, not per proxy", async () => {
        const a1 = await request(app).get("/api/v1/users").set("CF-Connecting-IP", "203.0.113.1")
        const a2 = await request(app).get("/api/v1/users").set("CF-Connecting-IP", "203.0.113.1")
        const b1 = await request(app).get("/api/v1/users").set("CF-Connecting-IP", "203.0.113.2")

        expect(remaining(a2)).toBe(remaining(a1) - 1)
        expect(remaining(b1)).toBe(199) // separate bucket from client A
    })

    it("falls back to the forwarded client IP when Cloudflare is bypassed", async () => {
        const c = await request(app).get("/api/v1/users").set("X-Forwarded-For", "198.51.100.7")
        const d = await request(app).get("/api/v1/users").set("X-Forwarded-For", "198.51.100.8")
        expect(remaining(c)).toBe(199)
        expect(remaining(d)).toBe(199)
    })

    it("does not rate limit /health", async () => {
        const res = await request(app).get("/health")
        expect(res.headers["ratelimit-remaining"]).toBeUndefined()
    })
})
