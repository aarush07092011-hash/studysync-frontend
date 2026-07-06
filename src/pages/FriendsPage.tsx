// Friends page: list, add by email, accept pending requests.

import { useEffect, useState, type FormEvent } from 'react';
import { friendsApi, getErrorMessage } from '@/lib/api';
import type { Friend, FriendsListResponse, PendingFriendRequest } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';

export default function FriendsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<FriendsListResponse>({ friends: [], pendingIncoming: [] });
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const refresh = async () => {
    try {
      const res = await friendsApi.list();
      setData(res);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      const res = await friendsApi.add(addEmail.trim());
      toast(res.alreadyExists ? 'Friend request already sent' : 'Friend request sent!', 'success');
      setAddEmail('');
      await refresh();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setAdding(false);
    }
  };

  const onAccept = async (id: number) => {
    try {
      await friendsApi.accept(id);
      toast('Friend added!', 'success');
      await refresh();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const onRemove = async (id: number) => {
    try {
      await friendsApi.remove(id);
      toast('Friend removed', 'info');
      await refresh();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text">Friends</h1>
        <p className="text-text-muted mt-1">Study with your friends and challenge each other.</p>
      </div>

      {/* Add friend */}
      <Card>
        <h2 className="font-semibold text-text mb-3">Add a friend</h2>
        <form onSubmit={onAdd} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
            />
          </div>
          <Button type="submit" loading={adding}>Send request</Button>
        </form>
      </Card>

      {/* Pending requests */}
      {data.pendingIncoming.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Pending requests</h2>
          <div className="space-y-2">
            {data.pendingIncoming.map((req) => (
              <PendingRequestRow key={req.id} req={req} onAccept={onAccept} />
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <h2 className="text-xl font-semibold text-text mb-3">
          Your friends {data.friends.length > 0 && <span className="text-text-muted">({data.friends.length})</span>}
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
          </div>
        ) : data.friends.length === 0 ? (
          <Card>
            <p className="text-center py-8 text-text-muted">
              No friends yet. Add someone by email above.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.friends.map((f) => (
              <FriendCard key={f.id} friend={f} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PendingRequestRow({ req, onAccept }: { req: PendingFriendRequest; onAccept: (id: number) => void }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
        {req.requester_username?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1">
        <p className="font-medium text-text">{req.requester_username}</p>
        <p className="text-xs text-text-muted">{req.requester_email}</p>
      </div>
      <Button onClick={() => onAccept(req.id)} size="sm">Accept</Button>
    </Card>
  );
}

function FriendCard({ friend, onRemove }: { friend: Friend; onRemove: (id: number) => void }) {
  return (
    <Card hover>
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shrink-0">
          {friend.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text truncate">{friend.username}</p>
          <p className="text-xs text-text-muted truncate">{friend.email}</p>
          <div className="mt-2">
            <Badge variant="default">Friends</Badge>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(friend.id)}
        className="text-xs text-text-dim hover:text-status-danger mt-3 transition-colors"
      >
        Remove friend
      </button>
    </Card>
  );
}