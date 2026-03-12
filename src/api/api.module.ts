import { Router } from "express"

import coreModule from "./core/core.module"
import ecommerceRoutes from "./packs/ecommerce/routes/ecommerce.routes"
import startupRoutes from "./packs/startup/routes/startup.routes"

const router = Router()

// Core system
router.use("/", coreModule)

// Domain packs
router.use("/ecommerce", ecommerceRoutes)
router.use("/startup", startupRoutes)

export default router