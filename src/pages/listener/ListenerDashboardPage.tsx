import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToListener,
  subscribeToWallet,
  subscribeToAppointments,
  subscribeToUserSessions,
  subscribeToReviews,
  setListenerStatus
} from '../../lib/database';
import type { ListenerProfile, Wallet, Appointment, Session, Review, ListenerStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { StarRating } from '../../components/common/StarRating';
import { WithdrawalModal } from '../../components/listener/WithdrawalModal';
import { formatPaise } from '../../lib/upi';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  MessageSquare,
  ArrowDownToLine,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const ListenerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [listener, setListener] = useState<ListenerProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const unsubListener = subscribeToListener(currentUser.uid, (l) => setListener(l));
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => setWallet(w));
    const unsubAppts = subscribeToAppointments(currentUser.uid, 'listener', (a) => setAppointments(a));
    const unsubSessions = subscribeToUserSessions(currentUser.uid, 'listener', (s) => setSessions(s));
    const unsubReviews = subscribeToReviews(currentUser.uid, (r) => setReviews(r));

    return () => {
      unsubListener();
      unsubWallet();
      unsubAppts();
      unsubSessions();
      unsubReviews();
    };
  }, [currentUser]);

  const handleStatusChange = async (status: ListenerStatus) => {
    if (!currentUser) return;
    try {
      await setListenerStatus(currentUser.uid, status);
    } catch (e) {
      console.error(e);
    }
  };

  const todayAppointments = appointments.filter((a) => a.status === 'confirmed');

  return (
    <div className="space-y-6 text-left">
      {/* Verification Status Banner if Unverified */}
      {listener && !listener.isVerified && (
        <Card className="p-5 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Listener Qualification Assessment Pending
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/70">
                Complete the 5-question active listening test to earn your green "Platform-verified listener" badge and receive paid conversations.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/onboarding/listener-verification')}
            className="shrink-0"
          >
            Take Test Now
          </Button>
        </Card>
      )}

      {/* Verification Success Pill if Verified */}
      {listener?.isVerified && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 text-xs text-teal-800 dark:text-teal-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">Platform-Verified Listener Status Active</span>
          </div>
          <span>Verification Score: {listener.verificationScore || 100}%</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-slate-400">Star Rating</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {(listener?.rating || 5.0).toFixed(1)}
            </span>
            <span className="text-xs text-amber-500">★</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{listener?.totalReviews || 0} reviews</p>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-slate-400">Conversations</p>
          <div className="mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {listener?.totalSessions || 0}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Completed sessions</p>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-slate-400">Listening Time</p>
          <div className="mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {listener?.totalListeningMinutes || 0}
            </span>
            <span className="text-xs text-slate-500 ml-1">mins</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Active conversation</p>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-slate-400">Total Earned</p>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPaise(wallet?.totalEarnedPaise || 0)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Rate: ₹2.50 / min</p>
        </Card>
      </div>

      {/* Main Grid: Status Control + Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Control Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Real-Time Availability
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Current Status</p>
              <p className="text-[11px] text-slate-500">Live in Talker directory</p>
            </div>
            <StatusBadge status={listener?.status || 'idle'} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleStatusChange('idle')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                listener?.status === 'idle'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available (Online)</span>
            </button>

            <button
              onClick={() => handleStatusChange('busy')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                listener?.status === 'busy'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Busy / Offline</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
            When you enter an active conversation, your status automatically switches to "In Conversation".
          </p>
        </Card>

        {/* Today's Appointments */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Appointments</span>
            </h3>
            <Link to="/listener/appointments" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              View Calendar
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No appointments scheduled. Talkers can book available slots from your schedule.
            </p>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.slice(0, 3).map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={appt.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.talkerId}`}
                      alt={appt.talkerName}
                      className="w-10 h-10 rounded-2xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {appt.talkerName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {appt.date} • {appt.timeSlot} • {appt.sessionType}
                      </p>
                    </div>
                  </div>

                  <Badge variant="success" size="sm">Confirmed</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        wallet={wallet}
      />
    </div>
  );
};
