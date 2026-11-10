import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Heart,
  DollarSign,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge variant="neutral" size="sm">Platform Guide</Badge>
        <h1 className="text-display font-semibold text-text tracking-tight">
          How The Listener Works
        </h1>
        <p className="text-body text-text-muted leading-relaxed">
          The Listener is designed for privacy, empathy, and seamless human connection.
        </p>
      </div>

      {/* For Talkers */}
      <div className="space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-title font-semibold text-text flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            <span>For Talkers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md" className="space-y-2">
            <h3 className="text-small font-semibold text-text">
              1. Choose a Listener
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Browse our directory of verified listeners. Filter by topics (Relationships, Career, Loneliness, Stress), languages, ratings, and live status.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <h3 className="text-small font-semibold text-text">
              2. Add Credits via UPI
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Top up your balance safely with any UPI application (Google Pay, PhonePe, Paytm). The standard transparent rate is ₹5 per 2 minutes.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <h3 className="text-small font-semibold text-text">
              3. Connect in Real-Time
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Start an instant text conversation or audio call. Billing only begins once the listener accepts and both of you are officially active.
            </p>
          </Card>
        </div>
      </div>

      {/* For Listeners */}
      <div className="space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-title font-semibold text-text flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            <span>For Listeners</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md" className="space-y-2">
            <h3 className="text-small font-semibold text-text">
              1. Empathy Qualification
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Complete our listener verification questionnaire covering active listening, boundary management, crisis referral, and confidentiality.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <h3 className="text-small font-semibold text-text">
              2. Set Your Hours
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Toggle your availability online whenever you are free. Accept instant incoming sessions or schedule future slots in your calendar.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <h3 className="text-small font-semibold text-text">
              3. Fast UPI Payouts
            </h3>
            <p className="text-caption text-text-muted leading-relaxed">
              Track your earnings per session in your dedicated wallet. Request direct transfers to your private UPI ID whenever your balance is at least ₹200.
            </p>
          </Card>
        </div>
      </div>

      {/* Safety & Non-Medical Notice */}
      <Card padding="lg" className="border-border space-y-2">
        <div className="flex items-center gap-2 text-text font-semibold text-small">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
          <span>Our Strict Safety Standards</span>
        </div>
        <p className="text-caption text-text-muted leading-relaxed">
          The Listener does not provide psychotherapy, medical diagnoses, or psychiatric treatment. Listeners are verified for platform safety and respectful communication, but they are not acting as licensed medical practitioners.
          If a user expresses intentions of self-harm or severe psychological crisis, listeners are trained to refer the user immediately to official national emergency crisis lines.
        </p>
      </Card>

      <div className="text-center pt-2">
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
