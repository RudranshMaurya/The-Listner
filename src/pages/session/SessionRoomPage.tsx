import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  subscribeToSession,
  subscribeToMessages,
  sendMessage,
  setTypingIndicator,
  subscribeToTyping,
  endSession,
  getWallet
} from '../../lib/database';
import { WebRTCConnectionManager } from '../../lib/webrtc';
import { SessionTimer } from '../../components/communication/SessionTimer';
import { ReviewModal } from '../../components/communication/ReviewModal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import type { Session, ChatMessage, Wallet } from '../../types';
import {
  Send,
  Phone,
  Mic,
  MicOff,
  LogOut,
  Sparkles
} from 'lucide-react';

export const SessionRoomPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const [talkerWallet, setTalkerWallet] = useState<Wallet | null>(null);

  // WebRTC state
  const [rtcManager, setRtcManager] = useState<WebRTCConnectionManager | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modals
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load Session and Wallet
  useEffect(() => {
    if (!sessionId || !currentUser) return;

    const unsubSession = subscribeToSession(sessionId, async (s) => {
      setSession(s);
      if (s && s.talkerId) {
        const w = await getWallet(s.talkerId);
        setTalkerWallet(w);
      }
    });

    const unsubMessages = subscribeToMessages(sessionId, (msgs) => {
      setMessages(msgs);
    });

    const unsubTyping = subscribeToTyping(sessionId, (t) => {
      setTypingMap(t);
    });

    return () => {
      unsubSession();
      unsubMessages();
      unsubTyping();
    };
  }, [sessionId, currentUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebRTC Audio Call Handling
  useEffect(() => {
    if (!sessionId || !currentUser || !session) return;
    if (session.type !== 'audio' || session.status !== 'active') return;

    const manager = new WebRTCConnectionManager(sessionId, currentUser.uid);
    setRtcManager(manager);

    manager.setCallbacks(
      (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch((e) => console.warn('Audio play error:', e));
        }
      },
      (state) => {
        setConnectionState(state);
      }
    );

    // If talker, initiate offer. If listener, answer offer.
    if (currentUser.uid === session.talkerId) {
      manager.startCall().catch((e) => console.error('Start call error:', e));
    } else {
      manager.answerCall().catch((e) => console.error('Answer call error:', e));
    }

    return () => {
      manager.endCall();
    };
  }, [sessionId, currentUser?.uid, session?.status, session?.type]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !sessionId || !currentUser || !session) return;

    const text = inputText.trim();
    setInputText('');
    setTypingIndicator(sessionId, currentUser.uid, false);

    try {
      await sendMessage(sessionId, {
        sessionId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        senderRole: currentUser.uid === session.talkerId ? 'talker' : 'listener',
        text
      });
    } catch {
      showToast('error', 'Failed to deliver message.');
    }
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (sessionId && currentUser) {
      setTypingIndicator(sessionId, currentUser.uid, val.length > 0);
    }
  };

  const handleToggleMute = () => {
    if (!rtcManager) return;
    const nextMuted = !isMuted;
    rtcManager.toggleMute(nextMuted);
    setIsMuted(nextMuted);
  };

  const handleEndConversation = async () => {
    if (!sessionId || !currentUser) return;
    try {
      setIsEnding(true);
      if (rtcManager) {
        rtcManager.endCall();
      }

      const completedSession = await endSession(sessionId, currentUser.uid, 'User ended session cleanly');
      setSession(completedSession);
      setIsEndConfirmOpen(false);

      // If user is Talker, show review prompt
      if (currentUser.uid === completedSession.talkerId) {
        setIsReviewOpen(true);
      } else {
        showToast('info', 'Conversation ended. Returning to dashboard...');
        setTimeout(() => navigate('/listener/dashboard'), 1500);
      }
    } catch (e: any) {
      showToast('error', e.message || 'Failed to end session.');
    } finally {
      setIsEnding(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-pill animate-spin" />
      </div>
    );
  }

  const isTalker = currentUser?.uid === session.talkerId;
  const partnerName = isTalker ? session.listenerName : session.talkerName;
  const partnerPhoto = isTalker ? session.listenerPhoto : session.talkerPhoto;
  const partnerId = isTalker ? session.listenerId : session.talkerId;
  const isPartnerTyping = !!typingMap[partnerId];

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-8rem)]">
      {/* Hidden audio element for WebRTC audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Header Card: Partner Info, Timer, Controls */}
      <Card padding="sm" className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative shrink-0">
            <img
              src={partnerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`}
              alt={partnerName}
              className="w-11 h-11 rounded-card object-cover bg-surface border border-border"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-pill bg-success ring-2 ring-surface" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-small font-semibold text-text">
                {partnerName}
              </h3>
              <Badge variant={isTalker ? 'success' : 'neutral'} size="sm">
                {isTalker ? 'Verified Listener' : 'Talker'}
              </Badge>
            </div>
            <p className="text-caption text-text-muted">
              {session.type === 'audio' ? 'Encrypted Audio Call' : 'Real-time Safe Chat'}
              {session.status === 'active' && ' • Live'}
            </p>
          </div>
        </div>

        {/* Live Timer & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end w-full sm:w-auto">
          <SessionTimer
            session={session}
            talkerWallet={talkerWallet}
            onLowBalance={() => {
              if (isTalker) {
                showToast('warning', 'Low credits balance: You have less than 2 minutes of conversation credits remaining.');
              }
            }}
            onAutoEndSession={() => {
              showToast('error', 'Credits exhausted. Ending conversation safely.');
              handleEndConversation();
            }}
          />

          {session.status === 'active' && (
            <Button
              onClick={() => setIsEndConfirmOpen(true)}
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              End Session
            </Button>
          )}
        </div>
      </Card>

      {/* WebRTC Audio Call Bar (if audio type) */}
      {session.type === 'audio' && session.status === 'active' && (
        <Card padding="sm" className="mt-2.5 flex items-center justify-between bg-surface border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-pill bg-surface-raised border border-border flex items-center justify-center">
              <Phone className="w-4 h-4 text-success animate-pulse" />
            </div>
            <div>
              <p className="text-caption font-semibold text-text">WebRTC Audio Connected</p>
              <p className="text-[11px] text-text-muted">
                Quality: {connectionState === 'connected' ? 'High definition' : connectionState}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleMute}
              variant={isMuted ? 'danger' : 'secondary'}
              size="sm"
              leftIcon={isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
        </Card>
      )}

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto my-3 p-4 rounded-card bg-surface border border-border shadow-soft space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <Sparkles className="w-6 h-6 text-accent mb-2" />
            <h4 className="text-small font-semibold text-text">
              Session is ready.
            </h4>
            <p className="text-caption text-text-muted max-w-sm mt-1">
              "Sometimes, you don't need advice. You just need someone who listens."
              Say hello and begin speaking freely!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-apple-fade-in`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-card text-small leading-relaxed text-left ${
                    isMe
                      ? 'bg-accent text-accent-contrast font-normal rounded-br-xs shadow-soft'
                      : 'bg-surface-raised text-text rounded-bl-xs border border-border'
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                </div>
                <span className="text-[10px] text-text-muted mt-0.5 px-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {isPartnerTyping && (
          <div className="flex items-center gap-1.5 text-caption text-text-muted italic">
            <span className="w-1.5 h-1.5 rounded-pill bg-accent animate-ping" />
            <span>{partnerName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      {session.status === 'active' ? (
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${partnerName}...`}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            className="flex-1 h-11 rounded-pill border border-border bg-surface px-4 text-small text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim()}
            className="rounded-pill px-4"
            rightIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      ) : session.status === 'requested' ? (
        <div className="p-3.5 rounded-card bg-surface border border-border text-center text-caption text-text flex items-center justify-between gap-3 animate-apple-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-pill bg-warning animate-ping" />
            <span className="font-medium">Connecting... Waiting for {partnerName} to accept session</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndConversation}
          >
            Cancel Request
          </Button>
        </div>
      ) : (
        <div className="p-3.5 rounded-card bg-surface text-center text-caption text-text-muted border border-border">
          This conversation is completed.
          {isTalker && !session.reviewSubmitted && (
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              className="ml-2 text-accent font-medium underline cursor-pointer"
            >
              Leave a Review
            </button>
          )}
        </div>
      )}

      {/* End Conversation Confirmation Modal */}
      <Modal
        isOpen={isEndConfirmOpen}
        onClose={() => setIsEndConfirmOpen(false)}
        title="End Conversation?"
        description="Billing stops immediately upon ending. The final charge will be debited from credits according to active server duration."
      >
        <div className="space-y-4 text-left">
          <p className="text-small text-text-muted">
            Are you sure you want to conclude this session with {partnerName}?
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setIsEndConfirmOpen(false)}>
              Keep Talking
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={isEnding}
              onClick={handleEndConversation}
            >
              Confirm & End
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal for Talker */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          navigate('/talker/conversations');
        }}
        session={session}
        onSubmitted={() => {
          navigate('/talker/conversations');
        }}
      />
    </div>
  );
};
