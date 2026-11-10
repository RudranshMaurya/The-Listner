import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  subscribeToListener,
  subscribeToReviews,
  getListenerSchedule,
  requestSession,
  getWallet,
  recordListenerProfileVisit
} from '../../lib/database';
import type { ListenerProfile, Review, ListenerSchedule, SessionType } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { StarRating } from '../../components/common/StarRating';
import { BookingModal } from '../../components/talker/BookingModal';
import { TopupModal } from '../../components/talker/TopupModal';
import {
  CheckCircle2,
  MessageSquare,
  PhoneCall,
  Calendar,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export const ListenerProfilePage: React.FC = () => {
  const { listenerId } = useParams<{ listenerId: string }>();
  const { currentUser, role, profile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [listener, setListener] = useState<ListenerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [, setSchedule] = useState<ListenerSchedule | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!listenerId) return;

    const unsubListener = subscribeToListener(listenerId, (l) => setListener(l));
    const unsubReviews = subscribeToReviews(listenerId, (r) => setReviews(r));
    getListenerSchedule(listenerId).then((sch) => setSchedule(sch));

    // Record visitor analytics if visitor is not the listener themselves
    if (currentUser?.uid !== listenerId) {
      recordListenerProfileVisit(listenerId, {
        uid: currentUser?.uid,
        name: profile?.displayName || currentUser?.displayName || 'Anonymous Talker',
        role: role || 'talker',
        photoURL: profile?.photoURL || currentUser?.photoURL || ''
      });
    }

    return () => {
      unsubListener();
      unsubReviews();
    };
  }, [listenerId, currentUser?.uid, role, profile?.displayName, profile?.photoURL]);

  const handleStartSession = async (type: SessionType) => {
    if (!currentUser || !listener) {
      navigate('/login');
      return;
    }

    // Check talker wallet balance first
    const wallet = await getWallet(currentUser.uid);
    if ((wallet.balancePaise || 0) < 500) {
      showToast('warning', 'Please add credits to your account before starting a paid session. Minimum ₹5 required.');
      setIsTopupOpen(true);
      return;
    }

    try {
      setIsConnecting(true);
      const sessionId = await requestSession({
        talkerId: currentUser.uid,
        talkerName: currentUser.displayName || 'Talker',
        talkerPhoto: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
        listenerId: listener.uid,
        listenerName: listener.displayName,
        listenerPhoto: listener.photoURL,
        type
      });

      showToast('success', `Connection request sent to ${listener.displayName}!`);
      navigate(`/session/${sessionId}`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to start session.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!listener) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-pill animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-left space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Listeners
      </Button>

      {/* Main Profile Header Card */}
      <Card variant="raised" padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border pb-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={listener.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.uid}`}
                alt={listener.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-card object-cover bg-surface border border-border"
              />
              {listener.isVerified && (
                <span
                  className="absolute -bottom-1 -right-1 p-1 rounded-pill bg-accent text-accent-contrast shadow-soft"
                  title="Platform-verified Listener"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-title text-text tracking-tight">
                  {listener.displayName}
                </h1>
                <StatusBadge status={listener.status} />
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-caption text-text-muted">
                <span>{listener.yearsExperience} yrs experience</span>
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

              <div className="flex items-center gap-3 mt-3">
                <StarRating rating={listener.rating || 5.0} size="sm" showCount totalReviews={listener.totalReviews || 0} />
                <span className="text-border">•</span>
                <span className="text-caption text-text-muted font-medium">
                  {listener.totalSessions || 0} completed conversations
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="w-full sm:w-auto p-4 rounded-card bg-surface border border-border text-center sm:text-right">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">Standard Rate</p>
            <p className="text-xl font-bold text-text mt-0.5">
              ₹5 <span className="text-caption font-normal text-text-muted">/ 2 mins</span>
            </p>
            <p className="text-caption text-text-muted mt-0.5">₹2.50 per min active time</p>
          </div>
        </div>

        {/* Action Buttons: Only shown to talkers/guests, NEVER to listeners */}
        {role === 'listener' ? (
          <div className="mt-6 p-4 rounded-input bg-surface border border-border text-small text-text flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
            <div>
              <p className="font-semibold text-text">Public Listener Profile Preview</p>
              <p className="text-caption text-text-muted mt-0.5">
                Talkers browsing the site can start text chat, audio calls, or schedule appointments with you from this page.
              </p>
            </div>
            {currentUser?.uid === listener.uid && (
              <Button size="sm" variant="outline" onClick={() => navigate('/listener/profile')} className="shrink-0">
                Edit Your Profile
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              size="md"
              variant="primary"
              disabled={listener.status !== 'idle'}
              isLoading={isConnecting}
              onClick={() => handleStartSession('chat')}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              {listener.status === 'idle' ? 'Start Text Chat' : 'Listener Busy'}
            </Button>

            <Button
              size="md"
              variant="secondary"
              disabled={listener.status !== 'idle'}
              isLoading={isConnecting}
              onClick={() => handleStartSession('audio')}
              leftIcon={<PhoneCall className="w-4 h-4" />}
            >
              Start Audio Call
            </Button>

            <Button
              size="md"
              variant="outline"
              onClick={() => setIsBookingOpen(true)}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Schedule for Later
            </Button>
          </div>
        )}
      </Card>

      {/* Bio & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <Card padding="md">
            <h3 className="text-small font-semibold text-text mb-2">
              About {listener.displayName}
            </h3>
            <p className="text-small text-text-muted leading-relaxed whitespace-pre-line">
              {listener.bio || "I am here to offer a welcoming, gentle, and non-judgmental presence. Feel free to talk about whatever is weighing on your mind."}
            </p>
          </Card>

          {/* Topics & Languages */}
          <Card padding="md" className="space-y-4">
            <div>
              <h4 className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-2">
                Topics {listener.displayName} Listens To
              </h4>
              <div className="flex flex-wrap gap-2">
                {(listener.topics || []).map((topic) => (
                  <span
                    key={topic}
                    className="text-caption font-medium px-3 py-1 rounded-pill bg-surface border border-border text-text"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-2">
                Languages Spoken
              </h4>
              <div className="flex flex-wrap gap-2">
                {(listener.languages || ['English', 'Hindi']).map((lang) => (
                  <span
                    key={lang}
                    className="text-caption font-medium px-3 py-1 rounded-pill bg-surface border border-border text-text-muted"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Reviews & Feedback */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-small font-semibold text-text flex items-center gap-2">
                <StarRating rating={listener.rating || 5.0} size="sm" />
                <span>Reviews ({reviews.length})</span>
              </h3>
            </div>

            {reviews.length === 0 ? (
              <p className="text-caption text-text-muted py-3">
                No reviews yet. Be the first to have a conversation with {listener.displayName}!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-input bg-surface border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-caption font-semibold text-text">
                        {rev.talkerName}
                      </span>
                      <StarRating rating={rev.rating} size="sm" />
                    </div>
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rev.tags.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-pill bg-accent/10 text-accent font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-caption text-text-muted italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Trust & Safety info */}
        <div className="space-y-4">
          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-2 text-accent font-semibold text-caption uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Safety</span>
            </div>
            <ul className="text-caption text-text-muted space-y-2">
              <li>✓ Verified active listener assessment</li>
              <li>✓ Zero phone numbers or private UPI exposed</li>
              <li>✓ Encrypted WebRTC audio calling</li>
              <li>✓ Transparent ₹5 / 2 minutes rate</li>
            </ul>
          </Card>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        listener={listener}
      />

      <TopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        initialAmount={100}
      />
    </div>
  );
};
