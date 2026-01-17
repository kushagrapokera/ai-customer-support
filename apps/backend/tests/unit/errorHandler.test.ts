import { describe, it, expect } from 'vitest'
import { AppError } from '../../src/middleware/errorHandler.js'

describe('Error Handler', () => {
    it('should create AppError with correct status code', () => {
        const error = new AppError('Test error', 400)

        expect(error.message).toBe('Test error')
        expect(error.statusCode).toBe(400)
        expect(error.isOperational).toBe(true)
    })

    it('should default to 500 status code', () => {
        const error = new AppError('Internal error')

        expect(error.statusCode).toBe(500)
    })

    it('should be instance of Error', () => {
        const error = new AppError('Test error', 404)

        expect(error).toBeInstanceOf(Error)
        expect(error).toBeInstanceOf(AppError)
    })

    it('should have stack trace', () => {
        const error = new AppError('Test error', 400)

        expect(error.stack).toBeDefined()
    })
})
