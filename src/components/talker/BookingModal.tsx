import React, { useState } from 'react';
import type { ListenerProfile, SessionType } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Input';
import { createAppointment } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { MessageSquare, PhoneCall } from 'lucide-react';

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
          <label className="block text-caption font-semibold uppercase tracking-wider text-text-muted mb-2">
            Conversation Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSessionType('chat')}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-input border text-small font-medium transition-all cursor-pointer ${
                sessionType === 'chat'
                  ? 'border-accent bg-accent/10 text-accent font-semibold shadow-soft'
                  : 'border-border bg-surface text-text-muted hover:text-text'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Text Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setSessionType('audio')}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-input border text-small font-medium transition-all cursor-pointer ${
                sessionType === 'audio'
                  ? 'border-accent bg-accent/10 text-accent font-semibold shadow-soft'
                  : 'border-border bg-surface text-text-muted hover:text-text'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Audio Call</span>
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-caption font-semibold uppercase tracking-wider text-text-muted mb-2">
            Select Date (Asia/Kolkata)
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {dateOptions.map((opt) => (
              <button
                key={opt.dateStr}
                type="button"
                onClick={() => setSelectedDate(opt.dateStr)}
                className={`px-3.5 py-2 rounded-pill text-caption shrink-0 border transition-all cursor-pointer ${
                  selectedDate === opt.dateStr
                    ? 'border-accent bg-accent text-accent-contrast font-semibold shadow-soft'
                    : 'border-border bg-surface text-text-muted hover:text-text'
                }`}
              >
                {opt.displayStr}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-caption font-semibold uppercase tracking-wider text-text-muted mb-2">
            Select Time Slot
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-2.5 rounded-input text-caption border text-center transition-all cursor-pointer ${
                  selectedSlot === slot
                    ? 'border-accent bg-accent/10 text-accent font-semibold shadow-soft'
                    : 'border-border bg-surface text-text-muted hover:text-text'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Textarea
            label="What's on your mind? (Private note to listener)"
            placeholder="Share context, topics, or anything you'd like your listener to keep in mind..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleBooking}
            isLoading={isSubmitting}
          >
            Confirm Appointment
          </Button>
        </div>
      </div>
    </Modal>
  );
};
