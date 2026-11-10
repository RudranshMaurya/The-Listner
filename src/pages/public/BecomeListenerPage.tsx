import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  ArrowRight
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
      // Role is locked to talker
      navigate('/talker/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="success" size="sm">Listener Opportunities</Badge>
        <h1 className="text-display font-semibold text-text tracking-tight leading-[1.08]">
          Be a compassionate listener. Earn for your time.
        </h1>
        <p className="text-body text-text-muted leading-relaxed">
          Millions of people simply need someone who will listen without judging them.
          Set your own availability, connect from home, and receive fast UPI payouts directly to your bank account.
        </p>

        <div className="pt-4 flex flex-col items-center justify-center gap-3">
          {currentUser && role === 'talker' ? (
            <Card padding="md" className="text-center max-w-md border-border">
              <p className="text-small text-text mb-3">
                You are registered as a Talker with this account. Account roles are permanently fixed once registered.
              </p>
              <Button
                size="md"
                variant="primary"
                onClick={() => navigate('/talker/dashboard')}
              >
                Go to Talker Dashboard
              </Button>
            </Card>
          ) : (
            <Button
              size="lg"
              variant="primary"
              onClick={handleApply}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {role === 'listener' ? 'Go to Listener Dashboard' : 'Apply Now in 5 Minutes'}
            </Button>
          )}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="space-y-2">
          <div className="w-9 h-9 rounded-pill bg-surface border border-border flex items-center justify-center text-text mb-2">
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-small font-semibold text-text">
            100% Flexible Schedule
          </h3>
          <p className="text-caption text-text-muted leading-relaxed">
            Toggle your availability to "Online" whenever you have free time: morning, evening, or weekends. Accept sessions only when you want.
          </p>
        </Card>

        <Card padding="md" className="space-y-2">
          <div className="w-9 h-9 rounded-pill bg-surface border border-border flex items-center justify-center text-text mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <h3 className="text-small font-semibold text-text">
            Transparent Payouts
          </h3>
          <p className="text-caption text-text-muted leading-relaxed">
            Earn ₹2.50 for every minute of active listening. Withdraw your funds directly to your UPI ID whenever your balance reaches ₹200.
          </p>
        </Card>

        <Card padding="md" className="space-y-2">
          <div className="w-9 h-9 rounded-pill bg-surface border border-border flex items-center justify-center text-text mb-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-small font-semibold text-text">
            Private & Respectful
          </h3>
          <p className="text-caption text-text-muted leading-relaxed">
            Your personal phone number and personal details are never visible to talkers. All sessions happen directly in the browser.
          </p>
        </Card>
      </div>

      {/* Verification Process */}
      <Card variant="raised" padding="lg" className="space-y-4">
        <h3 className="text-title font-semibold text-text tracking-tight">
          The 4-Step Listener Onboarding
        </h3>
        <ol className="space-y-3 text-small text-text-muted">
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-accent">1.</span>
            <span><strong className="text-text">Profile setup:</strong> Add your bio, language fluency, and conversational experience.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-accent">2.</span>
            <span><strong className="text-text">Topic preferences:</strong> Select topics you feel comfortable discussing (Relationships, Career, Family, etc.).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-accent">3.</span>
            <span><strong className="text-text">Listening assessment:</strong> Answer scenario-based questions to earn your Platform-Verified Listener badge (requires ≥ 80% score).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-accent">4.</span>
            <span><strong className="text-text">Payout UPI setup:</strong> Securely enter your confidential UPI ID for payouts.</span>
          </li>
        </ol>

        <div className="pt-2">
          <Button variant="primary" size="md" onClick={handleApply}>
            Get Started as a Listener
          </Button>
        </div>
      </Card>
    </div>
  );
};
