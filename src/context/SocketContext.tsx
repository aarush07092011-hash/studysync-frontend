// SocketContext: lazy-connects a Socket.io client when a token is available,
// reconnects on auth failure, and exposes a typed interface matching the
// backend's events (see types/api.ts ServerToClientEvents).

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/api';
import { useAuth } from './AuthContext';

type StudySyncSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: StudySyncSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<StudySyncSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Tear down any existing socket first.
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (!token) {
      setIsConnected(false);
      return;
    }

    // In dev, Vite proxies /socket.io -> backend.
    // In prod, VITE_API_URL points at the Render service and we connect
    // there directly with the same /socket.io path.
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    const s: StudySyncSocket = io(apiUrl || '/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));
    s.on('connect_error', (err) => {
      // Server rejects tokens with a custom message; surface to console only.
      console.warn('[socket] connect_error:', err.message);
      setIsConnected(false);
    });

    socketRef.current = s;

    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, [token]);

  const value = useMemo<SocketContextValue>(
    () => ({ socket: socketRef.current, isConnected }),
    [isConnected],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
}