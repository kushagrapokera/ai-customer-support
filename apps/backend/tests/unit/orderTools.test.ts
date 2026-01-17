import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '../../src/config/database.js'

describe('Order Tools', () => {
    beforeAll(async () => {
        console.log('Setting up order tools tests...')
    })

    it('should fetch order details by order number', async () => {
        const order = await prisma.order.findFirst({
            where: { orderNumber: 'ORD-2026-001' }
        })

        expect(order).toBeDefined()
        expect(order?.orderNumber).toBe('ORD-2026-001')
        expect(order?.status).toBeDefined()
        expect(order?.totalAmount).toBeGreaterThan(0)
    })

    it('should return null for non-existent order', async () => {
        const order = await prisma.order.findFirst({
            where: { orderNumber: 'ORD-9999-999' }
        })

        expect(order).toBeNull()
    })

    it('should have valid order status', async () => {
        const orders = await prisma.order.findMany()
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

        expect(orders.length).toBeGreaterThan(0)

        for (const order of orders) {
            expect(validStatuses).toContain(order.status)
        }
    })

    it('should have tracking number for shipped orders', async () => {
        const shippedOrders = await prisma.order.findMany({
            where: { status: 'shipped' }
        })

        for (const order of shippedOrders) {
            expect(order.trackingNumber).toBeDefined()
            expect(order.trackingNumber).not.toBe('')
            expect(order.trackingNumber).not.toBeNull()
        }
    })

    it('should have valid order amounts', async () => {
        const orders = await prisma.order.findMany()

        for (const order of orders) {
            expect(order.totalAmount).toBeGreaterThan(0)
            expect(typeof order.totalAmount).toBe('number')
        }
    })

    it('should have user ID for all orders', async () => {
        const orders = await prisma.order.findMany()

        for (const order of orders) {
            expect(order.userId).toBeDefined()
            expect(order.userId.length).toBeGreaterThan(0)
        }
    })

    it('should have valid shipping address', async () => {
        const orders = await prisma.order.findMany()

        for (const order of orders) {
            expect(order.shippingAddress).toBeDefined()
            expect(order.shippingAddress.length).toBeGreaterThan(0)
        }
    })

    it('should have items field', async () => {
        const orders = await prisma.order.findMany()

        for (const order of orders) {
            expect(order.items).toBeDefined()
            expect(order.items.length).toBeGreaterThan(0)
        }
    })

    it('should have timestamps for orders', async () => {
        const orders = await prisma.order.findMany()

        for (const order of orders) {
            expect(order.createdAt).toBeInstanceOf(Date)
            expect(order.updatedAt).toBeInstanceOf(Date)
        }
    })
})
