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
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-nav border-t border-border/60 transition-apple px-2 py-1"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path.split('?')[0]);

          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-apple active:scale-95 ${
                isActive
                  ? 'text-accent font-semibold'
                  : 'text-text-muted hover:text-text font-normal'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 stroke-[2]" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 text-[10px] font-bold bg-danger text-white px-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-caption mt-1 tracking-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
