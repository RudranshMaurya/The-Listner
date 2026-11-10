import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToUserSessions } from '../../lib/database';
import type { Session } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatPaise } from '../../lib/upi';
import { formatDuration } from '../../lib/billing';
import { MessageSquare, Calendar, Clock } from 'lucide-react';

export const ListenerConversationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserSessions(currentUser.uid, 'listener', (list) => {
      setSessions(list);
    });
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Conversation History & Session Earnings
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Completed listening sessions, duration, and net credited earnings.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-5 h-5 text-text-muted" />}
          title="No Conversations Yet"
          description="When talkers connect with you, your conversation duration and earnings breakdown will be listed here."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const dateStr = new Date(s.startedAt || s.requestedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <Card key={s.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={s.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.talkerId}`}
                    alt={s.talkerName}
                    className="w-12 h-12 rounded-card object-cover bg-surface border border-border"
                  />
                  <div>
                    <h4 className="text-small font-semibold text-text flex items-center gap-2">
                      <span>{s.talkerName}</span>
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
                        {formatDuration(s.billableSeconds || s.durationSeconds || 0)}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-success">
                        Earned: {formatPaise(s.listenerEarningsPaise || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/session/${s.id}`)}
                >
                  View Room
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
