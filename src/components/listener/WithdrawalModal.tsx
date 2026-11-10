import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { requestWithdrawal } from '../../lib/database';
import { formatPaise } from '../../lib/upi';
import type { Wallet } from '../../types';
import { ArrowDownToLine, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  savedUpiId?: string;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  wallet,
  savedUpiId = ''
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const withdrawableRupees = (wallet?.withdrawablePaise || 0) / 100;
  const [amountInput, setAmountInput] = useState<string>(
    withdrawableRupees >= 200 ? withdrawableRupees.toString() : '200'
  );
  const [upiId, setUpiId] = useState<string>(savedUpiId);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleWithdrawalSubmit = async () => {
    if (!currentUser) return;
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount < 200) {
      showToast('error', 'Minimum withdrawal threshold is ₹200.00');
      return;
    }

    if (amount > withdrawableRupees) {
      showToast('error', `You only have ${formatPaise(wallet?.withdrawablePaise || 0)} available to withdraw.`);
      return;
    }

    if (!upiId || !upiId.includes('@')) {
      showToast('error', 'Please provide a valid UPI ID (e.g. name@okhdfcbank or user@paytm)');
      return;
    }

    try {
      setIsSubmitting(true);
      await requestWithdrawal(
        currentUser.uid,
        currentUser.displayName || 'Listener',
        amount,
        upiId.trim()
      );

      setIsSuccess(true);
      showToast('success', `Withdrawal request of ₹${amount.toFixed(2)} submitted to admin.`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to request withdrawal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? 'Payout Request Submitted' : 'Request Earnings Payout'}
      description={
        isSuccess
          ? 'Your payout request has been queued for admin verification and transfer.'
          : 'Transfer your listener earnings directly to your UPI ID.'
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-14 h-14 rounded-pill bg-success/10 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-body font-semibold text-text">
            ₹{parseFloat(amountInput).toFixed(2)} Reserved for Payout
          </h4>
          <p className="text-small text-text-muted max-w-sm mx-auto leading-relaxed">
            Target UPI: <span className="font-mono font-semibold text-text">{upiId}</span>.
            The administrator will review the request and disburse the funds via UPI. You will receive an in-app notification with the bank UTR as soon as it's completed.
          </p>
          <div className="pt-3">
            <Button variant="primary" className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-left">
          {/* Available balance indicator */}
          <div className="p-3.5 rounded-input bg-surface border border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-semibold text-text-muted">Available to Withdraw</p>
              <p className="text-base font-bold text-text font-mono">
                {formatPaise(wallet?.withdrawablePaise || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-semibold text-text-muted">Min. Threshold</p>
              <p className="text-small font-semibold text-text font-mono">₹200.00</p>
            </div>
          </div>

          <div>
            <Input
              label="Withdrawal Amount (₹)"
              type="number"
              min="200"
              max={withdrawableRupees}
              placeholder="Min ₹200"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              helperText={`Maximum withdrawable: ₹${withdrawableRupees.toFixed(2)}`}
            />
          </div>

          <div>
            <Input
              label="Your Payout UPI ID"
              placeholder="e.g. rahul@oksbi or yourname@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              helperText="This UPI ID remains strictly confidential and is never shown to talkers."
            />
          </div>

          {withdrawableRupees < 200 && (
            <div className="p-3 rounded-input bg-warning/10 border border-warning/30 text-caption text-warning flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Your current withdrawable earnings ({formatPaise(wallet?.withdrawablePaise || 0)}) are below the ₹200 minimum threshold. Complete more sessions to unlock payouts.
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={withdrawableRupees < 200}
              isLoading={isSubmitting}
              onClick={handleWithdrawalSubmit}
              leftIcon={<ArrowDownToLine className="w-4 h-4" />}
            >
              Submit Payout Request
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
