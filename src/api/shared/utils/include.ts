// src/shared/utils/include.ts

/**
 * A relation is either:
 * - an array → one-to-one, resolved via the item's `${key}Id` field (e.g. `category` → `categoryId`)
 * - `{ data, foreignKey }` → one-to-many, returns every related record whose `foreignKey` equals the item's `id`
 */
export type Relation = any[] | { data: any[]; foreignKey: string }
export type Relations = Record<string, Relation>

export const includeData = <T extends Record<string, any>>(
  items: T[],
  includes: string[],
  relations: Relations
): (T & Record<string, any>)[] => {
  return items.map(item => {
    const newItem: Record<string, any> = { ...item }

    includes.forEach(rawKey => {
      const key = rawKey.trim()
      const relation = relations[key]
      if (!relation) return

      if (Array.isArray(relation)) {
        const foreignKey = `${key}Id`
        if (item[foreignKey] !== undefined) {
          newItem[key] = relation.find(r => r.id === item[foreignKey]) ?? null
        }
      } else {
        newItem[key] = relation.data.filter(r => r[relation.foreignKey] === item.id)
      }
    })

    return newItem as T & Record<string, any>
  })
}
