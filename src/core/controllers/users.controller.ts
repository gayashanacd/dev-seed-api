import { Request, Response, NextFunction } from "express"
import { usersService } from "../services/users.service"

export const getUsers = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
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