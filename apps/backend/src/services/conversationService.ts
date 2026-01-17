// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\services\conversationService.ts
import { prisma } from '../config/database.js'

export class ConversationService {
  async getConversationsByUser(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      lastMessage: conv.messages[0]?.content || null
    }))
  }

  async getConversationWithMessages(conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return conversation
  }

  async deleteConversation(conversationId: string) {
    await prisma.conversation.delete({
      where: { id: conversationId }
    })
  }
}

export const conversationService = new ConversationService()
