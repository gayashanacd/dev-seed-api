export const searchData = <T>(
    data: T[],
    searchQuery: string,
    fields: string[] // 👈 changed from (keyof T)[]
) => {
    if (!searchQuery) return data

    const q = searchQuery.toLowerCase()

    const getValue = (obj: any, path: string) =>
        path.split(".").reduce((acc, key) => acc?.[key], obj)

    return data.filter(item =>
        fields.some(field => {
            const value = field.includes(".")
                ? getValue(item, field)   // nested support
                : (item as any)[field]   // existing flat support

            return value?.toString().toLowerCase().includes(q)
        })
    )
}