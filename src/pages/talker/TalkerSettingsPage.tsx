import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { TopupModal } from '../../components/talker/TopupModal';
import { formatPaise } from '../../lib/upi';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
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
  HelpCircle,
  PhoneCall,
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
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-5 text-left">
      {/* Top Header with Back Arrow (Astrotalk Style) */}
      <div className="flex items-center gap-3 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
          Profile & Settings
        </h1>
      </div>

      {/* Top 3 Quick Cards (Image 3: My Orders, Wallet, Support Chat) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Card 1: My Sessions */}
        <Link
          to="/talker/conversations"
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1F1D1A] border border-gray-200/90 dark:border-stone-800 shadow-2xs hover:shadow-xs transition-all text-center group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1">
            My Orders
          </span>
          <span className="text-[10px] text-stone-400">Past chats</span>
        </Link>

        {/* Card 2: Wallet */}
        <div
          onClick={() => setIsTopupOpen(true)}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1F1D1A] border border-gray-200/90 dark:border-stone-800 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">
            ₹{formatPaise(wallet?.balancePaise || 0)}
          </span>
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tight">
            + Recharge
          </span>
        </div>

        {/* Card 3: Support Chat */}
        <button
          onClick={() => setIsSupportModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1F1D1A] border border-gray-200/90 dark:border-stone-800 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Headphones className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1">
            Support Chat
          </span>
          <span className="text-[10px] text-stone-400">24x7 Help</span>
        </button>
      </div>

      {/* SECTION 1: EXPLORE */}
      <div className="space-y-1.5 pt-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2">
          EXPLORE
        </h3>
        <div className="rounded-2xl border border-gray-200/90 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] divide-y divide-gray-100 dark:divide-stone-800/80 shadow-2xs overflow-hidden">
          <Link
            to="/"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Home
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/explore"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Find Compassionate Listeners
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/talker/appointments"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Scheduled Appointments
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/become-a-listener"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Become a Listener (Earn ₹2.50/min)
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* SECTION 2: ACCOUNT */}
      <div className="space-y-1.5 pt-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2">
          ACCOUNT
        </h3>
        <div className="rounded-2xl border border-gray-200/90 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] divide-y divide-gray-100 dark:divide-stone-800/80 shadow-2xs overflow-hidden">
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <Headphones className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Customer Support Chat
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <Link
            to="/talker/wallet"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Credits & Recharge History
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/talker/conversations"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Order & Conversation History
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Edit Profile Details
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      </div>

      {/* SECTION 3: SAFETY & POLICIES */}
      <div className="space-y-1.5 pt-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2">
          SAFETY & POLICIES
        </h3>
        <div className="rounded-2xl border border-gray-200/90 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] divide-y divide-gray-100 dark:divide-stone-800/80 shadow-2xs overflow-hidden">
          <Link
            to="/community-guidelines"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Community Guidelines
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/terms"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Terms of Service
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/privacy"
            className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-stone-500" />
              <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                Privacy Policy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* SECTION 4: LOGOUT */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-white dark:bg-[#1F1D1A] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-2xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 font-semibold text-xs sm:text-sm">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-4 h-4" />
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
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

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-stone-800">
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
        <div className="space-y-4 text-left text-xs text-stone-600 dark:text-stone-300">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40">
            <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">
              Payment & Credits Inquiries:
            </p>
            <p>
              UPI auto-credit detects transactions via webhook. If you experience any delay, pending orders can be approved or managed inside your Credits section.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <p className="font-bold text-stone-900 dark:text-white mb-1">
              National Support Helplines:
            </p>
            <p>KIRAN Mental Health Toll-Free: <strong>1800-599-0019</strong></p>
            <p>Vandrevala Foundation: <strong>9999-666-555</strong></p>
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
