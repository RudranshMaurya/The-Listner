import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  totalReviews?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
  showCount = false,
  totalReviews
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = rating >= starValue;
          const isHalf = !isFilled && rating >= starValue - 0.5;

          return (
            <button
              type="button"
              key={index}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starValue)}
              className={`${
                interactive
                  ? 'cursor-pointer transition-transform hover:scale-115 focus:outline-none'
                  : 'cursor-default'
              }`}
            >
              <Star
                className={`${sizeClasses} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showCount && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {rating.toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-slate-400 font-normal"> ({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};
