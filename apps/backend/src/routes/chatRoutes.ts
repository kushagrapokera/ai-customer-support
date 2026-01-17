import { Hono } from 'hono'
import { chatController } from '../controllers/chatController.js'

export const chatRoutes = new Hono()

chatRoutes.post('/messages', (c) => chatController.sendMessage(c))
chatRoutes.post('/messages/stream', (c) => chatController.sendMessageStream(c))
