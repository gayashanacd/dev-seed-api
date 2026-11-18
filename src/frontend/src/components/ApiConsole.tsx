import { useState, useEffect } from "react"

interface ApiConsoleProps {
  endpoint: string
  /** Placeholder for the optional ID field */
  exampleId: string
}

const ApiConsole = ({ endpoint, exampleId }: ApiConsoleProps) => {
    const [id, setId] = useState("")
    const [query, setQuery] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)

    // Clear inputs and response when endpoint changes
    useEffect(() => {
        setId("")
        setQuery("")
        setResponse("")
    }, [endpoint])

    const path = `${endpoint}${id.trim() ? `/${encodeURIComponent(id.trim())}` : ""}`

    const runRequest = async () => {
        setLoading(true)
        try {
        const url = `/api/v1${path}${query ? `?${query}` : ""}`
        const res = await fetch(url)
        const data = await res.json()
        setResponse(JSON.stringify(data, null, 2))
        } catch (err) {
        setResponse("Error fetching API")
        }
        setLoading(false)
    }

    return (
        <div className="border rounded-lg p-5 bg-white dark:bg-gray-900 dark:bg-gray-800 shadow space-y-4">
        <h3 className="text-xl font-semibold">Live API Console</h3>

        <div className="space-y-2">
            <label className="block text-sm font-medium">Endpoint</label>
            <div className="border p-2 rounded bg-gray-100 font-mono dark:bg-gray-800">
            GET {path}
            </div>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="api-console-id">ID (optional, fetches one record)</label>
            <input
            id="api-console-id"
            className="border p-2 rounded w-full"
            placeholder={exampleId}
            value={id}
            onChange={(e) => setId(e.target.value)}
            />
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
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto dark:bg-gray-800">
                {response}
            </pre>
            </div>
        )}
        </div>
    )
}

export default ApiConsole