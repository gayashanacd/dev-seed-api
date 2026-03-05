// src/shared/services/base.service.ts
import { paginate } from "../utils/pagination"
import { filterData } from "../utils/filtering"
import { sortData } from "../utils/sorting"
import { searchData } from "../utils/search"

export class BaseService<T extends Record<string, any>> {
    constructor(private data: T[]) {}

    getAll(query: Record<string, any>) {
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

        items = filterData(items, filters)

        // Sort
        if (query.sortBy) {
            items = sortData(items, query.sortBy, query.order || "asc")
        }

        // Pagination
        const page = query.page ? Number(query.page) : 1
        const limit = query.limit ? Number(query.limit) : 10

        return paginate(items, page, limit)
    }
}