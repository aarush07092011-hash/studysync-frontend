// Leaderboard page: weekly / all-time toggle, user highlighted.

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { sessionsApi, getErrorMessage } from '@/lib/api';
import type { LeaderboardEntry } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

type Scope = 'weekly' | 'alltime';

export default function LeaderboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await sessionsApi.globalLeaderboard(scope, 50);
        if (!cancelled) setEntries(res.leaderboard);
      } catch (err) {
        toast(getErrorMessage(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [scope, toast]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text">Leaderboard</h1>
        <p className="text-text-muted mt-1">See where you stand among the community.</p>
      </div>

      {/* Scope toggle */}
      <div className="flex gap-2 border-b border-bg-hover">
        <button
          onClick={() => setScope('alltime')}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            scope === 'alltime' ? 'border-accent-purple text-text' : 'border-transparent text-text-muted hover:text-text',
          )}
        >
          All-time
        </button>
        <button
          onClick={() => setScope('weekly')}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            scope === 'weekly' ? 'border-accent-purple text-text' : 'border-transparent text-text-muted hover:text-text',
          )}
        >
          Weekly
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main list */}
        <div className="lg:col-span-2">
          <Card>
            {loading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-center py-10 text-text-muted">
                No scores yet. Play a session to appear here.
              </p>
            ) : (
              <ol className="space-y-2">
                {entries.map((entry) => {
                  const isMe = entry.userId === user?.id;
                  return (
                    <li
                      key={entry.userId}
                      className={clsx(
                        'flex items-center gap-4 p-3 rounded transition-colors',
                        isMe ? 'bg-accent-purple/15 border border-accent-purple/30' : 'hover:bg-bg-hover',
                      )}
                    >
                      <span className={clsx(
                        'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        entry.rank === 1 ? 'bg-status-warning text-white'
                          : entry.rank === 2 ? 'bg-text-muted text-bg'
                          : entry.rank === 3 ? 'bg-status-warning/60 text-white'
                          : 'bg-bg-hover text-text-muted',
                      )}>
                        #{entry.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">
                          {isMe ? 'You' : `User #${entry.userId}`}
                        </p>
                      </div>
                      <Badge variant="info">{entry.score} pts</Badge>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        {/* Sidebar: badges / achievements placeholder */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-text mb-3">Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              {['🔥', '⚡', '🎯', '🧠', '⭐', '🏆'].map((emoji, i) => (
                <div
                  key={i}
                  className="aspect-square rounded bg-bg-hover flex items-center justify-center text-2xl opacity-40"
                  title="Locked"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-xs text-text-dim mt-3">
              Earn badges by completing sessions, winning streaks, and more.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}