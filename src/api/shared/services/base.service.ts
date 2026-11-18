// src/shared/services/base.service.ts
import { paginate } from "../utils/pagination"
import { filterData } from "../utils/filtering"
import { sortData } from "../utils/sorting"
import { searchData } from "../utils/search"
import { includeData, Relations } from "../utils/include"

// Query params that control the pipeline and must never be treated as field filters
const RESERVED_PARAMS = [
    "page", "limit", "search", "sortBy", "order", "include",
    "delay", "error", "errorRate"
]

export interface RangeFilter {
    field: string // dot paths allowed
    op: "gte" | "lte"
}

export interface BaseServiceOptions {
    /** Fields `search` matches against (dot paths allowed). Defaults to all top-level keys. */
    searchFields?: string[]
    /** Query params treated as numeric range filters, e.g. `{ minPrice: { field: "price", op: "gte" } }` */
    rangeFilters?: Record<string, RangeFilter>
}

const getValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj)

const parseInclude = (query: Record<string, any>): string[] =>
    query.include ? String(query.include).split(",") : []

export class BaseService<T extends Record<string, any>> {
    constructor(private data: T[], private options: BaseServiceOptions = {}) {}

    public getAllData(): T[] {
        return [...this.data]
    }

    getAll(query: Record<string, any>, relations: Relations = {}) {
        let items = [...this.data]
        const rangeFilters = this.options.rangeFilters ?? {}

        // Search
        if (query.search) {
            const fields = this.options.searchFields ?? Object.keys(items[0] ?? {})
            items = searchData(items, String(query.search), fields)
        }

        // Range filters (non-numeric values are ignored)
        for (const [param, { field, op }] of Object.entries(rangeFilters)) {
            if (query[param] === undefined) continue
            const bound = Number(query[param])
            if (Number.isNaN(bound)) continue
            items = items.filter(item => {
                const value = Number(getValue(item, field))
                if (Number.isNaN(value)) return false
                return op === "gte" ? value >= bound : value <= bound
            })
        }

        // Exact-match filters: every remaining query param
        const filters: Record<string, string> = {}
        for (const [key, value] of Object.entries(query)) {
            if (RESERVED_PARAMS.includes(key) || key in rangeFilters) continue
            filters[key] = String(value)
        }
        items = filterData(items, filters)

        // Sort
        if (query.sortBy) {
            items = sortData(items, String(query.sortBy), query.order === "desc" ? "desc" : "asc")
        }

        // Include relational data
        const include = parseInclude(query)
        if (include.length > 0) {
            items = includeData(items, include, relations) as T[]
        }

        // Pagination
        const page = query.page ? Number(query.page) : 1
        const limit = query.limit ? Number(query.limit) : 10

        return paginate(items, page, limit)
    }

    /**
     * One record by `id` (compared as strings, so numeric ids match the URL segment), with
     * `include` applied. Other query params are ignored. Returns undefined when not found.
     */
    getById(id: string, query: Record<string, any> = {}, relations: Relations = {}) {
        const item = this.data.find(record => String(record.id) === id)
        if (!item) return undefined

        const include = parseInclude(query)
        return include.length > 0 ? includeData([item], include, relations)[0] : { ...item }
    }
}
