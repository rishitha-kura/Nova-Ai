import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { Chat, Message } from './types';

function App() {
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        const history: Record<string, Chat> = {};
        for (const [id, messages] of Object.entries(data.chats)) {
            history[id] = { id, messages: messages as Message[] };
        }
        setChats(history);
      })
      .catch(console.error);
  }, []);

  const handleNewChat = () => {
    setCurrentChatId(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await fetch(`/api/history?chatId=${id}`, { method: 'DELETE' });
      setChats(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (currentChatId === id) setCurrentChatId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats(prev => {
      const chat = prev[chatId] || { id: chatId, messages: [] };
      return {
        ...prev,
        [chatId]: { ...chat, messages: [...chat.messages, message] }
      };
    });
  };

  const currentChat = currentChatId ? chats[currentChatId] : null;

  return (
    <div className="app-container">
      <Sidebar 
        chats={Object.values(chats)} 
        currentChatId={currentChatId}
        onSelectChat={(id) => {
          setCurrentChatId(id);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="main-area">
        <ChatArea 
          chat={currentChat} 
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          addMessageToChat={addMessageToChat}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </main>
    </div>
  );
}

export default App;
