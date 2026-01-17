import { useState, useCallback } from 'react';
import type { Message, AgentType, StreamStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USER_ID = import.meta.env.VITE_USER_ID || 'f5196a62-0db5-42ed-be9f-745e1bdc7b3e';

export function useStreamingChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
    const [conversationId, setConversationId] = useState<string>();

    const sendMessage = useCallback(async (content: string) => {
        setLoading(true);
        setStreamStatus({ type: 'routing', content: 'Analyzing your question...' });

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            conversationId: conversationId || '',
            role: 'user',
            content,
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/messages/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: USER_ID,
                    conversationId: conversationId,
                    message: content,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response stream');
            }

            let assistantMessageContent = '';
            let assistantMessageId = `assistant-${Date.now()}`;
            let currentAgent: AgentType = 'support';
            let currentConversationId = conversationId;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'routing') {
                                setStreamStatus({ type: 'routing', content: data.content });
                            } else if (data.type === 'routed') {
                                currentAgent = data.agent;
                                setStreamStatus({
                                    type: 'routed',
                                    agent: data.agent,
                                    confidence: data.confidence,
                                    method: data.method,
                                    content: `${data.agent.toUpperCase()} Agent (${Math.round(data.confidence * 100)}% confidence)`
                                });
                            } else if (data.type === 'chunk') {
                                assistantMessageContent += data.content;
                                setStreamStatus({ type: 'thinking', content: 'Generating response...' });

                                setMessages((prev) => {
                                    const existingIndex = prev.findIndex(
                                        (m) => m.id === assistantMessageId && m.role === 'assistant'
                                    );

                                    const assistantMessage: Message = {
                                        id: assistantMessageId,
                                        conversationId: currentConversationId || '',
                                        role: 'assistant',
                                        content: assistantMessageContent,
                                        agentType: currentAgent,
                                        createdAt: new Date(),
                                    };

                                    if (existingIndex !== -1) {
                                        const updated = [...prev];
                                        updated[existingIndex] = assistantMessage;
                                        return updated;
                                    } else {
                                        return [...prev, assistantMessage];
                                    }
                                });
                            } else if (data.type === 'complete') {
                                currentConversationId = data.conversationId;
                                if (!conversationId) {
                                    setConversationId(data.conversationId);
                                }
                                setStreamStatus({ type: 'complete' });
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);

            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                conversationId: conversationId || '',
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                createdAt: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setStreamStatus(null);
        }
    }, [conversationId]);

    return {
        messages,
        loading,
        streamStatus,
        conversationId,
        sendMessage,
    };
}
