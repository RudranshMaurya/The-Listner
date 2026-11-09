import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getListenerProfile, saveListenerProfile } from '../../lib/database';
import type { ListenerProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Save, User, ShieldCheck } from 'lucide-react';

export const ListenerProfileEditPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [listener, setListener] = useState<ListenerProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('Female');
  const [yearsExperience, setYearsExperience] = useState(2);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi']);
  const [showAge, setShowAge] = useState(true);
  const [showGender, setShowGender] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const allTopics = [
    'Relationships',
    'Friendship',
    'Family',
    'Education',
    'Career',
    'Work stress',
    'Personal growth',
    'Loneliness',
    'Daily life',
    'Motivation',
    'General conversations'
  ];

  useEffect(() => {
    if (!currentUser) return;
    getListenerProfile(currentUser.uid).then((l) => {
      if (l) {
        setListener(l);
        setDisplayName(l.displayName || '');
        setBio(l.bio || '');
        setAge(l.age ? String(l.age) : '25');
        setGender(l.gender || 'Female');
        setYearsExperience(l.yearsExperience || 1);
        setSelectedTopics(l.topics || []);
        setLanguages(l.languages || ['English', 'Hindi']);
        setShowAge(l.showAge ?? true);
        setShowGender(l.showGender ?? true);
      }
    });
  }, [currentUser]);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setIsSaving(true);
      await saveListenerProfile({
        uid: currentUser.uid,
        displayName: displayName.trim(),
        bio: bio.trim(),
        age: parseInt(age, 10) || 25,
        gender,
        yearsExperience,
        topics: selectedTopics,
        languages,
        showAge,
        showGender
      });
      showToast('success', 'Listener profile updated successfully.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Edit Public Listener Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Update the profile details shown to talkers in the listener directory.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Age"
              type="number"
              min="18"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <Input
              label="Years Experience"
              type="number"
              min="0"
              max="50"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <Textarea
            label="About You (Bio)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Listening Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {allTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
