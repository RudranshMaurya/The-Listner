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
      <div className="rounded-3xl bg-gradient-to-tr from-[#1F1D1A] via-[#272420] to-[#161412] text-white p-6 sm:p-8 shadow-xl border border-[#D4A373]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4A373] dark:text-[#DEC6A5] tracking-wider">
            Available Credits
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
            ₹{formatPaise(wallet?.balancePaise || 0)} Credits
          </h2>
          <p className="text-xs text-[#DEC6A5]/80 mt-1">
            Standard rate: ₹2.50 per minute (₹5 per 2 mins). Deducted proportionally to conversation time.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => setIsTopupOpen(true)}
          className="shadow-md font-bold"
          leftIcon={<PlusCircle className="w-4 h-4 text-stone-900" />}
        >
          Add Credits via UPI
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400">Total Spent on Conversations</p>
            <p className="text-xl font-bold text-stone-900 dark:text-white mt-0.5">
              {formatPaise(wallet?.totalSpentPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420] text-[#D4A373] dark:text-[#DEC6A5] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Card>

        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400">Pending UPI Top-ups</p>
            <p className="text-xl font-bold text-stone-900 dark:text-white mt-0.5">
              {pendingTopups.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420] text-[#CA8A04] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Pending Top-ups Warning/Status */}
      {pendingTopups.length > 0 && (
        <Card className="p-5 bg-[#FAF6F0]/80 dark:bg-[#272420]/60 border-[#D4A373]/30 dark:border-[#332E28] space-y-3">
          <div className="flex items-center gap-2 text-[#875C34] dark:text-[#DEC6A5] font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-[#D4A373] animate-spin" />
            <span>Pending UPI Verifications</span>
          </div>

          <div className="space-y-2">
            {pendingTopups.map((topup) => (
              <div
                key={topup.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#1F1D1A] border border-[#EFEBE4] dark:border-[#332E28] text-xs shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">
                      Order Ref: {topup.id}
                    </span>
                    <Badge variant="warning" size="sm">Awaiting Notification</Badge>
                  </div>
                  <p className="text-stone-500 mt-1">
                    Amount: <strong className="text-stone-900 dark:text-stone-100">{formatRupees(topup.amountRupees)}</strong> • Target UPI: <span className="font-mono">{DESTINATION_UPI_ID}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="forest"
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
        <h3 className="text-sm font-bold text-stone-900 dark:text-white border-b border-[#EFEBE4] dark:border-[#332E28] pb-3">
          Credits Transaction Ledger
        </h3>

        {ledger.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            No transactions recorded yet. Add credits to get started!
          </p>
        ) : (
          <div className="space-y-2.5">
            {ledger.map((tx) => {
              const isDebit = tx.amountPaise < 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#272420]/50 border border-[#EFEBE4] dark:border-[#332E28] text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isDebit
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-[#DCFCE7] text-[#166534] dark:bg-[#166534]/30 dark:text-[#4ADE80]'
                      }`}
                    >
                      {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="font-semibold text-stone-900 dark:text-white">
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
