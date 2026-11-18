/**
 * Pack definitions are the single source of truth for every API entity. Both the Express
 * routes (`packs/router.ts`) and the docs site (`src/frontend/src/config/domains.ts`) are
 * generated from them.
 *
 * Keep definition files data-free and dependency-free: the frontend imports them, so they must
 * not pull in JSON datasets or Node/Express code. Datasets are bound in each pack's `data.ts`.
 */

/** A documented query parameter (docs only; any field can be filtered on) */
export interface DocParam {
    name: string
    type: string
    description: string
}

export interface RangeFilterDefinition {
    /** Field compared against the query value (dot paths allowed) */
    field: string
    op: "gte" | "lte"
    /** Shown in the docs */
    description: string
}

/**
 * - without `foreignKey`: one-to-one, resolved through the item's `${relationKey}Id` field
 *   (e.g. `category` → `categoryId`)
 * - with `foreignKey`: one-to-many, every target record whose `foreignKey` equals the item's `id`
 */
export interface RelationDefinition {
    /** Target entity key */
    entity: string
    /** Target pack key; defaults to the pack the relation is declared in */
    pack?: string
    foreignKey?: string
}

export interface EntityDefinition {
    title: string
    description: string
    /** Fields `search` matches against (dot paths allowed). Defaults to all top-level keys. */
    searchFields?: string[]
    /** Query params treated as numeric range filters, e.g. `minPrice` → `price >= value` */
    rangeFilters?: Record<string, RangeFilterDefinition>
    /** Keys accepted by `?include=` */
    relations?: Record<string, RelationDefinition>
    /** Exact-match filters worth calling out in the docs */
    filters?: DocParam[]
    /** Docs examples: a real record id (checked by tests), a filter field and a sort expression */
    examples: { id: string; filter: string; sort: string }
}

export interface PackDefinition {
    key: string
    /** Docs sidebar title */
    title: string
    /** Short label for SEO titles: "Products API – Free Mock {label} Data" */
    label: string
    /** Mount path under /api/v1, e.g. "/ecommerce". "" mounts entities at the root (/api/v1/users). */
    basePath: string
    entities: Record<string, EntityDefinition>
}
