import React from 'react';
import { Card } from '../../components/common/Card';
import { Heart, ShieldCheck, AlertCircle } from 'lucide-react';

export const CommunityGuidelinesPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-left space-y-8 animate-apple-fade-in">
      <div>
        <h1 className="text-title font-semibold text-text">Community Guidelines</h1>
        <p className="text-caption text-text-muted mt-1">Our principles for a kind, respectful environment</p>
      </div>

      <Card padding="lg" className="space-y-6 text-body text-text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text flex items-center gap-2">
            <Heart className="w-4 h-4 text-accent" />
            <span>1. Listen with Empathy, Speak with Respect</span>
          </h2>
          <p>
            The Listener exists to create a judgment-free sanctuary. Every person deserves to be treated with dignity, regardless of background, identity, or circumstance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>2. Maintain Personal Boundaries</span>
          </h2>
          <p>
            Do not request or disclose personal phone numbers, physical home addresses, financial credentials, or external social media profiles during conversations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger" />
            <span>3. Zero Tolerance for Harassment & Sexual Content</span>
          </h2>
          <p>
            Sexual harassment, inappropriate sexual advances, obscenity, threats, or hate speech are strictly prohibited. Violators are immediately banned permanently from the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-small font-semibold text-text">4. Confidentiality</h2>
          <p>
            What is shared in a conversation stays in that conversation. Do not record, screenshot, or share personal disclosures made by another person.
          </p>
        </section>
      </Card>
    </div>
  );
};
