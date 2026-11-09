/**
 * The Listener Billing & Pricing Engine
 *
 * Rules:
 * - Default rate: ₹5 for every 2 minutes (120 seconds) = ₹2.50/min
 * - Integer paise calculation to prevent floating point inaccuracies:
 *   1 Rupee = 100 paise
 *   ₹5.00 = 500 paise per 120 seconds (250 paise per 60 seconds)
 * - Minimum withdrawal amount: ₹200 (20,000 paise)
 * - Commission: Initially 0% unless changed by Admin
 */

export const DEFAULT_RATE_PAISE_PER_MIN = 250; // ₹2.50 per min (₹5 for 2 min)
export const MIN_WITHDRAWAL_PAISE = 20000; // ₹200.00
export const DEFAULT_COMMISSION_PCT = 0; // 0%

/**
 * Calculate charge in integer paise for a given active duration in seconds
 */
export function calculateCharge(durationSeconds: number, ratePaisePerMin: number = DEFAULT_RATE_PAISE_PER_MIN): number {
  if (durationSeconds <= 0) return 0;
  // Calculate based on ₹5 per 120 seconds blocks or exact fractional equivalent in integer paise
  // 1 second rate = (ratePaisePerMin / 60)
  const charge = Math.round((durationSeconds * ratePaisePerMin) / 60);
  return charge;
}

/**
 * Calculate listener earnings and platform fee
 */
export function calculateEarningsSplit(
  totalChargePaise: number,
  platformCommissionPct: number = DEFAULT_COMMISSION_PCT
): { listenerEarningsPaise: number; platformFeePaise: number } {
  const platformFeePaise = Math.round((totalChargePaise * platformCommissionPct) / 100);
  const listenerEarningsPaise = Math.max(0, totalChargePaise - platformFeePaise);
  return { listenerEarningsPaise, platformFeePaise };
}

/**
 * Format duration in seconds to "MM:SS" or "HH:MM:SS"
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
