import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  CheckCircle2,
  PhoneCall,
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
    { label: 'User Directory', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Listener Verification', path: '/admin/verification', icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: 'Active Sessions', path: '/admin/sessions', icon: <Activity className="w-4 h-4" /> },
    { label: 'Payment Notifications', path: '/admin/payments', icon: <BellRing className="w-4 h-4" /> },
    { label: 'Top-up Orders', path: '/admin/topups', icon: <Wallet className="w-4 h-4" /> },
    { label: 'Withdrawal Payouts', path: '/admin/withdrawals', icon: <ArrowDownToLine className="w-4 h-4" /> },
    { label: 'Reviews & Moderation', path: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Platform Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
    { label: 'Security & Audit Logs', path: '/admin/audit-logs', icon: <FileText className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Security barrier: If not admin, block entry
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            This private administration console requires verified administrator privileges.
            Ordinary users and listeners cannot access or modify platform financial controls.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/')} variant="primary" className="w-full">
              Return to Safety
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Admin Header */}
      <div className="mb-6 rounded-3xl bg-slate-900 text-white p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">The Listener Admin Center</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Secure Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervisory command center for payments, reconciliations, listeners verification, and ledger controls.
          </p>
        </div>

        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="text-slate-300 border-slate-700 hover:bg-slate-800"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Exit to Website
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Admin Navigation */}
        <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-3 shadow-xs">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Content Area */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
