import { Request, Response, NextFunction } from "express"
import { usersService } from "../services/users.service"

import { delay } from "../../shared/utils/delay"
import { simulateError } from "../../shared/utils/errorSimulation"
import { randomError } from "../../shared/utils/randomError"

export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const { delay: delayMs, error, errorRate } = req.query

        // simulate slow APIs
        await delay(delayMs ? Number(delayMs) : undefined)

        // force error
        simulateError(error ? Number(error) : undefined)

        // random API failures
        randomError(errorRate ? Number(errorRate) : undefined)

        const result = usersService.getAll(req.query)

        res.json({
        success: true,
        data: result.data,
        meta: result.meta
        })

    } catch (error) {
        next(error)
    }
}