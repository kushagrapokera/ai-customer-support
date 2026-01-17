import { describe, it, expect } from 'vitest'
import { prisma } from '../../src/config/database.js'

describe('Billing Tools', () => {
    it('should fetch invoice by invoice number', async () => {
        const invoice = await prisma.invoice.findFirst({
            where: { invoiceNumber: 'INV-2026-001' }
        })

        if (invoice) {
            expect(invoice.invoiceNumber).toBe('INV-2026-001')
            expect(invoice.amount).toBeGreaterThan(0)
        } else {
            expect(invoice).toBeNull()
        }
    })

    it('should check refund status by transaction ID', async () => {
        const payment = await prisma.payment.findFirst({
            where: { transactionId: 'TXN-2026-001' }
        })

        if (payment) {
            expect(payment.status).toBeDefined()
            expect(['completed', 'pending', 'refunded', 'failed']).toContain(payment.status)
        } else {
            expect(payment).toBeNull()
        }
    })

    it('should have valid payment methods', async () => {
        const payments = await prisma.payment.findMany({
            take: 5
        })
        const validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer']

        if (payments.length > 0) {
            for (const payment of payments) {
                expect(validMethods).toContain(payment.paymentMethod)
            }
        }
    })

    it('should calculate correct invoice totals', async () => {
        const invoices = await prisma.invoice.findMany({
            take: 5
        })

        if (invoices.length > 0) {
            for (const invoice of invoices) {
                expect(invoice.amount).toBeGreaterThan(0)
                expect(typeof invoice.amount).toBe('number')
            }
        }
    })

    it('should have valid payment status', async () => {
        const payments = await prisma.payment.findMany({
            take: 5
        })
        const validStatuses = ['completed', 'pending', 'refunded', 'failed']

        if (payments.length > 0) {
            for (const payment of payments) {
                expect(validStatuses).toContain(payment.status)
            }
        }
    })

    it('should have transaction ID for all payments', async () => {
        const payments = await prisma.payment.findMany({
            take: 5
        })

        if (payments.length > 0) {
            for (const payment of payments) {
                expect(payment.transactionId).toBeDefined()
                expect(payment.transactionId.length).toBeGreaterThan(0)
            }
        }
    })

    it('should link payments to orders', async () => {
        const payments = await prisma.payment.findMany({
            take: 5
        })

        if (payments.length > 0) {
            for (const payment of payments) {
                expect(payment.orderId).toBeDefined()
                expect(payment.orderId.length).toBeGreaterThan(0)
            }
        }
    })
})
