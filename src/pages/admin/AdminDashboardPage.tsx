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
import {
  ArrowDownToLine,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [topups, setTopups] = useState<TopupOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [, setAdminNotifs] = useState<any[]>([]);
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
        <h2 className="text-title text-text tracking-tight">
          Platform Overview
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Live financial ledger, payment candidates, and listening sessions.
        </p>
      </div>

      {/* Action Required Banner */}
      {(pendingTopups.length > 0 || pendingWithdrawals.length > 0) && (
        <Card padding="md" className="border-warning/40 bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <div className="text-small text-text">
              <span className="font-semibold">Pending Administrative Actions:</span>
              <span className="ml-1 text-text-muted">
                {pendingTopups.length} top-up verifications • {pendingWithdrawals.length} withdrawal payouts
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
        <Card padding="md">
          <p className="text-caption uppercase font-semibold text-text-muted">Total Deposit Volume</p>
          <p className="text-xl sm:text-2xl font-bold text-text mt-1 font-mono">
            {formatPaise(totalPlatformVolumePaise)}
          </p>
          <span className="text-caption text-success mt-1 block">Credited UPI deposits</span>
        </Card>

        <Card padding="md">
          <p className="text-caption uppercase font-semibold text-text-muted">Listener Earnings</p>
          <p className="text-xl sm:text-2xl font-bold text-success mt-1 font-mono">
            {formatPaise(totalListenerEarningsPaise)}
          </p>
          <span className="text-caption text-text-muted mt-1 block">Earned from sessions</span>
        </Card>

        <Card padding="md">
          <p className="text-caption uppercase font-semibold text-text-muted">Active Live Sessions</p>
          <p className="text-xl sm:text-2xl font-bold text-accent mt-1">
            {activeSessions.length}
          </p>
          <span className="text-caption text-text-muted mt-1 block">Currently communicating</span>
        </Card>

        <Card padding="md">
          <p className="text-caption uppercase font-semibold text-text-muted">Verified Listeners</p>
          <p className="text-xl sm:text-2xl font-bold text-text mt-1">
            {verifiedListeners.length} / {listeners.length}
          </p>
          <span className="text-caption text-text-muted mt-1 block">Passed assessment (80%+)</span>
        </Card>
      </div>

      {/* Pending Payout Queue & Live Topups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Withdrawals */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-small font-semibold text-text flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-success" />
              <span>Pending Listener Payouts ({pendingWithdrawals.length})</span>
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/withdrawals')}>
              Manage All
            </Button>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-caption text-text-muted py-6 text-center">
              No withdrawal requests pending review.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingWithdrawals.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3.5 rounded-input bg-surface border border-border text-small"
                >
                  <div>
                    <span className="font-semibold text-text">
                      {w.listenerName}
                    </span>
                    <p className="text-caption text-text-muted mt-0.5">
                      Requested: ₹{w.amountRupees.toFixed(2)} • UPI: <span className="font-mono text-accent">{w.upiId}</span>
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
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-small font-semibold text-text flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" />
              <span>Pending UPI Top-ups ({pendingTopups.length})</span>
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/topups')}>
              Reconcile All
            </Button>
          </div>

          {pendingTopups.length === 0 ? (
            <p className="text-caption text-text-muted py-6 text-center">
              No top-up orders pending verification.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingTopups.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 rounded-input bg-surface border border-border text-small"
                >
                  <div>
                    <span className="font-semibold text-text">
                      Order: {t.id}
                    </span>
                    <p className="text-caption text-text-muted mt-0.5">
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
