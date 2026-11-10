import React from 'react';
import { Card } from '../../components/common/Card';
import { ShieldAlert } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-left space-y-8 animate-apple-fade-in">
      <div>
        <h1 className="text-title font-semibold text-text">Terms of Service</h1>
        <p className="text-caption text-text-muted mt-1">Last revised: November 2026</p>
      </div>

      <Card padding="lg" className="space-y-6 text-body text-text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">1. Nature of the Platform</h2>
          <p>
            The Listener provides a peer conversation platform connecting individuals seeking informal listening (Talkers) with independent conversation providers (Listeners). The platform does NOT provide medical, clinical, psychiatric, or psychological counseling. Listeners are not licensed mental health practitioners on this platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">2. User Eligibility (18+ Policy)</h2>
          <p>
            You must be at least 18 years of age to register and use this service. By signing up, you certify that you meet this age requirement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">3. Billing & Pricing</h2>
          <p>
            Sessions are charged at the transparent rate of ₹5 per 2 minutes (₹2.50 per minute) calculated to the active second. Charges apply only when both parties are actively connected in a session. Unused wallet balances remain in the talker's account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">4. Listener Earnings & Withdrawals</h2>
          <p>
            Listeners earn revenue for active listening time. The minimum payout threshold is ₹200. Payouts are made directly to the listener's verified UPI ID upon administrative review and recording of banking transaction references.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">5. Code of Conduct</h2>
          <p>
            Users agree not to harass, abuse, stalk, threaten, solicit sexually explicit content, or engage in hate speech. Violations will result in immediate permanent account suspension and forfeiture of abusive balances.
          </p>
        </section>

        <div className="p-4 rounded-card bg-warning/10 border border-warning/20 flex items-start gap-3 text-warning">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-caption text-text leading-relaxed">
            Emergency Notice: If you are experiencing suicidal thoughts, severe depression, or medical emergencies, please do not use this app. Contact emergency medical services or national helplines immediately (KIRAN: 1800-599-0019).
          </p>
        </div>
      </Card>
    </div>
  );
};
