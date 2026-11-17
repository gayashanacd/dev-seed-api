import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { getPageMeta, OG_IMAGE, SITE_NAME, SITE_URL } from "../seo"

type Attr = "name" | "property"

const setMeta = (attr: Attr, key: string, content: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (!el) {
        el = document.createElement("meta")
        el.setAttribute(attr, key)
        el.setAttribute("data-seo", "")
        document.head.appendChild(el)
    }
    el.content = content
}

const setCanonical = (href: string | undefined) => {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!href) {
        el?.remove()
        return
    }
    if (!el) {
        el = document.createElement("link")
        el.rel = "canonical"
        el.setAttribute("data-seo", "")
        document.head.appendChild(el)
    }
    el.href = href
}

/**
 * Keeps <head> tags in sync on client-side navigation. The initial tags for each route
 * are written into the HTML at build time (scripts/prerender.mjs), so crawlers don't
 * depend on this running. Renders nothing, so it can't cause hydration mismatches.
 */
const Seo = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        const meta = getPageMeta(pathname)
        const url = meta.path ? `${SITE_URL}${meta.path}` : undefined

        document.title = meta.title
        setMeta("name", "description", meta.description)
        setMeta("name", "robots", meta.noindex ? "noindex, follow" : "index, follow")
        setCanonical(url)
        setMeta("property", "og:type", "website")
        setMeta("property", "og:site_name", SITE_NAME)
        setMeta("property", "og:title", meta.title)
        setMeta("property", "og:description", meta.description)
        if (url) setMeta("property", "og:url", url)
        setMeta("property", "og:image", OG_IMAGE)
        setMeta("name", "twitter:card", "summary_large_image")
        setMeta("name", "twitter:title", meta.title)
        setMeta("name", "twitter:description", meta.description)
        setMeta("name", "twitter:image", OG_IMAGE)
    }, [pathname])

    return null
}

export default Seo
