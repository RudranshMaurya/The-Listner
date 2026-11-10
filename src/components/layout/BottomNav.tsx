import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageSquare, PhoneCall, User, Wallet, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const { currentUser, role } = useAuth();
  const location = useLocation();

  // If in active session room, don't show bottom navigation so screen has 100% focus
  if (location.pathname.startsWith('/session/')) {
    return null;
  }

  const isListener = role === 'listener';

  interface NavItem {
    label: string;
    path: string;
    icon: typeof Home;
    exact?: boolean;
    badge?: string | number;
  }

  const navItems: NavItem[] = isListener
    ? [
        {
          label: 'Home',
          path: '/listener/dashboard',
          icon: Home,
          exact: true
        },
        {
          label: 'Analytics',
          path: '/listener/analytics',
          icon: BarChart3
        },
        {
          label: 'Earnings',
          path: '/listener/wallet',
          icon: Wallet
        },
        {
          label: 'Profile',
          path: '/listener/settings',
          icon: User
        }
      ]
    : [
        {
          label: 'Home',
          path: currentUser ? '/talker/dashboard' : '/',
          icon: Home,
          exact: true
        },
        {
          label: 'Chat',
          path: currentUser ? '/talker/conversations' : '/explore?type=chat',
          icon: MessageSquare
        },
        {
          label: 'Call',
          path: '/explore?type=call',
          icon: PhoneCall
        },
        {
          label: currentUser ? 'Profile' : 'Login',
          path: currentUser ? '/talker/settings' : '/login',
          icon: User
        }
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#1E1C18]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-stone-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path.split('?')[0]);

          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-3 text-[8px] font-extrabold bg-rose-500 text-white px-1 py-0.2 rounded-full ring-1 ring-white dark:ring-stone-900 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
