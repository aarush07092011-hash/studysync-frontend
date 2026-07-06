// Guide detail page: tabs for Summary | Key Concepts | Flashcards | Practice Questions.
// Prominent "Start Competitive Session" CTA at the top.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { guidesApi, sessionsApi, getErrorMessage } from '@/lib/api';
import type { StudyGuide } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useToast } from '@/context/ToastContext';

type Tab = 'summary' | 'concepts' | 'flashcards' | 'practice';

const tabs: { id: Tab; label: string }[] = [
  { id: 'summary',   label: 'Summary' },
  { id: 'concepts',  label: 'Key concepts' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'practice',  label: 'Practice questions' },
];

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('summary');
  const [bookmarked, setBookmarked] = useState(false);
  const [creating, setCreating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await guidesApi.get(parseInt(id, 10));
        if (!cancelled) setGuide(res.guide);
      } catch (err) {
        toast(getErrorMessage(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, toast]);

  const startSession = async () => {
    if (!guide) return;
    setCreating(true);
    try {
      const res = await sessionsApi.create({
        guide_id: guide.id,
        session_name: `${guide.title} — quiz`,
        duration_minutes: 10,
      });
      toast('Session created! Starting now...', 'success');
      navigate(`/sessions/${res.session.id}/live`);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Guide not found.</p>
        <Link to="/guides">
          <Button variant="secondary" className="mt-4">Back to guides</Button>
        </Link>
      </div>
    );
  }

  const { content } = guide;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Link to="/guides" className="text-sm text-text-muted hover:text-text inline-flex items-center gap-1 mb-3">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to guides
          </Link>
          <h1 className="text-3xl font-bold text-text">{content.title}</h1>
          <p className="text-sm text-text-muted mt-1">
            Created {new Date(guide.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarked((b) => !b)}
            className={clsx(
              'p-2 rounded transition-colors',
              bookmarked ? 'text-accent-purple bg-accent-purple/15' : 'text-text-muted hover:text-text bg-bg-card',
            )}
            aria-label="Bookmark"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button
            className="p-2 rounded text-text-muted hover:text-text bg-bg-card transition-colors"
            aria-label="Share"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
          </button>
          <Button onClick={startSession} loading={creating}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start competitive session
          </Button>
          <Button
            variant="secondary"
            onClick={() => setChatOpen(true)}
            title="Ask the AI questions about this guide"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask AI
          </Button>
        </div>
      </div>

      <ChatPanel guideId={guide.id} open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Tabs */}
      <div className="border-b border-bg-hover flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              tab === t.id
                ? 'border-accent-purple text-text'
                : 'border-transparent text-text-muted hover:text-text',
            )}
          >
            {t.label}
            <span className="ml-2 text-xs text-text-dim">
              {t.id === 'summary' ? 1
                : t.id === 'concepts' ? content.key_concepts.length
                : t.id === 'flashcards' ? content.flashcards.length
                : content.practice_questions.length}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'summary' && (
          <div className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-text mb-3">At a glance</h2>
              <p className="text-text leading-relaxed whitespace-pre-line">{content.summary}</p>
            </Card>

            {content.detailed_summary?.sections?.length ? (
              content.detailed_summary.sections.map((sec, i) => (
                <Card key={i}>
                  <h3 className="text-lg font-semibold text-text mb-3">{sec.heading}</h3>
                  <div className="space-y-3">
                    {sec.paragraphs.map((p, j) => (
                      <p key={j} className="text-text leading-relaxed whitespace-pre-line">{p}</p>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-text-muted text-sm">
                  This guide doesn't have a detailed breakdown yet. Generate a new guide to see one.
                </p>
              </Card>
            )}
          </div>
        )}

        {tab === 'concepts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.key_concepts.map((c, i) => (
              <Card key={i}>
                <h3 className="font-semibold text-text mb-1">{c.term}</h3>
                <p className="text-sm text-text-muted">{c.definition}</p>
              </Card>
            ))}
          </div>
        )}

        {tab === 'flashcards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.flashcards.map((f, i) => (
              <Flashcard key={i} front={f.front} back={f.back} />
            ))}
          </div>
        )}

        {tab === 'practice' && (
          <div className="space-y-3">
            {content.practice_questions.map((q, i) => (
              <PracticeQuestion key={i} index={i} q={q.question} a={q.answer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="text-left rounded bg-bg-card border border-bg-hover p-4 h-40 hover:border-accent-purple/40 transition-all shadow-card"
    >
      <div className="flex flex-col h-full">
        <span className="text-xs uppercase tracking-wide text-text-dim mb-2">
          {flipped ? 'Answer' : 'Question'}
        </span>
        <p className={clsx(
          'flex-1 flex items-center text-sm',
          flipped ? 'text-accent-purple' : 'text-text',
        )}>
          {flipped ? back : front}
        </p>
        <span className="text-xs text-text-dim mt-2">Click to flip</span>
      </div>
    </button>
  );
}

function PracticeQuestion({ index, q, a }: { index: number; q: string; a: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Card>
      <div className="flex gap-3">
        <span className="h-7 w-7 rounded-full bg-accent-purple/15 text-accent-purple flex items-center justify-center text-sm font-bold shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-text">{q}</p>
          {revealed ? (
            <div className="mt-3 pl-4 border-l-2 border-accent-purple/40">
              <p className="text-sm text-text-muted">{a}</p>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="text-sm text-accent-blue hover:underline mt-2"
            >
              Show answer
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}