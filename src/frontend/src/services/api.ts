export const API_BASE = "/api/v1"

export const fetchUsers = async () => {
    const res = await fetch(`${API_BASE}/users`)
    if (!res.ok) throw new Error("Failed to fetch users")
    return res.json()
}