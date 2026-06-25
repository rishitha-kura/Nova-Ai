import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { ChatMessage, HealthStatus } from "./types";
import { Layers } from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Synchronize history with backend memory
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  }, []);

  // Poll Express Server Health Status
  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data: HealthStatus = await res.json();
        setHealth(data);
      } else {
        setHealth(null);
      }
    } catch (err) {
      console.error("Health check error:", err);
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  // Handle Initial Data Fetching on mount
  useEffect(() => {
    fetchHistory();
    checkHealth();

    // Setup periodic polling for health status every 12 seconds
    const interval = setInterval(() => {
      checkHealth();
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchHistory, checkHealth]);

  // Submit Prompt to Gemini API
  const handleSubmit = async () => {
    const trimmedPrompt = inputValue.trim();
    if (!trimmedPrompt || loading) return;

    setLoading(true);
    setError(null);
    setInputValue(""); // Immediate clear for reactive fluid feedback

    // Optimistically render user message locally for responsiveness
    const tempUserMessage: ChatMessage = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content: trimmedPrompt,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(data.history);
        checkHealth();
      } else {
        setError(data.error || "An error occurred while generating the AI response.");
        // Re-sync with exact backend history to clean any optimistic inconsistencies
        fetchHistory();
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with the Express API server.");
      fetchHistory();
    } finally {
      setLoading(false);
    }
  };

  // Clear Chat History on backend
  const handleClearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    setError(null);

    try {
      const res = await fetch("/api/chat/clear", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history);
      } else {
        setError("Could not clear history on server.");
      }
    } catch (err: any) {
      setError("Failed to clear history. " + err.message);
    } finally {
      setClearing(false);
    }
  };

  // Set prompt from Suggestion card clicking
  const handleSelectSuggestion = (prompt: string) => {
    setInputValue(prompt);
    // Focus the text input automatically
    const textarea = document.getElementById("prompt-input");
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#09090B] font-sans text-zinc-300">
      
      {/* Sidebar Info/Docs Panel */}
      <Sidebar
        messages={messages}
        onClearHistory={handleClearHistory}
        clearing={clearing}
        health={health}
      />

      {/* Main Dev Console Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Top Header Controls Bar */}
        <header className="h-16 border-b border-zinc-800/80 bg-[#09090B] px-6 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Nova Workspace
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            {health?.aiConnected ? (
              <span className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-emerald-500 font-sans font-semibold text-xs select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>AI Connected</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg text-amber-500 font-sans font-semibold text-xs select-none animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Smart Fallback</span>
              </span>
            )}
            <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-400 font-sans font-medium">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              <span>Nova Standard</span>
            </div>
          </div>
        </header>

        {/* Live Chat Panel */}
        <ChatArea
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onSelectSuggestion={handleSelectSuggestion}
          health={health}
        />
      </main>
    </div>
  );
}
