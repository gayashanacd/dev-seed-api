export const randomError = (errorRate?: number) => {
    if (!errorRate) return

    const chance = Math.random() * 100

    if (chance < errorRate) {
        const error: any = new Error("Random API Failure")
        error.statusCode = 500
        throw error
    }
}