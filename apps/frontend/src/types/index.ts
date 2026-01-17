export type AgentType = 'support' | 'order' | 'billing';

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    agentType?: AgentType;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    userId: string;
    title?: string;
    messages?: Message[];
    createdAt: Date;
    updatedAt: Date;
    lastMessage?: string;
}

export interface SendMessageRequest {
    userId: string;
    conversationId?: string;
    message: string;
}

export interface SendMessageResponse {
    conversationId: string;
    message: Message;
    agent: AgentType;
    routing: {
        method: 'semantic' | 'llm';
        confidence: number;
        reasoning?: string;
    };
}

export interface StreamStatus {
    type: 'routing' | 'routed' | 'thinking' | 'complete';
    content?: string;
    agent?: AgentType;
    confidence?: number;
    method?: 'semantic' | 'llm';
}
