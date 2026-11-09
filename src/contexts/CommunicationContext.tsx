import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { subscribeToUserSessions, acceptSession, rejectSession } from '../lib/database';
import type { Session } from '../types';

interface CommunicationContextType {
  activeSession: Session | null;
  incomingSession: Session | null;
  acceptIncoming: () => Promise<void>;
  rejectIncoming: () => Promise<void>;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, role } = useAuth();
  const [incomingSession, setIncomingSession] = useState<Session | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !role) {
      setIncomingSession(null);
      setActiveSession(null);
      return;
    }

    const unsubscribe = subscribeToUserSessions(currentUser.uid, role === 'admin' ? 'listener' : role, (sessions) => {
      // Find requested incoming session for listener
      if (role === 'listener') {
        const incoming = sessions.find((s) => s.status === 'requested' && Date.now() - s.requestedAt < 60000);
        setIncomingSession(incoming || null);
      }

      // Find active session
      const active = sessions.find((s) => s.status === 'active');
      setActiveSession(active || null);
    });

    return () => unsubscribe();
  }, [currentUser, role]);

  const acceptIncoming = async () => {
    if (!incomingSession) return;
    try {
      await acceptSession(incomingSession.id);
      const sid = incomingSession.id;
      setIncomingSession(null);
      navigate(`/session/${sid}`);
    } catch (e) {
      console.error("Failed to accept session:", e);
    }
  };

  const rejectIncoming = async () => {
    if (!incomingSession) return;
    try {
      await rejectSession(incomingSession.id, "Listener unavailable");
      setIncomingSession(null);
    } catch (e) {
      console.error("Failed to reject session:", e);
    }
  };

  return (
    <CommunicationContext.Provider
      value={{
        activeSession,
        incomingSession,
        acceptIncoming,
        rejectIncoming
      }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

export function useCommunication() {
  const context = useContext(CommunicationContext);
  if (!context) throw new Error('useCommunication must be used within CommunicationProvider');
  return context;
}
