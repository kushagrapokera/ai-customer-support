// packages/shared/src/schemas/index.ts
import { z } from 'zod'

export const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string(),
  role: z.enum(['user', 'assistant']),
})

export const conversationSchema = z.object({
  userId: z.string(),
  title: z.string().optional(),
})
