import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import type { UserRole } from '../../types';
import { MessageSquareHeart, Headphones, ArrowRight } from 'lucide-react';

export const OnboardingRolePage: React.FC = () => {
  const { currentUser, profile, updateProfileData } = useAuth();
  const navigate = useNavigate();

  // If user already has a locked role, immediately redirect to their dashboard
  React.useEffect(() => {
    if (profile?.role) {
      navigate(profile.role === 'listener' ? '/listener/dashboard' : '/talker/dashboard', { replace: true });
    }
  }, [profile?.role, navigate]);

  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    return (localStorage.getItem('tl_selected_role') as UserRole) || profile?.role || 'listener';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const proceedWithRole = async (roleToUse: UserRole) => {
    try {
      setIsSubmitting(true);
      setSelectedRole(roleToUse);
      localStorage.setItem('tl_selected_role', roleToUse);

      // Persist to user profile in background without blocking route transition
      if (currentUser) {
        updateProfileData({ role: roleToUse }).catch((err) => {
          console.warn('Background profile role update notice:', err);
        });
      }

      const destination = roleToUse === 'talker' ? '/onboarding/talker' : '/onboarding/listener';
      navigate(destination);
    } catch (e) {
      console.error('Error during role selection navigation:', e);
      // Fallback navigation so user is never stuck
      navigate(roleToUse === 'talker' ? '/onboarding/talker' : '/onboarding/listener');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    proceedWithRole(selectedRole);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center space-y-8 animate-apple-fade-in">
      <div>
        <Badge variant="neutral" size="sm" className="mb-3">
          Welcome to The Listener
        </Badge>
        <h1 className="text-display font-semibold text-text tracking-tight">
          How would you like to use this platform?
        </h1>
        <p className="mt-2 text-body text-text-muted">
          Choose the role that best matches your primary goal today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {/* Option A: Talker */}
        <Card
          hover
          padding="lg"
          onClick={() => setSelectedRole('talker')}
          onDoubleClick={() => proceedWithRole('talker')}
          className={`cursor-pointer transition-all relative ${
            selectedRole === 'talker'
              ? 'border-accent bg-accent/5 ring-1 ring-accent shadow-soft'
              : 'border-border'
          }`}
        >
          <div className="w-11 h-11 rounded-card bg-surface border border-border text-accent flex items-center justify-center mb-4">
            <MessageSquareHeart className="w-6 h-6" />
          </div>

          <h3 className="text-body font-semibold text-text">
            I want someone to talk to
          </h3>
          <p className="mt-2 text-caption text-text-muted leading-relaxed">
            Role: <strong className="text-text">Talker</strong>
            <br />
            Share what's on your mind, unburden everyday stress, or chat freely with someone ready to listen without judgment.
          </p>

          <div className="mt-6 flex items-center justify-between text-caption font-semibold text-accent">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                proceedWithRole('talker');
              }}
              className="hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Find listeners instantly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div
              className={`w-5 h-5 rounded-pill border-2 flex items-center justify-center transition-all ${
                selectedRole === 'talker'
                  ? 'border-accent bg-accent text-accent-contrast'
                  : 'border-border'
              }`}
            >
              {selectedRole === 'talker' && <div className="w-2 h-2 rounded-pill bg-white" />}
            </div>
          </div>
        </Card>

        {/* Option B: Listener */}
        <Card
          hover
          padding="lg"
          onClick={() => setSelectedRole('listener')}
          onDoubleClick={() => proceedWithRole('listener')}
          className={`cursor-pointer transition-all relative ${
            selectedRole === 'listener'
              ? 'border-accent bg-accent/5 ring-1 ring-accent shadow-soft'
              : 'border-border'
          }`}
        >
          <div className="w-11 h-11 rounded-card bg-surface border border-border text-accent flex items-center justify-center mb-4">
            <Headphones className="w-6 h-6" />
          </div>

          <h3 className="text-body font-semibold text-text">
            I want to listen and earn
          </h3>
          <p className="mt-2 text-caption text-text-muted leading-relaxed">
            Role: <strong className="text-text">Listener</strong>
            <br />
            Provide supportive conversation sessions on your own schedule. Earn ₹2.50/min with direct bank UPI withdrawals.
          </p>

          <div className="mt-6 flex items-center justify-between text-caption font-semibold text-accent">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                proceedWithRole('listener');
              }}
              className="hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Get verified & start earning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div
              className={`w-5 h-5 rounded-pill border-2 flex items-center justify-center transition-all ${
                selectedRole === 'listener'
                  ? 'border-accent bg-accent text-accent-contrast'
                  : 'border-border'
              }`}
            >
              {selectedRole === 'listener' && <div className="w-2 h-2 rounded-pill bg-white" />}
            </div>
          </div>
        </Card>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          size="lg"
          variant="primary"
          onClick={handleContinue}
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="min-w-60 justify-center"
        >
          Continue as {selectedRole === 'listener' ? 'Listener' : 'Talker'}
        </Button>
      </div>
    </div>
  );
};
