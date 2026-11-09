import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ListenerProfile } from '../../types';
import { Card } from '../common/Card';
import { Badge, StatusBadge } from '../common/Badge';
import { StarRating } from '../common/StarRating';
import { Button } from '../common/Button';
import { CheckCircle2, MessageSquare, PhoneCall, Globe, Sparkles } from 'lucide-react';

export interface ListenerCardProps {
  listener: ListenerProfile;
}

export const ListenerCard: React.FC<ListenerCardProps> = ({ listener }) => {
  const navigate = useNavigate();

  return (
    <Card
      hover
      onClick={() => navigate(`/talker/listener/${listener.uid}`)}
      className="p-5 text-left cursor-pointer transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Top Header: Avatar, Name, Verification, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={listener.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.uid}`}
                alt={listener.displayName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform"
              />
              {listener.isVerified && (
                <span
                  className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-teal-500 text-white shadow-xs"
                  title="Platform-verified Listener"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {listener.displayName}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{listener.yearsExperience} yrs exp</span>
                {listener.showAge && listener.age && (
                  <>
                    <span>•</span>
                    <span>{listener.age} yrs</span>
                  </>
                )}
                {listener.showGender && listener.gender && (
                  <>
                    <span>•</span>
                    <span>{listener.gender}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <StatusBadge status={listener.status} />
        </div>

        {/* Rating and Session Stats */}
        <div className="flex items-center gap-3 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <StarRating rating={listener.rating || 5.0} size="sm" showCount totalReviews={listener.totalReviews || 0} />
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {listener.totalSessions || 0} conversations
          </span>
        </div>

        {/* Short Bio */}
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {listener.bio || "Available to listen with complete empathy, patience, and non-judgmental respect."}
        </p>

        {/* Topics Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(listener.topics || []).slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {topic}
            </span>
          ))}
          {(listener.topics || []).length > 3 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 text-slate-400">
              +{listener.topics.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Languages, Price, and Action Button */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Starting Rate</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            ₹5 <span className="text-xs font-normal text-slate-500">/ 2 mins</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={listener.status === 'idle' ? 'primary' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/talker/listener/${listener.uid}`);
            }}
          >
            {listener.status === 'idle' ? 'Connect Now' : 'View Profile'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
