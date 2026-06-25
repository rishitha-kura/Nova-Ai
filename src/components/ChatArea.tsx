import React, { useRef, useEffect, useState } from "react";
import { 
  Send, 
  Bot, 
  User, 
  ArrowDown, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles 
} from "lucide-react";
import { ChatMessage, HealthStatus } from "../types";
import SuggestionCards from "./SuggestionCards";

interface ChatAreaProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  onSelectSuggestion: (prompt: string) => void;
  health: HealthStatus | null;
}

// Simple custom text parsing to render code blocks and paragraphs elegantly
function MessageContent({ text }: { text: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Split text into normal parts and code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 font-sans text-sm leading-relaxed text-zinc-300">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Extract language and actual code content
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "code";
          const code = match ? match[2] : part.slice(3, -3);
          const blockId = `code-block-${index}`;

          return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80 shadow-md font-mono">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xxs tracking-wider uppercase font-semibold text-zinc-400">
                <span>{lang || "source-code"}</span>
                <button
                  onClick={() => handleCopy(code.trim(), blockId)}
                  className="hover:text-blue-400 transition flex items-center space-x-1 py-0.5 px-1.5 rounded hover:bg-zinc-800"
                  title="Copy code"
                >
                  {copiedId === blockId ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs text-zinc-300 whitespace-pre scrollbar-thin">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          // Render regular text, handles newlines as line breaks
          return (
            <p key={index} className="whitespace-pre-wrap text-zinc-300">
              {part}
            </p>
          );
        }
      })}
    </div>
  );
}

export default function ChatArea({
  messages,
  inputValue,
  onInputChange,
  onSubmit,
  loading,
  error,
  onSelectSuggestion,
  health,
}: ChatAreaProps) {
  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Send message on Enter (unless shift-key is held for newline)
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#09090B] text-zinc-300 relative overflow-hidden h-full">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      {/* Main Console Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10">
        {/* Render Suggestion Templates if history is clean or empty */}
        {messages.length <= 1 && (
          <div className="py-8 text-center space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center animate-pulse text-white shadow-lg shadow-indigo-900/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-sans font-bold text-3xl tracking-tight text-white bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Nova AI Workspace
              </h2>
              <p className="font-sans text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                Welcome to your personal intelligence workspace. Speak with Nova to generate code, draft professional emails, construct SQL queries, or explain concepts.
              </p>
            </div>
            <SuggestionCards onSelect={onSelectSuggestion} />
          </div>
        )}

        {/* Message Bubble Mapping */}
        {messages.length > 1 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isModel = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 ${
                    isModel ? "justify-start" : "justify-end flex-row-reverse"
                  }`}
                >
                  {/* Avatar with visual cue */}
                  <div className={`h-9 w-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-md transition-transform duration-250 ${
                    isModel 
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-indigo-900/10" 
                      : "bg-zinc-850 text-zinc-300 border border-zinc-700/80 shadow-zinc-950/20"
                  }`}>
                    {isModel ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble Content Area */}
                  <div className={`max-w-[85%] rounded-2xl p-5 border text-sm font-sans space-y-2 shadow-sm transition-all duration-200 ${
                    isModel 
                      ? "bg-[#111113] border-zinc-800/80 text-zinc-200" 
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-300"
                  }`}>
                    {/* Tiny Timestamp indicator */}
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 mb-1">
                      <span className="font-semibold uppercase tracking-wider text-zinc-400">
                        {isModel ? "Nova Assistant" : "You"}
                      </span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <MessageContent text={msg.content} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bouncing Typing Animation while Generating */}
        {loading && (
          <div className="max-w-4xl mx-auto flex items-start gap-4 justify-start">
            <div className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg animate-pulse">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="rounded-2xl p-5 border border-zinc-800/80 bg-[#111113] max-w-[85%] shadow-lg">
              <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-zinc-400">Nova is processing</span>
              </div>
              <div className="flex items-center space-x-1.5 py-1">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-[bounce_1.4s_infinite_0ms]"></span>
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-[bounce_1.4s_infinite_200ms]"></span>
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-[bounce_1.4s_infinite_400ms]"></span>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification Alert */}
        {error && (
          <div className="max-w-4xl mx-auto flex items-start space-x-3 p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-sans font-semibold text-rose-450 text-sm">Execution Error</h4>
              <p className="font-sans text-zinc-400 text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Invisible anchor for scroll alignment */}
        <div ref={listEndRef} />
      </div>

      {/* Persistent Prompt Entry Container */}
      <div className="p-4 md:p-6 bg-[#0C0C0E]/50 border-t border-zinc-800/80 relative z-10">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative flex items-end bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-blue-600/50 transition duration-200 shadow-2xl">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Nova anything..."
              className="w-full bg-transparent px-4 py-3.5 outline-none resize-none text-zinc-200 text-sm placeholder-zinc-550 max-h-40 min-h-[48px] scrollbar-thin font-sans"
              rows={1}
              disabled={loading}
              id="prompt-input"
            />
            <div className="p-2 flex items-center space-x-2">
              <span className="hidden md:inline font-mono text-xxs text-zinc-500 select-none mr-1">
                Enter to Send
              </span>
              <button
                onClick={onSubmit}
                disabled={loading || !inputValue.trim()}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition duration-200 disabled:opacity-40 disabled:hover:bg-blue-600 shadow-md shadow-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                id="generate-button"
                title="Generate Response"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="text-center text-zinc-600 text-[11px] mt-3 tracking-wide">
            Nova AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
