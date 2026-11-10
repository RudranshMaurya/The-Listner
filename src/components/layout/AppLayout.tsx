import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../common/Toast';
import { useCommunication } from '../../contexts/CommunicationContext';
import { Headphones, ShieldAlert, Check, X } from 'lucide-react';
import { Button } from '../common/Button';

export const AppLayout: React.FC = () => {
  const { incomingSession, acceptIncoming, rejectIncoming } = useCommunication();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors">
      <Navbar />

      {/* Global Incoming Call Banner / Modal */}
      {incomingSession && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-card-lg bg-surface/95 text-text shadow-soft-lg border border-border backdrop-blur-xl animate-apple-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={incomingSession.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingSession.talkerId}`}
                alt={incomingSession.talkerName}
                className="w-12 h-12 rounded-pill object-cover border border-border"
              />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-pill bg-success animate-ping" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-body font-semibold truncate text-text">
                {incomingSession.talkerName}
              </h4>
              <p className="text-caption text-text-muted">
                Incoming {incomingSession.type === 'audio' ? 'Audio Call' : 'Conversation'}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={acceptIncoming}
              variant="primary"
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
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Sticky Mobile Bottom Navigation */}
      <BottomNav />

      {/* Trust & Safety Emergency Banner */}
      <div className="bg-surface border-t border-border py-3 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-caption text-text-muted">
          <div className="flex items-center gap-1.5 font-medium text-text">
            <ShieldAlert className="w-4 h-4 text-warning shrink-0" />
            <span>Important Safety Notice:</span>
          </div>
          <p>
            The Listener is a supportive conversation platform, not a medical or psychiatric crisis service.
            If you or someone you know is in immediate crisis, please call national toll-free helplines (KIRAN: 1800-599-0019 or Vandrevala: 9999-666-555).
          </p>
        </div>
      </div>

      {/* Apple-style Clean Footer */}
      <footer className="bg-surface border-t border-border py-12 px-4 sm:px-6 lg:px-8 text-left transition-colors">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-card bg-text text-bg flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-body font-semibold text-text">
                The Listener
              </span>
            </div>
            <p className="text-caption text-text-muted leading-relaxed">
              "Sometimes, you don't need advice. You just need someone who listens."
              A calm, non-judgmental space for everyday human connection.
            </p>
          </div>

          <div>
            <h4 className="text-caption font-semibold uppercase tracking-wider text-text mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-caption text-text-muted">
              <li><Link to="/explore" className="hover:text-text transition-colors">Find a Listener</Link></li>
              <li><Link to="/how-it-works" className="hover:text-text transition-colors">How It Works</Link></li>
              <li><Link to="/become-a-listener" className="hover:text-text transition-colors">Become a Listener</Link></li>
              <li><Link to="/how-it-works#pricing" className="hover:text-text transition-colors">Transparent Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-caption font-semibold uppercase tracking-wider text-text mb-3">
              Safety & Policies
            </h4>
            <ul className="space-y-2 text-caption text-text-muted">
              <li><Link to="/terms" className="hover:text-text transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-text transition-colors">Community Guidelines</Link></li>
              <li><Link to="/how-it-works#safety" className="hover:text-text transition-colors">Listener Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-caption font-semibold uppercase tracking-wider text-text mb-3">
              Platform
            </h4>
            <p className="text-caption text-text-muted leading-relaxed mb-2">
              Official deployment with UPI payment integration.
            </p>
            <p className="text-caption text-text-muted">
              © {new Date().getFullYear()} The Listener Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};
