import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getListenerSchedule, saveListenerSchedule } from '../../lib/database';
import type { ListenerSchedule, DaySchedule } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Clock, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Availability & Calendar Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Instant Conversations
            </p>
            <p className="text-[11px] text-slate-500">
              Accept live incoming chat/call requests when marked online.
            </p>
          </div>
          <input
            type="checkbox"
            checked={schedule.acceptsImmediate}
            onChange={(e) => setSchedule({ ...schedule, acceptsImmediate: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Appointment Scheduling
            </p>
            <p className="text-[11px] text-slate-500">
              Allow talkers to book future time slots from this schedule.
            </p>
          </div>
          <input
            type="checkbox"
            checked={schedule.acceptsAppointments}
            onChange={(e) => setSchedule({ ...schedule, acceptsAppointments: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </Card>
      </div>

      {/* Days Table */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Weekly Working Hours
        </h3>

        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const dayConfig: DaySchedule = schedule.weekly[day] || { enabled: false, slots: [] };

            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    checked={dayConfig.enabled}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">
                    {day}
                  </span>
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {!dayConfig.enabled ? (
                    <span className="text-xs text-slate-400 italic">Unavailable / Day off</span>
                  ) : dayConfig.slots && dayConfig.slots.length > 0 ? (
                    dayConfig.slots.map((slot, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                      >
                        <span>{slot.start} - {slot.end}</span>
                        <button
                          type="button"
                          onClick={() => removeSlot(day, sIdx)}
                          className="text-slate-400 hover:text-rose-500 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No slots defined</span>
                  )}
                </div>

                {dayConfig.enabled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addSlot(day)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs"
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
