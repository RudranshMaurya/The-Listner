import React, { useEffect, useState } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { writeAuditLog } from '../../lib/database';
import type { Review } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { EmptyState } from '../../components/common/EmptyState';
import { Star, Trash2 } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsub = onValue(ref(db, 'reviews'), (snapshot) => {
      if (!snapshot.exists()) {
        setReviews([]);
        return;
      }
      const all: Review[] = [];
      const val = snapshot.val();
      for (const listenerUid of Object.keys(val)) {
        for (const r of Object.values(val[listenerUid])) {
          all.push(r as Review);
        }
      }
      all.sort((a, b) => b.createdAt - a.createdAt);
      setReviews(all);
    });
    return () => unsub();
  }, []);

  const handleDeleteReview = async (review: Review) => {
    if (!currentUser) return;
    try {
      await remove(ref(db, `reviews/${review.listenerId}/${review.id}`));
      await writeAuditLog({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || 'admin',
        action: `Deleted review from ${review.talkerName}`,
        targetType: 'user',
        targetId: review.listenerId,
        details: `Rating: ${review.rating}, Comment: ${review.comment}`
      });
      showToast('info', 'Review deleted by moderator.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to remove review.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Review Moderation Queue ({reviews.length})
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Monitor feedback submitted by talkers. Inappropriate remarks can be moderated here.
        </p>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="w-5 h-5 text-text-muted" />}
            title="No Reviews Submitted Yet"
            description="Reviews submitted by talkers for listeners will appear here."
          />
        ) : (
          reviews.map((rev) => (
            <Card key={rev.id} padding="md" className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-small text-text">
                    {rev.talkerName}
                  </span>
                  <StarRating rating={rev.rating} size="sm" />
                  <span className="text-border">•</span>
                  <span className="text-caption text-text-muted">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rev.tags.map((t) => (
                      <span key={t} className="text-caption px-2.5 py-0.5 rounded-pill bg-surface border border-border text-text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-small text-text-muted italic pt-1">
                  "{rev.comment}"
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteReview(rev)}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-danger" />}
              >
                Delete
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
