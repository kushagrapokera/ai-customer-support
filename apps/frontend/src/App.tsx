import { useState, useEffect } from 'react';
import { ChatWindow } from './components/chat/ChatWindow';
import { useStreamingChat } from './hooks/useStreamingChat';
import { chatApi } from './services/api';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [connected, setConnected] = useState(false);
  const { messages, loading, streamStatus, sendMessage } = useStreamingChat();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await chatApi.checkHealth();
      setConnected(true);
      console.log(`Connected to backend at ${API_URL}`);
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      setConnected(false);
      setTimeout(checkConnection, 5000);
    }
  };

  if (!connected) {
    return (
      <div className="app-container">
        <div className="connection-error">
          <h2>Connecting to backend...</h2>
          <p>Please make sure the backend server is running at {API_URL}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ChatWindow
        messages={messages}
        onSendMessage={sendMessage}
        loading={loading}
        streamStatus={streamStatus}
      />
    </div>
  );
}

export default App;
