// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\routes\conversationRoutes.ts
import { Hono } from 'hono'
import { conversationController } from '../controllers/conversationController.js'

export const conversationRoutes = new Hono()

conversationRoutes.get('/', (c) => conversationController.getConversations(c))
conversationRoutes.get('/:id', (c) => conversationController.getConversation(c))
conversationRoutes.delete('/:id', (c) => conversationController.deleteConversation(c))
