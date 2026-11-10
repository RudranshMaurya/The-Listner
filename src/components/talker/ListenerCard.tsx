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
      showToast('warning', `Low wallet balance (₹${(currentBalance / 100).toFixed(2)}). Please recharge to connect.`);
      setIsTopupOpen(true);
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

  const formattedOrders =
    (listener.totalSessions || 120) >= 1000
      ? `${((listener.totalSessions || 120) / 1000).toFixed(1)}k+ orders`
      : `${listener.totalSessions || 120}+ orders`;

  return (
    <>
      <div
        onClick={() => navigate(`/talker/listener/${listener.uid}`)}
        className="rounded-2xl border border-gray-200/90 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer text-left group"
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Avatar with golden ring & green verified badge */}
          <div className="relative shrink-0">
            <img
              src={
                listener.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.uid}`
              }
              alt={listener.displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-amber-400 p-0.5 bg-white dark:bg-stone-900 group-hover:scale-105 transition-transform"
            />
            {listener.isVerified && (
              <span
                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs"
                title="Platform-verified Listener"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </span>
            )}
            {/* Status Indicator Dot */}
            <span
              className={`absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-stone-900 ${
                listener.status === 'idle' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={listener.status === 'idle' ? 'Online' : 'Busy'}
            />
          </div>

          {/* Center: Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                {listener.displayName}
              </h3>
              {listener.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-stone-400 truncate mt-0.5">
              {listener.topics && listener.topics.length > 0
                ? listener.topics.slice(0, 3).join(', ')
                : 'Empathetic Listening, Stress, Advice'}
            </p>

            <p className="text-xs text-gray-500 dark:text-stone-400 truncate">
              {listener.languages && listener.languages.length > 0
                ? listener.languages.join(', ')
                : 'Hindi, English'}
            </p>

            <p className="text-xs text-gray-500 dark:text-stone-400">
              Exp- {listener.yearsExperience || 3} Years
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs">
              <div className="flex items-center text-amber-500 tracking-tighter">
                {'★'.repeat(Math.min(5, Math.max(1, Math.round(listener.rating || 5))))}
              </div>
              <span className="text-gray-300 dark:text-stone-700">•</span>
              <span className="text-gray-500 dark:text-stone-400 font-medium text-[11px]">
                {formattedOrders}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs line-through text-gray-400">₹27</span>
              <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
                ₹2.50<span className="text-xs font-normal text-gray-500">/min</span>
              </span>
            </div>
          </div>

          {/* Right: Action Buttons (Styled cleanly like Astrotalk) */}
          <div className="flex flex-col gap-2 shrink-0">
            {(preferredAction === 'chat' || preferredAction === 'both') && (
              <button
                disabled={isStarting !== null}
                onClick={(e) => handleAction(e, 'chat')}
                className="px-4 sm:px-6 py-2 rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-[#1F1D1A]"
              >
                {isStarting === 'chat' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                )}
                <span>Chat</span>
              </button>
            )}

            {(preferredAction === 'call' || preferredAction === 'both') && (
              <button
                disabled={isStarting !== null}
                onClick={(e) => handleAction(e, 'audio')}
                className="px-4 sm:px-6 py-2 rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-[#1F1D1A]"
              >
                {isStarting === 'audio' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                )}
                <span>Call</span>
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
