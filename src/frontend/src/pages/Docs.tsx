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
        <h1 className="text-2xl font-bold">Documentation not found</h1>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-6 space-y-10 dark:bg-gray-900 dark:text-gray-100">

      {/* Intro */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{config.title} API</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {config.description} A free mock REST endpoint from DevSeed API for building and
            testing frontend applications without a real backend.
          </p>
        </div>

        {/* Quick navigation link with smooth scroll */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => {
              const target = document.getElementById("try-api")
              if (target) {
                target.scrollIntoView({ behavior: "smooth" })
              }
            }}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Try API
          </button>
        </div>
      </section>

      {/* Base URL */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Base URL</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono">
          {selectedDomain?.baseUrl}
        </div>
      </section>

      {/* Domain Entity */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono mb-2">
          GET {config.endpoint}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{config.description}</p>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono mb-2">
          GET {config.endpoint}/:id
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Returns a single record as <code>{"{ success, data }"}</code>, or a 404 if the id doesn't
          exist. Supports {config.includeKeys.length > 0 ? "include and " : ""}the simulation
          parameters below.
        </p>

        <h3 className="text-xl font-semibold mb-2">Write endpoints (simulated)</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono mb-2 space-y-1">
          <div>POST {config.endpoint}</div>
          <div>PUT {config.endpoint}/:id</div>
          <div>PATCH {config.endpoint}/:id</div>
          <div>DELETE {config.endpoint}/:id</div>
        </div>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>
            Writes behave like a real API but <strong>nothing is saved</strong>: the response shows the
            record the write would produce, and later reads are unchanged.
          </li>
          <li>
            Send JSON (<code>Content-Type: application/json</code>) with the same fields as a record.
            <code> id</code> and <code>createdAt</code> are set by the server and ignored if you send them.
          </li>
          <li>
            <code>POST</code> returns <code>201</code>. <code>PUT</code> needs a full record,{" "}
            <code>PATCH</code> only the fields to change (nested objects are merged), and{" "}
            <code>DELETE</code> returns the deleted record.
          </li>
          <li>
            Invalid bodies return <code>422</code> with an <code>errors</code> list (missing or unknown
            fields, wrong types, ids that point at missing records). An unknown id returns <code>404</code>.
            The simulation parameters work on writes too.
          </li>
        </ul>

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

          <div>
            <p className="font-semibold">Get one by ID</p>
            <CodeBlock code={`GET ${config.endpoint}/${config.exampleId}`} />
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

          {config.includeKeys.length > 0 && (
            <div>
              <p className="font-semibold">Include Related Data</p>
              <CodeBlock code={`GET ${config.endpoint}?include=${config.includeKeys.join(",")}`} />
              <CodeBlock code={`GET ${config.endpoint}/${config.exampleId}?include=${config.includeKeys.join(",")}`} />
            </div>
          )}

          <div>
            <p className="font-semibold">Create (simulated)</p>
            <CodeBlock code={`POST ${config.endpoint}\nContent-Type: application/json\n\n{ ...fields of a ${config.endpointName} record }`} />
          </div>

          <div>
            <p className="font-semibold">Update fields (simulated)</p>
            <CodeBlock code={`PATCH ${config.endpoint}/${config.exampleId}\nContent-Type: application/json\n\n{ ...only the fields to change }`} />
          </div>

          <div>
            <p className="font-semibold">Delete (simulated)</p>
            <CodeBlock code={`DELETE ${config.endpoint}/${config.exampleId}`} />
          </div>

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
        <ApiConsole endpoint={config.endpoint} exampleId={config.exampleId} />
      </section>

    </main>
  )
}

export default Docs