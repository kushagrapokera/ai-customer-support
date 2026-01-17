import { prisma } from '../config/database.js'
import { agentService } from './agentService.js'

interface ProcessMessageInput {
  message: string
  conversationId?: string
  userId: string
}

interface ProcessMessageStreamInput extends ProcessMessageInput {
  stream: any
}

export class ChatService {
  async getConversationContext(conversationId: string, limit: number = 5) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return messages.reverse()
  }

  async formatContextForAgent(conversationId: string): Promise<string> {
    const messages = await this.getConversationContext(conversationId)

    if (messages.length === 0) {
      return ''
    }

    const contextLines = messages.map((msg) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant'
      return `${role}: ${msg.content}`
    })

    return `Previous conversation:\n${contextLines.join('\n')}\n\nCurrent question:`
  }

  async processAndSaveMessage(input: ProcessMessageInput) {
    const { message, conversationId, userId } = input

    let conversation

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: message.substring(0, 50)
        }
      })
    }

    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    })

    const conversationContext = await this.formatContextForAgent(conversation.id)

    console.log(`Processing message with context: ${conversationContext ? 'Yes' : 'No'}`)

    const agentResult = await agentService.processMessage(message, conversationContext)

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: agentResult.response,
        agentType: agentResult.routing.agent
      }
    })

    return {
      conversationId: conversation.id,
      message: assistantMessage,
      agent: agentResult.routing.agent,
      routing: {
        method: agentResult.routing.method,
        confidence: agentResult.routing.confidence,
        reasoning: agentResult.routing.reasoning
      }
    }
  }

  async processAndSaveMessageStream(input: ProcessMessageStreamInput) {
    const { message, conversationId, userId, stream } = input

    let conversation

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: message.substring(0, 50)
        }
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    })

    const conversationContext = await this.formatContextForAgent(conversation.id)

    await stream.writeSSE({
      data: JSON.stringify({ type: 'routing', content: 'Analyzing query...' }),
      event: 'status'
    })

    const { stream: agentStream, routing } = await agentService.processMessageStream(
      message,
      conversationContext
    )

    await stream.writeSSE({
      data: JSON.stringify({
        type: 'routed',
        agent: routing.agent,
        confidence: routing.confidence,
        method: routing.method
      }),
      event: 'routing'
    })

    let fullResponse = ''

    for await (const textPart of agentStream.textStream) {
      fullResponse += textPart
      await stream.writeSSE({
        data: JSON.stringify({ type: 'chunk', content: textPart }),
        event: 'message'
      })
    }

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: fullResponse,
        agentType: routing.agent
      }
    })

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      agent: routing.agent,
      routing: {
        method: routing.method,
        confidence: routing.confidence,
        reasoning: routing.reasoning
      }
    }
  }

  async getConversation(conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    return conversation
  }
}

export const chatService = new ChatService()
