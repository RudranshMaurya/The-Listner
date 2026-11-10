import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { ArrowRight } from 'lucide-react';

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
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 text-left">
      <Card padding="lg" className="space-y-6">
        <div>
          <h1 className="text-title font-semibold text-text tracking-tight">
            Complete Your Profile
          </h1>
          <p className="mt-1 text-small text-text-muted">
            Tell us a little about your conversational preferences. Your private data is never sold or shared.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-caption font-medium text-text mb-1.5">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 rounded-input border border-border bg-surface px-3 text-small text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-caption font-medium text-text mb-1.5">
              Preferred Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full h-11 rounded-input border border-border bg-surface px-3 text-small text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
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
            <label className="block text-caption font-semibold uppercase tracking-wider text-text-muted mb-2">
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
                    className={`px-3 py-1.5 rounded-pill text-caption font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-accent font-semibold shadow-soft'
                        : 'border-border bg-surface text-text-muted hover:text-text'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Short Bio or Note (Optional)"
            placeholder="Share what brings you here or what kind of conversation you appreciate..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-caption text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded-input text-accent focus:ring-accent accent-accent cursor-pointer"
              />
              <span>
                I agree to the Terms of Service and acknowledge The Listener is not a medical or clinical crisis service.
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Exploring Listeners
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
