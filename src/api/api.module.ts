import { buildPacksRouter } from "./packs/router"
import { packDefinitions } from "./packs/definitions"
import { packData } from "./packs/data"

// Every route under /api/v1 is generated from the pack definitions (see packs/types.ts)
export default buildPacksRouter(packDefinitions, packData)
