import React, { useEffect, useState } from 'react';
import { subscribeToAdminNotifications } from '../../lib/database';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { BellRing, ArrowDownToLine } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToAdminNotifications((n) => setNotifications(n));
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Admin Notification Alerts ({notifications.length})
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Private administrative alerts for withdrawal requests, payment events, and listener verifications.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<BellRing className="w-5 h-5 text-text-muted" />}
          title="No Administrative Alerts"
          description="High priority payment events and payout requests will trigger alerts here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} padding="md" className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-pill bg-surface border border-border text-accent flex items-center justify-center shrink-0">
                {notif.type === 'withdrawal' ? (
                  <ArrowDownToLine className="w-4 h-4 text-success" />
                ) : (
                  <BellRing className="w-4 h-4" />
                )}
              </div>
              <div>
                <h4 className="text-small font-semibold text-text">
                  {notif.title}
                </h4>
                <p className="text-caption text-text-muted mt-0.5">
                  {notif.message}
                </p>
                <span className="text-[11px] text-text-muted mt-1 block">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
