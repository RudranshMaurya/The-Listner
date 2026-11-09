import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { ToastContainer } from '../common/Toast';
import { useCommunication } from '../../contexts/CommunicationContext';
import { Headphones, ShieldAlert, PhoneCall, Check, X } from 'lucide-react';
import { Button } from '../common/Button';

export const AppLayout: React.FC = () => {
  const { incomingSession, acceptIncoming, rejectIncoming } = useCommunication();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Global Incoming Call Banner / Modal */}
      {incomingSession && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-3xl bg-indigo-900/95 text-white shadow-2xl border border-indigo-700/80 backdrop-blur-xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={incomingSession.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingSession.talkerId}`}
                alt={incomingSession.talkerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400"
              />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-semibold truncate">
                {incomingSession.talkerName}
              </h4>
              <p className="text-xs text-indigo-200">
                Incoming {incomingSession.type === 'audio' ? 'Audio Call' : 'Conversation'}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={acceptIncoming}
              variant="success"
              size="sm"
              className="flex-1 justify-center"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Accept
            </Button>
            <Button
              onClick={rejectIncoming}
              variant="danger"
              size="sm"
              className="flex-1 justify-center"
              leftIcon={<X className="w-4 h-4" />}
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Trust & Safety Emergency Banner */}
      <div className="bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80 py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Important Safety Notice:</span>
          </div>
          <p>
            The Listener is a supportive conversation platform, not a medical or psychiatric crisis service.
            If you or someone you know is in immediate crisis, please call national toll-free helplines (KIRAN: 1800-599-0019 or Vandrevala: 9999-666-555).
          </p>
        </div>
      </div>

      {/* Apple-style Clean Footer */}
      <footer className="bg-white dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 text-left transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                The Listener
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              "Sometimes, you don't need advice. You just need someone who listens."
              A premium, non-judgmental space for everyday human connection.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400">Find a Listener</Link></li>
              <li><Link to="/how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400">How It Works</Link></li>
              <li><Link to="/become-a-listener" className="hover:text-indigo-600 dark:hover:text-indigo-400">Become a Listener</Link></li>
              <li><Link to="/how-it-works#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400">Transparent Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Safety & Policies
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-indigo-600 dark:hover:text-indigo-400">Community Guidelines</Link></li>
              <li><Link to="/how-it-works#safety" className="hover:text-indigo-600 dark:hover:text-indigo-400">Listener Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              Official deployment in India with UPI payment integration.
            </p>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} The Listener Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};
