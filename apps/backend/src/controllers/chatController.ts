import type { Context } from 'hono'
import { chatService } from '../services/chatService.js'
import { agentService } from '../services/agentService.js'
import { AppError } from '../middleware/errorHandler.js'
import { streamSSE } from 'hono/streaming'

export class ChatController {
  async sendMessage(c: Context) {
    const body = await c.req.json()
    const { message, conversationId, userId } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError('Message is required and must be a non-empty string', 400)
    }

    if (!userId || typeof userId !== 'string') {
      throw new AppError('userId is required and must be a string', 400)
    }

    const result = await chatService.processAndSaveMessage({
      message,
      conversationId,
      userId
    })

    return c.json({
      success: true,
      data: result
    }, 200)
  }

  async sendMessageStream(c: Context) {
    const body = await c.req.json()
    const { message, conversationId, userId } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError('Message is required and must be a non-empty string', 400)
    }

    if (!userId || typeof userId !== 'string') {
      throw new AppError('userId is required and must be a string', 400)
    }

    return streamSSE(c, async (stream) => {
      try {
        await stream.writeSSE({
          data: JSON.stringify({ type: 'status', content: 'Processing...' }),
          event: 'status'
        })

        const result = await chatService.processAndSaveMessageStream({
          message,
          conversationId,
          userId,
          stream
        })

        await stream.writeSSE({
          data: JSON.stringify({ 
            type: 'complete',
            conversationId: result.conversationId,
            messageId: result.messageId,
            agent: result.agent,
            routing: result.routing
          }),
          event: 'complete'
        })
      } catch (error: any) {
        await stream.writeSSE({
          data: JSON.stringify({ type: 'error', content: error.message }),
          event: 'error'
        })
      }
    })
  }
}

export const chatController = new ChatController()
