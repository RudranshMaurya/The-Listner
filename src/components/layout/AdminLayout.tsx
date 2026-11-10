import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  CheckCircle2,
  BellRing,
  Wallet,
  ArrowDownToLine,
  Star,
  Settings,
  FileText,
  Lock,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { Button } from '../common/Button';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Verification', path: '/admin/verification', icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: 'Sessions', path: '/admin/sessions', icon: <Activity className="w-4 h-4" /> },
    { label: 'Payments', path: '/admin/payments', icon: <BellRing className="w-4 h-4" /> },
    { label: 'Top-ups', path: '/admin/topups', icon: <Wallet className="w-4 h-4" /> },
    { label: 'Withdrawals', path: '/admin/withdrawals', icon: <ArrowDownToLine className="w-4 h-4" /> },
    { label: 'Reviews', path: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <FileText className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Security barrier: If not admin, block entry
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-card-lg bg-surface-raised border border-border/60 text-center shadow-soft">
          <div className="w-12 h-12 rounded-pill bg-surface text-danger flex items-center justify-center mx-auto mb-4 border border-border/50">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-heading font-semibold text-text">
            Access Restricted
          </h2>
          <p className="text-small text-text-muted mt-2 leading-relaxed">
            This administration console requires verified administrator privileges.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/')} variant="primary" className="w-full">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 py-6 text-left transition-apple">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-accent" />
            <h1 className="text-title font-semibold tracking-tight text-text">Admin Console</h1>
            <span className="text-caption font-semibold px-2 py-0.5 rounded-pill bg-surface text-text-muted border border-border/40">
              Admin
            </span>
          </div>
          <p className="text-small text-text-muted mt-0.5">
            Platform control center for verification, payouts, reconciliation, and audit logs.
          </p>
        </div>

        <Button
          onClick={() => navigate('/')}
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Exit Admin
        </Button>
      </div>

      {/* Slim Desktop Horizontal Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border/40 mb-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-small transition-apple whitespace-nowrap ${
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

      {/* Admin Content Area */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};
