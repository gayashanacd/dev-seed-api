export const filterData = <T>(data: T[], filters: Record<string, string>) => {
    if (!filters || Object.keys(filters).length === 0) return data

    return data.filter(item =>
        Object.entries(filters).every(
            ([key, value]) => item[key as keyof T]?.toString() === value
        )
    )
}