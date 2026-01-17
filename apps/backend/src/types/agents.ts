// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\types\agents.ts
export type AgentType = 'support' | 'order' | 'billing'

export interface RoutingResult {
  agent: AgentType
  confidence: number
  method: 'semantic' | 'llm'
  reasoning?: string
}
