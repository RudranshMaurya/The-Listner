import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { requestSession } from '../../lib/database';
import { TopupModal } from './TopupModal';
import type { ListenerProfile, SessionType } from '../../types';
import { CheckCircle2, MessageSquare, PhoneCall, Loader2 } from 'lucide-react';

export interface ListenerCardProps {
  listener: ListenerProfile;
  onStartSession?: (listener: ListenerProfile, type: SessionType) => void;
  preferredAction?: 'chat' | 'call' | 'both';
}

export const ListenerCard: React.FC<ListenerCardProps> = ({
  listener,
  onStartSession,
  preferredAction = 'both'
}) => {
  const navigate = useNavigate();
  const { currentUser, profile, wallet } = useAuth();
  const { showToast } = useNotifications();

  const [isStarting, setIsStarting] = useState<SessionType | null>(null);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  const handleAction = async (e: React.MouseEvent, type: SessionType) => {
    e.stopPropagation();

    if (onStartSession) {
      onStartSession(listener, type);
      return;
    }

    if (!currentUser) {
      showToast('info', 'Please sign in to start chatting with verified listeners.');
      navigate('/login');
      return;
    }

    // Require at least ₹2.50 (250 paise) to connect
    const currentBalance = wallet?.balancePaise || 0;
    if (currentBalance < 250) {
      showToast('warning', `Low credits balance (₹${(currentBalance / 100).toFixed(2)}). Please add credits to connect.`);
      setIsTopupOpen(true);
      return;
    }

    if (listener.status === 'offline') {
      showToast('info', `${listener.displayName} is currently offline. You can book a scheduled slot or choose an online listener.`);
      return;
    }

    try {
      setIsStarting(type);
      const sessionId = await requestSession({
        talkerId: currentUser.uid,
        talkerName: profile?.displayName || currentUser.displayName || 'Talker',
        talkerPhoto: profile?.photoURL || currentUser.photoURL || '',
        listenerId: listener.uid,
        listenerName: listener.displayName,
        listenerPhoto: listener.photoURL || '',
        type: type === 'audio' ? 'audio' : 'chat'
      });

      navigate(`/session/${sessionId}`);
    } catch (err: any) {
      showToast('error', err.message || 'Could not initiate conversation.');
    } finally {
      setIsStarting(null);
    }
  };

  const isOffline = listener.status === 'offline';
  const ratingValue = (listener.rating || 5.0).toFixed(1);
  const sessionCount = listener.totalSessions || 0;

  return (
    <>
      <div
        onClick={() => navigate(`/talker/listener/${listener.uid}`)}
        className="rounded-card bg-surface border border-border/40 p-4 sm:p-5 shadow-soft transition-apple hover:-translate-y-0.5 hover:border-border cursor-pointer text-left"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Avatar with status dot */}
          <div className="relative shrink-0">
            <img
              src={
                listener.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.uid}`
              }
              alt={listener.displayName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover bg-surface-raised"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${
                listener.status === 'idle'
                  ? 'bg-success'
                  : listener.status === 'busy' || listener.status === 'listening'
                  ? 'bg-warning'
                  : 'bg-text-muted'
              }`}
              title={
                listener.status === 'idle'
                  ? 'Available'
                  : listener.status === 'busy' || listener.status === 'listening'
                  ? 'In Session'
                  : 'Offline'
              }
            />
          </div>

          {/* Center Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-body font-semibold text-text truncate">
                {listener.displayName}
              </h3>
              {listener.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              )}
            </div>

            <p className="text-small text-text-muted truncate mt-0.5">
              {listener.topics && listener.topics.length > 0
                ? listener.topics.slice(0, 2).join(', ')
                : 'Empathetic Listening'}
              {' • '}
              {listener.languages && listener.languages.length > 0
                ? listener.languages.slice(0, 2).join(', ')
                : 'English, Hindi'}
            </p>

            <div className="flex items-center gap-2 mt-1 text-caption text-text-muted">
              <span>★ {ratingValue}</span>
              <span>•</span>
              <span>{sessionCount} sessions</span>
              <span>•</span>
              <span className="font-semibold text-text">₹2.50/min</span>
            </div>
          </div>

          {/* Action Button: One primary action with 44px min touch target */}
          <div className="shrink-0">
            {preferredAction === 'call' ? (
              <button
                disabled={isStarting !== null || isOffline}
                onClick={(e) => handleAction(e, 'audio')}
                className={`min-h-[44px] px-5 rounded-pill font-medium text-small transition-apple flex items-center justify-center gap-1.5 ${
                  isOffline
                    ? 'bg-surface-raised text-text-muted opacity-50 cursor-not-allowed'
                    : 'bg-accent text-accent-contrast hover:bg-accent-hover shadow-soft active:scale-[0.98] cursor-pointer'
                }`}
              >
                {isStarting === 'audio' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PhoneCall className="w-4 h-4" />
                )}
                <span>{isOffline ? 'Offline' : 'Call'}</span>
              </button>
            ) : (
              <button
                disabled={isStarting !== null || isOffline}
                onClick={(e) => handleAction(e, 'chat')}
                className={`min-h-[44px] px-5 rounded-pill font-medium text-small transition-apple flex items-center justify-center gap-1.5 ${
                  isOffline
                    ? 'bg-surface-raised text-text-muted opacity-50 cursor-not-allowed'
                    : 'bg-accent text-accent-contrast hover:bg-accent-hover shadow-soft active:scale-[0.98] cursor-pointer'
                }`}
              >
                {isStarting === 'chat' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                <span>{isOffline ? 'Offline' : 'Chat'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <TopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        initialAmount={50}
      />
    </>
  );
};
