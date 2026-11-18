import { RequestHandler, Router } from "express"

import { BaseService } from "../shared/services/base.service"
import {
    createGetAllController,
    createGetByIdController,
    createWriteControllers
} from "../shared/controllers/base.controller"
import { WriteService, ForeignKey } from "../shared/services/write.service"
import { createBaseRoute } from "../shared/routes/base.route"
import { Relations } from "../shared/utils/include"
import type { PackDefinition } from "./types"

/** A pack's datasets, keyed by entity */
export type PackData<K extends string = string> = Record<K, Record<string, any>[]>

const entityPath = (pack: PackDefinition, entityKey: string) => `${pack.basePath}/${entityKey}`

/**
 * Builds every entity's routes from the pack definitions: `GET` and `POST` on `<basePath>/<entity>`,
 * `GET`, `PUT`, `PATCH` and `DELETE` on `<basePath>/<entity>/:id` (writes are simulated, never stored).
 * Throws at startup if a definition and its data don't line up, so mistakes never reach users.
 */
export const buildPacksRouter = (
    definitions: readonly PackDefinition[],
    data: Record<string, PackData>
): Router => {
    // 1. One service per entity, keyed "<pack>/<entity>"
    const services = new Map<string, BaseService<Record<string, any>>>()
    for (const pack of definitions) {
        for (const [entityKey, entity] of Object.entries(pack.entities)) {
            const dataset = data[pack.key]?.[entityKey]
            if (!Array.isArray(dataset)) {
                throw new Error(`Pack "${pack.key}": no dataset for entity "${entityKey}"`)
            }
            services.set(`${pack.key}/${entityKey}`, new BaseService(dataset, {
                searchFields: entity.searchFields,
                rangeFilters: entity.rangeFilters
            }))
        }
    }

    // 2. Resolve relations and mount a route per entity
    const router = Router()
    const paths = new Set<string>()
    for (const pack of definitions) {
        for (const [entityKey, entity] of Object.entries(pack.entities)) {
            const relations: Relations = {}
            const foreignKeys: ForeignKey[] = []
            for (const [relationKey, relation] of Object.entries(entity.relations ?? {})) {
                const target = services.get(`${relation.pack ?? pack.key}/${relation.entity}`)
                if (!target) {
                    throw new Error(
                        `Pack "${pack.key}", entity "${entityKey}": relation "${relationKey}" ` +
                        `points to unknown entity "${relation.pack ?? pack.key}/${relation.entity}"`
                    )
                }
                relations[relationKey] = relation.foreignKey
                    ? { data: target.getAllData(), foreignKey: relation.foreignKey }
                    : target.getAllData()

                // One-to-one relations make `${relationKey}Id` a foreign key that writes must respect
                if (!relation.foreignKey) {
                    foreignKeys.push({
                        field: `${relationKey}Id`,
                        entityName: relation.entity,
                        ids: new Set(target.getAllData().map(r => String(r.id)))
                    })
                }
            }

            const path = entityPath(pack, entityKey)
            if (paths.has(path)) throw new Error(`Duplicate API route ${path}`)
            paths.add(path)

            const service = services.get(`${pack.key}/${entityKey}`)!
            const writes = createWriteControllers(new WriteService(service.getAllData(), entityKey, foreignKeys))
            router.use(path, createBaseRoute({
                getAll: createGetAllController(service, relations),
                getById: createGetByIdController(service, relations, entityKey) as RequestHandler,
                create: writes.create as RequestHandler,
                replace: writes.replace as RequestHandler,
                update: writes.update as RequestHandler,
                remove: writes.remove as RequestHandler
            }))
        }
    }

    return router
}
