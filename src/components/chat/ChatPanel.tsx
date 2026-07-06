// ChatPanel — slide-in chat window for asking the AI questions about a guide.
// Loads history on mount, sends messages via chatApi, auto-scrolls.

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { chatApi, getErrorMessage } from '@/lib/api';
import type { ChatMessage } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface ChatPanelProps {
  guideId: number;
  open: boolean;
  onClose: () => void;
}

export function ChatPanel({ guideId, open, onClose }: ChatPanelProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load history whenever the panel opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    chatApi
      .list(guideId)
      .then((r) => {
        if (!cancelled) setMessages(r.messages);
      })
      .catch((err) => {
        if (!cancelled) toast(getErrorMessage(err), 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, guideId, toast]);

  // Auto-scroll to bottom when new messages arrive.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, sending]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    if (text.length > 4_000) {
      toast('Message is too long (max 4,000 characters).', 'warning');
      return;
    }

    // Optimistic append of the user message.
    const optimisticUser: ChatMessage = {
      id: -Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setDraft('');
    setSending(true);

    try {
      const { reply } = await chatApi.send(guideId, text);
      setMessages((prev) => [
        ...prev,
        {
          id: -Date.now() - 1,
          role: 'assistant',
          content: reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      // Remove the optimistic user message on failure so they can retry cleanly.
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      toast(getErrorMessage(err), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearHistory = async () => {
    if (!confirm('Clear all chat history for this guide?')) return;
    try {
      await chatApi.clear(guideId);
      setMessages([]);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <>
      {/* Backdrop on small screens */}
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden
      />

      <aside
        className={clsx(
          'fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-bg-card border-l border-bg-hover',
          'flex flex-col shadow-card-lg transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label="Chat about this guide"
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-bg-hover shrink-0">
          <div className="min-w-0">
            <h2 className="font-semibold text-text truncate">Ask about this guide</h2>
            <p className="text-xs text-text-muted truncate">Answers use only the guide's content</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-text-muted hover:text-status-danger transition-colors px-2 py-1"
                aria-label="Clear chat"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {loading ? (
            <div className="text-center text-text-muted py-10">Loading chat...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-text-muted py-10 space-y-2">
              <svg className="h-10 w-10 mx-auto text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs text-text-dim">
                Try asking: <em>"Explain the second section in simpler terms."</em>
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-bg-hover text-text-muted text-sm px-3 py-2 rounded-lg">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-3 border-t border-bg-hover shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={4_000}
              placeholder="Ask a question..."
              className={clsx(
                'flex-1 resize-none rounded bg-bg px-3 py-2 text-sm text-text',
                'placeholder:text-text-dim border border-bg-hover',
                'focus:outline-none focus:border-accent-purple max-h-32',
              )}
              style={{ minHeight: '40px' }}
            />
            <Button onClick={send} disabled={sending || !draft.trim()} size="md">
              Send
            </Button>
          </div>
          <p className="text-[10px] text-text-dim mt-1.5 px-1">
            Enter to send · Shift+Enter for newline · {draft.length}/4000
          </p>
        </div>
      </aside>
    </>
  );
}

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap break-words',
          isUser
            ? 'bg-gradient-primary text-white rounded-br-sm'
            : 'bg-bg-hover text-text rounded-bl-sm',
        )}
      >
        {content}
      </div>
    </div>
  );
}