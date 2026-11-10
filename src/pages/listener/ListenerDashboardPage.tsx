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
import { WithdrawalModal } from '../../components/listener/WithdrawalModal';
import { formatPaise } from '../../lib/upi';
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Eye
} from 'lucide-react';

export const ListenerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [listener, setListener] = useState<ListenerProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [, setSessions] = useState<Session[]>([]);
  const [, setReviews] = useState<Review[]>([]);
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
        <Card padding="md" className="border-warning/40 bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-pill bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-small font-semibold text-text">
                Listener Qualification Assessment Pending
              </h4>
              <p className="text-caption text-text-muted">
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
        <div className="flex items-center justify-between p-3.5 rounded-input bg-success/10 border border-success/30 text-caption text-success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Platform-Verified Listener Status Active</span>
          </div>
          <span>Verification Score: {listener.verificationScore || 100}%</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card padding="md" className="flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-text-muted">Profile Visitors</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-text font-mono">
              {analytics?.totalViews || 0}
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">{analytics?.uniqueVisitorsCount || 0} unique talkers</p>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-text-muted">Star Rating</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-text">
              {(listener?.rating || 5.0).toFixed(1)}
            </span>
            <span className="text-xs text-warning">★</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">{listener?.totalReviews || 0} reviews</p>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-text-muted">Conversations</p>
          <div className="mt-1">
            <span className="text-2xl font-bold text-text">
              {listener?.totalSessions || 0}
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">Completed sessions</p>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-text-muted">Listening Time</p>
          <div className="mt-1">
            <span className="text-2xl font-bold text-text">
              {listener?.totalListeningMinutes || 0}
            </span>
            <span className="text-caption text-text-muted ml-1">mins</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">Active conversation</p>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <p className="text-[11px] uppercase font-semibold text-text-muted">Total Earned</p>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold text-success font-mono">
              {formatPaise(wallet?.totalEarnedPaise || 0)}
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">Rate: ₹2.50 / min</p>
        </Card>
      </div>

      {/* Main Grid: Status Control + Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Control Card */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-small font-semibold text-text border-b border-border pb-3">
            Real-Time Availability
          </h3>

          <div className="flex items-center justify-between p-3 rounded-input bg-surface border border-border">
            <div>
              <p className="text-caption font-semibold text-text">Current Status</p>
              <p className="text-[11px] text-text-muted">Live in Talker directory</p>
            </div>
            <StatusBadge status={listener?.status || 'idle'} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleStatusChange('idle')}
              className={`p-3 rounded-input border text-caption font-semibold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                listener?.status === 'idle'
                  ? 'border-success bg-success/10 text-success shadow-soft'
                  : 'border-border bg-surface text-text-muted hover:text-text'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-pill bg-success animate-pulse" />
              <span>Available (Online)</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('busy')}
              className={`p-3 rounded-input border text-caption font-semibold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                listener?.status === 'busy'
                  ? 'border-warning bg-warning/10 text-warning shadow-soft'
                  : 'border-border bg-surface text-text-muted hover:text-text'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-pill bg-warning" />
              <span>Busy / Offline</span>
            </button>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed pt-1">
            When you enter an active conversation, your status automatically switches to "In Conversation".
          </p>
        </Card>

        {/* Today's Appointments */}
        <Card padding="md" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-small font-semibold text-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span>Appointments</span>
            </h3>
            <Link to="/listener/appointments" className="text-caption text-accent hover:underline font-medium">
              View Calendar
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="text-caption text-text-muted py-8 text-center">
              No appointments scheduled. Talkers can book available slots from your schedule.
            </p>
          ) : (
            <div className="space-y-2">
              {todayAppointments.slice(0, 3).map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-3.5 rounded-input bg-surface border border-border"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={appt.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.talkerId}`}
                      alt={appt.talkerName}
                      className="w-10 h-10 rounded-input object-cover bg-surface border border-border"
                    />
                    <div>
                      <h4 className="text-caption font-semibold text-text">
                        {appt.talkerName}
                      </h4>
                      <p className="text-[11px] text-text-muted">
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

      {/* Profile Visitors Analytics Preview */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-pill bg-accent/10 text-accent flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-small font-semibold text-text">
                Who Visited Your Profile ({analytics?.totalViews || 0} Total Visits)
              </h3>
              <p className="text-[11px] text-text-muted">
                {analytics?.uniqueVisitorsCount || 0} unique talkers viewed your listener profile
              </p>
            </div>
          </div>

          <Link
            to="/listener/analytics"
            className="text-caption font-medium text-accent hover:underline"
          >
            View Full Analytics →
          </Link>
        </div>

        {(!analytics?.visitors || Object.keys(analytics.visitors).length === 0) ? (
          <p className="text-caption text-text-muted py-6 text-center">
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
                  className="flex items-center justify-between p-3 rounded-input bg-surface border border-border"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={v.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.visitorId}`}
                      alt={v.visitorName}
                      className="w-8 h-8 rounded-pill object-cover bg-surface border border-border"
                    />
                    <div>
                      <p className="text-caption font-semibold text-text">
                        {v.visitorName}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(v.lastVisitedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
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
