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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Notifications
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Booking confirmations, wallet credits, and conversation updates.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="All Caught Up"
          description="You don't have any notifications right now."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition-all flex items-start justify-between gap-4 ${
                !notif.read ? 'border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
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
