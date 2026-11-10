import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToListener,
  subscribeToWallet,
  subscribeToAppointments,
  subscribeToUserSessions,
  subscribeToReviews,
  subscribeToListenerAnalytics,
  setListenerStatus
} from '../../lib/database';
import type { ListenerProfile, Wallet, Appointment, Session, Review, ListenerStatus, ListenerAnalytics } from '../../types';
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
  UserCheck,
  Eye,
  Users
} from 'lucide-react';

export const ListenerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [listener, setListener] = useState<ListenerProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<ListenerAnalytics | null>(null);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const unsubListener = subscribeToListener(currentUser.uid, (l) => setListener(l));
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => setWallet(w));
    const unsubAppts = subscribeToAppointments(currentUser.uid, 'listener', (a) => setAppointments(a));
    const unsubSessions = subscribeToUserSessions(currentUser.uid, 'listener', (s) => setSessions(s));
    const unsubReviews = subscribeToReviews(currentUser.uid, (r) => setReviews(r));
    const unsubAnalytics = subscribeToListenerAnalytics(currentUser.uid, (data) => setAnalytics(data));

    return () => {
      unsubListener();
      unsubWallet();
      unsubAppts();
      unsubSessions();
      unsubReviews();
      unsubAnalytics();
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
        <Card className="p-5 bg-[#FAF6F0] dark:bg-[#272420] border border-[#DEC6A5] dark:border-[#332E28] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4A373]/20 text-[#875C34] dark:text-[#DEC6A5] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Listener Qualification Assessment Pending
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300">
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
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#DCFCE7]/70 dark:bg-[#166534]/25 border border-[#166534]/40 text-xs text-[#166534] dark:text-[#4ADE80]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#166534] dark:text-[#4ADE80]" />
            <span className="font-semibold">Platform-Verified Listener Status Active</span>
          </div>
          <span>Verification Score: {listener.verificationScore || 100}%</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card hover className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-stone-400">Profile Visitors</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-stone-900 dark:text-white font-mono">
              {analytics?.totalViews || 0}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">{analytics?.uniqueVisitorsCount || 0} unique talkers</p>
        </Card>

        <Card hover className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-stone-400">Star Rating</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-stone-900 dark:text-white">
              {(listener?.rating || 5.0).toFixed(1)}
            </span>
            <span className="text-xs text-amber-500">★</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">{listener?.totalReviews || 0} reviews</p>
        </Card>

        <Card hover className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-stone-400">Conversations</p>
          <div className="mt-1">
            <span className="text-2xl font-extrabold text-stone-900 dark:text-white">
              {listener?.totalSessions || 0}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Completed sessions</p>
        </Card>

        <Card hover className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-stone-400">Listening Time</p>
          <div className="mt-1">
            <span className="text-2xl font-extrabold text-stone-900 dark:text-white">
              {listener?.totalListeningMinutes || 0}
            </span>
            <span className="text-xs text-stone-500 ml-1">mins</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Active conversation</p>
        </Card>

        <Card hover className="p-4 flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-stone-400">Total Earned</p>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-[#166534] dark:text-[#4ADE80] font-mono">
              {formatPaise(wallet?.totalEarnedPaise || 0)}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Rate: ₹2.50 / min</p>
        </Card>
      </div>

      {/* Main Grid: Status Control + Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Control Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white border-b border-[#EFEBE4] dark:border-[#332E28] pb-3">
            Real-Time Availability
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420] border border-[#EFEBE4] dark:border-[#332E28]">
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-white">Current Status</p>
              <p className="text-[11px] text-stone-500">Live in Talker directory</p>
            </div>
            <StatusBadge status={listener?.status || 'idle'} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleStatusChange('idle')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all duration-200 active:scale-[0.97] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center gap-1.5 ${
                listener?.status === 'idle'
                  ? 'border-[#166534] bg-[#DCFCE7]/70 dark:bg-[#166534]/30 text-[#166534] dark:text-[#4ADE80] ring-2 ring-[#166534]/25 shadow-xs'
                  : 'border-[#EFEBE4] dark:border-[#332E28] text-stone-600 dark:text-stone-400 hover:bg-[#FAF6F0] dark:hover:bg-[#272420]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#166534] dark:bg-[#4ADE80] animate-pulse" />
              <span>Available (Online)</span>
            </button>

            <button
              onClick={() => handleStatusChange('busy')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all duration-200 active:scale-[0.97] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center gap-1.5 ${
                listener?.status === 'busy'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-[#EFEBE4] dark:border-[#332E28] text-stone-600 dark:text-stone-400 hover:bg-[#FAF6F0] dark:hover:bg-[#272420]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Busy / Offline</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400 leading-relaxed pt-2">
            When you enter an active conversation, your status automatically switches to "In Conversation".
          </p>
        </Card>

        {/* Today's Appointments */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEBE4] dark:border-[#332E28] pb-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0891B2]" />
              <span>Appointments</span>
            </h3>
            <Link to="/listener/appointments" className="text-xs text-[#0891B2] hover:underline font-medium">
              View Calendar
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">
              No appointments scheduled. Talkers can book available slots from your schedule.
            </p>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.slice(0, 3).map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#272420]/50 border border-[#EFEBE4] dark:border-[#332E28]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={appt.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.talkerId}`}
                      alt={appt.talkerName}
                      className="w-10 h-10 rounded-2xl object-cover border border-[#EFEBE4] dark:border-[#332E28]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                        {appt.talkerName}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {appt.date} • {appt.timeSlot} • {appt.sessionType}
                      </p>
                    </div>
                  </div>

                  <Badge variant="verified" size="sm">Confirmed</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Profile Visitors Analytics Preview */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Who Visited Your Profile ({analytics?.totalViews || 0} Total Visits)
              </h3>
              <p className="text-[11px] text-stone-500">
                {analytics?.uniqueVisitorsCount || 0} unique talkers viewed your listener profile
              </p>
            </div>
          </div>

          <Link
            to="/listener/analytics"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            View Full Analytics →
          </Link>
        </div>

        {(!analytics?.visitors || Object.keys(analytics.visitors).length === 0) ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            No profile visits recorded yet. When talkers explore or open your profile, their visits appear here in real time.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(analytics.visitors)
              .sort((a, b) => b.lastVisitedAt - a.lastVisitedAt)
              .slice(0, 6)
              .map((v, i) => (
                <div
                  key={v.visitorId + i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#272420]/50 border border-[#EFEBE4] dark:border-[#332E28]"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={v.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.visitorId}`}
                      alt={v.visitorName}
                      className="w-8 h-8 rounded-full object-cover bg-amber-100 ring-1 ring-amber-300"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        {v.visitorName}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(v.lastVisitedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">
                    {v.visitCount} {v.visitCount === 1 ? 'view' : 'views'}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </Card>

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        wallet={wallet}
      />
    </div>
  );
};
