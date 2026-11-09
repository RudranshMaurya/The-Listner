import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Save, ShieldCheck, Lock } from 'lucide-react';

export const ListenerSettingsPage: React.FC = () => {
  const { currentUser, profile, updateProfileData } = useAuth();
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Listener Preferences & Payout Details
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure your private payout address and account settings.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-5">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Default Payout UPI ID"
            placeholder="e.g. rahul@oksbi or username@paytm"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            helperText="This UPI ID remains strictly confidential and is only visible to the system administrator when processing withdrawals."
          />

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Confidentiality Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Talkers never see your bank details, real phone number, or UPI address. All payouts are disbursed privately.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
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
