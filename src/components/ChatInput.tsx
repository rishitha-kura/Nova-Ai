import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-box-wrapper">
      <div className="input-glow"></div>
      <div className="input-box">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nova AI anything..."
          className="textarea-input"
          rows={1}
          disabled={disabled}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className={`btn-send ${input.trim() && !disabled ? 'active' : ''}`}
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
