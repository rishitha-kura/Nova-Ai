import React from "react";
import { 
  Sparkles, 
  Trash2, 
  MessageSquare,
  History,
  Terminal,
  Cpu
} from "lucide-react";
import { ChatMessage, HealthStatus } from "../types";

interface SidebarProps {
  messages: ChatMessage[];
  onClearHistory: () => void;
  clearing: boolean;
  health: HealthStatus | null;
}

export default function Sidebar({
  messages,
  onClearHistory,
  clearing,
  health,
}: SidebarProps) {
  // Filter out model welcome messages to list only user query threads in Chat History
  const userPrompts = messages.filter(msg => msg.role === "user");

  return (
    <aside className="w-full lg:w-80 bg-[#0C0C0E] border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center space-x-3 bg-zinc-950/20">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/25 shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-white tracking-tight text-lg">
            Nova AI Assistant
          </h1>
          <p className="font-mono text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
            AI Workspace
          </p>
        </div>
      </div>

      {/* Active Session Stats */}
      <div className="p-5 border-b border-zinc-800/60 bg-zinc-950/40">
        <div className="flex items-center space-x-2 text-zinc-400 font-sans font-semibold text-xs uppercase tracking-wider mb-2">
          <Cpu className="h-4 w-4 text-blue-500" />
          <span>Workspace Session</span>
        </div>
        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80 space-y-1.5 font-sans">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Status</span>
            {health?.aiConnected ? (
              <span className="text-emerald-550 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Connected
              </span>
            ) : (
              <span className="text-amber-550 font-semibold flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Smart Fallback
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Total Interactions</span>
            <span className="text-zinc-300 font-mono font-medium">{messages.length} messages</span>
          </div>
        </div>
      </div>

      {/* Dynamic Chat History Panel */}
      <div className="p-6 flex-1 flex flex-col min-h-[200px]">
        <div className="flex items-center space-x-2 text-zinc-400 font-sans font-semibold text-xs uppercase tracking-wider mb-4">
          <History className="h-4 w-4 text-blue-500" />
          <span>Chat History</span>
        </div>
        
        {userPrompts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-900/10">
            <MessageSquare className="h-6 w-6 text-zinc-600 mb-2" />
            <p className="text-zinc-500 text-xs">No active threads yet</p>
            <p className="text-zinc-600 text-[10px] mt-1 max-w-[180px] leading-relaxed">
              Start chatting to view your conversation log.
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-1 scrollbar-thin">
            {userPrompts.map((msg, index) => (
              <div 
                key={msg.id || index}
                className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-900/80 transition duration-200 cursor-pointer group"
              >
                <MessageSquare className="h-3.5 w-3.5 text-zinc-500 group-hover:text-blue-400 shrink-0 transition" />
                <span className="text-xs text-zinc-400 group-hover:text-zinc-200 truncate font-sans">
                  {msg.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-zinc-950/40 border-t border-zinc-800 mt-auto">
        <button
          onClick={onClearHistory}
          disabled={clearing || messages.length <= 1}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-900/80 text-zinc-300 hover:text-white font-sans font-medium text-xs transition duration-200 disabled:opacity-35 disabled:pointer-events-none shadow-sm cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
          <span>{clearing ? "Clearing..." : "Clear Conversation"}</span>
        </button>
      </div>
    </aside>
  );
}
