
import { Router } from "express"

export const createBaseRoute = (controller: any) => {
    const router = Router()
    router.get("/", controller)
    return router
}