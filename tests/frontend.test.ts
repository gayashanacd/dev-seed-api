import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import type { Express } from "express"

// A tiny fixture shaped like the prerendered frontend build (src/frontend/dist)
let dist: string
let app: Express

const write = (rel: string, content: string) => {
    const file = path.join(dist, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
}

beforeAll(async () => {
    dist = fs.mkdtempSync(path.join(os.tmpdir(), "devseed-dist-"))
    write("index.html", "<h1>home</h1>")
    write("404.html", "<h1>not found</h1>")
    write("docs/core/users.html", "<h1>users docs</h1>")
    write("assets/index-abc123.js", "console.log(1)")
    write("robots.txt", "User-agent: *")
    write("sitemap.xml", "<urlset/>")

    process.env.FRONTEND_DIST = dist
    app = (await import("../src/app")).default
})

afterAll(() => {
    fs.rmSync(dist, { recursive: true, force: true })
})

describe("prerendered frontend", () => {
    it("serves the home page", async () => {
        const res = await request(app).get("/")
        expect(res.status).toBe(200)
        expect(res.text).toContain("home")
        expect(res.headers["cache-control"]).toBe("no-cache")
    })

    it("serves docs pages at extensionless URLs without redirecting", async () => {
        const res = await request(app).get("/docs/core/users")
        expect(res.status).toBe(200)
        expect(res.text).toContain("users docs")
    })

    it("redirects trailing slashes to the canonical URL, keeping the query", async () => {
        const res = await request(app).get("/docs/core/users/?x=1")
        expect(res.status).toBe(301)
        expect(res.headers.location).toBe("/docs/core/users?x=1")
    })

    it("redirects /docs to the first docs page", async () => {
        const res = await request(app).get("/docs")
        expect(res.status).toBe(301)
        expect(res.headers.location).toBe("/docs/core/users")
    })

    it("returns HTTP 404 with the not-found page for unknown pages", async () => {
        for (const url of ["/nope", "/docs/nope/nope"]) {
            const res = await request(app).get(url)
            expect(res.status).toBe(404)
            expect(res.text).toContain("not found")
        }
    })

    it("serves robots.txt and sitemap.xml as real files", async () => {
        const robots = await request(app).get("/robots.txt")
        expect(robots.status).toBe(200)
        expect(robots.headers["content-type"]).toMatch(/text\/plain/)

        const sitemap = await request(app).get("/sitemap.xml")
        expect(sitemap.status).toBe(200)
        expect(sitemap.headers["content-type"]).toMatch(/xml/)
    })

    it("caches hashed assets for a year", async () => {
        const res = await request(app).get("/assets/index-abc123.js")
        expect(res.status).toBe(200)
        expect(res.headers["cache-control"]).toBe("public, max-age=31536000, immutable")
    })

    it("returns 404 for missing assets instead of the HTML page", async () => {
        const res = await request(app).get("/assets/missing.js")
        expect(res.status).toBe(404)
        expect(res.text).not.toContain("not found</h1>")
    })

    it("leaves API 404s as JSON", async () => {
        const res = await request(app).get("/api/v1/nope")
        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })
})
