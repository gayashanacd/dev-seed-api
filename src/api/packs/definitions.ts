import type { PackDefinition } from "./types"
import { corePack } from "./core/pack"
import { ecommercePack } from "./ecommerce/pack"
import { startupPack } from "./startup/pack"

/**
 * Every pack, in mount and docs-sidebar order. Data-free, so the frontend imports this too.
 * To add a pack: write `<pack>/pack.ts` and `<pack>/data.ts`, then list it here and in `data.ts`.
 */
export const packDefinitions: readonly PackDefinition[] = [corePack, ecommercePack, startupPack]
