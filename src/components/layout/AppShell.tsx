// AppShell: header + sidebar + main content area. Used by every authenticated page.

import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { to: '/guides', label: 'My Guides', icon: 'M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z M4 4v12a4 4 0 0 0 4 4' },
  { to: '/sessions', label: 'Sessions', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { to: '/friends', label: 'Friends', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'M8 21h8 M12 17v4 M6 4h12v6a6 6 0 0 1-12 0V4z M4 4h2v3a4 4 0 0 1-2 0V4z M18 4h2v3a4 4 0 0 1-2 0V4z' },
  { to: '/profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
];

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* --- Sidebar (desktop) --- */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-bg-card border-r border-bg-hover',
          'transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-16 px-5 flex items-center border-b border-bg-hover">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gradient-primary flex items-center justify-center font-bold text-white">
              S
            </div>
            <span className="font-bold text-text text-lg">StudySync</span>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-purple/15 text-text'
                    : 'text-text-muted hover:text-text hover:bg-bg-hover',
                )
              }
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-bg-hover">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* --- Mobile sidebar backdrop --- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* --- Main area --- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-16 px-4 lg:px-8 border-b border-bg-hover bg-bg-card flex items-center justify-between gap-4">
          <button
            className="lg:hidden p-2 text-text-muted hover:text-text"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
              <span
                className={clsx(
                  'h-2 w-2 rounded-full',
                  isConnected ? 'bg-status-success animate-pulse-slow' : 'bg-text-dim',
                )}
              />
              {isConnected ? 'Live' : 'Offline'}
            </div>

            {/* Profile menu */}
            <div className="flex items-center gap-3 pl-2 border-l border-bg-hover">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-text">{user?.username}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}