// Profile page: user info, stats, settings access.

import { useEffect, useState } from 'react';
import { guidesApi, sessionsApi, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [guideCount, setGuideCount] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [guidesRes, lbRes] = await Promise.all([
          guidesApi.list(),
          sessionsApi.globalLeaderboard('alltime', 100),
        ]);
        if (cancelled) return;
        setGuideCount(guidesRes.guides.length);
        const me = lbRes.leaderboard.find((e) => e.userId === user?.id);
        if (me) {
          setRank(me.rank);
          setTotalScore(me.score);
        } else {
          setRank(null);
          setTotalScore(0);
        }
      } catch (err) {
        console.error(getErrorMessage(err));
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user) return null;

  // Build a fake "studies this month" mini-graph: 30 bars, the last 7 slightly
  // higher to suggest recent activity. Replace with real data later.
  const monthBars = Array.from({ length: 30 }, (_, i) => (i > 22 ? 0.4 + Math.random() * 0.6 : Math.random() * 0.3));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text">Profile</h1>
        <p className="text-text-muted mt-1">Your stats and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity card */}
        <Card glow className="lg:col-span-1">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold mx-auto">
              {user.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <h2 className="text-xl font-bold text-text mt-4">{user.username}</h2>
            <p className="text-sm text-text-muted">{user.email}</p>
            <p className="text-xs text-text-dim mt-2">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Guides" value={guideCount} />
            <StatCard label="Global rank" value={rank ?? '—'} />
            <StatCard label="Total score" value={totalScore} />
          </div>

          <Card>
            <h3 className="font-semibold text-text mb-3">Studies this month</h3>
            <div className="flex items-end gap-1 h-24">
              {monthBars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-primary rounded-t opacity-70 hover:opacity-100 transition-opacity"
                  style={{ height: `${h * 100}%` }}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-text-dim mt-2">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-text mb-3">Badges</h3>
            <div className="grid grid-cols-6 gap-3">
              {['🔥', '⚡', '🎯', '🧠', '⭐', '🏆'].map((emoji, i) => (
                <div
                  key={i}
                  className="aspect-square rounded bg-bg-hover flex items-center justify-center text-2xl opacity-40 hover:opacity-100 transition-opacity cursor-help"
                  title="Earned by completing sessions"
                >
                  {emoji}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-text mb-3">Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text font-medium">Theme</p>
                  <p className="text-xs text-text-muted">Currently using {theme} mode</p>
                </div>
                <Button variant="secondary" size="sm" onClick={toggleTheme}>
                  Switch to {theme === 'dark' ? 'light' : 'dark'}
                </Button>
              </div>
              <div className="h-px bg-bg-hover" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text font-medium">Sign out</p>
                  <p className="text-xs text-text-muted">End your current session</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string | null }) {
  return (
    <Card className="text-center">
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-2xl font-bold text-text mt-1">
        {value === null ? <span className="skeleton inline-block h-7 w-12" /> : value}
      </p>
    </Card>
  );
}