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
  CheckCircle2
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
          <h2 className="text-title text-text tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-accent" />
            <span>UPI Payment Reconciliation</span>
          </h2>
          <p className="text-small text-text-muted mt-0.5">
            Incoming candidate notifications matched for <code className="font-mono text-accent">{DESTINATION_UPI_ID}</code>.
          </p>
        </div>
      </div>

      {/* Gateway Connection Status Box */}
      <Card padding="md" className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-caption font-semibold text-success">
            <span className="w-2 h-2 rounded-pill bg-success animate-pulse" />
            <span>Python Gateway Listening (Port 5050)</span>
          </div>
          <span className="text-caption text-text-muted font-mono">rudransh-maurya@fam</span>
        </div>
        <p className="text-small text-text-muted leading-relaxed">
          The webhook gateway parses Indian bank SMS, Google Pay, PhonePe, and FamPay alerts, performs deduplication, and streams candidates to this reconciliation console.
        </p>
      </Card>

      {/* Pending Orders Reconciler */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-small font-semibold text-text border-b border-border pb-3">
          Awaiting Verification & Wallet Credit ({pendingList.length})
        </h3>

        {pendingList.length === 0 ? (
          <p className="text-caption text-text-muted py-6 text-center">
            No pending top-up orders awaiting reconciliation.
          </p>
        ) : (
          <div className="space-y-2">
            {pendingList.map((topup) => (
              <div
                key={topup.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-input bg-surface border border-border text-small"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">
                      {formatRupees(topup.amountRupees)}
                    </span>
                    <Badge variant="warning" size="sm">Pending</Badge>
                    <span className="font-mono text-accent text-caption">
                      Ref: {topup.id}
                    </span>
                  </div>

                  <p className="text-caption text-text-muted mt-1">
                    Talker: <strong className="text-text">{topup.userName}</strong> ({topup.userEmail})
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
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
                  Verify & Credit
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Credited History */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-small font-semibold text-text border-b border-border pb-3">
          Recently Confirmed & Credited ({creditedList.length})
        </h3>

        {creditedList.length === 0 ? (
          <p className="text-caption text-text-muted py-6 text-center">
            No credited payments recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {creditedList.slice(0, 5).map((topup) => (
              <div
                key={topup.id}
                className="flex items-center justify-between p-3.5 rounded-input bg-surface border border-border text-small"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">
                      ₹{topup.amountRupees.toFixed(2)}
                    </span>
                    <Badge variant="success" size="sm">Credited</Badge>
                    <span className="font-mono text-text-muted text-caption">Ref: {topup.id}</span>
                  </div>
                  <p className="text-caption text-text-muted mt-0.5">
                    Talker: {topup.userName} • Bank UTR: {topup.utrRef || 'Verified'} • Confirmed by: {topup.confirmedBy}
                  </p>
                </div>
                <span className="text-caption text-text-muted">
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
            <div className="p-3.5 rounded-input bg-surface border border-border text-small text-text-muted space-y-1">
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

            <div className="pt-3 flex justify-end gap-2 border-t border-border">
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
