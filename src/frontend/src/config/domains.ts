// Generated from the backend pack definitions, which are the single source of truth for every
// entity. To document a new entity, add it to src/api/packs/<pack>/pack.ts, not here.
import { packDefinitions } from "../../../api/packs/definitions"
import type { EntityDefinition } from "../../../api/packs/types"

export interface FieldConfig {
    name: string
    type: string
    description: string
    filterBy?: string
    sortBy?: string
}

export interface EntityConfig {
    title: string
    endpoint: string
    endpointName: string
    description: string
    /** A real record id, used in GET /:id examples */
    exampleId: string
    /** Keys accepted by `?include=` (empty when the entity has no relations) */
    includeKeys: string[]
    fields: FieldConfig[]
}

export interface Domain {
    title: string
    /** Short label for SEO titles */
    label: string
    baseUrl: string
    entities: Record<string, EntityConfig>
}

const API_BASE_URL = "https://www.devseedapi.com/api/v1"

// Base simulation fields common to all entities
const simulationFields: FieldConfig[] = [
    { name: "page", type: "number", description: "Page number for pagination" },
    { name: "limit", type: "number", description: "Number of results per page" },
    {
        name: "search",
        type: "string",
        description:
        "Search across fields. Supports nested fields (e.g., searches name.first, name.last, email)."
    },

    {
        name: "filter",
        type: "string",
        description:
        "Filter by any field using query params. Supports nested fields using dot notation (e.g., address.city=Toronto, name.first=John)."
    },
    {
        name: "sort",
        type: "string",
        description:
        "Sort by a field. Supports nested fields using dot notation (e.g., sortBy=name.first&order=asc)."
    },
    {
        name: "delay",
        type: "number (ms)",
        description: "Simulates network latency"
    },
    {
        name: "error",
        type: "number (HTTP code)",
        description: "Force a specific HTTP error"
    },
    {
        name: "errorRate",
        type: "number (0–100)",
        description: "Random API failures by percentage"
    }
]

function buildFields(entity: EntityDefinition): FieldConfig[] {
    const relationKeys = Object.keys(entity.relations ?? {})
    const fields: FieldConfig[] = [
        ...simulationFields,
        ...(relationKeys.length > 0
            ? [{ name: "include", type: "string", description: `Include related data: ${relationKeys.join(", ")}` }]
            : []),
        ...(entity.filters ?? []),
        ...Object.entries(entity.rangeFilters ?? {}).map(([name, range]) => ({
            name,
            type: "number",
            description: range.description
        }))
    ]

    // Return copies: `simulationFields` is shared by every entity
    return fields.map(f => {
        if (f.name === "filter") return { ...f, filterBy: entity.examples.filter }
        if (f.name === "sort") return { ...f, sortBy: entity.examples.sort }
        return f
    })
}

export const domainConfig: Record<string, Domain> = Object.fromEntries(
    packDefinitions.map(pack => [pack.key, {
        title: pack.title,
        label: pack.label,
        baseUrl: `${API_BASE_URL}${pack.basePath}`,
        entities: Object.fromEntries(
            Object.entries(pack.entities).map(([key, entity]) => [key, {
                title: entity.title,
                endpoint: `${pack.basePath}/${key}`,
                endpointName: key,
                description: entity.description,
                exampleId: entity.examples.id,
                includeKeys: Object.keys(entity.relations ?? {}),
                fields: buildFields(entity)
            }])
        )
    }])
)
