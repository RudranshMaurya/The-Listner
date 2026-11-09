import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { generateOrderId, generateUpiUri, DESTINATION_UPI_ID, formatRupees } from '../../lib/upi';
import { createTopupOrder, subscribeToTopup } from '../../lib/database';
import type { TopupOrder } from '../../types';
import {
  QrCode,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Smartphone,
  Info
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
  const [utrInput, setUtrInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleStartPayment = async () => {
    if (!currentUser) return;
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount < 10) {
      showToast('error', 'Minimum top-up amount is ₹10.00');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = generateOrderId();
      const upiUri = generateUpiUri({
        vpa: DESTINATION_UPI_ID,
        amountRupees: finalAmount,
        orderId,
        note: `The Listener Wallet - ${orderId}`
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

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(DESTINATION_UPI_ID);
    setCopied(true);
    showToast('info', 'UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualUtrSubmit = async () => {
    if (!currentOrder || !utrInput.trim()) return;
    try {
      setIsSubmitting(true);
      // In production, user can attach candidate UTR to speed up reconciliation
      showToast('success', 'UTR reference submitted. Verifying payment...');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setStep('select');
    setCurrentOrder(null);
    setCustomAmount('');
    setUtrInput('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetState}
      title={step === 'success' ? 'Wallet Top-up Successful!' : 'Add Money to Wallet'}
      description={
        step === 'success'
          ? 'Your funds are immediately available for conversations.'
          : 'Scan the UPI QR code using Google Pay, PhonePe, Paytm, or any UPI app.'
      }
      maxWidth="md"
    >
      {step === 'select' && (
        <div className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Amount (INR)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
                    selectedAmount === amt && !customAmount
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label="Or Enter Custom Amount (₹)"
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

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Direct Bank UPI Integration</span>
            </div>
            <p>Target UPI: <code className="font-mono text-indigo-600 dark:text-indigo-400">{DESTINATION_UPI_ID}</code></p>
            <p className="text-[11px] text-slate-400">Zero platform deposit fees. 100% money credited to your talker wallet.</p>
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
              Generate UPI QR (₹{customAmount || selectedAmount})
            </Button>
          </div>
        </div>
      )}

      {step === 'pay' && currentOrder && (
        <div className="space-y-5 text-center">
          {/* Amount Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold text-base">
            <span>Amount to Pay:</span>
            <span>{formatRupees(currentOrder.amountRupees)}</span>
          </div>

          {/* Real Dynamic QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md max-w-xs mx-auto">
            <QRCodeSVG
              value={currentOrder.upiUri}
              size={200}
              level="H"
              includeMargin
              className="rounded-xl"
            />
            <p className="mt-2 text-[11px] font-mono text-slate-500">
              Order Ref: <span className="font-bold text-slate-800">{currentOrder.id}</span>
            </p>
          </div>

          {/* Quick UPI ID Copy & Mobile Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
            <Button
              onClick={handleCopyVpa}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied UPI ID' : `Copy UPI (${DESTINATION_UPI_ID})`}
            </Button>

            <a
              href={currentOrder.upiUri}
              className="inline-flex items-center justify-center font-medium rounded-full text-xs px-4 py-2 gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Open in UPI App</span>
            </a>
          </div>

          {/* Pending Status Spinner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-left flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-spin" />
            <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              <span className="font-semibold">Waiting for payment confirmation...</span>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 mt-0.5">
                Once paid via MacroDroid / Bank notification receiver, your wallet will automatically credit without refreshing this screen.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
              Change Amount
            </Button>
            <Button variant="secondary" size="sm" onClick={resetState}>
              Close & Wait in Background
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && currentOrder && (
        <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            ₹{currentOrder.amountRupees.toFixed(2)} Credited!
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your transaction has been securely verified and credited to your wallet balance.
            You can now start listening sessions immediately.
          </p>

          <div className="pt-4">
            <Button variant="primary" size="md" className="w-full" onClick={resetState}>
              Continue to Dashboard
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
