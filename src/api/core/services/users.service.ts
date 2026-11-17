import usersData from "../data/users.json"
import { User } from "../interfaces/user.interface"
import { BaseService } from "../../shared/services/base.service"

export const usersService = new BaseService<User>(usersData as User[], {
    searchFields: ["name.first", "name.last", "email"]
})
