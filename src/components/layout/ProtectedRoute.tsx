// ProtectedRoute: redirects to /login if not authenticated.
// Allows the auth state to settle (we hydrate from localStorage synchronously
// in AuthProvider, so this is mainly a safety net).

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}