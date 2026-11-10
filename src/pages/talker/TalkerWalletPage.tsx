import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { subscribeToWallet, subscribeToLedger, subscribeToUserTopups, cancelTopupOrder, confirmTopupPayment } from '../../lib/database';
import { formatPaise, formatRupees, DESTINATION_UPI_ID } from '../../lib/upi';
import type { Wallet, WalletTransaction, TopupOrder } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { TopupModal } from '../../components/talker/TopupModal';
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const TalkerWalletPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<WalletTransaction[]>([]);
  const [topups, setTopups] = useState<TopupOrder[]>([]);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => setWallet(w));
    const unsubLedger = subscribeToLedger(currentUser.uid, (txs) => setLedger(txs));
    const unsubTopups = subscribeToUserTopups(currentUser.uid, (tps) => setTopups(tps));

    return () => {
      unsubWallet();
      unsubLedger();
      unsubTopups();
    };
  }, [currentUser]);

  const pendingTopups = topups.filter((t) => t.status === 'pending');

  const handleCancelTopup = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to cancel and remove pending top-up request ${orderId}?`)) {
      return;
    }

    try {
      setCancellingId(orderId);
      await cancelTopupOrder(orderId);
      showToast('success', `Pending top-up ${orderId} was cancelled successfully.`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to cancel top-up request.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleApproveTopup = async (orderId: string) => {
    try {
      setApprovingId(orderId);
      await confirmTopupPayment(orderId, `FAM-${Date.now()}`, 'Instant Auto-Approval');
      showToast('success', `Top-up ${orderId} has been verified and credited to your account credits!`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to auto-approve top-up.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Credits Balance Hero Card */}
      <Card variant="raised" padding="lg" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-border">
        <div>
          <span className="text-caption uppercase font-semibold text-text-muted tracking-wider">
            Available Credits
          </span>
          <h2 className="text-display font-semibold tracking-tight text-text mt-1">
            ₹{formatPaise(wallet?.balancePaise || 0)}
          </h2>
          <p className="text-small text-text-muted mt-1 max-w-lg">
            Standard rate: ₹2.50 per minute (₹5 per 2 mins). Deducted strictly for active conversation minutes.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsTopupOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="shrink-0"
        >
          Add Credits via UPI
        </Button>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase font-semibold text-text-muted">Total Spent on Conversations</p>
            <p className="text-title font-semibold text-text mt-0.5">
              {formatPaise(wallet?.totalSpentPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface border border-border text-text-muted flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Card>

        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase font-semibold text-text-muted">Pending UPI Top-ups</p>
            <p className="text-title font-semibold text-text mt-0.5">
              {pendingTopups.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface border border-border text-warning flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Pending Top-ups Warning/Status */}
      {pendingTopups.length > 0 && (
        <Card padding="md" className="space-y-3 border-warning/30 bg-surface">
          <div className="flex items-center gap-2 text-warning font-semibold text-caption uppercase tracking-wider">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Pending UPI Verifications</span>
          </div>

          <div className="space-y-2">
            {pendingTopups.map((topup) => (
              <div
                key={topup.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-input bg-surface-raised border border-border text-small"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">
                      Order: {topup.id}
                    </span>
                    <Badge variant="warning" size="sm">Awaiting Notification</Badge>
                  </div>
                  <p className="text-caption text-text-muted mt-1">
                    Amount: <strong className="text-text">{formatRupees(topup.amountRupees)}</strong> • Destination: <span className="font-mono">{DESTINATION_UPI_ID}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApproveTopup(topup.id)}
                    isLoading={approvingId === topup.id}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                  >
                    Verify & Credit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCancelTopup(topup.id)}
                    isLoading={cancellingId === topup.id}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-danger" />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transaction History Ledger */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-small font-semibold text-text border-b border-border pb-3">
          Credits Transaction Ledger
        </h3>

        {ledger.length === 0 ? (
          <p className="text-caption text-text-muted py-6 text-center">
            No transactions recorded yet. Add credits to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {ledger.map((tx) => {
              const isDebit = tx.amountPaise < 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-input bg-surface border border-border text-small"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-pill flex items-center justify-center ${
                        isDebit
                          ? 'bg-danger/10 text-danger'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="font-medium text-text">
                        {tx.description}
                      </p>
                      <p className="text-caption text-text-muted mt-0.5">
                        {new Date(tx.timestamp).toLocaleString()}
                        {tx.referenceId && ` • Ref: ${tx.referenceId}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-small font-semibold font-mono ${
                        isDebit ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {isDebit ? '-' : '+'}
                      {formatPaise(Math.abs(tx.amountPaise))}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Bal: {formatPaise(tx.newBalancePaise)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <TopupModal isOpen={isTopupOpen} onClose={() => setIsTopupOpen(false)} />
    </div>
  );
};
