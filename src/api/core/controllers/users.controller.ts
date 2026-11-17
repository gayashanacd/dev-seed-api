import { createGetAllController } from "../../shared/controllers/base.controller"
import { usersService } from "../services/users.service"

export const getUsers = createGetAllController(usersService)
