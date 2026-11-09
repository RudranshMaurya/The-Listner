import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { saveListenerProfile, saveListenerSchedule, DEFAULT_WEEKLY_SCHEDULE } from '../../lib/database';
import {
  User,
  Heart,
  Clock,
  ShieldCheck,
  CheckCircle2,
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
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi']);
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-left">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 text-xs font-semibold">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep === s.num
                    ? 'bg-indigo-600 text-white'
                    : currentStep > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span
                className={
                  currentStep === s.num
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400'
                }
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 sm:p-10 shadow-lg space-y-6">
        {/* Step 1: Personal Profile */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 1: Your Listener Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 2: Listening Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                    className={`px-3.5 py-2 rounded-2xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
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
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 3: Availability Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure how talkers can reach you. You can adjust your detailed weekly calendar anytime.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Accept Immediate Conversations
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive direct chat and call requests when you are online.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={acceptsImmediate}
                  onChange={(e) => setAcceptsImmediate(e.target.checked)}
                  className="rounded text-indigo-600 w-5 h-5 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Accept Scheduled Appointments
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Allow talkers to reserve future time slots in your calendar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={acceptsAppointments}
                  onChange={(e) => setAcceptsAppointments(e.target.checked)}
                  className="rounded text-indigo-600 w-5 h-5 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Confidential UPI ID */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 4: Confidential Payout Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Next Step: Verification Questionnaire</p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                  To complete registration and earn your green "Platform-verified listener" badge, you will answer a short scenario questionnaire.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
