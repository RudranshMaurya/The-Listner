import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Headphones, Lock, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { currentUser, role, loginWithGoogle } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('Female');

  // If already logged in, smoothly redirect
  useEffect(() => {
    if (currentUser) {
      if (role === 'listener') {
        navigate('/listener/dashboard', { replace: true });
      } else {
        navigate('/talker/dashboard', { replace: true });
      }
    }
  }, [currentUser, role, navigate]);

  const handleGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const userProfile = await loginWithGoogle({
        displayName: displayName.trim(),
        gender
      });
      showToast('success', 'Signed in successfully!');
      if (userProfile.role === 'listener') {
        navigate('/listener/dashboard');
      } else {
        navigate('/talker/dashboard');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-sm mx-auto w-full p-4 sm:p-6 text-center animate-apple-fade-in">
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-end w-full pt-2">
        <Link
          to="/"
          className="text-caption font-semibold text-text-muted hover:text-text px-3 py-1.5 rounded-pill hover:bg-surface transition-colors"
        >
          Skip
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {/* Brand Emblem */}
        <div className="w-16 h-16 rounded-card bg-surface border border-border flex items-center justify-center mb-4 shadow-soft">
          <Headphones className="w-8 h-8 text-accent" />
        </div>

        {/* Brand Name & Subtitle */}
        <h1 className="text-title font-semibold text-text tracking-tight">
          The Listener
        </h1>
        <p className="mt-1 text-small text-text-muted">
          Talk freely. Connect with someone ready to listen.
        </p>

        {/* Talker Setup: Name & Gender */}
        <Card variant="raised" padding="md" className="w-full mt-6 space-y-4 text-left border-border">
          <form onSubmit={handleGoogleLogin} className="space-y-3.5">
            <div>
              <label className="block text-caption font-medium text-text mb-1.5">
                Your Name or Nickname
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Saanvi / Alex (or use Google Name)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-11 rounded-input border border-border bg-surface pl-10 pr-4 text-small text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-caption font-medium text-text mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 rounded-input border border-border bg-surface px-3 text-small text-text focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* 1-Click Secure Google Sign-In */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-pill bg-accent text-accent-contrast font-semibold text-small shadow-soft hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>
            </div>
          </form>
        </Card>

        <div className="w-full mt-4 p-3 rounded-card bg-surface border border-border text-caption text-text-muted space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-medium text-text">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span>Instant & Private Account Setup</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Name and gender help your listener address you respectfully. No phone number or clinical questions asked.
          </p>
        </div>
      </div>

      {/* Bottom Legal Disclaimer */}
      <div className="pb-3 pt-2 text-caption text-text-muted">
        By continuing you agree to The Listener's{' '}
        <Link to="/privacy" className="underline font-medium hover:text-text">
          privacy policy
        </Link>{' '}
        and{' '}
        <Link to="/terms" className="underline font-medium hover:text-text">
          terms of service
        </Link>.
      </div>
    </div>
  );
};
