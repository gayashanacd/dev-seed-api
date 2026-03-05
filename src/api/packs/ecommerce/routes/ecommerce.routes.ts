// src/api/packs/ecommerce/routes/ecommerce.routes.ts
import { Router } from "express"
import {
    getProducts,
    getCategories,
    getReviews,
    getOrders,
    getCart,
    getCoupons
} from "../controllers/ecommerce.controllers"
import { createBaseRoute } from "../../../shared/routes/base.route"

const router = Router()

router.use("/products", createBaseRoute(getProducts))
router.use("/categories", createBaseRoute(getCategories))
router.use("/reviews", createBaseRoute(getReviews))
router.use("/orders", createBaseRoute(getOrders))
router.use("/cart", createBaseRoute(getCart))
router.use("/coupons", createBaseRoute(getCoupons))

export default router