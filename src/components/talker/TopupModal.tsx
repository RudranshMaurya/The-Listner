import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { generateOrderId, generateUpiUri, DESTINATION_UPI_ID, formatRupees } from '../../lib/upi';
import { createTopupOrder, subscribeToTopup, subscribeToWallet } from '../../lib/database';
import type { TopupOrder } from '../../types';
import {
  CheckCircle2,
  Clock,
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
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
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-stone-900 dark:text-amber-200 ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-gray-200 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] text-stone-700 dark:text-stone-300 hover:border-gray-300'
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

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-gray-200/80 dark:border-stone-700/80 text-xs text-stone-600 dark:text-stone-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Instant UPI Credit</span>
            </div>
            <p className="text-[11px] text-stone-500">
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
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 font-bold text-sm shadow-2xs">
            <span>Amount:</span>
            <span>{formatRupees(currentOrder.amountRupees)}</span>
            <span className="text-xs font-normal text-amber-700 dark:text-amber-300">
              ({currentOrder.amountRupees} Credits)
            </span>
          </div>

          {/* Clean Modern Dynamic QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-gray-200 dark:border-stone-700 shadow-sm max-w-xs mx-auto">
            <QRCodeSVG
              value={currentOrder.upiUri}
              size={210}
              level="H"
              includeMargin
              className="rounded-2xl"
            />
            <p className="mt-2 text-[10px] font-mono text-stone-400">
              Ref: {currentOrder.id}
            </p>
          </div>

          {/* Supported Apps subtle indicators */}
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Scan using Google Pay, PhonePe, Paytm, BHIM, or any UPI app
          </p>

          {/* Mobile Direct Intent Link */}
          <div className="flex justify-center">
            <a
              href={currentOrder.upiUri}
              className="inline-flex items-center justify-center font-bold rounded-2xl text-xs px-5 py-2.5 gap-2 bg-[#F5C518] hover:bg-[#E5B508] text-stone-950 transition-all active:scale-95 shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open in UPI App</span>
            </a>
          </div>

          {/* Real-time Checking Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Waiting for payment confirmation... Credits update automatically</span>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-stone-800 flex items-center justify-between">
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
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-bold text-stone-900 dark:text-white">
            ₹{currentOrder.amountRupees.toFixed(2)} Credits Added!
          </h3>

          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
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
