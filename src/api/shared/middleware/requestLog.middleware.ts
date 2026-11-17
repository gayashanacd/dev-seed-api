import { Request, Response, NextFunction } from "express"

/**
 * One JSON line per API request, for usage insight in Render logs.
 * Logs only the query-param *names* (never values) and no IP addresses.
 */
export const requestLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test") return next()

    const start = process.hrtime.bigint()

    res.on("finish", () => {
        const ms = Number(process.hrtime.bigint() - start) / 1e6
        console.log(JSON.stringify({
            type: "api_request",
            method: req.method,
            path: req.originalUrl.split("?")[0],
            params: Object.keys(req.query).sort(),
            status: res.statusCode,
            ms: Math.round(ms)
        }))
    })

    next()
}
