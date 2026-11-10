import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Headphones,
  Heart,
  ShieldCheck,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  Star,
  Users,
  Compass
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, role, profile, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // If user is already authenticated, immediately route them to their respective dashboard
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-24 py-10 sm:py-16 text-center">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6F0] dark:bg-[#272420] border border-[#EFEBE4] dark:border-[#332E28] text-xs font-semibold text-[#875C34] dark:text-[#E9D9C3] mb-6 shadow-xs animate-apple-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>A safe space for everyday human connection</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.1] max-w-4xl mx-auto">
          A space where you can{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A87747] via-[#D4A373] to-[#C49160] dark:from-[#DEC6A5] dark:via-[#D4A373] dark:to-[#FAF6F0]">
            speak freely
          </span>{' '}
          and be heard.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Share what's on your mind, talk about your experiences, or simply have a conversation with someone who is ready to listen. No judgment. Just human connection.
        </p>

        {/* Philosophy Tagline Pill */}
        <div className="mt-6 inline-block px-5 py-2 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420] text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 border border-[#EFEBE4] dark:border-[#332E28]">
          "Sometimes, you don't need advice. You just need someone who listens."
        </div>

        {/* Primary CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/explore')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-md"
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

        {/* Visual Composition Card */}
        <div className="mt-14 relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4A373]/15 via-[#0891B2]/10 to-[#166534]/10 blur-3xl -z-10 rounded-full" />
          <div className="rounded-3xl bg-white/90 dark:bg-[#1F1D1A]/90 border border-[#EFEBE4] dark:border-[#332E28] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-2xl bg-[#FAF6F0]/80 dark:bg-[#272420]/60 border border-[#EFEBE4] dark:border-[#332E28] nomad-card-hover">
                <div className="w-9 h-9 rounded-xl bg-[#D4A373]/20 flex items-center justify-center text-[#875C34] dark:text-[#DEC6A5] mb-3">
                  <Heart className="w-5 h-5 text-[#D4A373]" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">100% Non-Judgmental</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Listeners are vetted specifically for empathy, patience, active listening, and discretion.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6F0]/80 dark:bg-[#272420]/60 border border-[#EFEBE4] dark:border-[#332E28] nomad-card-hover">
                <div className="w-9 h-9 rounded-xl bg-[#0891B2]/15 flex items-center justify-center text-[#0891B2] mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">Private & Anonymous</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  No real phone numbers exchanged. Encrypted real-time text chat and WebRTC audio calling.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6F0]/80 dark:bg-[#272420]/60 border border-[#EFEBE4] dark:border-[#332E28] nomad-card-hover">
                <div className="w-9 h-9 rounded-xl bg-[#166534]/15 flex items-center justify-center text-[#166534] dark:text-[#4ADE80] mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">₹5 / 2 Minutes</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Honest pay-per-minute billing. Timer runs only while session is active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373] dark:text-[#DEC6A5]">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white mt-2">
            How The Listener Works
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            Find the right listener and begin expressing yourself in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <Card hover className="p-6 relative">
            <div className="text-4xl font-black text-[#D4A373]/30 dark:text-[#D4A373]/20 mb-3">01</div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1.5">
              Explore Verified Listeners
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Browse listener profiles, view their star ratings, completed conversations, languages, and topics of interest. Check their live availability status.
            </p>
          </Card>

          <Card hover className="p-6 relative">
            <div className="text-4xl font-black text-[#D4A373]/30 dark:text-[#D4A373]/20 mb-3">02</div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1.5">
              Connect Instantly or Schedule
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Start an immediate chat/call if the listener is currently available, or reserve a scheduled time slot that suits your daily routine.
            </p>
          </Card>

          <Card hover className="p-6 relative">
            <div className="text-4xl font-black text-[#D4A373]/30 dark:text-[#D4A373]/20 mb-3">03</div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1.5">
              Talk Freely Without Pressure
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Share thoughts, unburden your stress, or have a lighthearted talk. End whenever you wish, and only pay for the exact active minutes used.
            </p>
          </Card>
        </div>
      </section>

      {/* Become a Listener Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-tr from-[#1F1D1A] via-[#272420] to-[#161412] text-white p-8 sm:p-14 text-left border border-[#D4A373]/30 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <Badge variant="verified" size="md" className="mb-4">
              Earn by Listening
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Turn your empathy and patience into meaningful income.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#FAF6F0]/90 leading-relaxed">
              Are you naturally a great listener who friends turn to? Join The Listener community. Pass our listening verification assessment, set your own schedule, and earn ₹2.50 per minute with direct UPI bank withdrawals starting from ₹200.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/become-a-listener')}
              >
                Apply as a Listener
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373] dark:text-[#DEC6A5]">
            No Surprises
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white mt-2">
            Simple, Honest Pricing
          </h2>
        </div>

        <Card className="max-w-md mx-auto p-8 border-2 border-[#D4A373]/40 shadow-xl shadow-[#D4A373]/5">
          <Badge variant="listening" size="sm" className="mb-3">Standard Conversation Rate</Badge>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-stone-900 dark:text-white">₹5</span>
            <span className="text-stone-500 dark:text-stone-400 font-medium">/ 2 minutes</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Equivalent to ₹2.50 per minute. Billed to the second.
          </p>

          <ul className="mt-6 space-y-2.5 text-xs text-left text-stone-600 dark:text-stone-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#166534] dark:text-[#4ADE80] shrink-0" />
              <span>Zero charges while waiting or browsing profiles</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#166534] dark:text-[#4ADE80] shrink-0" />
              <span>Real-time wallet balance deductions with auto-safety cutoff</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#166534] dark:text-[#4ADE80] shrink-0" />
              <span>Instant UPI Top-up via Google Pay, PhonePe, Paytm</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#166534] dark:text-[#4ADE80] shrink-0" />
              <span>End the conversation anytime with one click</span>
            </li>
          </ul>

          <div className="mt-8">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => navigate('/explore')}
            >
              Start a Conversation Now
            </Button>
          </div>
        </Card>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-left">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Everything you need to know about our safety, community, and payments.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              hover
              className="p-5 cursor-pointer transition-all"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  {faq.q}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-[#D4A373]' : ''
                  }`}
                />
              </div>
              {openFaq === idx && (
                <p className="mt-3 text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-[#EFEBE4] dark:border-[#332E28] pt-3 animate-apple-fade-in">
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
