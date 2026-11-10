import React, { useEffect, useState } from 'react';
import type { Session, Wallet } from '../../types';
import { calculateCharge, formatDuration, DEFAULT_RATE_PAISE_PER_MIN } from '../../lib/billing';
import { Clock, AlertTriangle } from 'lucide-react';

export interface SessionTimerProps {
  session: Session;
  talkerWallet?: Wallet | null;
  onLowBalance?: () => void;
  onAutoEndSession?: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  session,
  talkerWallet,
  onLowBalance,
  onAutoEndSession
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [, setEstimatedChargePaise] = useState<number>(0);
  const [lowBalanceAlerted, setLowBalanceAlerted] = useState<boolean>(false);

  useEffect(() => {
    if (session.status !== 'active') {
      if (session.durationSeconds) {
        setElapsedSeconds(session.durationSeconds);
        setEstimatedChargePaise(session.totalChargePaise || 0);
      }
      return;
    }

    const startedAt = session.startedAt || session.acceptedAt || Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startedAt) / 1000));
      setElapsedSeconds(diffSecs);

      const charge = calculateCharge(diffSecs, session.ratePaisePerMin || DEFAULT_RATE_PAISE_PER_MIN);
      setEstimatedChargePaise(charge);

      // Low balance check for Talker
      if (talkerWallet && session.status === 'active') {
        const remainingPaise = talkerWallet.balancePaise - charge;
        // If remaining balance is less than 2 minutes of conversation (₹5 = 500 paise)
        if (remainingPaise <= 500 && !lowBalanceAlerted) {
          setLowBalanceAlerted(true);
          onLowBalance?.();
        }

        // If completely exhausted
        if (remainingPaise <= 0) {
          onAutoEndSession?.();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, talkerWallet, lowBalanceAlerted]);

  const minutesPassed = Math.floor(elapsedSeconds / 60);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface border border-border text-text shadow-soft text-caption font-semibold">
        <span className="w-2 h-2 rounded-pill bg-success animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-text-muted" />
        <span className="font-mono tracking-wide">
          {formatDuration(elapsedSeconds)}
        </span>
        <span className="text-[11px] text-text-muted font-normal">
          ({minutesPassed} {minutesPassed === 1 ? 'min' : 'mins'} passed)
        </span>
      </div>

      {lowBalanceAlerted && session.status === 'active' && (
        <div className="flex items-center gap-1 text-[11px] text-warning bg-warning/10 border border-warning/30 px-2.5 py-1 rounded-pill animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Low balance: &lt; 2 mins left</span>
        </div>
      )}
    </div>
  );
};
