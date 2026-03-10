// src/shared/services/base.service.ts
import { paginate } from "../utils/pagination"
import { filterData } from "../utils/filtering"
import { sortData } from "../utils/sorting"
import { searchData } from "../utils/search"
import { includeData } from "../utils/include"

export class BaseService<T extends Record<string, any>> {
    constructor(private data: T[]) {}

    // Add this getter
    public getAllData(): T[] {
        return [...this.data]
    }

    getAll(query: Record<string, any>, relations: Record<string, any[]> = {}) {
        let items = [...this.data]

        // Search
        if (query.search) {
            items = searchData(items, query.search, Object.keys(items[0]))
        }

        // Filters
        const filters = { ...query }
        delete filters.page
        delete filters.limit
        delete filters.search
        delete filters.sortBy
        delete filters.order
        delete filters.include
        delete filters.delay
        delete filters.error
        delete filters.errorRate

        items = filterData(items, filters)

        // Sort
        if (query.sortBy) {
            items = sortData(items, query.sortBy, query.order || "asc")
        }

        // Include relational data
        const include = query.include ? query.include.split(",") : []
        if (include.length > 0) {
            items = includeData(items, include, relations) as T[]
        }

        // Pagination
        const page = query.page ? Number(query.page) : 1
        const limit = query.limit ? Number(query.limit) : 10

        return paginate(items, page, limit)
    }
}