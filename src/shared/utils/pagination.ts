export const paginate = <T>(data: T[], page = 1, limit = 10) => {
    const total = data.length
    const start = (page - 1) * limit
    const end = start + limit

    return {
        data: data.slice(start, end),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}