import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import type { UserRole } from '../../types';
import { MessageSquareHeart, Headphones, ArrowRight, CheckCircle2 } from 'lucide-react';

export const OnboardingRolePage: React.FC = () => {
  const { currentUser, profile, updateProfileData } = useAuth();
  const navigate = useNavigate();
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center space-y-8">
      <div>
        <Badge variant="listening" size="md" className="mb-3">
          Welcome to The Listener
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How would you like to use this platform?
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Choose the role that best matches your primary goal today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
        {/* Option A: Talker */}
        <Card
          hover
          onClick={() => setSelectedRole('talker')}
          onDoubleClick={() => proceedWithRole('talker')}
          className={`p-6 sm:p-8 cursor-pointer transition-all relative ${
            selectedRole === 'talker'
              ? 'border-2 border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-md'
              : 'border border-slate-200 dark:border-slate-800 hover:border-indigo-300'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <MessageSquareHeart className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            I want someone to talk to
          </h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Role: <strong>Talker</strong>
            <br />
            Share what's on your mind, unburden everyday stress, or chat freely with someone ready to listen without judgment.
          </p>

          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
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
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedRole === 'talker'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {selectedRole === 'talker' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
        </Card>

        {/* Option B: Listener */}
        <Card
          hover
          onClick={() => setSelectedRole('listener')}
          onDoubleClick={() => proceedWithRole('listener')}
          className={`p-6 sm:p-8 cursor-pointer transition-all relative ${
            selectedRole === 'listener'
              ? 'border-2 border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-md'
              : 'border border-slate-200 dark:border-slate-800 hover:border-teal-300'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
            <Headphones className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            I want to listen and earn
          </h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Role: <strong>Listener</strong>
            <br />
            Provide supportive conversation sessions on your own schedule. Earn ₹2.50/min with direct bank UPI withdrawals.
          </p>

          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
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
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedRole === 'listener'
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {selectedRole === 'listener' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
        </Card>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          size="lg"
          variant="primary"
          onClick={handleContinue}
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="min-w-60 justify-center shadow-lg shadow-indigo-600/15 cursor-pointer font-semibold"
        >
          Continue as {selectedRole === 'listener' ? 'Listener' : 'Talker'}
        </Button>
      </div>
    </div>
  );
};
