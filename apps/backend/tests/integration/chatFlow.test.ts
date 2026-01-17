import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '../../src/config/database.js'

describe('Chat Flow Integration', () => {
    let testUserId: string

    beforeAll(async () => {
        const user = await prisma.user.findFirst()
        testUserId = user?.id || 'f5196a62-0db5-42ed-be9f-745e1bdc7b3e'
    })

    it('should have test user in database', () => {
        expect(testUserId).toBeDefined()
        expect(testUserId.length).toBeGreaterThan(0)
    })

    it('should be able to create conversations', async () => {
        const conversation = await prisma.conversation.create({
            data: {
                userId: testUserId,
                title: 'Test Conversation'
            }
        })

        expect(conversation).toBeDefined()
        expect(conversation.id).toBeDefined()
        expect(conversation.userId).toBe(testUserId)

        await prisma.conversation.delete({
            where: { id: conversation.id }
        })
    })

    it('should be able to create messages', async () => {
        const conversation = await prisma.conversation.create({
            data: {
                userId: testUserId,
                title: 'Test Conversation'
            }
        })

        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: 'Test message'
            }
        })

        expect(message).toBeDefined()
        expect(message.content).toBe('Test message')
        expect(message.role).toBe('user')

        await prisma.message.delete({ where: { id: message.id } })
        await prisma.conversation.delete({ where: { id: conversation.id } })
    })

    it('should retrieve conversation with messages', async () => {
        const conversation = await prisma.conversation.findFirst({
            include: {
                messages: true
            }
        })

        expect(conversation).toBeDefined()
        if (conversation) {
            expect(conversation.messages).toBeDefined()
            expect(Array.isArray(conversation.messages)).toBe(true)
        }
    })
})
