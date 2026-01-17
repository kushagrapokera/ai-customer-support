import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { StreamStatusComponent } from './StreamStatus';
import type { Message, StreamStatus } from '../../types';

interface ChatWindowProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    loading: boolean;
    streamStatus?: StreamStatus | null;
}

export function ChatWindow({ messages, onSendMessage, loading, streamStatus }: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamStatus]);

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h1>AI Customer Support Assistant</h1>
                <p>Powered by multi-agent intelligence</p>
            </div>
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <h2>Welcome to AI Support</h2>
                        <p>Ask me anything about your orders, billing, or general support questions. I'm here to help you 24/7.</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))
                )}
                {streamStatus && <StreamStatusComponent status={streamStatus} />}
                <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={onSendMessage} disabled={loading} />
        </div>
    );
}
