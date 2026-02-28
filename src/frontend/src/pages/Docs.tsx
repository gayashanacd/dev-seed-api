import ApiConsole from "../components/ApiConsole"
import CodeBlock from "../components/CodeBlock"

const Docs = () => {
    return (
        <main id="docs" className="container mx-auto p-6 space-y-10">

        <section>
            <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
            <p className="text-gray-600">
                DevSeed API provides mock REST endpoints for frontend developers.
                Use these APIs to build and test applications without needing a real backend.
            </p>
        </section>

        {/* Base URL */}
        <section>
            <h2 className="text-2xl font-semibold mb-3">Base URL</h2>
            <div className="bg-gray-100 p-3 rounded font-mono">
                /api/v1
            </div>
        </section>

        {/* Users Endpoint */}
        <section>
            <h2 className="text-2xl font-semibold mb-4">Users Endpoint</h2>

            <div className="bg-gray-100 p-3 rounded font-mono mb-4">
                GET /users
            </div>

            <p className="text-gray-600 mb-4">
                Returns a list of users. Supports pagination, search, and filtering.
            </p>

            {/* Query Parameters */}
            <h3 className="text-xl font-semibold mb-2">Query Parameters</h3>

            <div className="overflow-x-auto">
            <table className="w-full border text-left">
                <thead className="bg-gray-200">
                <tr>
                    <th className="p-2 border">Parameter</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Description</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td className="p-2 border">page</td>
                    <td className="p-2 border">number</td>
                    <td className="p-2 border">Page number for pagination</td>
                </tr>
                <tr>
                    <td className="p-2 border">limit</td>
                    <td className="p-2 border">number</td>
                    <td className="p-2 border">Number of results per page</td>
                </tr>
                <tr>
                    <td className="p-2 border">search</td>
                    <td className="p-2 border">string</td>
                    <td className="p-2 border">Search users by first name or last name</td>
                </tr>
                <tr>
                    <td className="p-2 border">role</td>
                    <td className="p-2 border">string</td>
                    <td className="p-2 border">Filter users by role (admin or customer)</td>
                </tr>
                </tbody>
            </table>
            </div>
        </section>

        {/* Example Requests */}
        <section>
            <h2 className="text-2xl font-semibold mb-4">Example Requests</h2>

            <div className="space-y-4">

            <div>
                <p className="font-semibold">Get all users</p>
                <CodeBlock code={`GET /api/v1/users`} />
            </div>

            <div>
                <p className="font-semibold">Pagination</p>
                <CodeBlock code={`GET /api/v1/users?page=3&limit=10`} />
            </div>

            <div>
                <p className="font-semibold">Filter by role</p>
                <CodeBlock code={`GET /api/v1/users?role=admin`} />
            </div>

            <div>
                <p className="font-semibold">Search users</p>
                <CodeBlock code={`GET /api/v1/users?search=john`} />
            </div>

            </div>
        </section>

        {/* Example Response */}
        <section>
            <h2 className="text-2xl font-semibold mb-4">Example Response</h2>

            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
    {`{
    "page": 1,
    "limit": 10,
    "total": 25,
    "data": [
        {
        "id": "u1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "customer",
        "createdAt": "2026-01-01T10:00:00Z"
        }
    ]
    }`}
            </pre>

        </section>
        <section>
            <h2 className="text-2xl font-semibold mb-4">Try the API</h2>
            <ApiConsole />
        </section>

        </main>
    )
}

export default Docs