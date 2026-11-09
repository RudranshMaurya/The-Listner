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

  return (
    <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-sm text-left">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="font-mono text-sm font-bold tracking-wider">
          {formatDuration(elapsedSeconds)}
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      <div>
        <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Estimated Cost</p>
        <p className="text-xs font-bold text-emerald-400 font-mono">
          {formatPaise(estimatedChargePaise)}
        </p>
      </div>

      {lowBalanceAlerted && session.status === 'active' && (
        <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Low balance (&lt; 2 min left)</span>
        </div>
      )}
    </div>
  );
};
