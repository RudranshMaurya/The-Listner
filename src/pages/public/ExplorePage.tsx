import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToListeners } from '../../lib/database';
import type { ListenerProfile } from '../../types';
import { ListenerCard } from '../../components/talker/ListenerCard';
import { TopupModal } from '../../components/talker/TopupModal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  Sparkles,
  Users
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();

  const [listeners, setListeners] = useState<ListenerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'sessions'>('rating');

  const actionParam = ((searchParams.get('type') as 'chat' | 'call') || 'both') as 'chat' | 'call' | 'both';

  const categories = [
    { id: 'all', label: 'All', icon: '▦' },
    { id: 'new', label: 'NEW!', icon: '✦' },
    { id: 'relationships', label: 'Love & Dating', icon: '♡' },
    { id: 'stress', label: 'Stress & Anxiety', icon: '☁' },
    { id: 'career', label: 'Career & Work', icon: '🎓' },
    { id: 'loneliness', label: 'Loneliness', icon: '☀' },
    { id: 'casual', label: 'Casual Talk', icon: '☕' }
  ];

  useEffect(() => {
    const unsubscribe = subscribeToListeners((list) => {
      setListeners(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredListeners = listeners.filter((l) => {
    const matchesSearch =
      l.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.bio && l.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.topics && l.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (l.languages && l.languages.some((lang) => lang.toLowerCase().includes(searchTerm.toLowerCase())));

    let matchesCategory = true;
    if (selectedCategory === 'new') {
      matchesCategory = (l.totalSessions || 0) < 50;
    } else if (selectedCategory === 'relationships') {
      matchesCategory = l.topics?.some((t) => /relation|love|dating|marriage/i.test(t)) ?? true;
    } else if (selectedCategory === 'stress') {
      matchesCategory = l.topics?.some((t) => /stress|anxiety|overthinking|grief/i.test(t)) ?? true;
    } else if (selectedCategory === 'career') {
      matchesCategory = l.topics?.some((t) => /career|work|job|growth/i.test(t)) ?? true;
    } else if (selectedCategory === 'loneliness') {
      matchesCategory = l.topics?.some((t) => /lonely|loneliness|listen/i.test(t)) ?? true;
    } else if (selectedCategory === 'casual') {
      matchesCategory = true;
    }

    return matchesSearch && matchesCategory;
  });

  filteredListeners.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    if (sortBy === 'experience') return (b.yearsExperience || 0) - (a.yearsExperience || 0);
    if (sortBy === 'sessions') return (b.totalSessions || 0) - (a.totalSessions || 0);
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-left">
      {/* 1. Header Hero Card */}
      {currentUser && role !== 'listener' ? (
        <Card variant="raised" padding="lg" className="border border-border/80 text-center">
          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/10 text-accent text-caption font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Special Offer</span>
            </div>
            <h2 className="text-title text-text tracking-tight">
              50% Extra Credits
            </h2>
            <p className="text-small text-text-muted">
              Get bonus conversation credits on your next recharge.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsTopupOpen(true)}
              >
                Recharge Credits
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Clean Intro Banner for Unauthenticated Visitors / Listeners */
        <Card variant="default" padding="lg" className="border border-border/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent/10 text-accent text-caption font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Listeners</span>
              </div>
              <h1 className="text-title text-text tracking-tight">
                Find Someone Ready to Listen
              </h1>
              <p className="text-small text-text-muted mt-1 max-w-xl leading-relaxed">
                A private, respectful space to talk through anything on your mind with verified human listeners.
              </p>
            </div>
            {!currentUser && (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/login')}
                className="shrink-0"
              >
                Sign In to Connect
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* 2. Search & Mode (All / Chat / Call) */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search listener by name, language, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 rounded-input border border-border bg-surface pl-10 pr-4 text-small text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
        </div>

        {/* Action filter pill (All / Chat / Call) */}
        <div className="flex items-center bg-surface p-1 rounded-pill border border-border shrink-0 text-caption font-medium">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-3.5 py-1.5 rounded-pill transition-all cursor-pointer ${
              actionParam === 'both'
                ? 'bg-surface-raised text-text shadow-soft font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ type: 'chat' })}
            className={`px-3.5 py-1.5 rounded-pill transition-all cursor-pointer ${
              actionParam === 'chat'
                ? 'bg-surface-raised text-accent shadow-soft font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ type: 'call' })}
            className={`px-3.5 py-1.5 rounded-pill transition-all cursor-pointer ${
              actionParam === 'call'
                ? 'bg-surface-raised text-accent shadow-soft font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Call
          </button>
        </div>
      </div>

      {/* 3. Horizontal Scrollable Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-pill border text-caption font-medium shrink-0 transition-all cursor-pointer ${
            showAdvancedFilters
              ? 'border-accent bg-accent/10 text-accent font-semibold'
              : 'border-border bg-surface text-text-muted hover:text-text'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Sort & Filter</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-pill border text-caption shrink-0 transition-all cursor-pointer active:scale-98 ${
                isSelected
                  ? 'border-accent bg-accent text-accent-contrast font-semibold shadow-soft'
                  : 'border-border bg-surface text-text-muted hover:text-text'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvancedFilters && (
        <Card variant="raised" padding="sm" className="space-y-3 animate-apple-fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-caption font-semibold text-text uppercase tracking-wider">
              Sort Listeners By
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-input border border-border bg-surface px-3 py-1.5 text-small text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="sessions">Most Completed Sessions</option>
            </select>
          </div>
        </Card>
      )}

      {/* 4. Listeners Cards List */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-card bg-surface border border-border p-5 h-36 animate-pulse"
              />
            ))}
          </div>
        ) : filteredListeners.length === 0 ? (
          <EmptyState
            icon={<Users className="w-5 h-5 text-text-muted" />}
            title="No Listeners Online Right Now"
            description="Listeners become available throughout the day. Check back soon, or earn by becoming a verified listener yourself."
            action={
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/become-a-listener')}
              >
                Become a Listener & Earn
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListeners.map((listener) => (
              <ListenerCard
                key={listener.uid}
                listener={listener}
                preferredAction={actionParam}
              />
            ))}
          </div>
        )}
      </div>

      {/* TopupModal only if user is logged in */}
      {currentUser && (
        <TopupModal
          isOpen={isTopupOpen}
          onClose={() => setIsTopupOpen(false)}
          initialAmount={100}
        />
      )}
    </div>
  );
};
