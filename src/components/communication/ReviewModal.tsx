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
import { Heart } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center p-5 bg-surface rounded-card border border-border">
          <p className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-2">
            Tap Stars to Rate
          </p>
          <StarRating rating={rating} size="lg" interactive onRatingChange={(r) => setRating(r)} />
          <p className="text-small font-semibold text-accent mt-2">
            {rating === 5 && 'Outstanding Listener ⭐⭐⭐⭐⭐'}
            {rating === 4 && 'Very Good & Helpful ⭐⭐⭐⭐'}
            {rating === 3 && 'Good Conversation ⭐⭐⭐'}
            {rating === 2 && 'Fair ⭐⭐'}
            {rating === 1 && 'Needs Improvement ⭐'}
          </p>
        </div>

        {/* Remark Chips */}
        <div>
          <label className="block text-caption font-semibold uppercase tracking-wider text-text-muted mb-2">
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
                  className={`px-3 py-1.5 rounded-pill text-caption font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-accent bg-accent/10 text-accent font-semibold shadow-soft'
                      : 'border-border bg-surface text-text-muted hover:text-text'
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
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmitReview}
            isLoading={isSubmitting}
            leftIcon={<Heart className="w-4 h-4" />}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};
