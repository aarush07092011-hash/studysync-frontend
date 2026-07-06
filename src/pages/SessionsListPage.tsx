// Sessions page: list active/inactive sessions, friend invites, past results.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { guidesApi, getErrorMessage } from '@/lib/api';
import type { StudyGuideSummary } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';

// Phase 2 backend doesn't have a "list my sessions" endpoint yet, so we
// present an empty-state with a CTA to create one. This keeps the page
// useful without lying about data we don't have.

export default function SessionsListPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [guides, setGuides] = useState<StudyGuideSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await guidesApi.list();
        if (!cancelled) setGuides(res.guides);
      } catch (err) {
        toast(getErrorMessage(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Study sessions</h1>
          <p className="text-text-muted mt-1">Challenge friends in live multiplayer quizzes.</p>
        </div>
      </div>

      {/* Start a session */}
      <Card glow>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text">Start a new session</h3>
            <p className="text-sm text-text-muted mt-1">
              Pick one of your guides and we'll generate questions for a competitive quiz.
            </p>
          </div>
          <Link to="/guides">
            <Button>Browse guides</Button>
          </Link>
        </div>
      </Card>

      {/* Active sessions */}
      <div>
        <h2 className="text-xl font-semibold text-text mb-3">Active sessions</h2>
        <Card>
          <div className="text-center py-10">
            <p className="text-text-muted">No active sessions right now.</p>
            <p className="text-xs text-text-dim mt-1">Sessions appear here once you join or create one.</p>
          </div>
        </Card>
      </div>

      {/* Past sessions */}
      <div>
        <h2 className="text-xl font-semibold text-text mb-3">Recent guides</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
          </div>
        ) : guides.length === 0 ? (
          <Card>
            <div className="text-center py-10">
              <p className="text-text-muted">No guides yet. Create one to start a session.</p>
              <Button onClick={() => navigate('/guides/new')} className="mt-4">
                Create a guide
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.slice(0, 6).map((g) => (
              <Link key={g.id} to={`/guides/${g.id}`}>
                <Card hover className="cursor-pointer">
                  <h3 className="font-semibold text-text line-clamp-2">{g.title}</h3>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(g.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-accent-blue mt-3">Start session →</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}