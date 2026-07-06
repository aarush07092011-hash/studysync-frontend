// API response shapes. These mirror the backend (studysync-backend) responses.
// Keep these in sync with routes/*.js on the server.

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface StudyGuideSummary {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
}

export interface DetailedSummarySection {
  heading: string;
  paragraphs: string[];
}

export interface StudyGuideContent {
  title: string;
  summary: string;
  detailed_summary?: {
    sections: DetailedSummarySection[];
  };
  key_concepts: KeyConcept[];
  flashcards: Flashcard[];
  practice_questions: PracticeQuestion[];
}

export interface StudyGuide extends StudyGuideSummary {
  content: StudyGuideContent;
}

export interface Friend {
  id: number;            // friendship id
  user_id: number;       // the friend's user id
  username: string;
  email: string;
  created_at: string;
}

export interface PendingFriendRequest {
  id: number;            // friendship id
  requester_id: number;
  requester_username: string;
  requester_email: string;
  created_at: string;
}

export interface FriendsListResponse {
  friends: Friend[];
  pendingIncoming: PendingFriendRequest[];
}

export interface SessionQuestion {
  id: number;
  prompt: string;
  choices: string[];
  correct_index?: number; // present for creator or completed sessions only
}

export interface CompetitiveSession {
  id: number;
  creator_id: number;
  session_name: string;
  guide_id: number;
  duration_minutes: number;
  status: 'waiting' | 'active' | 'completed';
  start_time: string | null;
  end_time: string | null;
  questions: SessionQuestion[];
  created_at: string;
}

export interface LeaderboardEntry {
  userId: number;
  score: number;
  rank: number;
  correct_answers?: number;
  total_questions?: number;
}

export interface SessionLeaderboardResponse {
  session_id: number;
  total_questions: number | null;
  leaderboard: LeaderboardEntry[];
}

export interface AnswerAwarded {
  base: number;
  timeBonus: number;
  streakMultiplier: number;
  total: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  awarded: AnswerAwarded;
  totalScore: number;
  streak: number;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Socket.io server -> client events
export interface ServerToClientEvents {
  hello: (data: { user_id: number; username: string }) => void;
  joined_session: (data: { session_id: number }) => void;
  user_joined: (data: { session_id: number; user_id: number; username: string }) => void;
  user_left: (data: { session_id: number; user_id: number }) => void;
  session_started: (data: { session_id: number; started_at: string; duration_minutes: number }) => void;
  answer_submitted: (data: {
    session_id: number;
    user_id: number;
    question_id: number;
    correct: boolean;
    awarded: AnswerAwarded;
    totalScore: number;
  }) => void;
  leaderboard_updated: (data: {
    session_id: number;
    leaderboard: LeaderboardEntry[];
    total_questions: number;
  }) => void;
  session_ended: (data: {
    session_id: number;
    final_leaderboard: LeaderboardEntry[];
  }) => void;
  error_event: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_session: (data: { session_id: number }) => void;
  leave_session: (data: { session_id: number }) => void;
}