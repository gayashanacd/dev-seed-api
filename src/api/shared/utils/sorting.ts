export const sortData = <T>(
    data: T[],
    field: keyof T | string, // 👈 allow both
    order: "asc" | "desc" = "asc"
): T[] => {

    const getValue = (obj: any, path: string) =>
        path.split(".").reduce((acc, key) => acc?.[key], obj)

    return [...data].sort((a, b) => {
        const aValue =
            typeof field === "string" && field.includes(".")
                ? getValue(a, field)
                : (a as any)[field]

        const bValue =
            typeof field === "string" && field.includes(".")
                ? getValue(b, field)
                : (b as any)[field]

        if (aValue === bValue) return 0

        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1

        if (aValue > bValue) return order === "asc" ? 1 : -1
        if (aValue < bValue) return order === "asc" ? -1 : 1

        return 0
    })
}