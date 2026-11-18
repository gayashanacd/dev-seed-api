import type { PackDefinition } from "../types"

const users = { pack: "core", entity: "users" }

export const startupPack = {
    key: "startup",
    title: "Startup / SaaS Model",
    label: "SaaS",
    basePath: "/startup",
    entities: {
        organizations: {
            title: "Organizations",
            description: "Organization details with owners, projects, subscriptions, and invoices.",
            relations: {
                owner: users,
                projects: { entity: "projects", foreignKey: "organizationId" },
                subscriptions: { entity: "subscriptions", foreignKey: "organizationId" },
                invoices: { entity: "invoices", foreignKey: "organizationId" }
            },
            examples: { filter: "name", sort: "createdAt&order=asc" }
        },
        projects: {
            title: "Projects",
            description: "Projects under organizations with tasks and owners.",
            relations: {
                organization: { entity: "organizations" },
                owner: users,
                tasks: { entity: "tasks", foreignKey: "projectId" }
            },
            examples: { filter: "organizationId", sort: "createdAt&order=desc" }
        },
        tasks: {
            title: "Tasks",
            description: "Project tasks with assignees and status.",
            relations: {
                project: { entity: "projects" },
                assignee: users
            },
            examples: { filter: "projectId", sort: "dueDate&order=asc" }
        },
        subscriptions: {
            title: "Subscriptions",
            description: "Organization subscriptions with related invoices.",
            relations: {
                organization: { entity: "organizations" },
                invoices: { entity: "invoices", foreignKey: "subscriptionId" }
            },
            examples: { filter: "organizationId", sort: "createdAt&order=desc" }
        },
        invoices: {
            title: "Invoices",
            description: "Invoices linked to subscriptions and organizations.",
            relations: {
                organization: { entity: "organizations" },
                subscription: { entity: "subscriptions" }
            },
            examples: { filter: "subscriptionId", sort: "createdAt&order=desc" }
        },
        notifications: {
            title: "Notifications",
            description: "User notifications.",
            relations: {
                user: users
            },
            examples: { filter: "userId", sort: "createdAt&order=desc" }
        }
    }
} satisfies PackDefinition
