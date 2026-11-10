export type UserRole = 'talker' | 'listener' | 'admin';

export type ListenerStatus = 'idle' | 'busy' | 'listening' | 'offline';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'missed';

export type SessionType = 'chat' | 'audio';

export type SessionStatus = 'requested' | 'connecting' | 'active' | 'ended' | 'rejected' | 'cancelled';

export type TopupStatus = 
  | 'created'
  | 'pending'
  | 'notification_received'
  | 'verification_required'
  | 'verified'
  | 'credited'
  | 'failed'
  | 'expired'
  | 'rejected';

export type WithdrawalStatus = 
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'rejected'
  | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  age?: number;
  gender?: string;
  location?: string;
  timezone?: string;
  preferredLanguage?: string;
  bio?: string;
  topics?: string[];
  termsAccepted?: boolean;
  onboardingCompleted?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface ListenerProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  age?: number;
  gender?: string;
  yearsExperience: number;
  topics: string[];
  languages: string[];
  pricingPaisePerMin: number; // e.g. 250 paise = ₹2.50 per min (₹5 per 2 min)
  rating: number;
  totalReviews: number;
  totalSessions: number;
  totalListeningMinutes: number;
  profileViews?: number;
  isVerified: boolean;
  verificationScore?: number;
  verificationStatus: 'unsubmitted' | 'pending' | 'passed' | 'failed';
  status: ListenerStatus;
  lastActive: number;
  showAge?: boolean;
  showGender?: boolean;
}

export interface VisitorRecord {
  visitorId: string;
  visitorName: string;
  visitorRole: string;
  lastVisitedAt: number;
  visitCount: number;
  photoURL?: string;
}

export interface ListenerAnalytics {
  listenerId: string;
  totalViews: number;
  uniqueVisitorsCount: number;
  visitors?: Record<string, VisitorRecord>;
  updatedAt: number;
}

export interface ListenerPrivateDetails {
  uid: string;
  upiId: string;
  bankAccountLast4?: string;
  realName?: string;
  phoneNumber?: string;
  idProofType?: string;
}

export interface DaySchedule {
  enabled: boolean;
  slots: { start: string; end: string }[];
}

export interface ListenerSchedule {
  uid: string;
  weekly: Record<string, DaySchedule>; // 'monday', 'tuesday', etc.
  acceptsImmediate: boolean;
  acceptsAppointments: boolean;
  timezone: string;
  updatedAt: number;
}

export interface Appointment {
  id: string;
  talkerId: string;
  talkerName: string;
  talkerPhoto: string;
  listenerId: string;
  listenerName: string;
  listenerPhoto: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "14:00 - 15:00"
  status: AppointmentStatus;
  sessionType: SessionType;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Session {
  id: string;
  type: SessionType;
  talkerId: string;
  talkerName: string;
  talkerPhoto: string;
  listenerId: string;
  listenerName: string;
  listenerPhoto: string;
  status: SessionStatus;
  requestedAt: number;
  acceptedAt?: number;
  startedAt?: number; // Billing timer starts when both active
  endedAt?: number;
  durationSeconds: number;
  billableSeconds: number;
  ratePaisePerMin: number;
  totalChargePaise: number;
  listenerEarningsPaise: number;
  platformFeePaise: number;
  reviewSubmitted?: boolean;
  endReason?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: 'talker' | 'listener';
  text: string;
  timestamp: number;
  read?: boolean;
}

export interface Wallet {
  uid: string;
  balancePaise: number; // e.g. 10000 paise = ₹100.00
  totalSpentPaise: number;
  totalEarnedPaise: number;
  withdrawablePaise: number;
  reservedPaise: number;
  updatedAt: number;
}

export interface WalletTransaction {
  id: string;
  uid: string;
  type: 'topup' | 'session_debit' | 'session_credit' | 'withdrawal_hold' | 'withdrawal_payout' | 'withdrawal_refund' | 'adjustment';
  amountPaise: number;
  previousBalancePaise: number;
  newBalancePaise: number;
  description: string;
  referenceId?: string;
  timestamp: number;
}

export interface TopupOrder {
  id: string; // e.g. "TL-928172"
  uid: string;
  userName: string;
  userEmail: string;
  amountRupees: number;
  amountPaise: number;
  status: TopupStatus;
  upiUri: string;
  destinationVpa: string;
  utrRef?: string;
  rawNotificationText?: string;
  createdAt: number;
  updatedAt?: number;
  confirmedAt?: number;
  confirmedBy?: string;
}

export interface WithdrawalRequest {
  id: string;
  uid: string;
  listenerName: string;
  listenerEmail?: string;
  amountRupees: number;
  amountPaise: number;
  upiId: string;
  status: WithdrawalStatus;
  utrRef?: string;
  adminNote?: string;
  requestedAt: number;
  processedAt?: number;
  processedBy?: string;
}

export interface Review {
  id: string;
  sessionId: string;
  talkerId: string;
  talkerName: string;
  talkerPhoto: string;
  listenerId: string;
  rating: number; // 1-5
  tags: string[];
  comment: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
  read: boolean;
  timestamp: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'withdrawal' | 'verification' | 'report' | 'system';
  data?: any;
  read: boolean;
  timestamp: number;
}

export interface AdminPlatformConfig {
  defaultRatePaisePerMin: number; // 250 paise = ₹2.50 / min (₹5 per 2 min)
  platformCommissionPct: number; // 0 initially
  minWithdrawalPaise: number; // 20000 paise = ₹200
  verificationPassScore: number; // 80 (%)
  maintenanceMode: boolean;
  emergencyHelplineNumber: string;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'topup' | 'withdrawal' | 'session' | 'config';
  targetId: string;
  details: string;
  timestamp: number;
}
