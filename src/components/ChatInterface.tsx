'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Globe } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'model';
  parts: string;
  sources?: { title: string; text: string; url?: string }[];
}

interface ChatInterfaceProps {
    courseId: string;
    stepContext?: string;
}

export default function ChatInterface({ courseId, stepContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'model', 
            parts: stepContext 
                ? `Hi! I'm ready to help you with "${stepContext}". What questions do you have?` 
                : "Hi! I'm your AI Tutor. Ask me anything about your course materials!" 
        }
    ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeWebSearch, setIncludeWebSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', parts: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.parts,
          courseId,
          history: messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.parts }],
          })),
          stepContext, // Pass the context
          includeWebSearch,
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { 
            role: 'model', 
            parts: data.response,
            sources: data.sources 
          },
        ]);
      }
    } catch (error) {
      console.error('Chat failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold">AI Tutor</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Ask me anything about your course materials!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={clsx(
              'flex gap-3 max-w-[80%]',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            )}
          >
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                msg.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
              )}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={clsx(
                'p-3 rounded-lg text-sm',
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              )}
            >
              {msg.parts}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
                  <p className="font-semibold mb-1">Sources:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {msg.sources.map((source, i) => (
                      <li key={i} title={source.text.substring(0, 100) + '...'}>
                        {source.title || 'Course Material'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-700 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2">
            <button
                onClick={() => setIncludeWebSearch(!includeWebSearch)}
                className={clsx(
                    "text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors",
                    includeWebSearch 
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/50" 
                        : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                )}
            >
                <Globe className="w-3 h-3" />
                {includeWebSearch ? "Web Search On" : "Search Web"}
            </button>
        </div>
        <div className="flex gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white"
            />
            <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
            <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
