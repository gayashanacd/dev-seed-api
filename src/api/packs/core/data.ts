import type { PackData } from "../router"
import type { corePack } from "./pack"
import users from "./data/users.json"

export const coreData = {
    users
} satisfies PackData<keyof typeof corePack.entities>
