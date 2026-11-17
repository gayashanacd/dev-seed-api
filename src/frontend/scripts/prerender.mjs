// Build step: turns the client build in dist/ into one static HTML file per route,
// with real content and per-page <head> tags, plus 404.html and sitemap.xml.
// Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx` (dist-ssr/).
//
// Output layout (served by Express with `extensions: ["html"]`):
//   /                    -> dist/index.html
//   /docs/core/users     -> dist/docs/core/users.html
//   unknown paths        -> dist/404.html (served with HTTP 404)

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const distDir = path.join(root, "dist")
const ssrDir = path.join(root, "dist-ssr")

const ssrEntry = path.join(ssrDir, "entry-server.js")
const { render, getIndexableRoutes, getPageMeta, renderHeadTags, SITE_URL, NOT_FOUND_PATH } =
    await import(pathToFileURL(ssrEntry).href)

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf8")
const HEAD_RE = /<!--seo-head-->[\s\S]*?<!--\/seo-head-->/
const ROOT_TAG = '<div id="root"></div>'
if (!HEAD_RE.test(template) || !template.includes(ROOT_TAG)) {
    throw new Error("index.html is missing the <!--seo-head--> markers or the empty #root div")
}

const renderPage = url => {
    const head = renderHeadTags(getPageMeta(url))
    const appHtml = render(url)
    return template
        .replace(HEAD_RE, () => head)
        .replace(ROOT_TAG, () => `<div id="root">${appHtml}</div>`)
}

const outFile = route =>
    route === "/" ? path.join(distDir, "index.html") : path.join(distDir, `${route.slice(1)}.html`)

const routes = getIndexableRoutes()
for (const route of routes) {
    const file = outFile(route)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, renderPage(route))
}

fs.writeFileSync(path.join(distDir, "404.html"), renderPage(NOT_FOUND_PATH))

const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map(route => `  <url><loc>${SITE_URL}${route}</loc></url>`),
    "</urlset>",
    ""
].join("\n")
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap)

fs.rmSync(ssrDir, { recursive: true, force: true })

console.log(`Prerendered ${routes.length} routes + 404.html, wrote sitemap.xml`)
