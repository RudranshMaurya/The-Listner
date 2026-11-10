import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToAllSessions, endSession, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Session } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatPaise } from '../../lib/upi';
import { formatDuration } from '../../lib/billing';
import { LogOut } from 'lucide-react';

export const AdminSessionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const unsub = subscribeToAllSessions((list) => setSessions(list));
    return () => unsub();
  }, []);

  const handleAdminEndSession = async (sessionId: string) => {
    if (!currentUser) return;
    try {
      await endSession(sessionId, currentUser.uid, 'Force ended by Administrator');
      await writeAuditLog({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || 'admin',
        action: `Force terminated active session: ${sessionId}`,
        targetType: 'session',
        targetId: sessionId,
        details: 'Admin supervisory intervention'
      });
      showToast('info', 'Session ended by admin.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to end session.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Active & Historical Conversations ({sessions.length})
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Supervise live active rooms, durations, and financial ledger settlement.
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <Card key={s.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-small text-text">
                  Talker: {s.talkerName} ↔ Listener: {s.listenerName}
                </span>
                <Badge variant={s.status === 'active' ? 'success' : 'neutral'} size="sm">
                  {s.status}
                </Badge>
                <Badge variant="neutral" size="sm">
                  {s.type === 'audio' ? 'Audio Call' : 'Chat'}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-caption text-text-muted">
                <span>Session ID: {s.id}</span>
                <span>•</span>
                <span>Duration: {formatDuration(s.billableSeconds || s.durationSeconds || 0)}</span>
                <span>•</span>
                <span className="font-semibold text-text">
                  Charge: {formatPaise(s.totalChargePaise || 0)}
                </span>
                <span>•</span>
                <span className="text-success font-medium">
                  Payout: {formatPaise(s.listenerEarningsPaise || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/session/${s.id}`)}
              >
                Inspect Room
              </Button>

              {s.status === 'active' && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleAdminEndSession(s.id)}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Force End
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
