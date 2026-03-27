export const filterData = <T>(
    data: T[],
    filters: Record<string, string>
    ) => {
    if (!filters || Object.keys(filters).length === 0) return data

    const getValue = (obj: any, path: string) =>
        path.split(".").reduce((acc, key) => acc?.[key], obj)

    return data.filter(item =>
        Object.entries(filters).every(([key, value]) => {
        const itemValue = key.includes(".")
            ? getValue(item, key)        // nested support
            : (item as any)[key]         // existing flat support

        return itemValue?.toString() === value
        })
    )
}