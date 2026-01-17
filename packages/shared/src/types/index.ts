// packages/shared/src/types/index.ts
export type AgentType = 'support' | 'order' | 'billing'

export interface RoutingResult {
  agent: AgentType
  confidence: number
  method: 'semantic' | 'llm'
  reasoning?: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  agentType?: AgentType
  createdAt: Date
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  createdAt: Date
  updatedAt: Date
}
