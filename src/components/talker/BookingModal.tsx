import React, { useState } from 'react';
import type { ListenerProfile, SessionType } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { createAppointment } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Calendar, Clock, MessageSquare, PhoneCall, Check } from 'lucide-react';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listener: ListenerProfile;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  listener
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  // Next 7 days
  const today = new Date();
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const displayStr = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { dateStr, displayStr };
  });

  const timeSlots = [
    '10:00 AM - 10:30 AM',
    '11:00 AM - 11:30 AM',
    '02:00 PM - 02:30 PM',
    '04:00 PM - 04:30 PM',
    '06:00 PM - 06:30 PM',
    '08:00 PM - 08:30 PM',
    '09:00 PM - 09:30 PM'
  ];

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(timeSlots[0]);
  const [sessionType, setSessionType] = useState<SessionType>('chat');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleBooking = async () => {
    if (!currentUser) return;
    try {
      setIsSubmitting(true);
      await createAppointment({
        talkerId: currentUser.uid,
        talkerName: currentUser.displayName || 'Talker',
        talkerPhoto: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
        listenerId: listener.uid,
        listenerName: listener.displayName,
        listenerPhoto: listener.photoURL,
        date: selectedDate,
        timeSlot: selectedSlot,
        sessionType,
        notes: notes.trim()
      });

      showToast('success', `Appointment booked with ${listener.displayName} for ${selectedDate} at ${selectedSlot}.`);
      onClose();
    } catch (e: any) {
      showToast('error', e.message || 'Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule with ${listener.displayName}`}
      description="Select an available time slot for your 1-on-1 private conversation."
      maxWidth="lg"
    >
      <div className="space-y-5 text-left">
        {/* Session Type Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Conversation Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSessionType('chat')}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-sm font-medium transition-all ${
                sessionType === 'chat'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Text Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setSessionType('audio')}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-sm font-medium transition-all ${
                sessionType === 'audio'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Audio Call</span>
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Select Date (Asia/Kolkata)
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dateOptions.map((opt) => (
              <button
                key={opt.dateStr}
                type="button"
                onClick={() => setSelectedDate(opt.dateStr)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-medium shrink-0 border transition-all ${
                  selectedDate === opt.dateStr
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt.displayStr}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Select Time Slot
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  selectedSlot === slot
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <Textarea
            label="What's on your mind? (Optional)"
            placeholder="Feel free to share what you'd like to discuss or simply 'just want someone to talk to'..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Rate: <span className="font-semibold text-slate-900 dark:text-white">₹5 / 2 mins</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBooking}
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
