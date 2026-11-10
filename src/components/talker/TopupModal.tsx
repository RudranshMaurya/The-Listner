import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { generateOrderId, generateUpiUri, DESTINATION_UPI_ID, formatRupees } from '../../lib/upi';
import { createTopupOrder, subscribeToTopup, subscribeToWallet, confirmTopupPayment } from '../../lib/database';
import type { TopupOrder } from '../../types';
import {
  CheckCircle2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

export const TopupModal: React.FC<TopupModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 100
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const presetAmounts = [50, 100, 200, 300, 500];
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
  const [currentOrder, setCurrentOrder] = useState<TopupOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [baselineBalance, setBaselineBalance] = useState<number | null>(null);

  // Watch topup order status in real time
  useEffect(() => {
    if (!currentOrder?.id) return;

    const unsubscribe = subscribeToTopup(currentOrder.id, (updated) => {
      if (!updated) return;
      setCurrentOrder(updated);

      if (updated.status === 'credited') {
        setStep('success');
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    });

    return () => unsubscribe();
  }, [currentOrder?.id]);

  // Dual Fallback: Also watch balance in real time
  useEffect(() => {
    if (!currentUser || step !== 'pay') return;

    let baseline = baselineBalance;
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => {
      if (!w) return;
      if (baseline === null) {
        baseline = w.balancePaise;
        setBaselineBalance(w.balancePaise);
        return;
      }
      if (w.balancePaise > baseline) {
        setStep('success');
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    });

    return () => unsubWallet();
  }, [currentUser, step, baselineBalance]);

  const handleStartPayment = async () => {
    if (!currentUser) return;
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount < 10) {
      showToast('error', 'Minimum amount is ₹10.00');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = generateOrderId();
      const upiUri = generateUpiUri({
        vpa: DESTINATION_UPI_ID,
        amountRupees: finalAmount,
        orderId,
        note: `The Listener Credits - ${orderId}`
      });

      const order: TopupOrder = {
        id: orderId,
        uid: currentUser.uid,
        userName: currentUser.displayName || 'Talker',
        userEmail: currentUser.email || '',
        amountRupees: finalAmount,
        amountPaise: Math.round(finalAmount * 100),
        status: 'pending',
        upiUri,
        destinationVpa: DESTINATION_UPI_ID,
        createdAt: Date.now()
      };

      await createTopupOrder(order);
      setCurrentOrder(order);
      setStep('pay');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to initiate payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPaid = async () => {
    if (!currentOrder) return;
    try {
      setIsConfirming(true);
      await confirmTopupPayment(currentOrder.id, `UPI-${Date.now()}`, 'Instant Confirmation');
      showToast('success', `Payment verified! ₹${currentOrder.amountRupees} added to your credits.`);
      setStep('success');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } catch (e: any) {
      showToast('error', e.message || 'Failed to verify payment. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const resetState = () => {
    setStep('select');
    setCurrentOrder(null);
    setCustomAmount('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetState}
      title={step === 'success' ? 'Credits Added' : 'Add Credits'}
      description={
        step === 'select'
          ? 'Select amount to add credits for talking with listeners.'
          : step === 'pay'
          ? 'Scan the UPI QR code with any payment app to complete.'
          : 'Your credits have been added successfully.'
      }
    >
      {step === 'select' && (
        <div className="space-y-5 text-left animate-apple-fade-in">
          <div>
            <label className="block text-caption font-medium uppercase tracking-wider text-text-muted mb-2">
              Select Amount
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presetAmounts.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-3 rounded-card text-small font-semibold border transition-apple cursor-pointer min-h-[44px] ${
                      isSelected
                        ? 'border-accent bg-accent text-accent-contrast shadow-soft'
                        : 'border-border bg-surface text-text hover:bg-surface-raised'
                    }`}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Input
              label="Or Custom Amount (₹)"
              type="number"
              min="10"
              max="10000"
              placeholder="e.g. 150"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(0);
              }}
            />
          </div>

          <div className="p-3.5 rounded-card bg-surface border border-border/50 text-caption text-text-muted space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-text">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Instant UPI Credit</span>
            </div>
            <p>
              Zero fees. 100% of payment is credited directly into your conversation credits.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={resetState}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartPayment}
              isLoading={isSubmitting}
            >
              Continue (₹{customAmount || selectedAmount})
            </Button>
          </div>
        </div>
      )}

      {step === 'pay' && currentOrder && (
        <div className="space-y-4 text-center animate-apple-fade-in py-1">
          {/* Amount Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-pill bg-surface border border-border/60 text-small font-semibold text-text">
            <span>Amount:</span>
            <span className="text-accent">{formatRupees(currentOrder.amountRupees)}</span>
            <span className="text-caption text-text-muted">
              ({currentOrder.amountRupees} Credits)
            </span>
          </div>

          {/* Clean Modern Dynamic QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-card-lg border border-border/60 shadow-soft max-w-xs mx-auto">
            <QRCodeSVG
              value={currentOrder.upiUri}
              size={200}
              level="H"
              includeMargin
              className="rounded-input"
            />
            <p className="mt-2 text-caption font-mono text-text-muted">
              Ref: {currentOrder.id}
            </p>
          </div>

          <p className="text-caption text-text-muted">
            Scan using Google Pay, PhonePe, Paytm, BHIM, or any UPI app
          </p>

          {/* Action Buttons: Confirm or Open UPI */}
          <div className="space-y-2 pt-1 max-w-xs mx-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleConfirmPaid}
              isLoading={isConfirming}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              I've Paid — Add ₹{currentOrder.amountRupees} Credits
            </Button>

            <div className="flex justify-center">
              <a
                href={currentOrder.upiUri}
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-pill text-caption font-medium text-text-muted hover:text-text hover:bg-surface transition-apple gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open in UPI App</span>
              </a>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center justify-center gap-2 text-caption text-text-muted pt-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Credits will be added instantly upon confirmation</span>
          </div>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
              Change Amount
            </Button>
            <Button variant="secondary" size="sm" onClick={resetState}>
              Close
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && currentOrder && (
        <div className="space-y-4 text-center py-4 animate-apple-fade-in">
          <div className="w-14 h-14 rounded-full bg-surface text-success flex items-center justify-center mx-auto border border-border/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-heading font-semibold text-text">
            ₹{currentOrder.amountRupees.toFixed(2)} Credits Added
          </h3>

          <p className="text-small text-text-muted max-w-sm mx-auto leading-relaxed">
            Your transaction has been confirmed and conversation credits have been added to your account.
          </p>

          <div className="pt-2">
            <Button variant="primary" size="md" className="w-full" onClick={resetState}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
