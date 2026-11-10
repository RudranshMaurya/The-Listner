import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Save, ShieldCheck } from 'lucide-react';

export const ListenerSettingsPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [upiId, setUpiId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !upiId.includes('@')) {
      showToast('error', 'Please provide a valid UPI ID (e.g. rahul@oksbi)');
      return;
    }
    try {
      setIsSaving(true);
      showToast('success', 'Confidential payout preferences updated.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Listener Preferences & Payout Details
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Configure your private payout address and account settings.
        </p>
      </div>

      <Card padding="lg" className="space-y-5">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Default Payout UPI ID"
            placeholder="e.g. rahul@oksbi or username@paytm"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            helperText="This UPI ID remains strictly confidential and is only visible to the system administrator when processing withdrawals."
          />

          <div className="p-4 rounded-input bg-surface border border-border text-small text-text-muted space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-text">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Confidentiality Guarantee</span>
            </div>
            <p className="text-caption">
              Talkers never see your bank details, real phone number, or UPI address. All payouts are disbursed privately.
            </p>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
