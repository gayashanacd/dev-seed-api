import { BaseService } from "../../../shared/services/base.service"

import usersData from "../../../core/data/users.json"
import organizationsData from "../data/organizations.json"
import projectsData from "../data/projects.json"
import tasksData from "../data/tasks.json"
import subscriptionsData from "../data/subscriptions.json"
import invoicesData from "../data/invoices.json"
import notificationsData from "../data/notifications.json"

export const usersService = new BaseService(usersData)
export const organizationsService = new BaseService(organizationsData)
export const projectsService = new BaseService(projectsData)
export const tasksService = new BaseService(tasksData)
export const subscriptionsService = new BaseService(subscriptionsData)
export const invoicesService = new BaseService(invoicesData)
export const notificationsService = new BaseService(notificationsData)