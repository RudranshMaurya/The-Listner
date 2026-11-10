import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../../components/common/Button';
import { Headphones, ShieldCheck, Sparkles, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { currentUser, profile, role, loginWithGoogle } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // If already logged in, smoothly redirect
  useEffect(() => {
    if (currentUser) {
      if (role === 'listener') {
        navigate('/listener/dashboard', { replace: true });
      } else {
        navigate('/explore', { replace: true });
      }
    }
  }, [currentUser, role, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const userProfile = await loginWithGoogle();
      showToast('success', 'Signed in successfully!');
      if (!userProfile?.onboardingCompleted) {
        navigate('/onboarding');
      } else if (userProfile.role === 'listener') {
        navigate('/listener/dashboard');
      } else {
        navigate('/explore');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-md mx-auto w-full p-4 sm:p-6 text-center animate-apple-fade-in">
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-end w-full pt-2">
        <Link
          to="/explore"
          className="text-xs sm:text-sm font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Skip
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        {/* Brand Golden Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-[#F5C518] flex items-center justify-center shadow-lg shadow-amber-400/20 ring-4 ring-amber-300/40">
            <div className="w-20 h-20 rounded-full border-2 border-stone-900/20 flex items-center justify-center">
              <Headphones className="w-10 h-10 text-stone-950" />
            </div>
          </div>
        </div>

        {/* Brand Name & Subtitle */}
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          The Listener
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 font-medium">
          Login or Sign Up
        </p>

        {/* 1-Click Secure Google Sign-In */}
        <div className="w-full mt-8 space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#F5C518] hover:bg-[#E5B508] active:scale-[0.98] text-stone-950 font-extrabold text-sm uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Signing In...' : 'Continue with Google'}</span>
          </button>

          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#1E1C18] border border-gray-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant & Private Account Setup</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Sign in securely to browse listeners, start live encrypted conversations, or earn by becoming a listener.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Legal Disclaimer (Astrotalk Style) */}
      <div className="pb-4 pt-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
        By continuing you accept to share your profile information with{' '}
        <strong className="text-stone-700 dark:text-stone-300">The Listener</strong>, and agree to the{' '}
        <Link to="/privacy" className="underline font-medium hover:text-amber-500">
          privacy policy
        </Link>{' '}
        and{' '}
        <Link to="/terms" className="underline font-medium hover:text-amber-500">
          terms of service
        </Link>.
      </div>
    </div>
  );
};
