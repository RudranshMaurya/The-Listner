import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { saveListenerProfile, saveListenerSchedule, DEFAULT_WEEKLY_SCHEDULE } from '../../lib/database';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const ListenerOnboardingPage: React.FC = () => {
  const { currentUser, profile, updateProfileData } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1: Personal Profile
  const [displayName, setDisplayName] = useState(profile?.displayName || currentUser?.displayName || '');
  const [age, setAge] = useState<string>(profile?.age ? String(profile.age) : '25');
  const [gender, setGender] = useState<string>('Female');
  const [yearsExperience, setYearsExperience] = useState<number>(2);
  const [languages] = useState<string[]>(['English', 'Hindi']);
  const [bio, setBio] = useState<string>(
    'Patient, empathetic listener ready to hear your stories and feelings without judgment.'
  );

  // Step 2: Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Relationships',
    'Loneliness',
    'Career',
    'Work stress',
    'Personal growth',
    'General conversations'
  ]);

  // Step 3: Schedule
  const [acceptsImmediate, setAcceptsImmediate] = useState<boolean>(true);
  const [acceptsAppointments, setAcceptsAppointments] = useState<boolean>(true);

  // Step 4: Payouts
  const [upiId, setUpiId] = useState<string>('');

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
    'Life experiences',
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!displayName.trim()) {
        showToast('error', 'Please enter your display name.');
        return;
      }
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 18) {
        showToast('error', 'Listeners must be at least 18 years old.');
        return;
      }
    } else if (currentStep === 2) {
      if (selectedTopics.length === 0) {
        showToast('error', 'Please select at least one topic you are comfortable listening to.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinishStep4 = async () => {
    if (!currentUser) return;
    if (!upiId.trim() || !upiId.includes('@')) {
      showToast('error', 'Please enter a valid private UPI ID for payouts.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Save user base profile
      await updateProfileData({
        displayName: displayName.trim(),
        role: 'listener',
        age: parseInt(age, 10),
        gender,
        preferredLanguage: languages[0] || 'English',
        topics: selectedTopics,
        bio: bio.trim(),
        onboardingCompleted: false // Will complete after questionnaire
      });

      // Save listener specific profile
      await saveListenerProfile({
        uid: currentUser.uid,
        displayName: displayName.trim(),
        photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
        bio: bio.trim(),
        age: parseInt(age, 10),
        gender,
        yearsExperience,
        topics: selectedTopics,
        languages,
        pricingPaisePerMin: 250,
        rating: 5.0,
        totalReviews: 0,
        totalSessions: 0,
        isVerified: false,
        verificationStatus: 'unsubmitted',
        status: 'idle'
      });

      // Save initial schedule
      await saveListenerSchedule({
        uid: currentUser.uid,
        weekly: DEFAULT_WEEKLY_SCHEDULE,
        acceptsImmediate,
        acceptsAppointments,
        timezone: 'Asia/Kolkata',
        updatedAt: Date.now()
      });

      showToast('success', 'Profile details saved! Proceeding to Listener Qualification Questionnaire.');
      navigate('/onboarding/listener-verification');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save listener profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Profile' },
    { num: 2, title: 'Topics' },
    { num: 3, title: 'Availability' },
    { num: 4, title: 'Payout Info' }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 text-left">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 text-caption font-medium">
              <span
                className={`w-5 h-5 rounded-pill flex items-center justify-center text-[11px] font-semibold transition-colors ${
                  currentStep === s.num
                    ? 'bg-accent text-accent-contrast shadow-soft'
                    : currentStep > s.num
                    ? 'bg-success text-white'
                    : 'bg-surface text-text-muted border border-border'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span
                className={
                  currentStep === s.num
                    ? 'text-text font-semibold'
                    : 'text-text-muted'
                }
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-surface border border-border h-1.5 rounded-pill overflow-hidden">
          <div
            className="bg-accent h-full rounded-pill transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <Card padding="lg" className="space-y-6">
        {/* Step 1: Personal Profile */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-apple-fade-in">
            <div>
              <h2 className="text-title font-semibold text-text tracking-tight">
                Step 1: Your Listener Profile
              </h2>
              <p className="text-small text-text-muted mt-1">
                This information is displayed on your public listener card so talkers can find you.
              </p>
            </div>

            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya or Rahul"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Age (18+)"
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />

              <div>
                <label className="block text-caption font-medium text-text mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 rounded-input border border-border bg-surface px-3 text-small text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <Input
                label="Years of Experience"
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            <Textarea
              label="Short Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell talkers about your listening style, patience, and warmth..."
              rows={3}
            />
          </div>
        )}

        {/* Step 2: Topics */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-apple-fade-in">
            <div>
              <h2 className="text-title font-semibold text-text tracking-tight">
                Step 2: Listening Preferences
              </h2>
              <p className="text-small text-text-muted mt-1">
                Select the life situations and topics you feel comfortable listening to.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {allTopics.map((topic) => {
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
        )}

        {/* Step 3: Availability Schedule */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-apple-fade-in">
            <div>
              <h2 className="text-title font-semibold text-text tracking-tight">
                Step 3: Availability Schedule
              </h2>
              <p className="text-small text-text-muted mt-1">
                Configure how talkers can reach you. You can adjust your detailed weekly calendar anytime.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-input border border-border bg-surface cursor-pointer">
                <div>
                  <p className="text-small font-semibold text-text">
                    Accept Immediate Conversations
                  </p>
                  <p className="text-caption text-text-muted">
                    Receive direct chat and call requests when you are online.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={acceptsImmediate}
                  onChange={(e) => setAcceptsImmediate(e.target.checked)}
                  className="rounded-input text-accent w-5 h-5 focus:ring-accent accent-accent cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-input border border-border bg-surface cursor-pointer">
                <div>
                  <p className="text-small font-semibold text-text">
                    Accept Scheduled Appointments
                  </p>
                  <p className="text-caption text-text-muted">
                    Allow talkers to reserve future time slots in your calendar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={acceptsAppointments}
                  onChange={(e) => setAcceptsAppointments(e.target.checked)}
                  className="rounded-input text-accent w-5 h-5 focus:ring-accent accent-accent cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Confidential UPI ID */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-apple-fade-in">
            <div>
              <h2 className="text-title font-semibold text-text tracking-tight">
                Step 4: Confidential Payout Details
              </h2>
              <p className="text-small text-text-muted mt-1">
                Earnings are transferred via UPI. Your UPI ID is strictly confidential and never displayed to talkers.
              </p>
            </div>

            <Input
              label="Your Personal UPI ID"
              placeholder="e.g. rahul@oksbi or username@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              helperText="Minimum payout amount: ₹200. Paid out directly to this UPI address."
              required
            />

            <div className="p-4 rounded-input bg-surface border border-border text-small text-text flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-text">Next Step: Verification Questionnaire</p>
                <p className="text-caption text-text-muted mt-0.5">
                  To complete registration and earn your green "Platform-verified listener" badge, you will answer a short scenario questionnaire.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              onClick={handleFinishStep4}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Save & Take Qualification Test
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
