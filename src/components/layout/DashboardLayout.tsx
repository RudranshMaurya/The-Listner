import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToWallet, subscribeToListener, setListenerStatus } from '../../lib/database';
import { formatPaise } from '../../lib/upi';
import type { Wallet, ListenerProfile, ListenerStatus } from '../../types';
import { Badge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Wallet as WalletIcon,
  Bell,
  Settings,
  Clock,
  TrendingUp,
  Star,
  PlusCircle,
  ArrowDownToLine,
  ShieldCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export interface DashboardLayoutProps {
  role: 'talker' | 'listener';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { currentUser, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [listenerProfile, setListenerProfile] = useState<ListenerProfile | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => setWallet(w));
    let unsubListener: (() => void) | undefined;

    if (role === 'listener') {
      unsubListener = subscribeToListener(currentUser.uid, (lp) => setListenerProfile(lp));
    }

    return () => {
      unsubWallet();
      if (unsubListener) unsubListener();
    };
  }, [currentUser, role]);

  const talkerNav = [
    { label: 'Overview', path: '/talker/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Find Listeners', path: '/talker/listeners', icon: <Users className="w-4 h-4" /> },
    { label: 'Appointments', path: '/talker/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Conversations', path: '/talker/conversations', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Wallet & Top-up', path: '/talker/wallet', icon: <WalletIcon className="w-4 h-4" /> },
    { label: 'Notifications', path: '/talker/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Settings', path: '/talker/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const listenerNav = [
    { label: 'Overview', path: '/listener/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Edit Profile', path: '/listener/profile', icon: <Users className="w-4 h-4" /> },
    { label: 'Availability Schedule', path: '/listener/schedule', icon: <Clock className="w-4 h-4" /> },
    { label: 'Appointments', path: '/listener/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Conversations', path: '/listener/conversations', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Earnings', path: '/listener/earnings', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Wallet & Payouts', path: '/listener/wallet', icon: <WalletIcon className="w-4 h-4" /> },
    { label: 'Reviews', path: '/listener/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Settings', path: '/listener/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const navItems = role === 'listener' ? listenerNav : talkerNav;

  const handleStatusToggle = async (newStatus: ListenerStatus) => {
    if (!currentUser || role !== 'listener') return;
    try {
      await setListenerStatus(currentUser.uid, newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Welcome & Financial Status Banner */}
      <div className="mb-6 rounded-3xl bg-white dark:bg-[#1F1D1A] border border-[#EFEBE4] dark:border-[#332E28] p-5 sm:p-6 shadow-sm shadow-[#D4A373]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left transition-colors">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={
                currentUser?.photoURL ||
                profile?.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid}`
              }
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#D4A373]/40 shadow-xs"
            />
            {role === 'listener' && listenerProfile?.isVerified && (
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#166534] text-white shadow-xs" title="Platform-verified Listener">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {currentUser?.displayName || 'Welcome back'}
              </h2>
              <Badge variant={role === 'listener' ? 'listening' : 'neutral'} size="sm">
                {role === 'listener' ? 'Listener' : 'Talker'}
              </Badge>
              {role === 'listener' && listenerProfile && (
                <StatusBadge status={listenerProfile.status} />
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {role === 'listener'
                ? 'Thank you for giving people a safe space to be heard.'
                : 'Share your thoughts freely. Friendly listeners are ready for you.'}
            </p>
          </div>
        </div>

        {/* Financial Quick Action Card */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EFEBE4] dark:border-[#332E28]">
          {role === 'talker' ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase font-semibold text-stone-400">Wallet Balance</p>
                <p className="text-lg font-bold text-stone-900 dark:text-white">
                  {formatPaise(wallet?.balancePaise || 0)}
                </p>
              </div>
              <Button
                onClick={() => navigate('/talker/wallet')}
                size="sm"
                variant="primary"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Add Money
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Listener Availability Toggle */}
              {listenerProfile && (
                <div className="hidden lg:flex items-center gap-1 bg-[#FAF6F0] dark:bg-[#272420] p-1 rounded-full text-xs border border-[#EFEBE4] dark:border-[#332E28]">
                  <button
                    onClick={() => handleStatusToggle('idle')}
                    className={`px-3 py-1 rounded-full font-medium transition-all ${
                      listenerProfile.status === 'idle'
                        ? 'bg-[#166534] text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => handleStatusToggle('busy')}
                    className={`px-3 py-1 rounded-full font-medium transition-all ${
                      listenerProfile.status === 'busy'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    Busy
                  </button>
                </div>
              )}

              <div className="text-right">
                <p className="text-[10px] uppercase font-semibold text-stone-400">Withdrawable</p>
                <p className="text-lg font-bold text-[#166534] dark:text-[#4ADE80]">
                  {formatPaise(wallet?.withdrawablePaise || 0)}
                </p>
              </div>
              <Button
                onClick={() => navigate('/listener/wallet')}
                size="sm"
                variant="secondary"
                leftIcon={<ArrowDownToLine className="w-3.5 h-3.5" />}
              >
                Payout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar + Child Route View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-[#1F1D1A] border border-[#EFEBE4] dark:border-[#332E28] p-3 shadow-sm shadow-[#D4A373]/5">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FAF6F0] dark:bg-[#272420] text-[#875C34] dark:text-[#E9D9C3] font-semibold border border-[#EFEBE4] dark:border-[#332E28] shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-[#FAF6F0]/60 dark:hover:bg-[#272420]/60 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#D4A373] dark:text-[#DEC6A5]' : 'text-stone-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4A373]" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick Help Box */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420]/70 border border-[#EFEBE4] dark:border-[#332E28] text-left">
            <h5 className="text-[11px] font-semibold text-[#875C34] dark:text-[#DEC6A5]">
              Need assistance?
            </h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
              Transparent rate: ₹5 per 2 minutes. All sessions are 100% private.
            </p>
          </div>
        </div>

        {/* Content Outlet */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
