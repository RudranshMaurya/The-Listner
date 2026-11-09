import React, { useEffect, useState } from 'react';
import { getAdminConfig, updateAdminConfig, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { AdminPlatformConfig } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Save, Shield, Settings, Sliders } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [rateRupees, setRateRupees] = useState('5.00'); // ₹5 per 2 mins
  const [commissionPct, setCommissionPct] = useState('0');
  const [minWithdrawalRupees, setMinWithdrawalRupees] = useState('200');
  const [passScore, setPassScore] = useState('80');
  const [helpline, setHelpline] = useState('1800-599-0019');
  const [maintenance, setMaintenance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAdminConfig().then((cfg) => {
      if (cfg) {
        setRateRupees(((cfg.defaultRatePaisePerMin * 2) / 100).toFixed(2));
        setCommissionPct(String(cfg.platformCommissionPct || 0));
        setMinWithdrawalRupees(String((cfg.minWithdrawalPaise || 20000) / 100));
        setPassScore(String(cfg.verificationPassScore || 80));
        setHelpline(cfg.emergencyHelplineNumber || '1800-599-0019');
        setMaintenance(!!cfg.maintenanceMode);
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsSaving(true);
      const ratePerMinPaise = Math.round((parseFloat(rateRupees) / 2) * 100);
      const minWithdrawalPaise = Math.round(parseFloat(minWithdrawalRupees) * 100);

      const updated: Partial<AdminPlatformConfig> = {
        defaultRatePaisePerMin: ratePerMinPaise,
        platformCommissionPct: parseInt(commissionPct, 10) || 0,
        minWithdrawalPaise: minWithdrawalPaise,
        verificationPassScore: parseInt(passScore, 10) || 80,
        emergencyHelplineNumber: helpline.trim(),
        maintenanceMode: maintenance
      };

      await updateAdminConfig(updated);
      await writeAuditLog({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || 'admin',
        action: 'Updated global platform configuration',
        targetType: 'config',
        targetId: 'global',
        details: JSON.stringify(updated)
      });

      showToast('success', 'Platform settings successfully saved to trusted configuration.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to update configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Platform Configuration & Rules
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Centralized billing engine rates, commission rates, and safety parameters stored in backend configuration.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Standard Rate (₹ per 2 minutes)"
              type="number"
              step="0.5"
              value={rateRupees}
              onChange={(e) => setRateRupees(e.target.value)}
              helperText="Current default: ₹5.00 for every 2 mins (₹2.50/min)"
              required
            />

            <Input
              label="Platform Commission (%)"
              type="number"
              min="0"
              max="50"
              value={commissionPct}
              onChange={(e) => setCommissionPct(e.target.value)}
              helperText="Initially 0% (full rate credited to listeners)"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min. Withdrawal Amount (₹)"
              type="number"
              min="50"
              max="10000"
              value={minWithdrawalRupees}
              onChange={(e) => setMinWithdrawalRupees(e.target.value)}
              helperText="Minimum threshold: ₹200.00"
              required
            />

            <Input
              label="Verification Pass Score (%)"
              type="number"
              min="50"
              max="100"
              value={passScore}
              onChange={(e) => setPassScore(e.target.value)}
              helperText="Threshold to earn Platform-Verified tick"
              required
            />
          </div>

          <Input
            label="National Emergency Helpline Display"
            value={helpline}
            onChange={(e) => setHelpline(e.target.value)}
            helperText="Crisis support helpline displayed on disclaimer banners"
            required
          />

          <div className="pt-2">
            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Maintenance Mode
                </p>
                <p className="text-[11px] text-slate-500">
                  Temporarily pause new conversation initiation for system maintenance.
                </p>
              </div>
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
