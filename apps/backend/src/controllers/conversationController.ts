import type { Context } from 'hono'
import { prisma } from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

export class ConversationController {
  async getConversations(c: Context) {
    const userId = c.req.query('userId')

    if (!userId) {
      throw new AppError('userId query parameter is required', 400)
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      userId: conv.userId,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      lastMessage: conv.messages[0]?.content || null
    }))

    return c.json({
      success: true,
      data: formattedConversations,
      count: formattedConversations.length
    })
  }

  async getConversation(c: Context) {
    const conversationId = c.req.param('id')

    if (!conversationId) {
      throw new AppError('Conversation ID is required', 400)
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404)
    }

    return c.json({
      success: true,
      data: conversation
    })
  }

  async deleteConversation(c: Context) {
    const conversationId = c.req.param('id')

    if (!conversationId) {
      throw new AppError('Conversation ID is required', 400)
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404)
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    })

    return c.json({
      success: true,
      message: 'Conversation deleted successfully'
    })
  }
}

export const conversationController = new ConversationController()
