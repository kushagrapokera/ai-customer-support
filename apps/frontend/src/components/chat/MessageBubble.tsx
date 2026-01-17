import type { Message } from '../../types';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`message-container ${isUser ? 'user' : 'assistant'}`}>
            <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
                {!isUser && message.agentType && (
                    <div className="agent-badge">
                        {message.agentType.toUpperCase()} AGENT
                    </div>
                )}
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}
