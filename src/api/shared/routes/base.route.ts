import { RequestHandler, Router } from "express"

export interface EntityHandlers {
    getAll: RequestHandler
    getById: RequestHandler
    create: RequestHandler
    replace: RequestHandler
    update: RequestHandler
    remove: RequestHandler
}

/** Read routes plus the fake write routes for an entity */
export const createBaseRoute = (handlers: EntityHandlers) => {
    const router = Router()
    router.get("/", handlers.getAll)
    router.post("/", handlers.create)
    router.get("/:id", handlers.getById)
    router.put("/:id", handlers.replace)
    router.patch("/:id", handlers.update)
    router.delete("/:id", handlers.remove)
    return router
}
