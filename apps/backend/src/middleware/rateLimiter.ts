import { rateLimiter } from 'hono-rate-limiter'

export const chatRateLimiter = rateLimiter({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-6',
    keyGenerator: (c) => {
        return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anonymous'
    },
    handler: (c) => {
        return c.json({
            success: false,
            error: {
                message: 'Too many requests. Please try again later.',
                statusCode: 429,
                retryAfter: 60
            }
        }, 429)
    }
})
