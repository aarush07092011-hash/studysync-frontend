// App.tsx - router + provider composition. AuthProvider MUST wrap SocketProvider
// so the socket knows about the token. ThemeProvider is outer-most since it
// has no dependencies.

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { SocketProvider } from '@/context/SocketContext';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import GuidesListPage from '@/pages/GuidesListPage';
import GuideDetailPage from '@/pages/GuideDetailPage';
import CreateGuidePage from '@/pages/CreateGuidePage';
import SessionsListPage from '@/pages/SessionsListPage';
import LiveSessionPage from '@/pages/LiveSessionPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import FriendsPage from '@/pages/FriendsPage';
import ProfilePage from '@/pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppShell><Navigate to="/dashboard" replace /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppShell><DashboardPage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guides"
                  element={
                    <ProtectedRoute>
                      <AppShell><GuidesListPage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guides/new"
                  element={
                    <ProtectedRoute>
                      <AppShell><CreateGuidePage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guides/:id"
                  element={
                    <ProtectedRoute>
                      <AppShell><GuideDetailPage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <AppShell><SessionsListPage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/:id/live"
                  element={
                    <ProtectedRoute>
                      <AppShell><LiveSessionPage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <AppShell><LeaderboardPage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <ProtectedRoute>
                      <AppShell><FriendsPage /></AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppShell><ProfilePage /></AppShell>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}