'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'How much did I spend on food last month?',
  "What's my biggest expense category?",
  'Am I on track with my savings goals?',
  'Show me unusual transactions this week',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [usage, setUsage] = useState<{ queries_used: number; queries_limit: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.oracle.getUsage().then(setUsage).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isStreaming) return;

    const userMsg: Message = {
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Add empty assistant message for streaming
    const assistantMsg: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await api.oracle.query(query);
      if (!response.ok) {
        const error = await response.json();
        const detail = error.detail;
        if (typeof detail === 'object' && detail.upgrade_prompt) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: `${detail.message} ${detail.upgrade_prompt}`,
            };
            return updated;
          });
        } else {
          throw new Error(typeof detail === 'string' ? detail : 'Query failed');
        }
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response stream');

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            fullText += data;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: fullText,
              };
              return updated;
            });
          }
        }
      }

      // Update usage
      api.oracle.getUsage().then(setUsage).catch(() => {});
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Sorry, I encountered an error. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showLimitWarning = usage && usage.queries_used >= 8 && usage.queries_used < usage.queries_limit;
  const atLimit = usage && usage.queries_used >= usage.queries_limit;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-brand-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">@ORACLE</h2>
            <p className="text-sm text-text-secondary mb-6 max-w-sm">
              Your AI financial assistant. Ask me anything about your spending, budgets, or savings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm p-3 bg-bg-surface rounded-lg border border-border hover:border-brand-primary/30 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-surface text-text-primary'
              }`}>
                {msg.role === 'assistant' && !msg.content && isStreaming ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content.split(/(\$[\d,.]+)/g).map((part, j) =>
                      part.match(/^\$[\d,.]+$/) ? (
                        <span key={j} className="font-mono font-semibold">{part}</span>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query limit warning */}
      {showLimitWarning && (
        <div className="px-6 py-2 bg-brand-accent/10 border-t border-brand-accent/20 text-center">
          <p className="text-xs text-brand-accent">
            {usage.queries_used} of {usage.queries_limit} AI queries used this month &middot;{' '}
            <span className="underline cursor-pointer">Upgrade to Pro</span>
          </p>
        </div>
      )}

      {/* At limit message */}
      {atLimit && (
        <div className="px-6 py-3 bg-loss/10 border-t border-loss/20 text-center">
          <p className="text-sm text-loss font-medium">
            You&apos;ve reached your monthly AI query limit.
          </p>
          <button className="mt-1 text-xs text-brand-primary underline">
            Upgrade to Pro for unlimited queries
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask @ORACLE anything..."
            rows={1}
            disabled={isStreaming || !!atLimit}
            className="flex-1 bg-bg-surface text-text-primary rounded-lg px-4 py-3 border border-border focus:border-brand-primary focus:outline-none text-sm resize-none max-h-32 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming || !!atLimit}
            className="p-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
