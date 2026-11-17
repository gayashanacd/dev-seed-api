import { Request } from "express"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"

/**
 * Production traffic arrives Client → Cloudflare → Render proxy → Express, so the
 * socket address (and even `req.ip` with `trust proxy`) is a proxy, not the user.
 * Cloudflare puts the real client IP in `CF-Connecting-IP`; fall back to `req.ip`
 * for requests that bypass Cloudflare (e.g. the *.onrender.com URL or local dev).
 *
 * Note: a client hitting the Render URL directly could spoof this header. That only
 * lets them dodge the rate limit on mock data, which is an acceptable trade-off.
 */
export const clientKey = (req: Request): string => {
    const cfIp = req.get("cf-connecting-ip")?.trim()
    return ipKeyGenerator(cfIp || req.ip || "unknown")
}

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each client to 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: clientKey,
    message: {
        success: false,
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later."
    }
})
