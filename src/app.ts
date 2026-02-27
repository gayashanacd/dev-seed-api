// generate express app instance
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"    

import { notFoundMiddleware } from "./shared/middleware/notFound.middleware"
import { errorMiddleware } from "./shared/middleware/error.middleware"

import coreModule from "./core/core.module"

const app = express()

// middlewares
app.use(cors())
app.use(bodyParser.json())  
app.use(bodyParser.urlencoded({ extended: true }))

// health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

// core module routes
app.use("/api/v1", coreModule)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app