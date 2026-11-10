import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { subscribeToAppointments, updateAppointmentStatus } from '../../lib/database';
import type { Appointment } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Check } from 'lucide-react';

export const ListenerAppointmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToAppointments(currentUser.uid, 'listener', (list) => {
      setAppointments(list);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleStatus = async (id: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(id, status);
      showToast('info', `Appointment marked as ${status}.`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to update appointment.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Client Appointments
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Bookings made by talkers from your availability calendar.
        </p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-5 h-5 text-text-muted" />}
          title="No Appointments Scheduled"
          description="When talkers book slots from your calendar, they will appear here."
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={appt.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.talkerId}`}
                  alt={appt.talkerName}
                  className="w-12 h-12 rounded-card object-cover bg-surface border border-border"
                />
                <div>
                  <h4 className="text-small font-semibold text-text flex items-center gap-2">
                    <span>{appt.talkerName}</span>
                    <Badge variant={appt.status === 'confirmed' ? 'success' : 'neutral'} size="sm">
                      {appt.status}
                    </Badge>
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-caption text-text-muted">
                    <span>{appt.date}</span>
                    <span>•</span>
                    <span>{appt.timeSlot}</span>
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
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatus(appt.id, 'completed')}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatus(appt.id, 'cancelled')}
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
