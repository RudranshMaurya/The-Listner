import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, CheckCheck, Info } from 'lucide-react';

export const TalkerNotificationsPage: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Notifications
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Booking confirmations, account credits, and conversation updates.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-5 h-5 text-text-muted" />}
          title="All Caught Up"
          description="You don't have any notifications right now."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              padding="md"
              className={`flex items-start justify-between gap-4 transition-all ${
                !notif.read ? 'border-accent/40 bg-accent/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-pill bg-surface border border-border flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-small font-semibold text-text">
                    {notif.title}
                  </h4>
                  <p className="text-small text-text-muted mt-0.5">
                    {notif.message}
                  </p>
                  <span className="text-caption text-text-muted mt-1 block">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markAsRead(notif.id)}
                  leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
                >
                  Mark read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
