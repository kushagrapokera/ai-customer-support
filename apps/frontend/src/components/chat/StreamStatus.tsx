import type { StreamStatus } from '../../types';

interface StreamStatusProps {
  status: StreamStatus;
}

export function StreamStatusComponent({ status }: StreamStatusProps) {
  return (
    <div className="stream-status">
      {status.type === 'routing' && (
        <div className="status-item routing">
          <div className="status-icon">
            <div className="spinner"></div>
          </div>
          <span>{status.content}</span>
        </div>
      )}

      {status.type === 'routed' && status.agent && (
        <div className="status-item routed">
          <div className="agent-chip">
            <span className="agent-name">{status.agent.toUpperCase()}</span>
            <span className="confidence">{Math.round((status.confidence || 0) * 100)}%</span>
          </div>
          <span className="method-badge">{status.method}</span>
        </div>
      )}

      {status.type === 'thinking' && (
        <div className="status-item thinking">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>{status.content}</span>
        </div>
      )}
    </div>
  );
}
