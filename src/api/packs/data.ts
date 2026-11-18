import type { PackData } from "./router"
import { coreData } from "./core/data"
import { ecommerceData } from "./ecommerce/data"
import { startupData } from "./startup/data"

/**
 * Datasets for each pack, keyed by pack key (backend only). The router throws at startup if a
 * pack in `definitions.ts` has no data here.
 */
export const packData: Record<string, PackData> = {
    core: coreData,
    ecommerce: ecommerceData,
    startup: startupData
}
