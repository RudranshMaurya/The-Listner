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
import { MessageSquare, Calendar, Clock, DollarSign } from 'lucide-react';

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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Conversation History & Session Earnings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Completed listening sessions, duration, and net credited earnings.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8" />}
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
              <Card key={s.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={s.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.talkerId}`}
                    alt={s.talkerName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{s.talkerName}</span>
                      <Badge variant="neutral" size="sm">
                        {s.type === 'audio' ? 'Audio Call' : 'Chat'}
                      </Badge>
                      <Badge variant={s.status === 'active' ? 'listening' : 'neutral'} size="sm">
                        {s.status}
                      </Badge>
                    </h4>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDuration(s.billableSeconds || s.durationSeconds || 0)}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
