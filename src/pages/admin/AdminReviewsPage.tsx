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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Review Moderation Queue ({reviews.length})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor feedback submitted by talkers. Inappropriate remarks can be moderated here.
        </p>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-xs">
            No reviews submitted on platform yet.
          </Card>
        ) : (
          reviews.map((rev) => (
            <Card key={rev.id} className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {rev.talkerName}
                  </span>
                  <StarRating rating={rev.rating} size="sm" />
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rev.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                  "{rev.comment}"
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteReview(rev)}
                className="text-rose-600 hover:bg-rose-50"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
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
