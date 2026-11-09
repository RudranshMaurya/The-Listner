import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Save, User, ShieldCheck } from 'lucide-react';

export const TalkerSettingsPage: React.FC = () => {
  const { profile, currentUser, updateProfileData } = useAuth();
  const { showToast } = useNotifications();

  const [displayName, setDisplayName] = useState(profile?.displayName || currentUser?.displayName || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '24');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage || 'English');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateProfileData({
        displayName: displayName.trim(),
        age: parseInt(age, 10) || 24,
        preferredLanguage,
        bio: bio.trim()
      });
      showToast('success', 'Profile settings updated.');
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
          Account Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal profile and display preferences.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-5">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Age (18+ Policy)"
              type="number"
              min="18"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Marathi">Marathi</option>
                <option value="Tamil">Tamil</option>
                <option value="Bengali">Bengali</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
          />

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
