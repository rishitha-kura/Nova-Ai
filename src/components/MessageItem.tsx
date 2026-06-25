import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { Message } from '../types';

export default function MessageItem({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'assistant'} animate-fade-in`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        {!isUser && (
          <button 
            onClick={handleCopy}
            className="btn-copy"
            title="Copy response"
          >
            {copied ? <Check size={14} style={{color: '#4ade80'}} /> : <Copy size={14} />}
          </button>
        )}
        
        {isUser ? (
          <div className="message-content-user">{message.content}</div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const {children, className, node, ref, ...rest} = props
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <SyntaxHighlighter
                      {...rest}
                      PreTag="div"
                      children={String(children).replace(/\n$/, '')}
                      language={match[1]}
                      style={vscDarkPlus as any}
                    />
                  ) : (
                    <code {...rest} className={className}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
