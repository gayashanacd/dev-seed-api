export const simulateError = (errorCode?: number) => {
    if (!errorCode) return

    const error: any = new Error("Simulated API Error")
    error.statusCode = Number(errorCode)

    throw error
}