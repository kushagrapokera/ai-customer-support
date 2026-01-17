// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\tools\supportTools.ts
import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const searchFAQTool = tool({
    description: 'Search the FAQ database for answers to common questions',
    parameters: z.object({
        query: z.string().describe('The search query or question keyword'),
    }),
    execute: async ({ query }) => {
        try {
            const faqs = await prisma.fAQ.findMany({
                where: {
                    OR: [
                        { question: { contains: query, mode: 'insensitive' } },
                        { answer: { contains: query, mode: 'insensitive' } },
                        { category: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 3,
            })

            if (faqs.length === 0) {
                return {
                    success: false,
                    message: 'No FAQ articles found matching your query'
                }
            }

            return {
                success: true,
                data: faqs.map(faq => ({
                    question: faq.question,
                    answer: faq.answer,
                    category: faq.category
                }))
            }
        } catch (error) {
            console.error('FAQ search error:', error)
            return {
                success: false,
                error: 'Failed to search FAQs'
            }
        }
    },
})

export const supportTools = {
    searchFAQ: searchFAQTool,
}
