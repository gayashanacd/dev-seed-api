import { useParams } from "react-router-dom"
import { domainConfig, type EntityConfig } from "../config/domains"
import CodeBlock from "../components/CodeBlock"
import ApiConsole from "../components/ApiConsole"

const Docs = () => {
  const { domain, entity } = useParams()

  const selectedDomain = domain ? domainConfig[domain] : undefined
  const config: EntityConfig | undefined =
    selectedDomain && entity
      ? selectedDomain.entities[entity]
      : undefined

  if (!config) {
    return (
      <main className="container mx-auto p-10 dark:bg-gray-900 dark:text-gray-100">
        <h2 className="text-2xl font-bold">Documentation not found</h2>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-6 space-y-10 dark:bg-gray-900 dark:text-gray-100">

      {/* Intro */}
      <section>
        <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
        <p className="text-gray-600 dark:text-gray-300">
          DevSeed API provides mock REST endpoints for frontend developers.
          Use these APIs to build and test applications without needing a real backend.
        </p>
      </section>

      {/* Base URL */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Base URL</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono">
          /api/v1
        </div>
      </section>

      {/* Domain Entity */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{config.title}</h2>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono mb-4">
          GET {config.endpoint}
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">{config.description}</p>

        {/* Query Parameters */}
        <h3 className="text-xl font-semibold mb-2">Query Parameters</h3>
        <div className="overflow-x-auto">
          <table className="w-full border text-left">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-2 border dark:border-gray-600">Parameter</th>
                <th className="p-2 border dark:border-gray-600">Type</th>
                <th className="p-2 border dark:border-gray-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {config.fields.map((f) => (
                <tr
                  key={f.name}
                  className={`${
                    ["delay", "error", "errorRate"].includes(f.name)
                      ? "bg-yellow-50 dark:bg-yellow-900"
                      : ""
                  }`}
                >
                  <td className="p-2 border dark:border-gray-600">{f.name}</td>
                  <td className="p-2 border dark:border-gray-600">{f.type}</td>
                  <td className="p-2 border dark:border-gray-600">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Example Requests */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Example Requests</h2>
        <div className="space-y-4">

          {/* GET all */}
          <div>
            <p className="font-semibold">Get all {config.endpointName}</p>
            <CodeBlock code={`GET ${config.endpoint}`} />
          </div>

          {config.fields.some(f => f.name === "limit") && (
            <div>
              <p className="font-semibold">Pagination</p>
              <CodeBlock code={`GET ${config.endpoint}?page=2&limit=10`} />
            </div>
          )}

          {config.fields.some(f => f.name === "search") && (
            <div>
              <p className="font-semibold">Search {config.endpointName}</p>
              <CodeBlock code={`GET ${config.endpoint}?search=john`} />
            </div>
          )}

          {config.fields.some(f => f.name === "filter") && (
            <div>
              <p className="font-semibold">Filter {config.endpointName}</p>
              <CodeBlock code={`GET ${config.endpoint}?filter=value`} />
            </div>
          )}

          {config.fields.some(f => f.name === "sort") && (
            <div>
              <p className="font-semibold">Sort {config.endpointName}</p>
              <CodeBlock code={`GET ${config.endpoint}?sortBy=field&order=asc`} />
            </div>
          )}

          {config.fields.some(f => f.name === "delay") && (
            <div>
              <p className="font-semibold">Simulate slow API</p>
              <CodeBlock code={`GET ${config.endpoint}?delay=2000`} />
            </div>
          )}

          {config.fields.some(f => f.name === "error") && (
            <div>
              <p className="font-semibold">Force an error</p>
              <CodeBlock code={`GET ${config.endpoint}?error=500`} />
            </div>
          )}

          {config.fields.some(f => f.name === "errorRate") && (
            <div>
              <p className="font-semibold">Random API failures (20%)</p>
              <CodeBlock code={`GET ${config.endpoint}?errorRate=20`} />
            </div>
          )}

        </div>
      </section>

      {/* Try API */}
      <section id="try-api">
        <h2 className="text-2xl font-semibold mb-4">Try the API</h2>
        <ApiConsole endpoint={config.endpoint} />
      </section>

    </main>
  )
}

export default Docs