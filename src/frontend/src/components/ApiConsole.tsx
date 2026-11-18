import { useState, useEffect } from "react"

interface ApiConsoleProps {
  endpoint: string
  /** Placeholder for the ID field, and the record used to pre-fill write bodies */
  exampleId: string
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const
type Method = (typeof METHODS)[number]

const NEEDS_ID: Method[] = ["PUT", "PATCH", "DELETE"]
const HAS_BODY: Method[] = ["POST", "PUT", "PATCH"]

const ApiConsole = ({ endpoint, exampleId }: ApiConsoleProps) => {
    const [method, setMethod] = useState<Method>("GET")
    const [id, setId] = useState("")
    const [query, setQuery] = useState("")
    const [body, setBody] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)

    // Clear inputs and response when endpoint changes
    useEffect(() => {
        setMethod("GET")
        setId("")
        setQuery("")
        setBody("")
        setResponse("")
    }, [endpoint])

    const path = `${endpoint}${id.trim() ? `/${encodeURIComponent(id.trim())}` : ""}`
    const isWrite = method !== "GET"

    // Pre-fill the body with the example record (minus server-owned fields) so writes work out of the box
    const prefillBody = async () => {
        try {
            const res = await fetch(`/api/v1${endpoint}/${encodeURIComponent(exampleId)}`)
            const json = await res.json()
            if (!json.success) return
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, createdAt: _createdAt, ...record } = json.data
            setBody(current => current || JSON.stringify(record, null, 2))
        } catch {
            // Leave the body empty; the user can type one
        }
    }

    const changeMethod = (next: Method) => {
        setMethod(next)
        if (NEEDS_ID.includes(next) && !id.trim()) setId(exampleId)
        if (next === "POST") setId("")
        if (HAS_BODY.includes(next) && !body.trim()) prefillBody()
    }

    const runRequest = async () => {
        if (NEEDS_ID.includes(method) && !id.trim()) {
            setResponse(`${method} needs an ID`)
            return
        }
        setLoading(true)
        try {
            const url = `/api/v1${path}${query ? `?${query}` : ""}`
            const sendBody = HAS_BODY.includes(method)
            const res = await fetch(url, {
                method,
                headers: sendBody ? { "Content-Type": "application/json" } : undefined,
                body: sendBody ? body || "{}" : undefined
            })
            const data = await res.json()
            setResponse(`HTTP ${res.status}\n\n${JSON.stringify(data, null, 2)}`)
        } catch {
            setResponse("Error fetching API")
        }
        setLoading(false)
    }

    return (
        <div className="border rounded-lg p-5 bg-white dark:bg-gray-900 dark:bg-gray-800 shadow space-y-4">
        <h3 className="text-xl font-semibold">Live API Console</h3>

        <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="api-console-method">Request</label>
            <div className="flex gap-2">
                <select
                id="api-console-method"
                className="border p-2 rounded font-mono bg-white dark:bg-gray-800"
                value={method}
                onChange={(e) => changeMethod(e.target.value as Method)}
                >
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="flex-1 border p-2 rounded bg-gray-100 font-mono dark:bg-gray-800 break-all">
                {path}
                </div>
            </div>
            {isWrite && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                Writes are simulated: the request is validated and the response is realistic, but nothing is saved.
                </p>
            )}
        </div>

        {method !== "POST" && (
            <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="api-console-id">
                {NEEDS_ID.includes(method) ? "ID" : "ID (optional, fetches one record)"}
                </label>
                <input
                id="api-console-id"
                className="border p-2 rounded w-full"
                placeholder={exampleId}
                value={id}
                onChange={(e) => setId(e.target.value)}
                />
            </div>
        )}

        {HAS_BODY.includes(method) && (
            <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="api-console-body">JSON Body</label>
                <textarea
                id="api-console-body"
                className="border p-2 rounded w-full font-mono text-sm h-48"
                spellCheck={false}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                />
            </div>
        )}

        <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="api-console-query">Query Parameters</label>
            <input
            id="api-console-query"
            className="border p-2 rounded w-full"
            placeholder={isWrite ? "delay=1000" : "page=1&limit=5"}
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
