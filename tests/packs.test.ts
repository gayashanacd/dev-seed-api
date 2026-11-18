import { describe, it, expect } from "vitest"
import request from "supertest"
import express from "express"

import app from "../src/app"
import { buildPacksRouter } from "../src/api/packs/router"
import { packDefinitions } from "../src/api/packs/definitions"
import type { PackDefinition } from "../src/api/packs/types"

const allEntities = packDefinitions.flatMap(pack =>
    Object.entries(pack.entities).map(([key, entity]) => ({ pack, key, entity }))
)

describe("pack definitions", () => {
    it.each(allEntities.map(e => [`${e.pack.basePath}/${e.key}`, e]))(
        "%s is served",
        async (path, { entity }) => {
            const res = await request(app).get(`/api/v1${path}`)
            expect(res.status).toBe(200)
            expect(res.body.data.length).toBeGreaterThan(0)

            // The docs example id exists and is served by GET /:id
            const one = await request(app).get(`/api/v1${path}/${entity.examples.id}`)
            expect(one.status).toBe(200)
            expect(String(one.body.data.id)).toBe(entity.examples.id)

            // The inferred write schema accepts the entity's own records
            const { id, createdAt, ...record } = one.body.data
            expect((await request(app).post(`/api/v1${path}`).send(record)).status).toBe(201)
            expect((await request(app).put(`/api/v1${path}/${id}`).send(record)).status).toBe(200)
            expect((await request(app).patch(`/api/v1${path}/${id}`).send({})).status).toBe(200)
            expect((await request(app).delete(`/api/v1${path}/${id}`)).status).toBe(200)

            // Every declared relation resolves on at least one record
            for (const relationKey of Object.keys(entity.relations ?? {})) {
                const inc = await request(app).get(`/api/v1${path}?include=${relationKey}&limit=1000`)
                expect(inc.body.data.some((r: any) => r[relationKey] != null)).toBe(true)
            }
        }
    )
})

describe("buildPacksRouter", () => {
    const pack = (entities: PackDefinition["entities"]): PackDefinition => ({
        key: "test", title: "Test", label: "Test", basePath: "/test", entities
    })
    const entity = { title: "A", description: "A", examples: { id: "1", filter: "id", sort: "id" } }

    it("throws when an entity has no dataset", () => {
        expect(() => buildPacksRouter([pack({ things: entity })], { test: {} }))
            .toThrow(/no dataset for entity "things"/)
    })

    it("throws when a relation targets an unknown entity", () => {
        const defs = [pack({ things: { ...entity, relations: { owner: { entity: "people" } } } })]
        expect(() => buildPacksRouter(defs, { test: { things: [] } }))
            .toThrow(/relation "owner" points to unknown entity "test\/people"/)
    })

    it("throws on duplicate routes", () => {
        const a = pack({ things: entity })
        const b = { ...a, key: "other" }
        expect(() => buildPacksRouter([a, b], { test: { things: [] }, other: { things: [] } }))
            .toThrow(/Duplicate API route \/test\/things/)
    })

    it("resolves cross-pack relations", async () => {
        const people: PackDefinition = { ...pack({ people: entity }), key: "people", basePath: "" }
        const things = pack({ things: { ...entity, relations: { owner: { pack: "people", entity: "people" } } } })
        const router = buildPacksRouter([people, things], {
            people: { people: [{ id: "p1", name: "Ada" }] },
            test: { things: [{ id: "t1", ownerId: "p1" }] }
        })
        const res = await request(express().use(router)).get("/test/things?include=owner")
        expect(res.body.data[0].owner).toEqual({ id: "p1", name: "Ada" })
    })
})
