import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToListeners, subscribeToAppointments, subscribeToUserSessions } from '../../lib/database';
import type { ListenerProfile, Appointment, Session } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { ListenerCard } from '../../components/talker/ListenerCard';
import { TopupModal } from '../../components/talker/TopupModal';
import {
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const TalkerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [listeners, setListeners] = useState<ListenerProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const unsubListeners = subscribeToListeners((list) => setListeners(list));
    const unsubAppts = subscribeToAppointments(currentUser.uid, 'talker', (appts) => setAppointments(appts));
    const unsubSessions = subscribeToUserSessions(currentUser.uid, 'talker', (sess) => setSessions(sess));

    return () => {
      unsubListeners();
      unsubAppts();
      unsubSessions();
    };
  }, [currentUser]);

  const availableListeners = listeners.filter((l) => l.status === 'idle');
  const upcomingAppointments = appointments.filter((a) => a.status === 'confirmed');

  return (
    <div className="space-y-6 text-left">
      {/* Astrotalk Promotional Cashback Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF6E5] via-[#FFFDF7] to-[#FFF0D4] dark:from-[#26221B] dark:via-[#1F1C18] dark:to-[#26221B] border border-amber-200/70 dark:border-amber-900/40 p-5 sm:p-6 text-center shadow-xs">
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🪙</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-amber-100 tracking-tight">
              50% Cashback!
            </h2>
            <span className="text-xl">🪙</span>
          </div>

          <p className="text-[11px] uppercase tracking-widest font-bold text-stone-600 dark:text-stone-300">
            ON NEXT RECHARGE
          </p>

          <div className="mt-2.5">
            <button
              onClick={() => setIsTopupOpen(true)}
              className="px-5 py-1.5 rounded-full bg-[#F5C518] hover:bg-[#E5B508] active:scale-95 text-stone-950 font-extrabold text-xs uppercase tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              RECHARGE NOW
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400">Available Listeners</p>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {availableListeners.length}
            </p>
            <span className="text-[11px] text-[#166534] dark:text-[#4ADE80] font-medium flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534] dark:bg-[#4ADE80] animate-pulse" />
              Ready to talk right now
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420] text-[#D4A373] dark:text-[#DEC6A5] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400">Upcoming Sessions</p>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {upcomingAppointments.length}
            </p>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
              Scheduled in your calendar
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420] text-[#0891B2] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>

        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400">Past Conversations</p>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-0.5">
              {sessions.length}
            </p>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
              Completed sessions
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] dark:bg-[#272420] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Available Listeners Carousel / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              Listeners Online Right Now
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Connect instantly via real-time text chat or encrypted audio call.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/talker/listeners')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />}
          >
            View All ({listeners.length})
          </Button>
        </div>

        {availableListeners.length === 0 ? (
          <Card className="p-8 text-center text-stone-500 text-xs">
            No listeners are currently online. You can view all listeners to book a scheduled slot.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableListeners.slice(0, 4).map((l) => (
              <ListenerCard key={l.uid} listener={l} />
            ))}
          </div>
        )}
      </div>

      {/* Appointments & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments List */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEBE4] dark:border-[#332E28] pb-3">
            <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0891B2]" />
              <span>Upcoming Appointments</span>
            </h4>
            <Link to="/talker/appointments" className="text-xs text-[#0891B2] hover:underline font-medium">
              See All
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">
              No appointments scheduled for today.
            </p>
          ) : (
            upcomingAppointments.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#272420]/50 border border-[#EFEBE4] dark:border-[#332E28]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={a.listenerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.listenerId}`}
                    alt={a.listenerName}
                    className="w-9 h-9 rounded-full object-cover border border-[#EFEBE4] dark:border-[#332E28]"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-white">{a.listenerName}</p>
                    <p className="text-[11px] text-stone-500">{a.date} • {a.timeSlot}</p>
                  </div>
                </div>
                <Badge variant="verified" size="sm">Confirmed</Badge>
              </div>
            ))
          )}
        </Card>

        {/* Recent Conversations */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEBE4] dark:border-[#332E28] pb-3">
            <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D4A373]" />
              <span>Recent Conversations</span>
            </h4>
            <Link to="/talker/conversations" className="text-xs text-[#0891B2] hover:underline font-medium">
              Full History
            </Link>
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">
              You haven't had any conversations yet. Select a listener to begin!
            </p>
          ) : (
            sessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#272420]/50 border border-[#EFEBE4] dark:border-[#332E28]"
              >
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-white">{s.listenerName}</p>
                  <p className="text-[11px] text-stone-500">
                    {Math.ceil(s.durationSeconds / 60)} mins • {s.type === 'audio' ? 'Audio Call' : 'Chat'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/session/${s.id}`)}
                >
                  View Room
                </Button>
              </div>
            ))
          )}
        </Card>
      </div>

      <TopupModal isOpen={isTopupOpen} onClose={() => setIsTopupOpen(false)} />
    </div>
  );
};
