import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { TopupModal } from '../../components/talker/TopupModal';
import { formatPaise } from '../../lib/upi';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Wallet,
  Headphones,
  Home,
  Calendar,
  Sparkles,
  Award,
  History,
  User,
  ShieldCheck,
  FileText,
  Lock,
  LogOut,
  Save
} from 'lucide-react';

export const TalkerSettingsPage: React.FC = () => {
  const { profile, currentUser, wallet, updateProfileData, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Profile edit states
  const [displayName, setDisplayName] = useState(profile?.displayName || currentUser?.displayName || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '24');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage || 'English');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateProfileData({
        displayName: displayName.trim(),
        age: parseInt(age, 10) || 24,
        preferredLanguage,
        bio: bio.trim()
      });
      showToast('success', 'Profile updated successfully.');
      setIsEditProfileOpen(false);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-6 text-left">
      {/* Top Header with Back Arrow */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-pill hover:bg-surface text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title text-text tracking-tight">
          Profile & Settings
        </h1>
      </div>

      {/* Top 3 Quick Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: My Sessions */}
        <Link
          to="/talker/conversations"
          className="flex flex-col items-center justify-center p-3.5 rounded-card bg-surface hover:bg-surface-raised border border-border shadow-soft transition-all text-center group min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-pill bg-surface-raised border border-border/80 text-text flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-caption font-semibold text-text mt-1">
            My Orders
          </span>
          <span className="text-[11px] text-text-muted">Past chats</span>
        </Link>

        {/* Card 2: Wallet */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsTopupOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsTopupOpen(true); }}
          className="flex flex-col items-center justify-center p-3.5 rounded-card bg-surface hover:bg-surface-raised border border-border shadow-soft transition-all text-center cursor-pointer group min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-pill bg-surface-raised border border-border/80 text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-caption font-semibold text-text mt-1">
            ₹{formatPaise(wallet?.balancePaise || 0)}
          </span>
          <span className="text-[11px] text-accent font-medium">
            + Top Up
          </span>
        </div>

        {/* Card 3: Support Chat */}
        <button
          type="button"
          onClick={() => setIsSupportModalOpen(true)}
          className="flex flex-col items-center justify-center p-3.5 rounded-card bg-surface hover:bg-surface-raised border border-border shadow-soft transition-all text-center cursor-pointer group min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-pill bg-surface-raised border border-border/80 text-text-muted flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Headphones className="w-4 h-4" />
          </div>
          <span className="text-caption font-semibold text-text mt-1">
            Support Chat
          </span>
          <span className="text-[11px] text-text-muted">24x7 Help</span>
        </button>
      </div>

      {/* SECTION 1: EXPLORE */}
      <div className="space-y-2">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted px-2">
          Explore
        </h3>
        <Card padding="none" className="divide-y divide-border overflow-hidden">
          <Link
            to="/"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Home
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          <Link
            to="/explore"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Find Compassionate Listeners
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          <Link
            to="/talker/appointments"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Scheduled Appointments
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          <Link
            to="/become-a-listener"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Become a Listener (Earn ₹2.50/min)
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>
        </Card>
      </div>

      {/* SECTION 2: ACCOUNT */}
      <div className="space-y-2">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted px-2">
          Account
        </h3>
        <Card padding="none" className="divide-y divide-border overflow-hidden">
          <button
            type="button"
            onClick={() => setIsSupportModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <Headphones className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Customer Support Chat
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>

          <Link
            to="/talker/wallet"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Credits & Recharge History
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          <Link
            to="/talker/conversations"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Order & Conversation History
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Edit Profile Details
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        </Card>
      </div>

      {/* SECTION 3: SAFETY & POLICIES */}
      <div className="space-y-2">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted px-2">
          Safety & Policies
        </h3>
        <Card padding="none" className="divide-y divide-border overflow-hidden">
          <Link
            to="/community-guidelines"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Community Guidelines
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          <Link
            to="/terms"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Terms of Service
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          <Link
            to="/privacy"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-text-muted" />
              <span className="text-small text-text font-medium">
                Privacy Policy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>
        </Card>
      </div>

      {/* SECTION 4: LOGOUT */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-card border border-border bg-surface text-danger hover:bg-danger/10 shadow-soft transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 font-semibold text-small">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-70" />
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
        description="Update your display name and basic preferences."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age (18+)"
              type="number"
              min="18"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />

            <div>
              <label className="block text-caption font-medium text-text mb-1.5">
                Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full h-11 rounded-input border border-border bg-surface px-3 text-small text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Punjabi">Punjabi</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Bio (Optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Support Modal */}
      <Modal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        title="Customer Support"
        description="Need assistance with payments or conversation quality?"
      >
        <div className="space-y-4 text-left text-small text-text-muted">
          <div className="p-4 rounded-input bg-surface border border-border">
            <p className="font-semibold text-text mb-1">
              Payment & Credits Inquiries:
            </p>
            <p className="text-caption">
              UPI auto-credit detects transactions via webhook. If you experience any delay, pending orders can be approved or managed inside your Credits section.
            </p>
          </div>

          <div className="p-4 rounded-input bg-surface border border-border">
            <p className="font-semibold text-text mb-1">
              National Support Helplines:
            </p>
            <p className="text-caption">KIRAN Mental Health Toll-Free: <strong className="text-text">1800-599-0019</strong></p>
            <p className="text-caption">Vandrevala Foundation: <strong className="text-text">9999-666-555</strong></p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSupportModalOpen(false)}
            >
              Got It
            </Button>
          </div>
        </div>
      </Modal>

      <TopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        initialAmount={100}
      />
    </div>
  );
};
