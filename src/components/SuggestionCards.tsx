import React from "react";
import { Sparkles, Terminal, Code2, Server, HelpCircle } from "lucide-react";

interface SuggestionCard {
  title: string;
  desc: string;
  prompt: string;
  icon: "code" | "server" | "explain" | "tips";
}

const SUGGESTIONS: SuggestionCard[] = [
  {
    title: "Explain Artificial Intelligence",
    desc: "Understand neural networks, machine learning, and natural language models.",
    prompt: "Explain Artificial Intelligence in an intuitive, natural way for a curious learner, using elegant analogies.",
    icon: "explain",
  },
  {
    title: "Create a React Login Form",
    desc: "Generate a modern, accessible form styled with Tailwind CSS.",
    prompt: "Create a modern, responsive, and accessible React login form component styled with Tailwind CSS, including input validation logic.",
    icon: "code",
  },
  {
    title: "Write a Professional Email",
    desc: "Draft a polite and polished message for your team or stakeholders.",
    prompt: "Write a polite and professional follow-up email to a project stakeholder requesting feedback on our latest design prototype.",
    icon: "tips",
  },
  {
    title: "Generate SQL Queries",
    desc: "Construct database queries with proper joins, indexing, and grouping.",
    prompt: "Generate a secure SQL query to retrieve the top 5 customers by total transaction amount from a database, using appropriate JOIN and GROUP BY clauses.",
    icon: "server",
  },
];

interface SuggestionCardsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "code":
        return <Code2 className="h-4 w-4 text-blue-400" />;
      case "server":
        return <Server className="h-4 w-4 text-emerald-400" />;
      case "explain":
        return <Terminal className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-pink-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mx-auto p-4">
      {SUGGESTIONS.map((item, index) => (
        <button
          key={index}
          onClick={() => onSelect(item.prompt)}
          className="group text-left p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700/80 transition duration-200 shadow-sm flex flex-col justify-between h-32 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-zinc-950/60 rounded-lg group-hover:bg-zinc-950 transition duration-200">
                {getIcon(item.icon)}
              </span>
              <h3 className="font-sans font-semibold text-zinc-200 group-hover:text-zinc-100 text-sm transition duration-200">
                {item.title}
              </h3>
            </div>
            <p className="font-sans text-zinc-400 text-xs leading-relaxed mt-1.5">
              {item.desc}
            </p>
          </div>
          <span className="font-mono text-xxs text-blue-400 group-hover:text-blue-300 flex items-center space-x-1 font-semibold">
            <span>Use Prompt</span>
            <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>
      ))}
    </div>
  );
}
