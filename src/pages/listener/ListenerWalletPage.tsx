import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToWallet, subscribeToUserWithdrawals } from '../../lib/database';
import { formatPaise, formatRupees } from '../../lib/upi';
import type { Wallet, WithdrawalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { WithdrawalModal } from '../../components/listener/WithdrawalModal';
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
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
      <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">
            Withdrawable Earnings
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-emerald-400 font-mono">
            {formatPaise(wallet?.withdrawablePaise || 0)}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Minimum withdrawal threshold: <strong>₹200.00</strong>. Transferred directly to your private UPI ID.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          disabled={!canWithdraw}
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md font-bold"
          leftIcon={<ArrowDownToLine className="w-4 h-4" />}
        >
          Request UPI Payout
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">Funds Reserved for Pending Payout</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {formatPaise(wallet?.reservedPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">All-Time Earnings</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatPaise(wallet?.totalEarnedPaise || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <WalletIcon className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Withdrawal & Payout History
        </h3>

        {withdrawals.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No withdrawal requests submitted yet. Once you reach ₹200, you can request an instant transfer.
          </p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
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
                          : 'info'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <p className="text-slate-500 mt-1">
                    To UPI: <span className="font-mono">{req.upiId}</span> • Requested: {new Date(req.requestedAt).toLocaleDateString()}
                  </p>
                  {req.utrRef && (
                    <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] mt-0.5">
                      Bank Ref / UTR: {req.utrRef}
                    </p>
                  )}
                  {req.adminNote && (
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Admin Note: {req.adminNote}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {req.status === 'paid' ? (
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transferred</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">In Queue</span>
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
