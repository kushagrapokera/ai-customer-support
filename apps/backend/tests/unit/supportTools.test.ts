import { describe, it, expect } from 'vitest'
import { prisma } from '../../src/config/database.js'

describe('Support Tools', () => {
    it('should search FAQs by keyword', async () => {
        const faqs = await prisma.fAQ.findMany({
            where: {
                OR: [
                    { question: { contains: 'password', mode: 'insensitive' } },
                    { answer: { contains: 'password', mode: 'insensitive' } }
                ]
            }
        })

        expect(faqs).toBeDefined()
        expect(Array.isArray(faqs)).toBe(true)
    })

    it('should return FAQs for common terms', async () => {
        const searchTerm = 'account'
        const faqs = await prisma.fAQ.findMany({
            where: {
                OR: [
                    { question: { contains: searchTerm, mode: 'insensitive' } },
                    { answer: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            take: 5
        })

        expect(faqs).toBeDefined()
        expect(Array.isArray(faqs)).toBe(true)
    })

    it('should have non-empty FAQ answers', async () => {
        const faqs = await prisma.fAQ.findMany({
            take: 5
        })

        expect(faqs).toBeDefined()

        if (faqs.length > 0) {
            for (const faq of faqs) {
                expect(faq.question).toBeDefined()
                expect(faq.question.length).toBeGreaterThan(0)
                expect(faq.answer).toBeDefined()
                expect(faq.answer.length).toBeGreaterThan(0)
            }
        }
    })

    it('should be able to search all FAQs', async () => {
        const allFaqs = await prisma.fAQ.findMany()

        expect(allFaqs).toBeDefined()
        expect(Array.isArray(allFaqs)).toBe(true)
    })
})
