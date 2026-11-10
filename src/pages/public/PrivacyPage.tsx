import React from 'react';
import { Card } from '../../components/common/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-left space-y-8 animate-apple-fade-in">
      <div>
        <h1 className="text-title font-semibold text-text">Privacy Policy</h1>
        <p className="text-caption text-text-muted mt-1">Last revised: November 2026</p>
      </div>

      <Card padding="lg" className="space-y-6 text-body text-text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">1. Information We Collect</h2>
          <p>
            We collect basic account information via Google Sign-In (name, email, profile photo), chosen display preferences, age, preferred language, and session metadata (duration and timestamps for billing).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">2. Strict Separation of Sensitive Data</h2>
          <p>
            Listener payout information (UPI IDs), financial ledger records, and private audit trails are strictly quarantined and never accessible to other platform users or public profiles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">3. Audio Call Privacy</h2>
          <p>
            Audio calls are routed peer-to-peer using WebRTC technology. We do not record, store, or eavesdrop on voice conversations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">4. Payment Security</h2>
          <p>
            UPI top-ups are processed via dynamic QR codes without storing bank debit cards or net banking passwords. Payment confirmations are verified securely by our backend services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">5. Account Deletion & Rights</h2>
          <p>
            You have the right to request deletion of your account and associated profile data at any time by contacting our support team or through settings.
          </p>
        </section>
      </Card>
    </div>
  );
};
