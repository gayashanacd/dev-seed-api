export const delay = async (ms?: number) => {
    if (!ms || ms <= 0) return

    await new Promise(resolve => setTimeout(resolve, ms))
}