import usersData from "../data/users.json"
import { User } from "../interfaces/user.interface"
import { filterData } from "../../shared/utils/filtering"
import { searchData } from "../../shared/utils/search"
import { paginate } from "../../shared/utils/pagination"
import { sortData } from "../../shared/utils/sorting"

class UsersService {
    private users: User[] = usersData as User[]

    getAll(query: {
        page?: number
        limit?: number
        search?: string
        sortBy?: keyof User
        order?: "asc" | "desc"
        [key: string]: any
    }) {

        let data = [...this.users]

        const page = query.page ? Number(query.page) : 1
        const limit = query.limit ? Number(query.limit) : 10

        // Search
        if (query.search) {
            data = searchData(data, query.search, ["firstName", "lastName", "email"])
        }

        // Filters
        const filters = { ...query }
        delete filters.page
        delete filters.limit
        delete filters.search
        delete filters.sortBy
        delete filters.order

        data = filterData(data, filters)

        // Sorting
        if (query.sortBy) {
            data = sortData(
                data,
                query.sortBy,
                query.order || "asc"
            )
        }

        // Pagination
        const result = paginate(data, page, limit)

        return result
    }
}

export const usersService = new UsersService()