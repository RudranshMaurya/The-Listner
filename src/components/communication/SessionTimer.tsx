import React, { useEffect, useState } from 'react';
import type { Session, Wallet } from '../../types';
import { calculateCharge, formatDuration, DEFAULT_RATE_PAISE_PER_MIN } from '../../lib/billing';
import { formatPaise } from '../../lib/upi';
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
  const [estimatedChargePaise, setEstimatedChargePaise] = useState<number>(0);
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
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="font-mono tracking-wide">
          {formatDuration(elapsedSeconds)}
        </span>
        <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-normal">
          ({minutesPassed} {minutesPassed === 1 ? 'min' : 'mins'} passed)
        </span>
      </div>

      {lowBalanceAlerted && session.status === 'active' && (
        <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Low balance: less than 2 mins left</span>
        </div>
      )}
    </div>
  );
};
