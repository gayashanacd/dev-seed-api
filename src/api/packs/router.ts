import { RequestHandler, Router } from "express"

import { BaseService } from "../shared/services/base.service"
import { createGetAllController, createGetByIdController } from "../shared/controllers/base.controller"
import { createBaseRoute } from "../shared/routes/base.route"
import { Relations } from "../shared/utils/include"
import type { PackDefinition } from "./types"

/** A pack's datasets, keyed by entity */
export type PackData<K extends string = string> = Record<K, Record<string, any>[]>

const entityPath = (pack: PackDefinition, entityKey: string) => `${pack.basePath}/${entityKey}`

/**
 * Builds every `GET <basePath>/<entity>` and `GET <basePath>/<entity>/:id` route from the pack definitions.
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
            }

            const path = entityPath(pack, entityKey)
            if (paths.has(path)) throw new Error(`Duplicate API route ${path}`)
            paths.add(path)

            const service = services.get(`${pack.key}/${entityKey}`)!
            router.use(path, createBaseRoute(
                createGetAllController(service, relations),
                createGetByIdController(service, relations, entityKey) as RequestHandler
            ))
        }
    }

    return router
}
