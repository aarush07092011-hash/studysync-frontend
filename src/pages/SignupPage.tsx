// Signup page: email, username, password. Mirrors LoginPage styling.

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await signup(email, password, username);
      toast('Account created. Let\'s study!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
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
          <h1 className="text-2xl font-bold text-text mb-1">Create your account</h1>
          <p className="text-sm text-text-muted mb-6">Start generating AI study guides in seconds.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="studious_user"
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              error={error ?? undefined}
            />

            <Button type="submit" loading={isLoading} fullWidth size="lg">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-blue hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}