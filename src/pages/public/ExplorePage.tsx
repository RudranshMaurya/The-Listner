import React, { useEffect, useState } from 'react';
import { subscribeToListeners } from '../../lib/database';
import type { ListenerProfile, ListenerStatus } from '../../types';
import { ListenerCard } from '../../components/talker/ListenerCard';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { Search, Filter, Sparkles, Users } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [listeners, setListeners] = useState<ListenerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'idle'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'sessions'>('rating');

  const topicsList = [
    'all',
    'Relationships',
    'Friendship',
    'Family',
    'Career',
    'Work stress',
    'Loneliness',
    'Personal growth',
    'General conversations'
  ];

  const languagesList = ['all', 'English', 'Hindi', 'Hinglish'];

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
      (l.bio && l.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTopic =
      selectedTopic === 'all' || (l.topics && l.topics.includes(selectedTopic));

    const matchesLanguage =
      selectedLanguage === 'all' || (l.languages && l.languages.includes(selectedLanguage));

    const matchesAvailability =
      availabilityFilter === 'all' || l.status === 'idle';

    return matchesSearch && matchesTopic && matchesLanguage && matchesAvailability;
  });

  filteredListeners.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    if (sortBy === 'experience') return (b.yearsExperience || 0) - (a.yearsExperience || 0);
    if (sortBy === 'sessions') return (b.totalSessions || 0) - (a.totalSessions || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Compassionate Listeners
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Find a patient, verified listener ready to hear you without judgment. Transparent rate: ₹5 per 2 minutes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by listener name, bio keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="sessions">Sort: Most Conversations</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mr-1">
            Status:
          </span>
          <button
            onClick={() => setAvailabilityFilter('all')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              availabilityFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Listeners
          </button>
          <button
            onClick={() => setAvailabilityFilter('idle')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              availabilityFilter === 'idle'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Available Now Only
          </button>

          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] ml-4 mr-1">
            Topic:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {topicsList.slice(0, 6).map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded-full font-medium capitalize transition-all ${
                  selectedTopic === topic
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Listeners */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : filteredListeners.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Listeners Matched Your Filter"
          description="Try broadening your search keywords or resetting topics to see more friendly listeners."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedTopic('all');
            setSelectedLanguage('all');
            setAvailabilityFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListeners.map((listener) => (
            <ListenerCard key={listener.uid} listener={listener} />
          ))}
        </div>
      )}
    </div>
  );
};
