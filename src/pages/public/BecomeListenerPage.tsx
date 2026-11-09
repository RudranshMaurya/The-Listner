import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Heart,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Smile
} from 'lucide-react';

export const BecomeListenerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();

  const handleApply = () => {
    if (!currentUser) {
      navigate('/signup');
    } else if (role === 'listener') {
      navigate('/listener/dashboard');
    } else {
      navigate('/onboarding/listener');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-left space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="verified" size="md" className="mb-4">Listener Opportunities</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Be a compassionate listener. Earn for your time.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Millions of people simply need someone who will listen without judging them.
          Set your own availability, connect from the comfort of your home, and receive fast UPI payouts directly to your bank account.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={handleApply}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Apply Now in 5 Minutes
          </Button>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
            100% Flexible Schedule
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Toggle your availability to "Online" whenever you have free time: morning, evening, or weekends. Accept sessions only when you want.
          </p>
        </Card>

        <Card className="p-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
            Transparent Payouts
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Earn ₹2.50 for every minute of active listening. Withdraw your funds directly to your UPI ID whenever your balance reaches ₹200.
          </p>
        </Card>

        <Card className="p-6">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
            Private & Respectful
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your personal phone number and personal details are never visible to talkers. All sessions happen directly in the browser.
          </p>
        </Card>
      </div>

      {/* Verification Process */}
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          The 4-Step Listener Onboarding
        </h3>
        <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">1.</span>
            <span><strong>Profile setup:</strong> Add your bio, language fluency, and conversational experience.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">2.</span>
            <span><strong>Topic preferences:</strong> Select topics you feel comfortable discussing (Relationships, Career, Family, etc.).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">3.</span>
            <span><strong>Listening assessment:</strong> Answer scenario-based questions to earn your Platform-Verified Listener badge (requires ≥ 80% score).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">4.</span>
            <span><strong>Payout UPI setup:</strong> Securely enter your confidential UPI ID for payouts.</span>
          </li>
        </ol>

        <div className="pt-4">
          <Button variant="primary" onClick={handleApply}>
            Get Started as a Listener
          </Button>
        </div>
      </div>
    </div>
  );
};
