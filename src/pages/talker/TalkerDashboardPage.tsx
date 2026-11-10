import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToListeners, subscribeToAppointments, subscribeToUserSessions } from '../../lib/database';
import type { ListenerProfile, Appointment, Session } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ListenerCard } from '../../components/talker/ListenerCard';
import { TopupModal } from '../../components/talker/TopupModal';
import {
  Users,
  Calendar,
  MessageSquare,
  ArrowRight
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
    <div className="space-y-8 text-left animate-apple-fade-in">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-caption font-medium uppercase tracking-wider text-text-muted">Available Listeners</p>
            <p className="text-title font-semibold text-text mt-0.5">
              {availableListeners.length}
            </p>
            <span className="text-caption text-success font-medium flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Ready to talk right now
            </span>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface-raised text-text-muted flex items-center justify-center border border-border/40">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-caption font-medium uppercase tracking-wider text-text-muted">Upcoming Sessions</p>
            <p className="text-title font-semibold text-text mt-0.5">
              {upcomingAppointments.length}
            </p>
            <span className="text-caption text-text-muted mt-1 block">
              Scheduled in calendar
            </span>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface-raised text-text-muted flex items-center justify-center border border-border/40">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>

        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <p className="text-caption font-medium uppercase tracking-wider text-text-muted">Past Conversations</p>
            <p className="text-title font-semibold text-text mt-0.5">
              {sessions.length}
            </p>
            <span className="text-caption text-text-muted mt-1 block">
              Completed sessions
            </span>
          </div>
          <div className="w-10 h-10 rounded-pill bg-surface-raised text-text-muted flex items-center justify-center border border-border/40">
            <MessageSquare className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Available Listeners Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-heading font-semibold text-text">
              Available Listeners
            </h2>
            <p className="text-small text-text-muted">
              Connect instantly via real-time text chat or encrypted audio call.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/talker/listeners')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View All ({listeners.length})
          </Button>
        </div>

        {availableListeners.length === 0 ? (
          <Card className="p-8 text-center text-text-muted text-small">
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
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="text-body font-semibold text-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span>Upcoming Appointments</span>
            </h3>
            <Link to="/talker/appointments" className="text-caption text-accent hover:underline font-medium">
              See All
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <p className="text-caption text-text-muted py-4 text-center">
              No appointments scheduled for today.
            </p>
          ) : (
            upcomingAppointments.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-card bg-surface-raised border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={a.listenerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.listenerId}`}
                    alt={a.listenerName}
                    className="w-9 h-9 rounded-full object-cover bg-surface"
                  />
                  <div>
                    <p className="text-small font-semibold text-text">{a.listenerName}</p>
                    <p className="text-caption text-text-muted">{a.date} • {a.timeSlot}</p>
                  </div>
                </div>
                <Badge variant="verified" size="sm">Confirmed</Badge>
              </div>
            ))
          )}
        </Card>

        {/* Recent Conversations */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="text-body font-semibold text-text flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              <span>Recent Conversations</span>
            </h3>
            <Link to="/talker/conversations" className="text-caption text-accent hover:underline font-medium">
              Full History
            </Link>
          </div>

          {sessions.length === 0 ? (
            <p className="text-caption text-text-muted py-4 text-center">
              You haven't had any conversations yet. Select a listener to begin!
            </p>
          ) : (
            sessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-card bg-surface-raised border border-border/40"
              >
                <div>
                  <p className="text-small font-semibold text-text">{s.listenerName}</p>
                  <p className="text-caption text-text-muted">
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
