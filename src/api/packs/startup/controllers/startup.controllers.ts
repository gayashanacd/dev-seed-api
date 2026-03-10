import { createGetAllController } from "../../../shared/controllers/base.controller"

import {
    usersService,
    organizationsService,
    projectsService,
    tasksService,
    subscriptionsService,
    invoicesService,
    notificationsService
} from "../services/startup.services"

// Relations
const organizationRelations = {
    owner: usersService.getAllData(),
    projects: projectsService.getAllData(),
    subscriptions: subscriptionsService.getAllData(),
    invoices: invoicesService.getAllData()
}

const projectRelations = {
    organization: organizationsService.getAllData(),
    owner: usersService.getAllData(),
    tasks: tasksService.getAllData()
}

const taskRelations = {
    project: projectsService.getAllData(),
    assignee: usersService.getAllData()
}

const subscriptionRelations = {
    organization: organizationsService.getAllData(),
    invoices: invoicesService.getAllData()
}

const invoiceRelations = {
    organization: organizationsService.getAllData(),
    subscription: subscriptionsService.getAllData()
}

const notificationRelations = {
    user: usersService.getAllData()
}

// Controllers
export const getOrganizations = createGetAllController(organizationsService, organizationRelations)
export const getProjects = createGetAllController(projectsService, projectRelations)
export const getTasks = createGetAllController(tasksService, taskRelations)
export const getSubscriptions = createGetAllController(subscriptionsService, subscriptionRelations)
export const getInvoices = createGetAllController(invoicesService, invoiceRelations)
export const getNotifications = createGetAllController(notificationsService, notificationRelations)