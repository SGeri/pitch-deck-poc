'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Wand2, Check, ChevronDown } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  currentSlide: number;
}

const quickActions = [
  'Add a new bullet point',
  'Change the title',
  'Add a chart',
  'Reword this slide',
  'Make it more concise',
  'Add more detail',
];

export default function AIChat({ messages, onSendMessage, isProcessing, currentSlide }: AIChatProps) {
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickAction = (action: string) => {
    onSendMessage(action);
    setShowQuickActions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-surface)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--mol-red)] flex items-center justify-center">
            <Wand2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Assistant</h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Editing Slide {currentSlide + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-[var(--slate-900)] text-white'
                  : 'bg-[var(--slate-100)] text-[var(--text-primary)]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.slideRef && message.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-black/10 flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                  <Check className="w-3 h-3 text-[var(--success)]" />
                  Applied to {message.slideRef}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-[var(--slate-100)] rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-secondary)]">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--slate-50)] rounded transition-colors"
        >
          <span>Quick actions</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
        </button>

        {showQuickActions && (
          <div className="pb-2 flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="px-2 py-1 text-[11px] bg-[var(--slate-100)] hover:bg-[var(--slate-200)] text-[var(--text-secondary)] rounded transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border-default)]">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the changes you want to make..."
            rows={2}
            className="form-input form-textarea pr-12 text-sm resize-none"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 bottom-2 p-2 rounded bg-[var(--mol-red)] hover:bg-[var(--mol-red-hover)] disabled:bg-[var(--slate-300)] disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
        <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
