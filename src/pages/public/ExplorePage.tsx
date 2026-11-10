import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToListeners } from '../../lib/database';
import type { ListenerProfile, SessionType } from '../../types';
import { ListenerCard } from '../../components/talker/ListenerCard';
import { TopupModal } from '../../components/talker/TopupModal';
import {
  Search,
  Filter,
  Sparkles,
  Users,
  Coins
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
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 text-left">
      {/* 1. Header Banner: Only show top-up / recharge banner if LOGGED IN as Talker */}
      {currentUser && role !== 'listener' ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF6E5] via-[#FFFDF7] to-[#FFF0D4] dark:from-[#26221B] dark:via-[#1F1C18] dark:to-[#26221B] border border-amber-200/70 dark:border-amber-900/40 p-5 sm:p-7 text-center shadow-xs">
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🪙</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-amber-100 tracking-tight">
                50% Cashback!
              </h2>
              <span className="text-xl">🪙</span>
            </div>

            <p className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-stone-600 dark:text-stone-300">
              ON NEXT RECHARGE
            </p>

            <div className="mt-3">
              <button
                onClick={() => setIsTopupOpen(true)}
                className="px-6 py-2 rounded-full bg-[#F5C518] hover:bg-[#E5B508] active:scale-95 text-stone-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                RECHARGE NOW
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Clean Intro Banner for Unauthenticated Visitors / Listeners (NO Topup) */
        <div className="rounded-3xl bg-white dark:bg-[#1F1D1A] border border-gray-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-2xs text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/40 text-[11px] font-bold mb-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Compassionate & Empathetic Listeners</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Find Someone Ready to Listen
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl leading-relaxed">
                A private, respectful space to talk through anything on your mind with verified human listeners.
              </p>
            </div>
            {!currentUser && (
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-full bg-[#F5C518] hover:bg-[#E5B508] text-stone-950 font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all shrink-0 cursor-pointer"
              >
                Sign In to Connect
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Search & Mode (All / Chat / Call) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search listener by name, language, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all shadow-2xs"
          />
        </div>

        {/* Action filter pill (All / Chat / Call) */}
        <div className="flex items-center bg-gray-100 dark:bg-stone-800/80 p-1 rounded-2xl border border-gray-200 dark:border-stone-800 shrink-0 text-xs">
          <button
            onClick={() => setSearchParams({})}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              actionParam === 'both'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSearchParams({ type: 'chat' })}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              actionParam === 'chat'
                ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setSearchParams({ type: 'call' })}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              actionParam === 'call'
                ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Call
          </button>
        </div>
      </div>

      {/* 3. Horizontal Scrollable Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            showAdvancedFilters
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
              : 'border-gray-200 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] text-stone-700 dark:text-stone-300 hover:border-gray-300'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <span>Filter</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'border-amber-400 bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 ring-1 ring-amber-400/50 shadow-2xs'
                  : 'border-gray-200 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] text-stone-600 dark:text-stone-300 hover:border-gray-300 dark:hover:border-stone-700'
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
        <div className="rounded-2xl border border-gray-200 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] p-4 text-xs space-y-3 animate-apple-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-800 dark:text-white uppercase tracking-wider text-[11px]">
              Sort Listeners By
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs text-stone-900 dark:text-white focus:outline-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="sessions">Most Completed Sessions</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. Listeners Cards List */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] p-4 h-28 animate-pulse"
              />
            ))}
          </div>
        ) : filteredListeners.length === 0 ? (
          <div className="rounded-3xl border border-gray-200/90 dark:border-stone-800 bg-white dark:bg-[#1F1D1A] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                No Listeners Online Right Now
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Listeners become available throughout the day. Check back soon, or earn by becoming a verified listener yourself.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => navigate('/become-a-listener')}
                className="px-6 py-2.5 rounded-full bg-[#F5C518] hover:bg-[#E5B508] text-stone-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Become a Listener & Earn
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
