import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getListenerSchedule, saveListenerSchedule } from '../../lib/database';
import type { ListenerSchedule, DaySchedule } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Save, Plus, Trash2 } from 'lucide-react';

export const ListenerSchedulePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [schedule, setSchedule] = useState<ListenerSchedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (!currentUser) return;
    getListenerSchedule(currentUser.uid).then((sch) => setSchedule(sch));
  }, [currentUser]);

  const toggleDay = (day: string) => {
    if (!schedule) return;
    const currentDay = schedule.weekly[day] || { enabled: false, slots: [] };
    const updatedWeekly = {
      ...schedule.weekly,
      [day]: {
        ...currentDay,
        enabled: !currentDay.enabled
      }
    };
    setSchedule({ ...schedule, weekly: updatedWeekly });
  };

  const addSlot = (day: string) => {
    if (!schedule) return;
    const currentDay = schedule.weekly[day] || { enabled: true, slots: [] };
    const updatedWeekly = {
      ...schedule.weekly,
      [day]: {
        enabled: true,
        slots: [...(currentDay.slots || []), { start: '10:00', end: '14:00' }]
      }
    };
    setSchedule({ ...schedule, weekly: updatedWeekly });
  };

  const removeSlot = (day: string, index: number) => {
    if (!schedule) return;
    const currentDay = schedule.weekly[day];
    const newSlots = currentDay.slots.filter((_, i) => i !== index);
    const updatedWeekly = {
      ...schedule.weekly,
      [day]: { ...currentDay, slots: newSlots }
    };
    setSchedule({ ...schedule, weekly: updatedWeekly });
  };

  const handleSave = async () => {
    if (!schedule || !currentUser) return;
    try {
      setIsSaving(true);
      await saveListenerSchedule({
        ...schedule,
        updatedAt: Date.now()
      });
      showToast('success', 'Weekly schedule saved successfully.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!schedule) return null;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title text-text tracking-tight">
            Availability & Calendar Schedule
          </h2>
          <p className="text-small text-text-muted mt-0.5">
            Set your weekly working hours and time slots. Timezone: {schedule.timezone || 'Asia/Kolkata'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          isLoading={isSaving}
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Schedule
        </Button>
      </div>

      {/* Global preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-small font-semibold text-text">
              Instant Conversations
            </p>
            <p className="text-caption text-text-muted mt-0.5">
              Accept live incoming chat/call requests when marked online.
            </p>
          </div>
          <input
            type="checkbox"
            checked={schedule.acceptsImmediate}
            onChange={(e) => setSchedule({ ...schedule, acceptsImmediate: e.target.checked })}
            className="w-5 h-5 rounded-input text-accent focus:ring-accent accent-accent cursor-pointer"
          />
        </Card>

        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-small font-semibold text-text">
              Appointment Scheduling
            </p>
            <p className="text-caption text-text-muted mt-0.5">
              Allow talkers to book future time slots from this schedule.
            </p>
          </div>
          <input
            type="checkbox"
            checked={schedule.acceptsAppointments}
            onChange={(e) => setSchedule({ ...schedule, acceptsAppointments: e.target.checked })}
            className="w-5 h-5 rounded-input text-accent focus:ring-accent accent-accent cursor-pointer"
          />
        </Card>
      </div>

      {/* Days Table */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-small font-semibold text-text border-b border-border pb-3">
          Weekly Working Hours
        </h3>

        <div className="space-y-2">
          {daysOfWeek.map((day) => {
            const dayConfig: DaySchedule = schedule.weekly[day] || { enabled: false, slots: [] };

            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-input bg-surface border border-border"
              >
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    checked={dayConfig.enabled}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 rounded-input text-accent focus:ring-accent accent-accent cursor-pointer"
                  />
                  <span className="text-small font-semibold capitalize text-text">
                    {day}
                  </span>
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {!dayConfig.enabled ? (
                    <span className="text-caption text-text-muted italic">Unavailable / Day off</span>
                  ) : dayConfig.slots && dayConfig.slots.length > 0 ? (
                    dayConfig.slots.map((slot, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-raised border border-border text-caption font-mono text-text"
                      >
                        <span>{slot.start} - {slot.end}</span>
                        <button
                          type="button"
                          onClick={() => removeSlot(day, sIdx)}
                          className="text-text-muted hover:text-danger p-0.5 cursor-pointer"
                          aria-label="Remove slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-caption text-text-muted">No slots defined</span>
                  )}
                </div>

                {dayConfig.enabled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addSlot(day)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Slot
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
