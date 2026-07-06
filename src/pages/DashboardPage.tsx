// Dashboard: quick actions, recent guides, mini leaderboard, streak card.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { guidesApi, sessionsApi, getErrorMessage } from '@/lib/api';
import type { StudyGuideSummary, LeaderboardEntry } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GuideCardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [guides, setGuides] = useState<StudyGuideSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [loadingLb, setLoadingLb] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await guidesApi.list();
        if (!cancelled) setGuides(res.guides);
      } catch (err) {
        console.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingGuides(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await sessionsApi.globalLeaderboard('weekly', 5);
        if (!cancelled) setLeaderboard(res.leaderboard);
      } catch {
        // Non-critical
      } finally {
        if (!cancelled) setLoadingLb(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-text">
          Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{user?.username}</span>
        </h1>
        <p className="text-text-muted mt-1">Ready to study? Pick up where you left off or start something new.</p>
      </div>

      {/* Quick Start */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/guides/new">
          <Card hover className="h-full cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Upload new material</h3>
                <p className="text-sm text-text-muted mt-1">Paste text, upload a file, or drop a YouTube link.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/sessions">
          <Card hover className="h-full cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Start a session</h3>
                <p className="text-sm text-text-muted mt-1">Challenge your friends in a live multiplayer quiz.</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Guides */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">Recent study guides</h2>
            <Link to="/guides" className="text-sm text-accent-blue hover:underline">
              View all
            </Link>
          </div>
          {loadingGuides ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GuideCardSkeleton /><GuideCardSkeleton />
            </div>
          ) : guides.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <p className="text-text-muted">No guides yet.</p>
                <Link to="/guides/new">
                  <Button variant="primary" size="md" className="mt-4">
                    Create your first guide
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guides.slice(0, 4).map((g) => (
                <Link key={g.id} to={`/guides/${g.id}`}>
                  <Card hover className="h-full cursor-pointer">
                    <div className="h-24 rounded bg-gradient-card mb-3 flex items-center justify-center">
                      <svg className="h-8 w-8 text-accent-purple/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text line-clamp-2">{g.title}</h3>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(g.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Streak + Leaderboard */}
        <div className="space-y-6">
          {/* Streak card */}
          <Card glow className="text-center py-6">
            <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Your streak</p>
            <p className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">0</p>
            <p className="text-sm text-text-muted mt-2">days in a row</p>
            <p className="text-xs text-text-dim mt-3">
              Streak tracking comes online after your first session.
            </p>
          </Card>

          {/* Mini leaderboard */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text">Trending this week</h3>
              <Link to="/leaderboard" className="text-xs text-accent-blue hover:underline">
                View all
              </Link>
            </div>
            {loadingLb ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-10" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">
                No scores yet. Be the first!
              </p>
            ) : (
              <ol className="space-y-2">
                {leaderboard.map((entry) => (
                  <li
                    key={entry.userId}
                    className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-bg-hover transition-colors"
                  >
                    <span className="text-sm font-bold text-text-muted w-6">#{entry.rank}</span>
                    <span className="text-sm text-text flex-1 truncate">User #{entry.userId}</span>
                    <Badge variant="info">{entry.score} pts</Badge>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}