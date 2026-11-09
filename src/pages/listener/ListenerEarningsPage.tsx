import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToWallet, subscribeToLedger, subscribeToUserSessions } from '../../lib/database';
import { formatPaise } from '../../lib/upi';
import type { Wallet, WalletTransaction, Session } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TrendingUp, ArrowDownToLine, DollarSign, Clock } from 'lucide-react';
import { WithdrawalModal } from '../../components/listener/WithdrawalModal';

export const ListenerEarningsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<WalletTransaction[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => setWallet(w));
    const unsubLedger = subscribeToLedger(currentUser.uid, (txs) => setLedger(txs));
    const unsubSessions = subscribeToUserSessions(currentUser.uid, 'listener', (s) => setSessions(s));

    return () => {
      unsubWallet();
      unsubLedger();
      unsubSessions();
    };
  }, [currentUser]);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Earnings & Ledger Breakdown
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Transparent breakdown of all session fees credited to your balance.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total All-Time Earned</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatPaise(wallet?.totalEarnedPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Available to Withdraw</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatPaise(wallet?.withdrawablePaise || 0)}
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsWithdrawalOpen(true)}
            leftIcon={<ArrowDownToLine className="w-3.5 h-3.5" />}
          >
            Payout
          </Button>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Total Paid Sessions</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {sessions.filter((s) => (s.totalChargePaise || 0) > 0).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Earnings Ledger Table */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Session Credit Ledger
        </h3>

        {ledger.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No credits recorded yet. When you complete paid conversations, credit receipts appear here in real time.
          </p>
        ) : (
          <div className="space-y-2.5">
            {ledger.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(tx.timestamp).toLocaleString()}
                    {tx.referenceId && ` • Session ID: ${tx.referenceId}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    +{formatPaise(tx.amountPaise)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Bal: {formatPaise(tx.newBalancePaise)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        wallet={wallet}
      />
    </div>
  );
};
