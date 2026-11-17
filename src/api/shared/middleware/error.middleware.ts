import { Request, Response, NextFunction } from "express"

// Accept both `statusCode` (our simulation utils) and `status` (Express/body-parser errors).
// Anything outside the 4xx/5xx range falls back to 500 — Express 5 throws on invalid codes.
const resolveStatus = (err: any): number => {
    const code = Number(err?.statusCode ?? err?.status)
    return Number.isInteger(code) && code >= 400 && code <= 599 ? code : 500
}

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err)

    res.status(resolveStatus(err)).json({
        success: false,
        message: err?.message || "Internal Server Error"
    })
}
