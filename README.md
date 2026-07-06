# StudySync Frontend

React + TypeScript + Vite + Tailwind + Socket.io client. Dark theme by default. Connects to the [`studysync-backend`](../studysync-backend) Express server.

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 5 |
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3 (custom design-system palette) |
| HTTP | Axios (with JWT interceptor + 401 auto-logout) |
| Realtime | socket.io-client |
| Routing | React Router 6 |
| State | React Context (auth, socket, toast, theme) |

## Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`. The dev server proxies `/api` and `/socket.io` to `http://localhost:3000`, so **make sure the backend is running**.

```bash
# In a separate terminal, from studysync-backend/:
npm start
```

## Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # serve the built bundle
```

## Pages

| Path | Purpose |
|---|---|
| `/login`, `/signup` | Auth (no AppShell) |
| `/dashboard` | Greeting, quick actions, recent guides, mini leaderboard, streak card |
| `/guides` | Grid of all your study guides |
| `/guides/new` | Create flow: paste text / upload file / YouTube URL (file + YouTube are stubbed — backend Phase 1 only handles text) |
| `/guides/:id` | Detail with Summary / Concepts / Flashcards / Practice tabs + "Start session" CTA |
| `/sessions` | Start-new-session CTA, recent guides |
| `/sessions/:id/live` | Live quiz: timer, MCQ card, live leaderboard, end-of-session results |
| `/leaderboard` | Weekly / All-time toggle, user highlighted |
| `/friends` | Add by email, pending requests, friends grid |
| `/profile` | Stats, studies-this-month bar chart, settings (theme + signout) |

## Real-time flow (Live Session)

1. User clicks "Start session" on a guide → `POST /api/sessions/create`.
2. Page navigates to `/sessions/:id/live`.
3. `LiveSessionPage` calls `POST /sessions/:id/join` and then `socket.emit('join_session', ...)`.
4. Backend emits `session_started`, `answer_submitted`, `leaderboard_updated`, `session_ended`.
5. Frontend listens via typed `ServerToClientEvents` and updates state live.
6. On `session_ended`, results modal appears with final standings.

## Design system

Dark theme by default. Light theme toggle in the header.

| Token | Value |
|---|---|
| `bg` (page) | `#0F172A` |
| `bg-card` | `#1E293B` |
| `bg-hover` | `#273449` |
| `accent-blue` | `#3B82F6` |
| `accent-purple` | `#8B5CF6` |
| `text` | `#F1F5F9` |
| `text-muted` | `#94A3B8` |
| `status-success` | `#10B981` |
| `status-warning` | `#F59E0B` |
| `status-danger` | `#EF4444` |

All defined in `tailwind.config.js` — extend there if you need new tokens.

## Project layout

```
studysync-frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css                 # Tailwind + base styles
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Badge, Modal, Skeleton
│   │   └── layout/               # AppShell, ProtectedRoute
│   ├── context/                  # Auth, Socket, Toast, Theme providers
│   ├── lib/                      # api.ts (axios + endpoint wrappers)
│   ├── pages/                    # one per route
│   └── types/                    # api.ts (shared shapes matching backend)
├── index.html
├── tailwind.config.js
├── vite.config.ts                # /api + /socket.io proxy to :3000
└── tsconfig.json
```

## Known limitations / Phase 3 candidates

- **File upload & YouTube** — UI is built; backend doesn't process them yet. The Create Guide page shows friendly toasts instead of erroring.
- **Active sessions list** — backend doesn't expose "my sessions" yet; the page shows an empty state with CTA.
- **Streak tracking** — dashboard placeholder only; backend has the schema but no UI to view/update.
- **No service worker / offline mode.**
- **No error boundary.** A bad render currently whitescreens; `react-error-boundary` would be a quick add.
- **No tests.** Same rationale as the backend (kept deps minimal). Vitest + Testing Library would be the natural choice.

## Notes

- **JWT in localStorage** for simplicity. For production, consider httpOnly cookies to avoid XSS exposure of the token.
- **Socket reconnects automatically**; the `Live` indicator in the header reflects connection state.
- **Theme toggle** is in the header and the profile settings — both wired to the same `ThemeContext`.
- **Real-time "N / M correct"** is rendered in the live leaderboard as soon as the backend broadcasts it.