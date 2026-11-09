import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const TalkerOnboardingPage: React.FC = () => {
  const { currentUser, profile, updateProfileData } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.displayName || currentUser?.displayName || '');
  const [age, setAge] = useState<string>(profile?.age ? String(profile.age) : '24');
  const [gender, setGender] = useState<string>(profile?.gender || 'Prefer not to say');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Personal growth',
    'General conversations'
  ]);
  const [bio, setBio] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableTopics = [
    'Relationships',
    'Friendship',
    'Family',
    'Career',
    'Work stress',
    'Personal growth',
    'Loneliness',
    'Daily life',
    'Motivation',
    'General conversations'
  ];

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      showToast('error', 'You must be at least 18 years of age to use this platform.');
      return;
    }

    if (!termsAccepted) {
      showToast('error', 'Please accept the Terms of Service to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProfileData({
        displayName: displayName.trim() || 'Talker',
        role: 'talker',
        age: ageNum,
        gender,
        preferredLanguage,
        topics: selectedTopics,
        bio: bio.trim(),
        termsAccepted: true,
        onboardingCompleted: true
      });

      showToast('success', 'Profile completed! Welcome to The Listener.');
      navigate('/talker/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-left">
      <Card className="p-6 sm:p-10 shadow-lg space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Complete Your Talker Profile
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tell us a little about your conversational preferences. Your private data is never sold or shared.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Display Name or Pseudonym"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex or Anonymous"
            helperText="You can use your real name or a nickname."
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
              helperText="The Listener is an 18+ platform."
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>
          </div>

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
              <option value="Telugu">Telugu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Topics you like to talk about
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((topic) => {
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

          <Textarea
            label="Short Bio / Note (Optional)"
            placeholder="A short sentence about you or what you're seeking..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
          />

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                I am at least 18 years old and agree to the platform Terms of Service, Community Guidelines, and acknowledge this is an informal conversation service (not medical care).
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete & Find Listeners
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
