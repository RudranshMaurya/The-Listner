import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  subscribeToAllTopups,
  subscribeToAllWithdrawals,
  subscribeToAllSessions,
  subscribeToAdminNotifications,
  getAllListeners
} from '../../lib/database';
import { formatPaise } from '../../lib/upi';
import type { TopupOrder, WithdrawalRequest, Session, ListenerProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  ShieldCheck,
  Activity,
  CreditCard,
  ArrowDownToLine,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  BellRing
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [topups, setTopups] = useState<TopupOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);
  const [listeners, setListeners] = useState<ListenerProfile[]>([]);

  useEffect(() => {
    const unsubTopups = subscribeToAllTopups((tps) => setTopups(tps));
    const unsubWithdrawals = subscribeToAllWithdrawals((wds) => setWithdrawals(wds));
    const unsubSessions = subscribeToAllSessions((sess) => setSessions(sess));
    const unsubNotifs = subscribeToAdminNotifications((n) => setAdminNotifs(n));
    getAllListeners().then((l) => setListeners(l));

    return () => {
      unsubTopups();
      unsubWithdrawals();
      unsubSessions();
      unsubNotifs();
    };
  }, []);

  const pendingTopups = topups.filter((t) => t.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'requested');
  const activeSessions = sessions.filter((s) => s.status === 'active');
  const verifiedListeners = listeners.filter((l) => l.isVerified);

  const totalPlatformVolumePaise = topups
    .filter((t) => t.status === 'credited')
    .reduce((sum, t) => sum + t.amountPaise, 0);

  const totalListenerEarningsPaise = sessions.reduce(
    (sum, s) => sum + (s.listenerEarningsPaise || 0),
    0
  );

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Platform Overview & Real-Time Supervision
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Live financial ledger, payment candidates, and listening sessions.
        </p>
      </div>

      {/* Action Required Banner */}
      {(pendingTopups.length > 0 || pendingWithdrawals.length > 0) && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Pending Administrative Actions:</span>
              <span className="ml-1">
                {pendingTopups.length} top-up verifications awaiting matching • {pendingWithdrawals.length} withdrawal requests pending payout
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingTopups.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/topups')}>
                Review Top-ups
              </Button>
            )}
            {pendingWithdrawals.length > 0 && (
              <Button size="sm" variant="primary" onClick={() => navigate('/admin/withdrawals')}>
                Process Payouts
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Total Deposit Volume</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {formatPaise(totalPlatformVolumePaise)}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Credited UPI deposits</span>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Listener Earnings</p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {formatPaise(totalListenerEarningsPaise)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Earned from sessions</span>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Active Live Sessions</p>
          <p className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {activeSessions.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Currently communicating</span>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Verified Listeners</p>
          <p className="text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
            {verifiedListeners.length} / {listeners.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Passed assessment (80%+)</span>
        </Card>
      </div>

      {/* Pending Payout Queue & Live Topups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Withdrawals */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
              <span>Pending Listener Payouts ({pendingWithdrawals.length})</span>
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/withdrawals')}>
              Manage All
            </Button>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No withdrawal requests pending review.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingWithdrawals.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {w.listenerName}
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Requested: ₹{w.amountRupees.toFixed(2)} • UPI: <span className="font-mono text-indigo-600 dark:text-indigo-400">{w.upiId}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/admin/withdrawals')}
                  >
                    Process
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Top-ups */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <span>Pending UPI Top-ups ({pendingTopups.length})</span>
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/topups')}>
              Reconcile All
            </Button>
          </div>

          {pendingTopups.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No top-up orders pending verification.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingTopups.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Order: {t.id}
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      Talker: {t.userName} • Amount: ₹{t.amountRupees.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/admin/topups')}
                  >
                    Match Payment
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
