import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToListenerAnalytics, subscribeToListener } from '../../lib/database';
import type { ListenerAnalytics, ListenerProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Eye,
  TrendingUp,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

export const ListenerAnalyticsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<ListenerAnalytics | null>(null);
  const [listener, setListener] = useState<ListenerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const unsubAnalytics = subscribeToListenerAnalytics(currentUser.uid, (data) => {
      setAnalytics(data);
      setLoading(false);
    });

    const unsubListener = subscribeToListener(currentUser.uid, (l) => {
      setListener(l);
    });

    return () => {
      unsubAnalytics();
      unsubListener();
    };
  }, [currentUser]);

  const totalViews = analytics?.totalViews || 0;
  const uniqueVisitors = analytics?.uniqueVisitorsCount || 0;
  const totalSessions = listener?.totalSessions || 0;
  const conversionRate = totalViews > 0 ? ((totalSessions / totalViews) * 100).toFixed(1) : '0.0';

  const visitorsList = analytics?.visitors
    ? Object.values(analytics.visitors).sort((a, b) => b.lastVisitedAt - a.lastVisitedAt)
    : [];

  return (
    <div className="space-y-6 text-left animate-apple-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#1F1D1A] via-[#272420] to-[#161412] text-white p-6 sm:p-8 shadow-xl border border-[#D4A373]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Site & Profile Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Listener Profile Traffic
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
            Real-time analytics on how many people visit your listener page, who is viewing your profile, and conversation conversion rate.
          </p>
        </div>

        <div className="text-right sm:text-right shrink-0 bg-white/10 dark:bg-black/30 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10">
          <p className="text-[10px] uppercase font-semibold text-stone-300">Total Page Visits</p>
          <p className="text-3xl font-black text-amber-400 font-mono mt-0.5">
            {totalViews}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">{uniqueVisitors} unique talkers</p>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase font-semibold text-stone-400">Total Visits</p>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-2 font-mono">
            {totalViews}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">Profile impressions</p>
        </Card>

        <Card hover className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase font-semibold text-stone-400">Unique Talkers</p>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-2 font-mono">
            {uniqueVisitors}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">Distinct visitors</p>
        </Card>

        <Card hover className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase font-semibold text-stone-400">Conversations</p>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-2 font-mono">
            {totalSessions}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">Sessions started</p>
        </Card>

        <Card hover className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase font-semibold text-stone-400">Conversion Rate</p>
            <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-2 font-mono">
            {conversionRate}%
          </p>
          <p className="text-[10px] text-stone-500 mt-1">Visits to sessions</p>
        </Card>
      </div>

      {/* Who All Visited: Visitors Feed Table */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>People Who Visited Your Profile</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Live log of talkers who opened or viewed your listener profile.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            {visitorsList.length} Logged Visitors
          </Badge>
        </div>

        {visitorsList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Eye className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              No Profile Visitors Recorded Yet
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              When talkers view your profile from the dashboard or listener list, their visit timestamp and count will update here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-stone-800">
            {visitorsList.map((v, index) => {
              const timeFormatted = new Date(v.lastVisitedAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div
                  key={v.visitorId + index}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        v.photoURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.visitorId}`
                      }
                      alt={v.visitorName}
                      className="w-10 h-10 rounded-full object-cover bg-amber-100 dark:bg-stone-700 ring-2 ring-amber-300/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900 dark:text-white">
                          {v.visitorName}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {v.visitorRole || 'Talker'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>Last visited {timeFormatted}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="warning" size="sm">
                      {v.visitCount} {v.visitCount === 1 ? 'view' : 'views'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
