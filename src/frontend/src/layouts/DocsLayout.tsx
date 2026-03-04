import { NavLink, Outlet } from "react-router-dom"
import { domainConfig } from "../config/domains"

const DocsLayout = () => {
    return (
        <div className="flex min-h-screen">

        <aside className="w-64 bg-gray-900 text-white p-6 space-y-6 overflow-y-auto">
            {Object.entries(domainConfig).map(([domainKey, domain]) => (
            <div key={domainKey}>
                <h2 className="text-sm uppercase text-gray-400 mb-2">
                {domain.title}
                </h2>

                <div className="flex flex-col space-y-1">
                {Object.entries(domain.entities).map(([entityKey, entity]) => (
                    <NavLink
                    key={entityKey}
                    to={`/docs/${domainKey}/${entityKey}`}
                    className={({ isActive }) =>
                        `px-3 py-2 rounded text-sm ${
                        isActive
                            ? "bg-blue-600"
                            : "hover:bg-gray-700 text-gray-300"
                        }`
                    }
                    >
                    {entity.title}
                    </NavLink>
                ))}
                </div>
            </div>
            ))}
        </aside>

        <div className="flex-1 bg-white">
            <Outlet />
        </div>
        </div>
    )
}

export default DocsLayout