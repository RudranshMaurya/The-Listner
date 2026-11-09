import React, { useEffect, useState } from 'react';
import { subscribeToAllTopups, confirmTopupPayment, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { TopupOrder } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { DESTINATION_UPI_ID, formatRupees } from '../../lib/upi';
import {
  BellRing,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [topups, setTopups] = useState<TopupOrder[]>([]);
  const [selectedTopup, setSelectedTopup] = useState<TopupOrder | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAllTopups((list) => setTopups(list));
    return () => unsub();
  }, []);

  const handleConfirmPayment = async () => {
    if (!selectedTopup || !currentUser) return;
    const finalUtr = utrInput.trim() || `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    try {
      setIsSubmitting(true);
      await confirmTopupPayment(
        selectedTopup.id,
        finalUtr,
        currentUser.email || currentUser.uid
      );

      await writeAuditLog({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || 'admin',
        action: `Verified & Credited Topup ${selectedTopup.id}`,
        targetType: 'topup',
        targetId: selectedTopup.id,
        details: `Amount: ₹${selectedTopup.amountRupees}, UTR: ${finalUtr}`
      });

      showToast('success', `Topup order ${selectedTopup.id} verified and credited ₹${selectedTopup.amountRupees.toFixed(2)} to talker!`);
      setSelectedTopup(null);
      setUtrInput('');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to reconcile payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingList = topups.filter((t) => t.status === 'pending');
  const creditedList = topups.filter((t) => t.status === 'credited');

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-500" />
            <span>MacroDroid Payment Notification Receiver</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Incoming UPI candidate notifications received at <code className="font-mono text-indigo-500">http://&lt;LOCAL_IP&gt;:5050/notify</code> for <code className="font-mono">{DESTINATION_UPI_ID}</code>.
          </p>
        </div>
      </div>

      {/* MacroDroid Server Connection Status Box */}
      <Card className="p-5 bg-slate-900 text-white border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Python Gateway Listening (Port 5050)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">rudransh-maurya@fam</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your MacroDroid macro points to: <code className="text-indigo-400 font-mono">http://&lt;IP&gt;:5050/notify?text={'{notification}'}</code>.
          The gateway parses Indian bank SMS, Google Pay, PhonePe, and FamPay alerts, performs deduplication, and streams candidates to this reconciliation console.
        </p>
      </Card>

      {/* Pending Orders Reconciler */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Awaiting Verification & Wallet Credit ({pendingList.length})
        </h3>

        {pendingList.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No pending top-up orders awaiting reconciliation.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingList.map((topup) => (
              <div
                key={topup.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {formatRupees(topup.amountRupees)}
                    </span>
                    <Badge variant="warning" size="sm">Pending</Badge>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      Ref: {topup.id}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Talker: <strong>{topup.userName}</strong> ({topup.userEmail})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Created: {new Date(topup.createdAt).toLocaleTimeString()} ({new Date(topup.createdAt).toLocaleDateString()})
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSelectedTopup(topup);
                    setUtrInput(topup.utrRef || '');
                  }}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Verify & Credit Wallet
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Credited History */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Recently Confirmed & Credited ({creditedList.length})
        </h3>

        {creditedList.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No credited payments recorded yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {creditedList.slice(0, 5).map((topup) => (
              <div
                key={topup.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{topup.amountRupees.toFixed(2)}
                    </span>
                    <Badge variant="success" size="sm">Credited</Badge>
                    <span className="font-mono text-slate-500">Ref: {topup.id}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Talker: {topup.userName} • Bank UTR: {topup.utrRef || 'Verified'} • Confirmed by: {topup.confirmedBy}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  {topup.confirmedAt ? new Date(topup.confirmedAt).toLocaleDateString() : 'Done'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Manual Verification Modal */}
      {selectedTopup && (
        <Modal
          isOpen={!!selectedTopup}
          onClose={() => setSelectedTopup(null)}
          title={`Confirm Payment for ${selectedTopup.id}`}
          description={`Verify that ₹${selectedTopup.amountRupees.toFixed(2)} was received on ${DESTINATION_UPI_ID}.`}
        >
          <div className="space-y-4 text-left">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p><strong>Talker:</strong> {selectedTopup.userName} ({selectedTopup.userEmail})</p>
              <p><strong>Expected Amount:</strong> ₹{selectedTopup.amountRupees.toFixed(2)} ({selectedTopup.amountPaise} paise)</p>
              <p><strong>Target VPA:</strong> {DESTINATION_UPI_ID}</p>
            </div>

            <Input
              label="Bank Reference / UTR Number"
              placeholder="e.g. 431289123456 (or leave empty to auto-generate)"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              helperText="The 12-digit UPI reference number extracted from the banking SMS / notification."
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTopup(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleConfirmPayment}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Credit Talker Wallet
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
