export const sortData = <T>(
    data: T[],
    field: keyof T,
    order: "asc" | "desc" = "asc"
): T[] => {
    return [...data].sort((a, b) => {
        const aValue = a[field]
        const bValue = b[field]

        if (aValue === bValue) return 0

        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1

        if (aValue > bValue) return order === "asc" ? 1 : -1
        if (aValue < bValue) return order === "asc" ? -1 : 1

        return 0
    })
}