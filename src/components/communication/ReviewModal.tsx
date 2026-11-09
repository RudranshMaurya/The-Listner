import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Session } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Input';
import { StarRating } from '../common/StarRating';
import { submitReview } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Heart, Sparkles, Check } from 'lucide-react';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  onSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  session,
  onSubmitted
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Great listener', 'Very understanding']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableTags = [
    'Very understanding',
    'Great listener',
    'Respectful',
    'Friendly',
    'Made me comfortable',
    'Helpful conversation',
    'Good communication',
    'Would talk again'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUser) return;
    try {
      setIsSubmitting(true);
      await submitReview({
        sessionId: session.id,
        talkerId: currentUser.uid,
        talkerName: currentUser.displayName || 'Talker',
        talkerPhoto: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
        listenerId: session.listenerId,
        rating,
        tags: selectedTags,
        comment: comment.trim() || 'Wonderful conversation. Thank you for listening!'
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      showToast('success', 'Thank you for your rating and feedback!');
      onSubmitted?.();
      onClose();
    } catch (e: any) {
      showToast('error', e.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How was your conversation?"
      description={`Share your feedback for ${session.listenerName}. Your ratings help maintain a safe, kind community.`}
      maxWidth="md"
    >
      <div className="space-y-5 text-left">
        {/* Star Rating Select */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Tap Stars to Rate
          </p>
          <StarRating rating={rating} size="lg" interactive onRatingChange={(r) => setRating(r)} />
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
            {rating === 5 && 'Outstanding Listener ⭐⭐⭐⭐⭐'}
            {rating === 4 && 'Very Good & Helpful ⭐⭐⭐⭐'}
            {rating === 3 && 'Good Conversation ⭐⭐⭐'}
            {rating === 2 && 'Fair ⭐⭐'}
            {rating === 1 && 'Needs Improvement ⭐'}
          </p>
        </div>

        {/* Remark Chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Highlights
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Textarea */}
        <div>
          <Textarea
            label="Leave a note (Optional)"
            placeholder="Share how this conversation helped you or what made this listener wonderful..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmitReview}
            isLoading={isSubmitting}
            leftIcon={<Heart className="w-4 h-4 text-rose-300" />}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};
