// Live session page: countdown timer + current question + live leaderboard.
// Socket.io for real-time leaderboard updates.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { sessionsApi, getErrorMessage } from '@/lib/api';
import type {
  CompetitiveSession,
  LeaderboardEntry,
  SessionQuestion,
} from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function LiveSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [session, setSession] = useState<CompetitiveSession | null>(null);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [now, setNow] = useState(Date.now());

  // 1. Initial fetch + join
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const joinRes = await sessionsApi.join(parseInt(id, 10));
        if (cancelled) return;
        setSession(joinRes.session);
        setQuestions(joinRes.questions);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // 2. Socket.io subscription
  useEffect(() => {
    if (!socket || !id) return;
    const sid = parseInt(id, 10);

    const onJoined = () => { /* could show a toast */ };
    const onUserJoined = () => { /* could update presence */ };
    const onAnswer = (data: { user_id: number; correct: boolean; totalScore: number }) => {
      if (data.user_id === user?.id) {
        toast(data.correct ? 'Correct!' : 'Wrong answer', data.correct ? 'success' : 'error');
        setSubmitted(true);
      }
    };
    const onLeaderboard = (data: { leaderboard: LeaderboardEntry[]; total_questions: number }) => {
      setLeaderboard(data.leaderboard);
    };
    const onEnded = (data: { final_leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.final_leaderboard);
      setEnded(true);
    };
    const onError = (data: { message: string }) => {
      toast(data.message, 'error');
    };

    socket.on('joined_session', onJoined);
    socket.on('user_joined', onUserJoined);
    socket.on('answer_submitted', onAnswer);
    socket.on('leaderboard_updated', onLeaderboard);
    socket.on('session_ended', onEnded);
    socket.on('error_event', onError);

    socket.emit('join_session', { session_id: sid });

    return () => {
      socket.emit('leave_session', { session_id: sid });
      socket.off('joined_session', onJoined);
      socket.off('user_joined', onUserJoined);
      socket.off('answer_submitted', onAnswer);
      socket.off('leaderboard_updated', onLeaderboard);
      socket.off('session_ended', onEnded);
      socket.off('error_event', onError);
    };
  }, [socket, id, user?.id, toast]);

  // 3. Countdown tick
  useEffect(() => {
    if (!session?.start_time || ended) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [session?.start_time, ended]);

  const totalMs = (session?.duration_minutes ?? 0) * 60 * 1000;
  const elapsedMs = session?.start_time ? now - new Date(session.start_time).getTime() : 0;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const remainingPct = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0;
  const remainingSeconds = remainingMs / 1000;

  // 4. Handlers
  const submit = async () => {
    if (!session || selected === null) return;
    try {
      await sessionsApi.submitAnswer(session.id, questionIndex, selected);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const advance = () => {
    if (questionIndex + 1 >= questions.length) {
      // No more questions. Wait for the timer to end the session.
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  };

  const isCreator = session?.creator_id === user?.id;
  const currentQ = questions[questionIndex];

  // Sort leaderboard by score desc (server already does this, but be defensive)
  const sortedLb = useMemo(
    () => [...leaderboard].sort((a, b) => b.score - a.score),
    [leaderboard],
  );

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="h-10 w-10 mx-auto rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
        <p className="text-text-muted mt-4">Loading session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-20">
        <p className="text-status-danger">{error ?? 'Session not found'}</p>
        <Link to="/sessions"><Button variant="secondary" className="mt-4">Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header: timer + status */}
      <Card className="text-center">
        <div className="flex items-center justify-center gap-3">
          <Badge variant={session.status === 'active' ? 'success' : session.status === 'waiting' ? 'warning' : 'default'}>
            {session.status}
          </Badge>
          <h1 className="text-xl font-semibold text-text truncate">{session.session_name}</h1>
        </div>
        <div className="mt-6">
          <p className={clsx(
            'text-6xl font-bold tabular-nums',
            remainingSeconds <= 30 ? 'text-status-danger animate-pulse-slow' : 'text-text',
          )}>
            {formatTime(remainingSeconds)}
          </p>
          <div className="mt-4 h-2 max-w-md mx-auto bg-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-1000 ease-linear"
              style={{ width: `${remainingPct}%` }}
            />
          </div>
          {session.status === 'waiting' && isCreator && (
            <Button
              className="mt-6"
              onClick={async () => {
                try {
                  await sessionsApi.start(session.id);
                  // Re-fetch to get updated start_time
                  const res = await sessionsApi.get(session.id);
                  setSession(res.session);
                  toast('Session started!', 'success');
                } catch (err) {
                  toast(getErrorMessage(err), 'error');
                }
              }}
            >
              Start session
            </Button>
          )}
          {session.status === 'waiting' && !isCreator && (
            <p className="text-text-muted mt-6">Waiting for the creator to start...</p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Question card */}
        <div className="lg:col-span-2 space-y-4">
          {session.status === 'active' && currentQ && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  Question {questionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-text-muted">
                  {questionIndex + 1}/{questions.length}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-text mb-6">{currentQ.prompt}</h2>
              <div className="space-y-2">
                {currentQ.choices.map((choice, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = currentQ.correct_index === idx;
                  const showState = submitted;
                  return (
                    <button
                      key={idx}
                      onClick={() => !submitted && setSelected(idx)}
                      disabled={submitted}
                      className={clsx(
                        'w-full text-left rounded p-4 border transition-all',
                        'hover:border-accent-purple/40',
                        !showState && isSelected && 'border-accent-purple bg-accent-purple/10',
                        !showState && !isSelected && 'border-bg-hover bg-bg-card',
                        showState && isCorrect && 'border-status-success bg-status-success/10',
                        showState && isSelected && !isCorrect && 'border-status-danger bg-status-danger/10',
                        showState && !isCorrect && !isSelected && 'border-bg-hover opacity-60',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          'h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                          showState && isCorrect ? 'bg-status-success text-white'
                            : showState && isSelected && !isCorrect ? 'bg-status-danger text-white'
                            : isSelected ? 'bg-accent-purple text-white'
                            : 'bg-bg-hover text-text-muted',
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-text">{choice}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                {!submitted ? (
                  <Button onClick={submit} disabled={selected === null}>
                    Submit answer
                  </Button>
                ) : (
                  <Button onClick={advance} disabled={questionIndex + 1 >= questions.length}>
                    {questionIndex + 1 >= questions.length ? 'Last question' : 'Next question'}
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Live leaderboard */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text">Live leaderboard</h3>
              <Badge variant="info">{sortedLb.length}</Badge>
            </div>
            {sortedLb.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                Waiting for first answer...
              </p>
            ) : (
              <ol className="space-y-2">
                {sortedLb.map((entry) => {
                  const isMe = entry.userId === user?.id;
                  return (
                    <li
                      key={entry.userId}
                      className={clsx(
                        'flex items-center gap-3 p-2.5 rounded transition-all',
                        isMe ? 'bg-accent-purple/15 border border-accent-purple/30' : 'bg-bg-hover/50',
                      )}
                    >
                      <span className={clsx(
                        'h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        entry.rank === 1 ? 'bg-status-warning text-white'
                          : entry.rank === 2 ? 'bg-text-muted text-bg'
                          : entry.rank === 3 ? 'bg-status-warning/60 text-white'
                          : 'bg-bg-hover text-text-muted',
                      )}>
                        {entry.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={clsx('text-sm font-medium truncate', isMe ? 'text-text' : 'text-text')}>
                          {isMe ? 'You' : `User #${entry.userId}`}
                        </p>
                        {entry.correct_answers !== undefined && entry.total_questions !== undefined && (
                          <p className="text-xs text-text-muted">
                            {entry.correct_answers} / {entry.total_questions} correct
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-text tabular-nums">{entry.score}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>
      </div>

      {/* End-of-session modal */}
      <Modal
        open={ended}
        onClose={() => navigate('/sessions')}
        title="Session complete!"
        size="md"
      >
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <p className="text-text-muted">Here are the final standings.</p>
          <ol className="space-y-2 text-left">
            {sortedLb.slice(0, 5).map((entry) => (
              <li
                key={entry.userId}
                className={clsx(
                  'flex items-center gap-3 p-2.5 rounded',
                  entry.userId === user?.id ? 'bg-accent-purple/15' : 'bg-bg-hover',
                )}
              >
                <span className="font-bold text-text-muted w-6">#{entry.rank}</span>
                <span className="flex-1 text-text">
                  {entry.userId === user?.id ? 'You' : `User #${entry.userId}`}
                </span>
                <span className="font-bold text-text">{entry.score} pts</span>
              </li>
            ))}
          </ol>
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="secondary" onClick={() => navigate('/sessions')}>Back to sessions</Button>
            <Button onClick={() => navigate('/leaderboard')}>View leaderboard</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}