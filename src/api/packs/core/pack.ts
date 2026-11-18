import type { PackDefinition } from "../types"

export const corePack = {
    key: "core",
    title: "Core System",
    label: "User",
    basePath: "",
    entities: {
        users: {
            title: "Users",
            description: "Returns a list of users. Supports pagination, filtering, sorting and simulation.",
            searchFields: ["name.first", "name.last", "email"],
            examples: { filter: "role", sort: "name.first&order=asc" }
        }
    }
} satisfies PackDefinition
