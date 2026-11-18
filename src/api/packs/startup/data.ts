import type { PackData } from "../router"
import type { startupPack } from "./pack"
import organizations from "./data/organizations.json"
import projects from "./data/projects.json"
import tasks from "./data/tasks.json"
import subscriptions from "./data/subscriptions.json"
import invoices from "./data/invoices.json"
import notifications from "./data/notifications.json"

export const startupData = {
    organizations,
    projects,
    tasks,
    subscriptions,
    invoices,
    notifications
} satisfies PackData<keyof typeof startupPack.entities>
