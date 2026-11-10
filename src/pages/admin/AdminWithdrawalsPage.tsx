import React, { useEffect, useState } from 'react';
import { subscribeToAllWithdrawals, processWithdrawalPayout, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { WithdrawalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { CheckCircle2, Copy } from 'lucide-react';

export const AdminWithdrawalsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [payoutAction, setPayoutAction] = useState<'paid' | 'rejected' | null>(null);
  const [utrRef, setUtrRef] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAllWithdrawals((list) => setWithdrawals(list));
    return () => unsub();
  }, []);

  const handleProcessAction = async () => {
    if (!selectedRequest || !payoutAction || !currentUser) return;

    if (payoutAction === 'paid' && !utrRef.trim()) {
      showToast('error', 'Please provide the banking UTR or transfer reference.');
      return;
    }

    try {
      setIsSubmitting(true);
      await processWithdrawalPayout(
        selectedRequest.id,
        payoutAction,
        utrRef.trim(),
        adminNote.trim(),
        currentUser.email || currentUser.uid
      );

      await writeAuditLog({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || 'admin',
        action: `Processed payout ${selectedRequest.id} as ${payoutAction}`,
        targetType: 'withdrawal',
        targetId: selectedRequest.id,
        details: `Amount: ₹${selectedRequest.amountRupees}, UPI: ${selectedRequest.upiId}, UTR: ${utrRef}`
      });

      showToast('success', `Withdrawal request marked as ${payoutAction}.`);
      setSelectedRequest(null);
      setPayoutAction(null);
      setUtrRef('');
      setAdminNote('');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to process payout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    showToast('info', `Copied ${upi} to clipboard`);
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Listener Withdrawal & Payout Center ({withdrawals.length})
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Review withdrawable requests (min ₹200), view confidential payout UPI addresses, and record bank UTR references.
        </p>
      </div>

      <div className="space-y-3">
        {withdrawals.length === 0 ? (
          <Card padding="lg" className="text-center text-text-muted text-caption">
            No withdrawal requests submitted yet.
          </Card>
        ) : (
          withdrawals.map((req) => (
            <Card key={req.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-small text-text font-mono">
                    ₹{req.amountRupees.toFixed(2)}
                  </span>
                  <span className="text-caption text-text-muted">to</span>
                  <span className="font-semibold text-small text-text">
                    {req.listenerName}
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

                {/* Confidential UPI Display */}
                <div className="flex items-center gap-2 text-caption text-text-muted">
                  <span>Confidential UPI:</span>
                  <code className="font-mono bg-surface-raised px-2 py-0.5 rounded-input border border-border font-medium text-text">
                    {req.upiId}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyUpi(req.upiId)}
                    className="p-1 text-text-muted hover:text-text cursor-pointer"
                    title="Copy UPI ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span>Req ID: {req.id}</span>
                  <span>•</span>
                  <span>Date: {new Date(req.requestedAt).toLocaleString()}</span>
                  {req.utrRef && (
                    <>
                      <span>•</span>
                      <span className="text-success font-mono">
                        UTR: {req.utrRef}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {req.status === 'requested' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedRequest(req);
                        setPayoutAction('paid');
                        setUtrRef('');
                      }}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Mark as Paid
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(req);
                        setPayoutAction('rejected');
                        setAdminNote('');
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Payout Processing Modal */}
      {selectedRequest && payoutAction && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            setPayoutAction(null);
          }}
          title={payoutAction === 'paid' ? 'Record UPI Bank Transfer' : 'Reject Withdrawal Request'}
          description={
            payoutAction === 'paid'
              ? `Confirm transfer of ₹${selectedRequest.amountRupees.toFixed(2)} to ${selectedRequest.upiId}.`
              : 'The reserved funds will be returned to the listener\'s withdrawable balance.'
          }
        >
          <div className="space-y-4 text-left">
            <div className="p-3.5 rounded-input bg-surface border border-border text-small text-text-muted space-y-1">
              <p><strong>Listener:</strong> {selectedRequest.listenerName}</p>
              <p><strong>Amount:</strong> ₹{selectedRequest.amountRupees.toFixed(2)}</p>
              <p><strong>Target UPI:</strong> <span className="font-mono text-accent">{selectedRequest.upiId}</span></p>
            </div>

            {payoutAction === 'paid' ? (
              <Input
                label="Bank Transfer UTR / Transaction Reference"
                placeholder="e.g. 431298456123 or UPI/4312..."
                value={utrRef}
                onChange={(e) => setUtrRef(e.target.value)}
                required
                helperText="Enter the real 12-digit UPI reference ID from your banking app."
              />
            ) : (
              <Input
                label="Rejection Reason"
                placeholder="e.g. Invalid UPI ID or pending account review..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required
              />
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRequest(null);
                  setPayoutAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={payoutAction === 'paid' ? 'primary' : 'danger'}
                size="md"
                isLoading={isSubmitting}
                onClick={handleProcessAction}
              >
                {payoutAction === 'paid' ? 'Confirm Payout Sent' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
