import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from './Button';
import {
  Headphones,
  Moon,
  Sun,
  Bell,
  User,
  LogOut,
  Wallet,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, profile, role, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How it works', path: '/how-it-works' },
    { label: 'Explore Listeners', path: '/explore' },
    { label: 'Become a Listener', path: '/become-a-listener' }
  ];

  const dashboardPath = role === 'listener' ? '/listener/dashboard' : '/talker/dashboard';

  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-b border-[#EFEBE4] dark:border-[#332E28] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4A373] to-[#C49160] flex items-center justify-center text-white shadow-md shadow-[#D4A373]/25 group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                The Listener
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium tracking-wide">
                Speak freely. Be heard.
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-[#FAF6F0] dark:bg-[#272420] p-1 rounded-full border border-[#EFEBE4] dark:border-[#332E28]">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-[#161412] text-[#875C34] dark:text-[#E9D9C3] shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-[#FAF6F0] dark:hover:bg-[#272420] transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <Link
                  to={role === 'listener' ? '/listener/dashboard' : '/talker/notifications'}
                  className="relative p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-[#FAF6F0] dark:hover:bg-[#272420] transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#161412]" />
                  )}
                </Link>

                {/* Dashboard Shortcut Button */}
                <Button
                  onClick={() => navigate(dashboardPath)}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#D4A373] dark:text-[#DEC6A5]" />}
                >
                  Dashboard
                </Button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#D4A373]/40 transition-all"
                  >
                    <img
                      src={
                        currentUser.photoURL ||
                        profile?.photoURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`
                      }
                      alt={currentUser.displayName || "User"}
                      className="w-8 h-8 rounded-full object-cover border border-[#EFEBE4] dark:border-[#332E28]"
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#1F1D1A] border border-[#EFEBE4] dark:border-[#332E28] shadow-xl py-2 z-20 text-left animate-apple-fade-in">
                        <div className="px-4 py-2 border-b border-[#EFEBE4] dark:border-[#332E28]">
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {currentUser.displayName || "User"}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                            {currentUser.email}
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#875C34] dark:bg-[#272420] dark:text-[#DEC6A5] border border-[#EFEBE4] dark:border-[#332E28]">
                            Role: {role || 'User'}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to={dashboardPath}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-[#FAF6F0] dark:hover:bg-[#272420] transition-colors"
                          >
                            <User className="w-4 h-4 text-stone-400" />
                            My Dashboard
                          </Link>

                          <Link
                            to={role === 'listener' ? '/listener/wallet' : '/talker/wallet'}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-[#FAF6F0] dark:hover:bg-[#272420] transition-colors"
                          >
                            <Wallet className="w-4 h-4 text-stone-400" />
                            {role === 'listener' ? 'Earnings & Payouts' : 'Wallet & Top-up'}
                          </Link>

                          <Link
                            to={role === 'listener' ? '/listener/appointments' : '/talker/appointments'}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-[#FAF6F0] dark:hover:bg-[#272420] transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-stone-400" />
                            Appointments
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#0891B2] dark:text-[#38BDF8] font-medium hover:bg-[#ECFEFF] dark:hover:bg-[#0891B2]/10 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-[#0891B2] dark:text-[#38BDF8]" />
                              Private Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-[#EFEBE4] dark:border-[#332E28] pt-1">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  size="sm"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  variant="primary"
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EFEBE4] dark:border-[#332E28] bg-white/95 dark:bg-[#1F1D1A]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-apple-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-[#FAF6F0] dark:hover:bg-[#272420] transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-[#EFEBE4] dark:border-[#332E28]">
            {currentUser ? (
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(dashboardPath);
                  }}
                  variant="primary"
                  className="w-full justify-center"
                >
                  Go to Dashboard
                </Button>
                {isAdmin && (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/admin');
                    }}
                    variant="outline"
                    className="w-full justify-center text-[#0891B2]"
                  >
                    Admin Panel
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  variant="ghost"
                  className="w-full justify-center text-rose-600"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  variant="outline"
                  className="w-full justify-center"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/signup');
                  }}
                  variant="primary"
                  className="w-full justify-center"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
