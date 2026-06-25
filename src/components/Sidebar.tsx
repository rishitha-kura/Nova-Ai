import { Plus, MessageSquare, Trash2, X, Sparkles } from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <Sparkles className="brand-icon" size={24} />
            <span className="gradient-text">Nova AI</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="btn-close">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-new-chat-container">
          <button 
            onClick={onNewChat}
            className="btn-new-chat"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="sidebar-chat-list">
          {chats.sort((a,b) => (b.messages[0]?.timestamp || 0) - (a.messages[0]?.timestamp || 0)).map(chat => (
            <div 
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
            >
              <div className="chat-item-content">
                <MessageSquare size={18} className="chat-item-icon" />
                <span className="chat-item-text">
                  {chat.messages[0]?.content || 'New Chat'}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                className="btn-delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
