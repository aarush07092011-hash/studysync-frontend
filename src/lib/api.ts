// Axios instance with JWT injection + auto-logout on 401.
//
// In dev, Vite's proxy forwards /api to the backend.
// In production, set VITE_API_URL=https://your-api.onrender.com at build time
// (see .env.production.example) and the requests go cross-origin to Render.

import axios, { AxiosError, type AxiosInstance } from 'axios';
import type {
  AuthResponse,
  StudyGuide,
  StudyGuideSummary,
  FriendsListResponse,
  CompetitiveSession,
  SessionLeaderboardResponse,
  SubmitAnswerResponse,
} from '@/types/api';

export const TOKEN_KEY = 'studysync_token';
export const USER_KEY = 'studysync_user';

// Resolve the API base URL.
// - In dev: empty -> axios uses relative /api, Vite proxy handles it.
// - In prod: VITE_API_URL is set to the Render URL, we use `${url}/api`.
const RAW_API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = RAW_API_URL ? `${RAW_API_URL}/api` : '/api';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
});

// Attach JWT to every request if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the token so the auth context can redirect to /login.
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Use a soft redirect via custom event so contexts can react cleanly.
      window.dispatchEvent(new CustomEvent('studysync:unauthorized'));
    }
    return Promise.reject(err);
  },
);

/** Extract a user-facing error message from any axios failure. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error || err.message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

// --- Auth -------------------------------------------------------------------

export const authApi = {
  signup: (email: string, password: string, username: string) =>
    api.post<AuthResponse>('/auth/signup', { email, password, username }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
};

// --- Guides -----------------------------------------------------------------

export const guidesApi = {
  createFromText: (text: string, title?: string) =>
    api.post<{ guide: StudyGuide }>('/guides/create-from-text', { text, title }).then((r) => r.data),

  createFromPdf: (
    file: File,
    title?: string,
    onProgress?: (pct: number) => void,
  ): Promise<{ guide: StudyGuide }> =>
    new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('pdf', file);
      if (title) form.append('title', title);
      api
        .post<{ guide: StudyGuide }>('/guides/create-from-pdf', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          // 30 MB files + AI summarization can take a while; give it room.
          timeout: 180_000,
          onUploadProgress: (evt) => {
            if (!onProgress || !evt.total) return;
            const pct = Math.round((evt.loaded / evt.total) * 100);
            onProgress(pct);
          },
        })
        .then((r) => resolve(r.data))
        .catch((err) => reject(err));
    }),

  list: () =>
    api.get<{ guides: StudyGuideSummary[] }>('/guides').then((r) => r.data),

  get: (id: number) =>
    api.get<{ guide: StudyGuide }>(`/guides/${id}`).then((r) => r.data),
};

// --- Guide chat -----------------------------------------------------------

export const chatApi = {
  list: (guideId: number) =>
    api.get<{ messages: import('@/types/api').ChatMessage[] }>(`/guides/${guideId}/chat`).then((r) => r.data),

  send: (guideId: number, message: string) =>
    api.post<{ reply: string }>(`/guides/${guideId}/chat`, { message }).then((r) => r.data),

  clear: (guideId: number) =>
    api.delete<{ ok: boolean }>(`/guides/${guideId}/chat`).then((r) => r.data),
};

// --- Friends ----------------------------------------------------------------

export const friendsApi = {
  add: (friend_email: string) =>
    api.post<{ friendship: unknown; alreadyExists?: boolean }>('/friends/add', { friend_email }).then((r) => r.data),

  list: () => api.get<FriendsListResponse>('/friends/list').then((r) => r.data),

  accept: (id: number) =>
    api.put<{ friendship: unknown }>(`/friends/${id}/accept`).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ ok: boolean }>(`/friends/${id}`).then((r) => r.data),
};

// --- Sessions ---------------------------------------------------------------

export const sessionsApi = {
  create: (params: {
    guide_id: number;
    session_name: string;
    duration_minutes: number;
    invited_user_ids?: number[];
  }) =>
    api.post<{ session: CompetitiveSession }>('/sessions/create', params).then((r) => r.data),

  get: (id: number) =>
    api.get<{ session: CompetitiveSession }>(`/sessions/${id}`).then((r) => r.data),

  join: (id: number) =>
    api.post<{ session: CompetitiveSession; questions: CompetitiveSession['questions'] }>(`/sessions/${id}/join`).then((r) => r.data),

  start: (id: number) =>
    api.post<{ ok: boolean; session_id: number; started_at: string }>(`/sessions/${id}/start`).then((r) => r.data),

  submitAnswer: (id: number, question_id: number, answer: number | string) =>
    api.post<SubmitAnswerResponse>(`/sessions/${id}/submit-answer`, { question_id, answer }).then((r) => r.data),

  leaderboard: (id: number) =>
    api.get<SessionLeaderboardResponse>(`/sessions/${id}/leaderboard`).then((r) => r.data),

  globalLeaderboard: (scope: 'weekly' | 'alltime' = 'alltime', limit = 50) =>
    api.get<{ scope: string; leaderboard: { userId: number; score: number; rank: number }[] }>(
      `/sessions/leaderboard/global`,
      { params: { scope, limit } },
    ).then((r) => r.data),
};