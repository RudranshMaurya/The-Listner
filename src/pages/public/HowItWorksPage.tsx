import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Compass,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Heart,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-left space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="listening" size="md" className="mb-4">Platform Walkthrough</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How The Listener Works
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          The Listener is designed from the ground up for privacy, empathy, and seamless human connection.
          Here is exactly how our platform functions for both Talkers and Listeners.
        </p>
      </div>

      {/* For Talkers */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>For Talkers (People who want to be heard)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              1. Choose a Listener
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Browse our directory of verified listeners. Filter by topics (Relationships, Career, Loneliness, Family, Stress), languages, ratings, and live status.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              2. Add Funds via UPI
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Top up your wallet safely with any UPI application (Google Pay, PhonePe, Paytm). The standard transparent rate is ₹5 per 2 minutes.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              3. Connect in Real-Time
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Start an instant text conversation or audio call. Billing only begins once the listener accepts and both of you are officially active.
            </p>
          </Card>
        </div>
      </div>

      {/* For Listeners */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>For Listeners (People who earn by listening)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              1. Empathy Qualification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Complete our listener verification questionnaire covering active listening, boundary management, crisis referral, and confidentiality.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              2. Set Your Hours
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Toggle your availability online whenever you are free. Accept instant incoming sessions or schedule future slots in your calendar.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              3. Fast UPI Payouts
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Track your earnings per session in your dedicated wallet. Request direct transfers to your private UPI ID whenever your balance is at least ₹200.
            </p>
          </Card>
        </div>
      </div>

      {/* Safety & Non-Medical Notice */}
      <div id="safety" className="p-6 sm:p-8 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-left space-y-3">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Our Strict Safety Standards</span>
        </div>
        <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
          The Listener does not provide psychotherapy, medical diagnoses, or psychiatric treatment. Listeners are verified for platform safety and respectful communication, but they are not acting as licensed medical practitioners.
          If a user expresses intentions of self-harm or severe psychological crisis, listeners are trained to refer the user immediately to official national emergency crisis lines.
        </p>
      </div>

      <div className="text-center pt-4">
        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/explore')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Explore Available Listeners
        </Button>
      </div>
    </div>
  );
};
