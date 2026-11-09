import React, { useEffect, useState } from 'react';
import { subscribeToAdminNotifications } from '../../lib/database';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { BellRing, ArrowDownToLine, CreditCard, ShieldCheck } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToAdminNotifications((n) => setNotifications(n));
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Admin Notification Alerts ({notifications.length})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Private administrative alerts for withdrawal requests, payment events, and listener verifications.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<BellRing className="w-8 h-8" />}
          title="No Administrative Alerts"
          description="High priority payment events and payout requests will trigger alerts here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {notif.type === 'withdrawal' ? (
                  <ArrowDownToLine className="w-4 h-4" />
                ) : (
                  <BellRing className="w-4 h-4" />
                )}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
