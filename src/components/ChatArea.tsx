import { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Chat, Message } from '../types';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import SuggestedPrompts from './SuggestedPrompts';

interface ChatAreaProps {
  chat: Chat | null;
  currentChatId: string | null;
  setCurrentChatId: (id: string) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  toggleSidebar: () => void;
}

export default function ChatArea({ chat, currentChatId, setCurrentChatId, addMessageToChat, toggleSidebar }: ChatAreaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    setIsLoading(true);
    setError(null);

    const tempId = Date.now().toString();
    const userMsg: Message = { id: tempId, role: 'user', content: text, timestamp: Date.now() };
    
    let activeChatId = currentChatId;
    
    if (activeChatId) {
        addMessageToChat(activeChatId, userMsg);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, chatId: activeChatId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (!activeChatId) {
        activeChatId = data.chatId;
        setCurrentChatId(activeChatId as string);
        addMessageToChat(activeChatId as string, userMsg);
      }
      
      addMessageToChat(activeChatId as string, data.message);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="chat-header">
        <button 
          onClick={toggleSidebar}
          className="btn-menu"
        >
          <Menu size={20} />
        </button>
      </header>

      <div ref={scrollContainerRef} className="chat-messages-container">
        <div className="chat-messages-inner">
          {!chat || chat.messages.length === 0 ? (
            <div className="welcome-screen animate-fade-in">
              <div className="welcome-icon-container">
                <div className="welcome-icon-inner">✨</div>
              </div>
              <h1 className="welcome-title">How can I help you today?</h1>
              <p className="welcome-subtitle">
                I'm Nova AI, your premium intelligent assistant. Ask me anything from coding to creative writing.
              </p>
              <SuggestedPrompts onSelect={handleSendMessage} />
            </div>
          ) : (
            <div className="messages-list">
              {chat.messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="loading-bubble animate-pulse">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              {error && (
                <div className="error-message">
                  <span className="error-dot"></span>
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          <div className="disclaimer">
            Nova AI can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </>
  );
}
