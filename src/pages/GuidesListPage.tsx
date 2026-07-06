// Guides list page: grid of user's guides, with link to detail and "new" CTA.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { guidesApi, getErrorMessage } from '@/lib/api';
import type { StudyGuideSummary } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GuideCardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';

export default function GuidesListPage() {
  const { toast } = useToast();
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
          <h1 className="text-3xl font-bold text-text">My guides</h1>
          <p className="text-text-muted mt-1">All your AI-generated study material in one place.</p>
        </div>
        <Link to="/guides/new">
          <Button>+ New guide</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <GuideCardSkeleton /><GuideCardSkeleton /><GuideCardSkeleton />
        </div>
      ) : guides.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-bg-hover flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text">No guides yet</h3>
            <p className="text-text-muted mt-1">Generate your first guide to get started.</p>
            <Link to="/guides/new">
              <Button className="mt-4">Create your first guide</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((g) => (
            <Link key={g.id} to={`/guides/${g.id}`}>
              <Card hover className="h-full cursor-pointer">
                <div className="h-28 rounded bg-gradient-card mb-3 flex items-center justify-center">
                  <svg className="h-10 w-10 text-accent-purple/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text line-clamp-2">{g.title}</h3>
                <p className="text-xs text-text-muted mt-2">
                  Created {new Date(g.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}