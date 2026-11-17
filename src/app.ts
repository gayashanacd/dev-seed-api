import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import path from "path"

import { notFoundMiddleware } from "./api/shared/middleware/notFound.middleware"
import { errorMiddleware } from "./api/shared/middleware/error.middleware"

import apiModule from "./api/api.module"
import { apiLimiter } from "./api/shared/middleware/rateLimit.middleware"
import { requestLogMiddleware } from "./api/shared/middleware/requestLog.middleware"

const app = express()

// Behind Render's proxy: trust one hop so req.ip is the connecting client, not the proxy.
// (Cloudflare's client IP is read separately from CF-Connecting-IP in the rate limiter.)
app.set("trust proxy", 1)

// Middlewares
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Apply rate limiting ONLY to API
app.use("/api/v1", requestLogMiddleware, apiLimiter, apiModule)

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

// ---- Frontend (prerendered React site, see src/frontend/scripts/prerender.mjs) ----
// FRONTEND_DIST lets tests point at a fixture build.
const buildPath = process.env.FRONTEND_DIST || path.join(__dirname, "../src/frontend/dist")

// Canonical URLs have no trailing slash: /docs/core/users/ -> /docs/core/users
app.use((req, res, next) => {
  if ((req.method === "GET" || req.method === "HEAD") && req.path.length > 1 && req.path.endsWith("/") && !req.path.startsWith("/api")) {
    const query = req.originalUrl.slice(req.path.length)
    return res.redirect(301, req.path.replace(/\/+$/, "") + query)
  }
  next()
})

app.get("/docs", (_req, res) => res.redirect(301, "/docs/core/users"))

// Hashed build assets never change: cache for a year
app.use("/assets", express.static(path.join(buildPath, "assets"), { immutable: true, maxAge: "1y", fallthrough: false }))

// Prerendered pages: /docs/core/users -> docs/core/users.html. HTML is revalidated on every request
// so deploys show up immediately.
app.use(express.static(buildPath, {
  extensions: ["html"],
  redirect: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache")
  }
}))

// Any other non-API page: real 404 status with the prerendered "not found" page
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || (req.method !== "GET" && req.method !== "HEAD")) return next()
  res.status(404).setHeader("Cache-Control", "no-cache")
  res.sendFile(path.join(buildPath, "404.html"), err => {
    if (err) next() // frontend not built (e.g. backend-only dev): fall back to JSON 404
  })
})

// Error & 404 Middlewares
app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app