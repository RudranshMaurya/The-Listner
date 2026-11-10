import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToWallet, subscribeToUserWithdrawals } from '../../lib/database';
import { formatPaise } from '../../lib/upi';
import type { Wallet, WithdrawalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { WithdrawalModal } from '../../components/listener/WithdrawalModal';
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const ListenerWalletPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => setWallet(w));
    const unsubWithdrawals = subscribeToUserWithdrawals(currentUser.uid, (wds) => setWithdrawals(wds));

    return () => {
      unsubWallet();
      unsubWithdrawals();
    };
  }, [currentUser]);

  const withdrawableRupees = (wallet?.withdrawablePaise || 0) / 100;
  const canWithdraw = withdrawableRupees >= 200;

  return (
    <div className="space-y-6 text-left">
      {/* Wallet Balance Hero Card */}
      <Card variant="raised" padding="lg" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-border">
        <div>
          <span className="text-caption uppercase font-semibold text-text-muted tracking-wider">
            Withdrawable Earnings
          </span>
          <h2 className="text-display font-semibold tracking-tight mt-1 text-success font-mono">
            {formatPaise(wallet?.withdrawablePaise || 0)}
          </h2>
          <p className="text-small text-text-muted mt-1 max-w-lg">
            Minimum withdrawal threshold: <strong>₹200.00</strong>. Transferred directly to your private UPI ID.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          disabled={!canWithdraw}
          onClick={() => setIsModalOpen(true)}
          leftIcon={<ArrowDownToLine className="w-4 h-4" />}
          className="shrink-0"
        >
          Request UPI Payout
        </Button>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase font-semibold text-text-muted">Funds Reserved for Pending Payout</p>
            <p className="text-title font-semibold text-warning mt-0.5 font-mono">
              {formatPaise(wallet?.reservedPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface border border-border text-warning flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase font-semibold text-text-muted">All-Time Earnings</p>
            <p className="text-title font-semibold text-text mt-0.5 font-mono">
              {formatPaise(wallet?.totalEarnedPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface border border-border text-text-muted flex items-center justify-center">
            <WalletIcon className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Payout History */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-small font-semibold text-text border-b border-border pb-3">
          Withdrawal & Payout History
        </h3>

        {withdrawals.length === 0 ? (
          <p className="text-caption text-text-muted py-6 text-center">
            No withdrawal requests submitted yet. Once you reach ₹200, you can request an instant transfer.
          </p>
        ) : (
          <div className="space-y-2.5">
            {withdrawals.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3.5 rounded-input bg-surface border border-border text-small"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">
                      ₹{req.amountRupees.toFixed(2)}
                    </span>
                    <Badge
                      variant={
                        req.status === 'paid'
                          ? 'success'
                          : req.status === 'requested'
                          ? 'warning'
                          : req.status === 'rejected'
                          ? 'danger'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <p className="text-caption text-text-muted mt-1">
                    To UPI: <span className="font-mono">{req.upiId}</span> • Requested: {new Date(req.requestedAt).toLocaleDateString()}
                  </p>
                  {req.utrRef && (
                    <p className="text-success font-mono text-[11px] mt-0.5">
                      Bank Ref / UTR: {req.utrRef}
                    </p>
                  )}
                  {req.adminNote && (
                    <p className="text-text-muted text-[11px] mt-0.5">
                      Admin Note: {req.adminNote}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {req.status === 'paid' ? (
                    <div className="flex items-center gap-1 text-success font-medium text-caption">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transferred</span>
                    </div>
                  ) : (
                    <span className="text-caption text-warning font-medium">In Queue</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <WithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallet={wallet}
      />
    </div>
  );
};
