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
import { Calendar, Clock, MessageSquare, PhoneCall, XCircle } from 'lucide-react';

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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Scheduled Appointments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View upcoming conversation dates, join active sessions, or reschedule.
          </p>
        </div>

        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-full capitalize font-medium transition-all ${
                filter === st
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="No Appointments Found"
          description="You don't have any appointments matching this filter."
          actionLabel="Book a Listener"
          onAction={() => navigate('/talker/listeners')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <Card key={appt.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={appt.listenerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.listenerId}`}
                  alt={appt.listenerName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {appt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {appt.timeSlot}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{appt.sessionType}</span>
                  </div>
                  {appt.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
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
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(appt.id)}
                      className="text-rose-600 hover:bg-rose-50"
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
