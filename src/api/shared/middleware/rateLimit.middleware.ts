import rateLimit from "express-rate-limit"

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later."
    }
})