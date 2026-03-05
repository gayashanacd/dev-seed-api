// src/shared/controllers/base.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseService } from "../services/base.service"
import { delay } from "../utils/delay"
import { simulateError } from "../utils/errorSimulation"
import { randomError } from "../utils/randomError"

export const createGetAllController = <T extends Record<string, any>>(service: BaseService<T>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { delay: delayMs, error, errorRate } = req.query
            await delay(delayMs ? Number(delayMs) : undefined)
            simulateError(error ? Number(error) : undefined)
            randomError(errorRate ? Number(errorRate) : undefined)

            const result = service.getAll(req.query)
            res.json({ success: true, data: result.data, meta: result.meta })
        } catch (err) {
            next(err)
        }
    }
}