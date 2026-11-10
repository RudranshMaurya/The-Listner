import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToReviews } from '../../lib/database';
import type { Review } from '../../types';
import { Card } from '../../components/common/Card';
import { StarRating } from '../../components/common/StarRating';
import { EmptyState } from '../../components/common/EmptyState';
import { Star } from 'lucide-react';

export const ListenerReviewsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToReviews(currentUser.uid, (list) => {
      setReviews(list);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 5.0;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title text-text tracking-tight">
            Ratings & Reviews from Talkers
          </h2>
          <p className="text-small text-text-muted mt-0.5">
            Feedback and appreciation shared by talkers after completed conversations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-pill bg-surface border border-border text-text">
          <Star className="w-4 h-4 fill-warning text-warning" />
          <span className="text-body font-bold">{avgRating.toFixed(1)}</span>
          <span className="text-caption text-text-muted">({reviews.length} reviews)</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="w-5 h-5 text-text-muted" />}
          title="No Reviews Received Yet"
          description="When you complete conversations with talkers, their 5-star ratings and written feedback will appear here."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <Card key={rev.id} padding="md" className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.talkerId}`}
                    alt={rev.talkerName}
                    className="w-10 h-10 rounded-pill object-cover bg-surface border border-border"
                  />
                  <div>
                    <h4 className="text-small font-semibold text-text">
                      {rev.talkerName}
                    </h4>
                    <p className="text-caption text-text-muted">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <StarRating rating={rev.rating} size="sm" />
              </div>

              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rev.tags.map((t) => (
                    <span
                      key={t}
                      className="text-caption font-medium px-2.5 py-0.5 rounded-pill bg-accent/10 text-accent"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-small text-text-muted italic pt-1 leading-relaxed">
                "{rev.comment}"
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
