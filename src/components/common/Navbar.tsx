import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { TopupModal } from '../talker/TopupModal';
import { formatPaise } from '../../lib/upi';
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
  X,
  Search
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, profile, role, isAdmin, wallet, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
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
  const firstName =
    (profile?.displayName || currentUser?.displayName || 'Friend')
      .trim()
      .split(' ')[0] || 'Friend';

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#1A1815]/95 backdrop-blur-md border-b border-gray-200/90 dark:border-stone-800 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Avatar + Greeting or Logo */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 sm:gap-3 text-left">
                <Link
                  to={role === 'listener' ? '/listener/settings' : '/talker/settings'}
                  className="relative group shrink-0"
                  title="Profile & Settings"
                >
                  <img
                    src={
                      currentUser.photoURL ||
                      profile?.photoURL ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`
                    }
                    alt={firstName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 p-0.5 bg-white dark:bg-stone-900 group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
                </Link>

                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                    Hi {firstName}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium hidden sm:inline">
                    Speak freely. Be heard.
                  </span>
                </div>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4A373] to-[#C49160] flex items-center justify-center text-white shadow-md shadow-[#D4A373]/25 group-hover:scale-105 transition-transform duration-300">
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
            )}

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 bg-[#FAF6F0] dark:bg-[#272420] p-1 rounded-full border border-[#EFEBE4] dark:border-[#332E28]">
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

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Only show Wallet Pill when USER IS LOGGED IN and is Talker */}
              {currentUser && role !== 'listener' && (
                <button
                  onClick={() => setIsTopupOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-gray-900 dark:text-white hover:border-amber-400 dark:hover:border-amber-400 transition-all shadow-xs cursor-pointer active:scale-95 group"
                  title="Wallet Balance - Click to Recharge"
                >
                  <span className="text-sm">💼</span>
                  <span className="text-xs sm:text-sm font-bold tracking-tight">
                    ₹{formatPaise(wallet?.balancePaise || 0)}
                  </span>
                  <span className="w-4 h-4 rounded-full bg-amber-400 group-hover:bg-amber-500 text-stone-900 text-xs font-bold flex items-center justify-center leading-none">
                    +
                  </span>
                </button>
              )}

              {/* Search Shortcut */}
              <Link
                to="/explore"
                className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Search Listeners"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Notification Bell (Only when logged in) */}
              {currentUser && (
                <Link
                  to={role === 'listener' ? '/listener/dashboard' : '/talker/notifications'}
                  className="relative p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-stone-900" />
                  )}
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Toggle Dark/Light Mode"
              >
                {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Desktop Profile / Dashboard Menu OR Log In / Sign Up */}
              {currentUser ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer"
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
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* When NOT logged in: Direct Log In & Sign Up buttons (Clean on both Phone & Desktop) */
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2.5 sm:px-3.5"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="primary"
                    size="sm"
                    className="text-xs px-3 sm:px-4"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Hamburger for mobile extra links */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-stone-800 bg-white/98 dark:bg-[#1A1815]/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-apple-fade-in text-left">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-200 dark:border-stone-800">
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
                      navigate('/login');
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

      {/* Global Topup Modal (Only mounts when user is logged in) */}
      {currentUser && (
        <TopupModal
          isOpen={isTopupOpen}
          onClose={() => setIsTopupOpen(false)}
          initialAmount={100}
        />
      )}
    </>
  );
};
