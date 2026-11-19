import { useState } from "react"
import { NavLink, Outlet, useParams } from "react-router-dom"
import { domainConfig } from "../config/domains"

const DEFAULT_EXPANDED = "core"

const DocsLayout = () => {
    const { domain: activeDomain } = useParams()

    // Accordion: at most one domain open. Deterministic first render (SSR-safe):
    // the current page's domain, or Core.
    const [expanded, setExpanded] = useState<string | null>(activeDomain ?? DEFAULT_EXPANDED)

    // Open the active page's domain when navigating into another domain.
    const [prevDomain, setPrevDomain] = useState(activeDomain)
    if (activeDomain !== prevDomain) {
        setPrevDomain(activeDomain)
        if (activeDomain) setExpanded(activeDomain)
    }

    const toggle = (domainKey: string) => {
        setExpanded(prev => (prev === domainKey ? null : domainKey))
    }

    return (
        <div className="flex min-h-screen ">

            <aside className="w-64 bg-gray-900 text-white p-6 space-y-4 overflow-y-auto">
                {Object.entries(domainConfig).map(([domainKey, domain]) => {
                    const isOpen = expanded === domainKey
                    const listId = `nav-${domainKey}`
                    return (
                        <div key={domainKey}>
                            <button
                                type="button"
                                onClick={() => toggle(domainKey)}
                                aria-expanded={isOpen}
                                aria-controls={listId}
                                className="w-full flex items-center justify-between text-sm uppercase text-gray-400 hover:text-gray-200 mb-2 cursor-pointer"
                            >
                                <span>{domain.title}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.17 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <div id={listId} hidden={!isOpen} className="flex flex-col space-y-1">
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
                    )
                })}
            </aside>

            <div className="flex-1 bg-white dark:bg-gray-900 dark:text-gray-100">
                <Outlet />
            </div>
        </div>
    )
}

export default DocsLayout
