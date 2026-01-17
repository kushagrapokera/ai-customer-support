import type { Context, Next } from 'hono'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (error: Error, c: Context) => {
  console.error('Error caught by middleware:', error)

  if (error instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          message: error.message,
          statusCode: error.statusCode
        }
      },
      error.statusCode as any
    )
  }

  const isProduction = process.env.NODE_ENV === 'production'

  return c.json(
    {
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
        statusCode: 500,
        ...((!isProduction && error.stack) && { stack: error.stack })
      }
    },
    500
  )
}

export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      success: false,
      error: {
        message: 'Route not found',
        statusCode: 404,
        path: c.req.path
      }
    },
    404
  )
}
