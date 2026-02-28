export const searchData = <T>(data: T[], searchQuery: string, fields: (keyof T)[]) => {
    if (!searchQuery) return data

    const q = searchQuery.toLowerCase()
    return data.filter(item =>
        fields.some(field =>
            item[field]?.toString().toLowerCase().includes(q)
        )
    )
}