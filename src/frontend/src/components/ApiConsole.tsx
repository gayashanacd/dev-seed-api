import  { useState } from "react"

const ApiConsole = () => {
    const [endpoint, setEndpoint] = useState("/users")
    const [query, setQuery] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)

    const runRequest = async () => {
        setLoading(true)

        try {
            const url = `/api/v1${endpoint}${query ? `?${query}` : ""}`
            const res = await fetch(url)
            const data = await res.json()

            setResponse(JSON.stringify(data, null, 2))
        } catch (err) {
            setResponse("Error fetching API")
        }

        setLoading(false)
    }

    return (
        <div id="examples" className="border rounded-lg p-5 bg-white shadow space-y-4">

        <h3 className="text-xl font-semibold">Live API Console</h3>

        <div className="space-y-2">
            <label className="block text-sm font-medium">Endpoint</label>

            <select
                className="border p-2 rounded w-full"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                >
                <option value="/users">GET /users</option>
            </select>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium">Query Parameters</label>

            <input
                className="border p-2 rounded w-full"
                placeholder="page=1&limit=5"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>

        <button
            onClick={runRequest}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            {loading ? "Loading..." : "Send Request"}
        </button>

        {response && (
            <div>
                <h4 className="font-semibold mb-2">Response</h4>

                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                    {response}
                </pre>
            </div>
        )}
        </div>
    )
}

export default ApiConsole