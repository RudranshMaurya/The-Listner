import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, role, profile, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // If user is already authenticated, immediately route them to their respective dashboard
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-pill animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    const effectiveRole = role || profile?.role || (localStorage.getItem('tl_selected_role') as 'talker' | 'listener' | null) || 'talker';
    const targetDashboard = effectiveRole === 'listener' ? '/listener/dashboard' : '/talker/dashboard';
    return <Navigate to={targetDashboard} replace />;
  }

  const faqs = [
    {
      q: 'What is The Listener platform?',
      a: 'The Listener is a safe, empathetic conversation platform connecting people who want to talk and share their thoughts (Talkers) with compassionate, respectful people who are ready to listen (Listeners).'
    },
    {
      q: 'Is this medical therapy or psychiatric counseling?',
      a: 'No. The platform is not a medical, psychiatric, or mental health emergency service. Listeners provide empathetic, human listening sessions without advice or clinical judgment. For psychological crises or clinical treatment, we guide users to national emergency hotlines.'
    },
    {
      q: 'How does pricing work?',
      a: 'Pricing is completely transparent: ₹5 for every 2 minutes of conversation (₹2.50 per minute). Billing begins only after both participants accept and start the active session. There are zero hidden fees.'
    },
    {
      q: 'How do I pay for sessions?',
      a: 'You can instantly add conversation credits using any Indian UPI app (Google Pay, PhonePe, Paytm, BHIM, FamPay) by scanning a dynamic QR code. Your credits are updated in real time.'
    },
    {
      q: 'How do Listeners earn and withdraw earnings?',
      a: 'Listeners earn for every minute spent actively listening. When your withdrawable balance reaches ₹200 or more, you can request an instant payout directly to your personal UPI ID.'
    },
    {
      q: 'Is my conversation private and confidential?',
      a: 'Yes. Only you and your listener participate in the active session. Audio calls are peer-to-peer WebRTC encrypted and never recorded.'
    }
  ];

  return (
    <div className="space-y-20 py-10 sm:py-16 text-center max-w-5xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface border border-border text-caption font-semibold text-text-muted shadow-soft animate-apple-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>A safe space for everyday human connection</span>
        </div>

        <h1 className="text-display font-semibold tracking-tight text-text leading-[1.08] max-w-3xl mx-auto">
          A space where you can speak freely and be heard.
        </h1>

        <p className="text-body text-text-muted max-w-xl mx-auto leading-relaxed">
          Share what's on your mind, talk about your experiences, or simply have a conversation with someone who is ready to listen. No judgment. Just human connection.
        </p>

        {/* Philosophy Tagline Pill */}
        <div className="inline-block px-5 py-2 rounded-pill bg-surface text-caption font-medium text-text-muted border border-border">
          "Sometimes, you don't need advice. You just need someone who listens."
        </div>

        {/* Primary CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/explore')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Find Someone to Talk To
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/become-a-listener')}
            className="w-full sm:w-auto"
          >
            Become a Listener & Earn
          </Button>
        </div>

        {/* 3 Value Props */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <Card padding="md" className="space-y-2">
            <div className="w-9 h-9 rounded-pill bg-surface border border-border flex items-center justify-center text-text mb-2">
              <Heart className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-small font-semibold text-text">100% Non-Judgmental</h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Listeners are vetted specifically for empathy, patience, active listening, and discretion.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <div className="w-9 h-9 rounded-pill bg-surface border border-border flex items-center justify-center text-text mb-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-small font-semibold text-text">Private & Anonymous</h3>
            <p className="text-caption text-text-muted leading-relaxed">
              No real phone numbers exchanged. Encrypted real-time text chat and WebRTC audio calling.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <div className="w-9 h-9 rounded-pill bg-surface border border-border flex items-center justify-center text-text mb-2">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-small font-semibold text-text">₹5 / 2 Minutes</h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Honest pay-per-minute billing. Timer runs only while session is active.
            </p>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
            Simple 3-Step Process
          </span>
          <h2 className="text-title font-semibold text-text tracking-tight">
            How The Listener Works
          </h2>
          <p className="text-small text-text-muted">
            Find the right listener and begin expressing yourself in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <Card padding="lg" className="space-y-2">
            <div className="text-2xl font-bold text-accent font-mono">01</div>
            <h3 className="text-small font-semibold text-text">
              Explore Verified Listeners
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Browse listener profiles, view their star ratings, completed conversations, languages, and topics of interest. Check their live availability status.
            </p>
          </Card>

          <Card padding="lg" className="space-y-2">
            <div className="text-2xl font-bold text-accent font-mono">02</div>
            <h3 className="text-small font-semibold text-text">
              Connect Instantly or Schedule
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Start an immediate chat/call if the listener is currently available, or reserve a scheduled time slot that suits your daily routine.
            </p>
          </Card>

          <Card padding="lg" className="space-y-2">
            <div className="text-2xl font-bold text-accent font-mono">03</div>
            <h3 className="text-small font-semibold text-text">
              Talk Freely Without Pressure
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Share thoughts, unburden your stress, or have a lighthearted talk. End whenever you wish, and only pay for the exact active minutes used.
            </p>
          </Card>
        </div>
      </section>

      {/* Become a Listener Callout */}
      <section>
        <Card variant="raised" padding="lg" className="text-left max-w-4xl mx-auto space-y-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="success" size="sm">
              Earn by Listening
            </Badge>
            <h2 className="text-title font-semibold text-text tracking-tight">
              Turn your empathy and patience into meaningful income.
            </h2>
            <p className="text-small text-text-muted leading-relaxed">
              Are you naturally a great listener who friends turn to? Join The Listener community. Pass our listening verification assessment, set your own schedule, and earn ₹2.50 per minute with direct UPI bank withdrawals starting from ₹200.
            </p>

            <div className="pt-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/become-a-listener')}
              >
                Apply as a Listener
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-1">
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
            No Surprises
          </span>
          <h2 className="text-title font-semibold text-text tracking-tight">
            Simple, Honest Pricing
          </h2>
        </div>

        <Card variant="raised" padding="lg" className="text-center space-y-5">
          <div>
            <Badge variant="neutral" size="sm">Standard Conversation Rate</Badge>
            <div className="flex items-baseline justify-center gap-1 mt-3">
              <span className="text-display font-bold text-text">₹5</span>
              <span className="text-caption text-text-muted font-normal">/ 2 minutes</span>
            </div>
            <p className="text-caption text-text-muted mt-1">
              Equivalent to ₹2.50 per minute. Billed to active time only.
            </p>
          </div>

          <ul className="space-y-2 text-caption text-left text-text-muted border-t border-border pt-4">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Zero charges while waiting or browsing profiles</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Real-time wallet balance deductions with auto-safety cutoff</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Instant UPI Top-up via Google Pay, PhonePe, Paytm</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>End the conversation anytime with one click</span>
            </li>
          </ul>

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={() => navigate('/explore')}
          >
            Start a Conversation Now
          </Button>
        </Card>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-2xl mx-auto text-left space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-title font-semibold text-text tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-caption text-text-muted">
            Everything you need to know about safety, privacy, and credits.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              padding="md"
              className="cursor-pointer transition-all"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-small font-semibold text-text">
                  {faq.q}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-accent' : ''
                  }`}
                />
              </div>
              {openFaq === idx && (
                <p className="mt-2.5 text-caption text-text-muted leading-relaxed border-t border-border pt-2.5 animate-apple-fade-in">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
