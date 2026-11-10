import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToListener, setListenerStatus } from '../../lib/database';
import type { ListenerProfile, ListenerStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Wallet as WalletIcon,
  Bell,
  Settings,
  Clock,
  Star,
  BarChart3
} from 'lucide-react';

export interface DashboardLayoutProps {
  role: 'talker' | 'listener';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [listenerProfile, setListenerProfile] = useState<ListenerProfile | null>(null);

  useEffect(() => {
    if (!currentUser || role !== 'listener') return;
    const unsub = subscribeToListener(currentUser.uid, (lp) => setListenerProfile(lp));
    return () => unsub();
  }, [currentUser, role]);

  const talkerNav = [
    { label: 'Overview', path: '/talker/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Find Listeners', path: '/talker/listeners', icon: <Users className="w-4 h-4" /> },
    { label: 'Appointments', path: '/talker/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Conversations', path: '/talker/conversations', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Credits', path: '/talker/wallet', icon: <WalletIcon className="w-4 h-4" /> },
    { label: 'Notifications', path: '/talker/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Settings', path: '/talker/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const listenerNav = [
    { label: 'Overview', path: '/listener/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Analytics', path: '/listener/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Profile', path: '/listener/profile', icon: <Users className="w-4 h-4" /> },
    { label: 'Schedule', path: '/listener/schedule', icon: <Clock className="w-4 h-4" /> },
    { label: 'Appointments', path: '/listener/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Payouts', path: '/listener/wallet', icon: <WalletIcon className="w-4 h-4" /> },
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
    <div className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 text-left transition-apple">
      {/* Top Header Row: Title + Status controls (No duplicate balance) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-title font-semibold tracking-tight text-text">
            {role === 'listener' ? 'Listener Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-small text-text-muted mt-0.5">
            {role === 'listener'
              ? 'Manage your availability, profile visitors, and payouts.'
              : 'Connect with compassionate listeners whenever you want to talk.'}
          </p>
        </div>

        {/* Listener Availability Status Toggle */}
        {role === 'listener' && listenerProfile && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <StatusBadge status={listenerProfile.status} />
            <div className="flex items-center bg-surface p-1 rounded-pill border border-border/50 text-caption font-medium">
              <button
                onClick={() => handleStatusToggle('idle')}
                className={`px-3 py-1 rounded-pill transition-apple cursor-pointer ${
                  listenerProfile.status === 'idle'
                    ? 'bg-surface-raised text-text shadow-soft font-semibold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => handleStatusToggle('busy')}
                className={`px-3 py-1 rounded-pill transition-apple cursor-pointer ${
                  listenerProfile.status === 'busy'
                    ? 'bg-surface-raised text-text shadow-soft font-semibold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Busy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slim Desktop Horizontal Subnav (Replaces heavy sidebar, preserves all destinations) */}
      <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border/40 mb-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-small transition-apple ${
                isActive
                  ? 'bg-surface font-semibold text-text shadow-soft'
                  : 'text-text-muted hover:text-text hover:bg-surface/50 font-normal'
              }`}
            >
              <span className={isActive ? 'text-accent' : 'text-text-muted'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};
