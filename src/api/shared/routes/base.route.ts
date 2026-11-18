import { RequestHandler, Router } from "express"

/** `GET /` (list) and `GET /:id` (one record) for an entity */
export const createBaseRoute = (getAll: RequestHandler, getById: RequestHandler) => {
    const router = Router()
    router.get("/", getAll)
    router.get("/:id", getById)
    return router
}
