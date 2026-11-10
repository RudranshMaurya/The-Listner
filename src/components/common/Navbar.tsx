import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { TopupModal } from '../talker/TopupModal';
import { formatPaise } from '../../lib/upi';
import { Button } from './Button';
import {
  Headphones,
  Sun,
  Moon,
  Search,
  User,
  LogOut,
  Calendar,
  Wallet,
  Menu,
  X,
  Bell,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, profile, role, isAdmin, wallet, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const dashboardPath = role === 'listener' ? '/listener/dashboard' : '/talker/dashboard';

  const navLinks = [
    { label: 'Home', path: currentUser ? dashboardPath : '/' },
    { label: 'How it works', path: '/how-it-works' },
    ...(!currentUser ? [{ label: 'Become a Listener', path: '/become-a-listener' }] : [])
  ];

  const firstName =
    (profile?.displayName || currentUser?.displayName || 'Friend')
      .trim()
      .split(' ')[0] || 'Friend';

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav border-b border-border/60 transition-apple">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand Logo / Greeting */}
            {currentUser ? (
              <div className="flex items-center gap-3 text-left">
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
                    className="w-8 h-8 rounded-full object-cover bg-surface border border-border/60"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success ring-2 ring-bg" />
                </Link>

                <Link
                  to={dashboardPath}
                  className="flex items-baseline gap-1.5 text-text hover:text-accent transition-apple"
                  title="Go to Dashboard"
                >
                  <span className="text-small font-semibold">
                    Hi {firstName}
                  </span>
                  <span className="text-caption text-text-muted hidden sm:inline">
                    • The Listener
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-2 group text-text">
                <div className="w-8 h-8 rounded-pill bg-accent text-accent-contrast flex items-center justify-center transition-apple group-hover:scale-105">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="text-body font-semibold tracking-tight">
                  The Listener
                </span>
              </Link>
            )}

            {/* Desktop Center Nav Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-small px-3.5 py-1.5 rounded-pill transition-apple ${
                      isActive
                        ? 'text-text font-semibold bg-surface'
                        : 'text-text-muted hover:text-text hover:bg-surface/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Talker Credits Pill */}
              {currentUser && role !== 'listener' && (
                <button
                  onClick={() => setIsTopupOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface border border-border/60 text-text hover:border-accent text-small font-semibold transition-apple cursor-pointer active:scale-95"
                  title="Credits Balance - Click to Add Credits"
                  aria-label={`Credits: ₹${formatPaise(wallet?.balancePaise || 0)}`}
                >
                  <span>₹{formatPaise(wallet?.balancePaise || 0)}</span>
                  <span className="w-4 h-4 rounded-full bg-accent text-accent-contrast flex items-center justify-center">
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </button>
              )}

              {/* Search Shortcut */}
              <Link
                to="/explore"
                className="p-2 rounded-pill text-text-muted hover:text-text hover:bg-surface transition-apple min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Search Listeners"
                aria-label="Search Listeners"
              >
                <Search className="w-4 h-4" />
              </Link>

              {/* Notification Bell */}
              {currentUser && (
                <Link
                  to={role === 'listener' ? '/listener/dashboard' : '/talker/notifications'}
                  className="relative p-2 rounded-pill text-text-muted hover:text-text hover:bg-surface transition-apple min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-bg" />
                  )}
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-pill text-text-muted hover:text-text hover:bg-surface transition-apple min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                title="Toggle Dark/Light Mode"
                aria-label="Toggle Dark or Light Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Dropdown Menu */}
              {currentUser ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="User account menu"
                    aria-expanded={dropdownOpen}
                    className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-accent transition-apple cursor-pointer"
                  >
                    <img
                      src={
                        currentUser.photoURL ||
                        profile?.photoURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`
                      }
                      alt={currentUser.displayName || "User"}
                      className="w-7 h-7 rounded-full object-cover bg-surface"
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                        aria-hidden="true"
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-card bg-surface-raised border border-border/60 shadow-soft py-2 z-20 text-left animate-apple-fade-in">
                        <div className="px-4 py-2 border-b border-border/40">
                          <p className="text-small font-semibold text-text truncate">
                            {currentUser.displayName || "User"}
                          </p>
                          <p className="text-caption text-text-muted truncate">
                            {currentUser.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            to={dashboardPath}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-small text-text hover:bg-surface transition-apple"
                          >
                            <User className="w-4 h-4 text-text-muted" />
                            Dashboard
                          </Link>

                          <Link
                            to={role === 'listener' ? '/listener/wallet' : '/talker/wallet'}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-small text-text hover:bg-surface transition-apple"
                          >
                            <Wallet className="w-4 h-4 text-text-muted" />
                            {role === 'listener' ? 'Payouts' : 'Credits'}
                          </Link>

                          <Link
                            to={role === 'listener' ? '/listener/appointments' : '/talker/appointments'}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-small text-text hover:bg-surface transition-apple"
                          >
                            <Calendar className="w-4 h-4 text-text-muted" />
                            Appointments
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-small text-accent font-medium hover:bg-surface transition-apple"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Admin Console
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-border/40 pt-1">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-small text-danger hover:bg-surface transition-apple cursor-pointer"
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
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    size="sm"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="primary"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Mobile Menu"
                className="p-1.5 rounded-pill text-text-muted hover:text-text hover:bg-surface md:hidden cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 glass-sheet px-4 pt-3 pb-6 space-y-3 animate-apple-fade-in text-left">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-pill text-small font-medium text-text hover:bg-surface transition-apple"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-border/40">
              {currentUser ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(dashboardPath);
                    }}
                    variant="primary"
                    className="w-full"
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
                      className="w-full"
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
                    className="w-full text-danger"
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
                    className="w-full"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Topup Modal */}
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
