import { createGetAllController } from "../../../shared/controllers/base.controller"
import { Relations } from "../../../shared/utils/include"

import {
    usersService,
    organizationsService,
    projectsService,
    tasksService,
    subscriptionsService,
    invoicesService,
    notificationsService
} from "../services/startup.services"

// Relations: array = one-to-one via `${key}Id`; { data, foreignKey } = one-to-many
const organizationRelations: Relations = {
    owner: usersService.getAllData(),
    projects: { data: projectsService.getAllData(), foreignKey: "organizationId" },
    subscriptions: { data: subscriptionsService.getAllData(), foreignKey: "organizationId" },
    invoices: { data: invoicesService.getAllData(), foreignKey: "organizationId" }
}

const projectRelations: Relations = {
    organization: organizationsService.getAllData(),
    owner: usersService.getAllData(),
    tasks: { data: tasksService.getAllData(), foreignKey: "projectId" }
}

const taskRelations: Relations = {
    project: projectsService.getAllData(),
    assignee: usersService.getAllData()
}

const subscriptionRelations: Relations = {
    organization: organizationsService.getAllData(),
    invoices: { data: invoicesService.getAllData(), foreignKey: "subscriptionId" }
}

const invoiceRelations: Relations = {
    organization: organizationsService.getAllData(),
    subscription: subscriptionsService.getAllData()
}

const notificationRelations: Relations = {
    user: usersService.getAllData()
}

// Controllers
export const getOrganizations = createGetAllController(organizationsService, organizationRelations)
export const getProjects = createGetAllController(projectsService, projectRelations)
export const getTasks = createGetAllController(tasksService, taskRelations)
export const getSubscriptions = createGetAllController(subscriptionsService, subscriptionRelations)
export const getInvoices = createGetAllController(invoicesService, invoiceRelations)
export const getNotifications = createGetAllController(notificationsService, notificationRelations)