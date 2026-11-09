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
  Wallet as WalletIcon,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  XCircle
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
      showToast('success', `Top-up ${orderId} has been verified and credited to your wallet!`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to auto-approve top-up.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Wallet Balance Hero Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
            Available Balance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            {formatPaise(wallet?.balancePaise || 0)}
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            Standard rate: ₹5 per 2 minutes. Deducted proportionally to active conversation time.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => setIsTopupOpen(true)}
          className="bg-white text-indigo-950 hover:bg-indigo-50 shadow-md font-bold"
          leftIcon={<PlusCircle className="w-4 h-4 text-indigo-600" />}
        >
          Add Money via UPI
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total Spent on Conversations</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatPaise(wallet?.totalSpentPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Pending UPI Top-ups</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {pendingTopups.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Pending Top-ups Warning/Status */}
      {pendingTopups.length > 0 && (
        <Card className="p-5 bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Pending UPI Verifications</span>
          </div>

          <div className="space-y-2">
            {pendingTopups.map((topup) => (
              <div
                key={topup.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 text-xs shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Order Ref: {topup.id}
                    </span>
                    <Badge variant="warning" size="sm">Awaiting Notification</Badge>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Amount: <strong className="text-slate-900 dark:text-slate-100">{formatRupees(topup.amountRupees)}</strong> • Target UPI: <span className="font-mono">{DESTINATION_UPI_ID}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleApproveTopup(topup.id)}
                    isLoading={approvingId === topup.id}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className="cursor-pointer font-medium text-xs py-1 px-2.5"
                    title="Approve and credit immediately"
                  >
                    Approve & Credit Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelTopup(topup.id)}
                    isLoading={cancellingId === topup.id}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:border-rose-900/50 cursor-pointer font-medium text-xs py-1 px-2.5"
                    title="Cancel this pending request"
                  >
                    Cancel Request
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transaction History Ledger */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Wallet Transaction Ledger
        </h3>

        {ledger.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No transactions recorded yet. Add money to get started!
          </p>
        ) : (
          <div className="space-y-2.5">
            {ledger.map((tx) => {
              const isDebit = tx.amountPaise < 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isDebit
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(tx.timestamp).toLocaleString()}
                        {tx.referenceId && ` • Ref: ${tx.referenceId}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-bold font-mono ${
                        isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? '-' : '+'}
                      {formatPaise(Math.abs(tx.amountPaise))}
                    </p>
                    <p className="text-[10px] text-slate-400">
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
