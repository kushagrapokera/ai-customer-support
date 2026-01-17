import { describe, it, expect } from 'vitest'

const API_BASE = 'http://localhost:3000'

describe('API Endpoints', () => {
    it('should return health status', async () => {
        const response = await fetch(`${API_BASE}/api/health`)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.status).toBe('ok')
    })

    it('should list all agents', async () => {
        const response = await fetch(`${API_BASE}/api/agents`)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toBeDefined()
        expect(data.data.length).toBe(3)
    })

    it('should get agent capabilities', async () => {
        const response = await fetch(`${API_BASE}/api/agents/order/capabilities`)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.type).toBe('order')
        expect(data.data.tools).toBeDefined()
    })

    it('should return 400 for invalid agent type', async () => {
        const response = await fetch(`${API_BASE}/api/agents/invalid/capabilities`)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error.message).toContain('Invalid agent type')
    })

    it('should return 404 for non-existent routes', async () => {
        const response = await fetch(`${API_BASE}/api/nonexistent`)
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.success).toBe(false)
    })
})
