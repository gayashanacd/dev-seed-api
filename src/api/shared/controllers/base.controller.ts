// src/shared/controllers/base.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseService } from "../services/base.service"
import { Relations } from "../utils/include"
import { delay } from "../utils/delay"
import { simulateError } from "../utils/errorSimulation"
import { randomError } from "../utils/randomError"

/** Applies the `delay`, `error` and `errorRate` simulation params (throws for simulated errors) */
const simulate = async (query: Request["query"]) => {
    const { delay: delayMs, error, errorRate } = query
    await delay(delayMs ? Number(delayMs) : undefined)
    simulateError(error ? Number(error) : undefined)
    randomError(errorRate ? Number(errorRate) : undefined)
}

/**
 * Generic GET ALL controller with optional `relations` map for `include` support.
 * @param service - BaseService instance
 * @param relations - optional map of related data (see `Relation` in utils/include)
 */
export const createGetAllController = <T extends Record<string, any>>(
    service: BaseService<T>,
    relations: Relations = {}
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await simulate(req.query)

            const result = service.getAll(req.query, relations)

            res.json({ success: true, data: result.data, meta: result.meta })
        } catch (err) {
            next(err)
        }
    }
}

/**
 * Generic GET BY ID controller: `{ success, data }` for one record, or a JSON 404.
 * Supports `include` and the simulation params.
 * @param entityName - used in the 404 message, e.g. "users"
 */
export const createGetByIdController = <T extends Record<string, any>>(
    service: BaseService<T>,
    relations: Relations = {},
    entityName = "record"
) => {
    return async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            await simulate(req.query)

            const item = service.getById(req.params.id, req.query, relations)
            if (!item) {
                res.status(404).json({
                    success: false,
                    message: `No ${entityName} record with id "${req.params.id}"`
                })
                return
            }

            res.json({ success: true, data: item })
        } catch (err) {
            next(err)
        }
    }
}
