import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import path from "path"

import { notFoundMiddleware } from "./api/shared/middleware/notFound.middleware"
import { errorMiddleware } from "./api/shared/middleware/error.middleware"

import ecommerceRoutes from "./api/packs/ecommerce/routes/ecommerce.routes"
import coreModule from "./api/core/core.module"

const app = express()

// Middlewares
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

// API Routes
app.use("/api/v1", coreModule)
app.use("/api/v1/ecommerce", ecommerceRoutes)

// Serve React SPA
const buildPath = path.join(__dirname, "../src/frontend/dist")

// Serve static files
app.use(express.static(buildPath))

// SPA fallback for non-API routes
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(buildPath, "index.html"))
  } else {
    next()
  }
})

// Error & 404 Middlewares
app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app