// src/shared/utils/include.ts
export const includeData = <T extends Record<string, any>>(
  items: T[],
  includes: string[],
  relations: Record<string, any[]>
): (T & Record<string, any>)[] => {
  return items.map(item => {
    // Make a mutable copy with index signature
    const newItem: Record<string, any> = { ...item }

    includes.forEach(key => {
      const relatedData = relations[key] || []

      // One-to-one relation: look for `${key}Id`
      const foreignKey = `${key}Id`
      if (item[foreignKey] !== undefined) {
        const rel = relatedData.find(r => r.id === item[foreignKey])
        if (rel) newItem[key] = rel
      }

      // One-to-many example: reviews
      if (key === "reviews") {
        newItem[key] = relatedData.filter(r => r.productId === item.id)
      }
    })

    return newItem as T & Record<string, any>
  })
}