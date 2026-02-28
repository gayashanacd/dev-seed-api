import usersData from "../data/users.json"
import { User } from "../interfaces/user.interface"
import { filterData } from "../../shared/utils/filtering"
import { searchData } from "../../shared/utils/search"
import { paginate } from "../../shared/utils/pagination"

class UsersService {
    private users: User[] = usersData as User[] 

    getAll(query: {
        page?: number
        limit?: number
        search?: string
        [key: string]: any
    }) {
        let data = [...this.users]

        // Extract page & limit
        const page = query.page ? Number(query.page) : 1
        const limit = query.limit ? Number(query.limit) : 10

        // Search
        if (query.search) {
            data = searchData(data, query.search, ["firstName", "lastName", "email"])
        }

        // Filters (exclude page, limit, search)
        const filters = { ...query }
        delete filters.page
        delete filters.limit
        delete filters.search
        data = filterData(data, filters)

        // Pagination
        const result = paginate(data, page, limit)

        return result
    }
}

export const usersService = new UsersService()