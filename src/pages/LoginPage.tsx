// Login page: email + password + "Stay signed in" toggle.
// "Stay signed in" simply controls whether we persist the JWT to localStorage
// vs sessionStorage. (We always store in localStorage for now; the toggle is
// UI-only and can be wired up properly later.)

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      toast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 bg-gradient-hero">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center font-bold text-white text-xl">
              S
            </div>
            <span className="font-bold text-text text-2xl">StudySync</span>
          </div>
        </div>

        <div className="rounded bg-bg-card border border-bg-hover p-8 shadow-card-lg">
          <h1 className="text-2xl font-bold text-text mb-1">Welcome back</h1>
          <p className="text-sm text-text-muted mb-6">Sign in to keep learning.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={error ?? undefined}
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="h-4 w-4 rounded border-bg-hover bg-bg-hover accent-accent-purple"
              />
              <span className="text-sm text-text-muted">Stay signed in</span>
            </label>

            <Button type="submit" loading={isLoading} fullWidth size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-blue hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}