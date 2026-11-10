import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToUserSessions } from '../../lib/database';
import type { Session } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ReviewModal } from '../../components/communication/ReviewModal';
import { formatPaise } from '../../lib/upi';
import { formatDuration } from '../../lib/billing';
import { MessageSquare, Calendar, Star, Clock } from 'lucide-react';

export const TalkerConversationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviewSession, setReviewSession] = useState<Session | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'chat' | 'audio'>('all');

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserSessions(currentUser.uid, 'talker', (list) => {
      setSessions(list);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const filtered = sessions.filter((s) => (typeFilter === 'all' ? true : s.type === typeFilter));

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title text-text tracking-tight">
            Conversation History
          </h2>
          <p className="text-small text-text-muted mt-0.5">
            Past text chats and encrypted audio calls with your listeners.
          </p>
        </div>

        <div className="flex gap-1 bg-surface p-1 rounded-pill border border-border text-caption">
          {(['all', 'chat', 'audio'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-pill capitalize transition-all cursor-pointer ${
                typeFilter === t
                  ? 'bg-surface-raised text-text font-semibold shadow-soft'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-5 h-5 text-text-muted" />}
          title="No Past Conversations"
          description="When you complete chat or audio sessions, your detailed duration and receipts will appear here."
          actionLabel="Find a Listener"
          onAction={() => navigate('/talker/listeners')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const dateStr = new Date(s.startedAt || s.requestedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <Card key={s.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={s.listenerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.listenerId}`}
                    alt={s.listenerName}
                    className="w-12 h-12 rounded-card object-cover bg-surface border border-border"
                  />
                  <div>
                    <h4 className="text-small font-semibold text-text flex items-center gap-2">
                      <span>{s.listenerName}</span>
                      <Badge variant="neutral" size="sm">
                        {s.type === 'audio' ? 'Audio Call' : 'Chat'}
                      </Badge>
                      <Badge variant={s.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {s.status}
                      </Badge>
                    </h4>

                    <div className="flex items-center gap-3 mt-1 text-caption text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Duration: {formatDuration(s.billableSeconds || s.durationSeconds || 0)}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-text">
                        Charged: {formatPaise(s.totalChargePaise || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/session/${s.id}`)}
                  >
                    View Room
                  </Button>

                  {!s.reviewSubmitted && s.status === 'ended' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setReviewSession(s)}
                      leftIcon={<Star className="w-3.5 h-3.5" />}
                    >
                      Rate Listener
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {reviewSession && (
        <ReviewModal
          isOpen={!!reviewSession}
          onClose={() => setReviewSession(null)}
          session={reviewSession}
        />
      )}
    </div>
  );
};
