import { domainConfig } from "./config/domains"

/**
 * Single source of truth for page metadata. Used in two places:
 * - at build time by scripts/prerender.mjs (via entry-server.tsx) to write real <head> tags
 *   into each prerendered HTML file, and to generate sitemap.xml
 * - in the browser by <Seo /> to keep tags in sync on client-side navigation
 */

export const SITE_URL = "https://www.devseedapi.com"
export const SITE_NAME = "DevSeed API"
export const OG_IMAGE = `${SITE_URL}/og-image.png`
export const NOT_FOUND_PATH = "/404"

export interface PageMeta {
    title: string
    description: string
    /** Canonical path; undefined for pages that must not be indexed */
    path?: string
    noindex?: boolean
    jsonLd?: Record<string, unknown>
}

const HOME_DESCRIPTION =
    "Free mock REST APIs with realistic users, e-commerce and SaaS data for frontend developers. " +
    "Filtering, sorting, relations, simulated writes and error simulation built in. No signup."

const HOME: PageMeta = {
    title: "DevSeed API – Free Realistic Mock APIs for Frontend Developers",
    description: HOME_DESCRIPTION,
    path: "/",
    jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        description: HOME_DESCRIPTION,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
    }
}

const NOT_FOUND: PageMeta = {
    title: `Page not found | ${SITE_NAME}`,
    description: "The page you are looking for does not exist.",
    noindex: true
}

export const docsPath = (domain: string, entity: string) => `/docs/${domain}/${entity}`

export const getPageMeta = (pathname: string): PageMeta => {
    const path = pathname.replace(/\/+$/, "") || "/"
    if (path === "/") return HOME

    const match = path.match(/^\/docs\/([^/]+)\/([^/]+)$/)
    const domain = match ? domainConfig[match[1]] : undefined
    const entity = match && domain ? domain.entities[match[2]] : undefined
    if (!match || !entity) return NOT_FOUND

    const label = domain!.label
    return {
        title: `${entity.title} API – Free Mock ${label} Data | ${SITE_NAME}`,
        description:
            `Free fake ${entity.title.toLowerCase()} REST API for frontend developers. ${entity.description} ` +
            "Pagination, filtering, sorting, simulated writes and error simulation. No signup.",
        path
    }
}

/** Every indexable route, in sitemap order */
export const getIndexableRoutes = (): string[] => [
    "/",
    ...Object.entries(domainConfig).flatMap(([domainKey, domain]) =>
        Object.keys(domain.entities).map(entityKey => docsPath(domainKey, entityKey))
    )
]

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")

/** Tags managed by <Seo /> on the client carry data-seo so they can be found and updated */
export const renderHeadTags = (meta: PageMeta): string => {
    const t = escapeHtml(meta.title)
    const d = escapeHtml(meta.description)
    const url = meta.path ? `${SITE_URL}${meta.path === "/" ? "/" : meta.path}` : undefined

    const tags = [
        `<title>${t}</title>`,
        `<meta data-seo name="description" content="${d}" />`,
        `<meta data-seo name="robots" content="${meta.noindex ? "noindex, follow" : "index, follow"}" />`,
        url ? `<link data-seo rel="canonical" href="${url}" />` : "",
        `<meta data-seo property="og:type" content="website" />`,
        `<meta data-seo property="og:site_name" content="${SITE_NAME}" />`,
        `<meta data-seo property="og:title" content="${t}" />`,
        `<meta data-seo property="og:description" content="${d}" />`,
        url ? `<meta data-seo property="og:url" content="${url}" />` : "",
        `<meta data-seo property="og:image" content="${OG_IMAGE}" />`,
        `<meta data-seo property="og:image:width" content="1200" />`,
        `<meta data-seo property="og:image:height" content="630" />`,
        `<meta data-seo name="twitter:card" content="summary_large_image" />`,
        `<meta data-seo name="twitter:title" content="${t}" />`,
        `<meta data-seo name="twitter:description" content="${d}" />`,
        `<meta data-seo name="twitter:image" content="${OG_IMAGE}" />`,
        // JSON.stringify output is safe in <script> once "<" is escaped
        meta.jsonLd
            ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`
            : ""
    ]

    return tags.filter(Boolean).join("\n    ")
}
