import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { subscribeToAppointments, updateAppointmentStatus } from '../../lib/database';
import type { Appointment } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Clock } from 'lucide-react';

export const TalkerAppointmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToAppointments(currentUser.uid, 'talker', (list) => {
      setAppointments(list);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleCancel = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'cancelled');
      showToast('info', 'Appointment cancelled.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to cancel appointment.');
    }
  };

  const filtered = appointments.filter((a) => (filter === 'all' ? true : a.status === filter));

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title text-text tracking-tight">
            Scheduled Appointments
          </h2>
          <p className="text-small text-text-muted mt-0.5">
            View upcoming conversation dates or manage your sessions.
          </p>
        </div>

        <div className="flex gap-1 bg-surface p-1 rounded-pill border border-border text-caption">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-pill capitalize transition-all cursor-pointer ${
                filter === st
                  ? 'bg-surface-raised text-text font-semibold shadow-soft'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-5 h-5 text-text-muted" />}
          title="No Appointments Found"
          description="You don't have any appointments matching this filter."
          actionLabel="Find a Listener"
          onAction={() => navigate('/talker/listeners')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <Card key={appt.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={appt.listenerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.listenerId}`}
                  alt={appt.listenerName}
                  className="w-12 h-12 rounded-card object-cover bg-surface border border-border"
                />
                <div>
                  <h4 className="text-small font-semibold text-text flex items-center gap-2">
                    <span>{appt.listenerName}</span>
                    <Badge
                      variant={
                        appt.status === 'confirmed'
                          ? 'success'
                          : appt.status === 'completed'
                          ? 'neutral'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {appt.status}
                    </Badge>
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-caption text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {appt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {appt.timeSlot}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{appt.sessionType}</span>
                  </div>
                  {appt.notes && (
                    <p className="text-caption text-text-muted mt-1 italic">
                      "{appt.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {appt.status === 'confirmed' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/talker/listener/${appt.listenerId}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(appt.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
