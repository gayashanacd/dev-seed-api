import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom"
import { AppShell } from "./App"

/** Build-time only: renders a route to HTML for scripts/prerender.mjs */
export const render = (url: string) =>
    renderToString(
        <StrictMode>
            <StaticRouter location={url}>
                <AppShell />
            </StaticRouter>
        </StrictMode>
    )

export { getIndexableRoutes, getPageMeta, renderHeadTags, SITE_URL, NOT_FOUND_PATH } from "./seo"
