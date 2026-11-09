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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Ratings & Reviews from Talkers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Feedback and appreciation shared by talkers after completed conversations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="text-lg font-extrabold">{avgRating.toFixed(1)}</span>
          <span className="text-xs text-slate-500">({reviews.length} reviews)</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="w-8 h-8" />}
          title="No Reviews Received Yet"
          description="When you complete conversations with talkers, their 5-star ratings and written feedback will appear here."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <Card key={rev.id} className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.talkerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.talkerId}`}
                    alt={rev.talkerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rev.talkerName}
                    </h4>
                    <p className="text-[10px] text-slate-400">
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
                      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-1 leading-relaxed">
                "{rev.comment}"
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
