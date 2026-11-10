import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToListenerAnalytics, subscribeToListener } from '../../lib/database';
import type { ListenerAnalytics, ListenerProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Eye,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const ListenerAnalyticsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<ListenerAnalytics | null>(null);
  const [listener, setListener] = useState<ListenerProfile | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubAnalytics = subscribeToListenerAnalytics(currentUser.uid, (data) => {
      setAnalytics(data);
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
      <Card variant="raised" padding="lg" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/10 text-accent text-caption font-semibold mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Profile Traffic</span>
          </div>
          <h2 className="text-title text-text tracking-tight">
            Listener Analytics
          </h2>
          <p className="text-small text-text-muted mt-1 max-w-xl leading-relaxed">
            Real-time analytics on how many people visit your listener page, who is viewing your profile, and conversation conversion rate.
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0 bg-surface px-5 py-3.5 rounded-card border border-border">
          <p className="text-caption uppercase font-semibold text-text-muted">Total Page Visits</p>
          <p className="text-3xl font-bold text-accent font-mono mt-0.5">
            {totalViews}
          </p>
          <p className="text-caption text-text-muted mt-0.5">{uniqueVisitors} unique talkers</p>
        </div>
      </Card>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-caption uppercase font-semibold text-text-muted">Total Visits</p>
            <div className="w-7 h-7 rounded-pill bg-surface border border-border text-text-muted flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text mt-2 font-mono">
            {totalViews}
          </p>
          <p className="text-caption text-text-muted mt-1">Profile impressions</p>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-caption uppercase font-semibold text-text-muted">Unique Talkers</p>
            <div className="w-7 h-7 rounded-pill bg-surface border border-border text-success flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text mt-2 font-mono">
            {uniqueVisitors}
          </p>
          <p className="text-caption text-text-muted mt-1">Distinct visitors</p>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-caption uppercase font-semibold text-text-muted">Conversations</p>
            <div className="w-7 h-7 rounded-pill bg-surface border border-border text-accent flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text mt-2 font-mono">
            {totalSessions}
          </p>
          <p className="text-caption text-text-muted mt-1">Sessions started</p>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-caption uppercase font-semibold text-text-muted">Conversion</p>
            <div className="w-7 h-7 rounded-pill bg-surface border border-border text-accent flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text mt-2 font-mono">
            {conversionRate}%
          </p>
          <p className="text-caption text-text-muted mt-1">Visits to sessions</p>
        </Card>
      </div>

      {/* Who All Visited: Visitors Feed Table */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 className="text-small font-semibold text-text flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <span>People Who Visited Your Profile</span>
            </h3>
            <p className="text-caption text-text-muted mt-0.5">
              Live log of talkers who opened or viewed your listener profile.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            {visitorsList.length} Logged Visitors
          </Badge>
        </div>

        {visitorsList.length === 0 ? (
          <EmptyState
            icon={<Eye className="w-5 h-5 text-text-muted" />}
            title="No Profile Visitors Recorded Yet"
            description="When talkers view your profile from the dashboard or listener list, their visit timestamp and count will update here automatically."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visitorsList.map((v, i) => (
              <div
                key={v.visitorId + i}
                className="flex items-center justify-between p-3.5 rounded-input bg-surface border border-border"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={v.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.visitorId}`}
                    alt={v.visitorName}
                    className="w-9 h-9 rounded-pill object-cover bg-surface border border-border"
                  />
                  <div>
                    <p className="text-caption font-semibold text-text">
                      {v.visitorName}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {new Date(v.lastVisitedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Badge variant="neutral" size="sm">
                  {v.visitCount} {v.visitCount === 1 ? 'visit' : 'visits'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
