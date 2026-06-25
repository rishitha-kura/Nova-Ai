import { Code, Edit3, Lightbulb, PenTool } from 'lucide-react';

const SUGGESTIONS = [
  { icon: <Code size={18} />, text: "Help me debug this React component" },
  { icon: <Edit3 size={18} />, text: "Write a professional email" },
  { icon: <Lightbulb size={18} />, text: "Explain quantum computing" },
  { icon: <PenTool size={18} />, text: "Design a landing page layout" }
];

export default function SuggestedPrompts({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="suggestions-grid">
      {SUGGESTIONS.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.text)}
          className="suggestion-card"
        >
          <div className="suggestion-icon">
            {s.icon}
          </div>
          <span className="suggestion-text">
            {s.text}
          </span>
        </button>
      ))}
    </div>
  );
}
