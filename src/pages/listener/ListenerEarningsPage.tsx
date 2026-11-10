import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToWallet, subscribeToLedger, subscribeToUserSessions } from '../../lib/database';
import { formatPaise } from '../../lib/upi';
import type { Wallet, WalletTransaction, Session } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TrendingUp, ArrowDownToLine, Clock } from 'lucide-react';
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
        <h2 className="text-title text-text tracking-tight">
          Earnings & Ledger Breakdown
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Transparent breakdown of all session fees credited to your balance.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase font-semibold text-text-muted">Total All-Time Earned</p>
            <p className="text-2xl font-bold text-success font-mono mt-0.5">
              {formatPaise(wallet?.totalEarnedPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-success/10 text-success flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase font-semibold text-text-muted">Available to Withdraw</p>
            <p className="text-2xl font-bold text-text font-mono mt-0.5">
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

        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase font-semibold text-text-muted">Total Paid Sessions</p>
            <p className="text-2xl font-bold text-text font-mono mt-0.5">
              {sessions.filter((s) => (s.totalChargePaise || 0) > 0).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface border border-border text-text-muted flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Earnings Ledger Table */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-small font-semibold text-text border-b border-border pb-3">
          Session Credit Ledger
        </h3>

        {ledger.length === 0 ? (
          <p className="text-caption text-text-muted py-6 text-center">
            No credits recorded yet. When you complete paid conversations, credit receipts appear here in real time.
          </p>
        ) : (
          <div className="space-y-2">
            {ledger.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-input bg-surface border border-border text-small"
              >
                <div>
                  <p className="font-semibold text-text">
                    {tx.description}
                  </p>
                  <p className="text-caption text-text-muted mt-0.5">
                    {new Date(tx.timestamp).toLocaleString()}
                    {tx.referenceId && ` • Session ID: ${tx.referenceId}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-small font-bold text-success font-mono">
                    +{formatPaise(tx.amountPaise)}
                  </p>
                  <p className="text-[11px] text-text-muted">
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
