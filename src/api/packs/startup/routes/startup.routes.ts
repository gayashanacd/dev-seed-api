import { Router } from "express"

import {
    getOrganizations,
    getProjects,
    getTasks,
    getSubscriptions,
    getInvoices,
    getNotifications
} from "../controllers/startup.controllers"

import { createBaseRoute } from "../../../shared/routes/base.route"

const router = Router()

router.use("/organizations", createBaseRoute(getOrganizations))
router.use("/projects", createBaseRoute(getProjects))
router.use("/tasks", createBaseRoute(getTasks))
router.use("/subscriptions", createBaseRoute(getSubscriptions))
router.use("/invoices", createBaseRoute(getInvoices))
router.use("/notifications", createBaseRoute(getNotifications))

export default router