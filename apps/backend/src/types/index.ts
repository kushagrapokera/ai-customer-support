export type AgentType = 'support' | 'order' | 'billing'

export interface AgentInfo {
  type: AgentType
  name: string
  description: string
  capabilities: string[]
}

export interface AgentTool {
  name: string
  description: string
  parameters: string[]
}

export interface AgentCapabilities {
  type: AgentType
  name: string
  description: string
  capabilities: string[]
  tools: AgentTool[]
}
