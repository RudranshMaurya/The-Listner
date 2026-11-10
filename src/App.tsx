import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CommunicationProvider } from './contexts/CommunicationContext';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { ExplorePage } from './pages/public/ExplorePage';
import { BecomeListenerPage } from './pages/public/BecomeListenerPage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { CommunityGuidelinesPage } from './pages/public/CommunityGuidelinesPage';

// Auth & Onboarding Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OnboardingRolePage } from './pages/auth/OnboardingRolePage';
import { TalkerOnboardingPage } from './pages/onboarding/TalkerOnboardingPage';
import { ListenerOnboardingPage } from './pages/onboarding/ListenerOnboardingPage';
import { ListenerVerificationPage } from './pages/onboarding/ListenerVerificationPage';

// Talker Pages
import { TalkerDashboardPage } from './pages/talker/TalkerDashboardPage';
import { ListenerDirectoryPage } from './pages/talker/ListenerDirectoryPage';
import { ListenerProfilePage } from './pages/talker/ListenerProfilePage';
import { TalkerAppointmentsPage } from './pages/talker/TalkerAppointmentsPage';
import { TalkerConversationsPage } from './pages/talker/TalkerConversationsPage';
import { TalkerWalletPage } from './pages/talker/TalkerWalletPage';
import { TalkerNotificationsPage } from './pages/talker/TalkerNotificationsPage';
import { TalkerSettingsPage } from './pages/talker/TalkerSettingsPage';

// Listener Pages
import { ListenerDashboardPage } from './pages/listener/ListenerDashboardPage';
import { ListenerAnalyticsPage } from './pages/listener/ListenerAnalyticsPage';
import { ListenerProfileEditPage } from './pages/listener/ListenerProfileEditPage';
import { ListenerSchedulePage } from './pages/listener/ListenerSchedulePage';
import { ListenerAppointmentsPage } from './pages/listener/ListenerAppointmentsPage';
import { ListenerConversationsPage } from './pages/listener/ListenerConversationsPage';
import { ListenerEarningsPage } from './pages/listener/ListenerEarningsPage';
import { ListenerWalletPage } from './pages/listener/ListenerWalletPage';
import { ListenerReviewsPage } from './pages/listener/ListenerReviewsPage';
import { ListenerSettingsPage } from './pages/listener/ListenerSettingsPage';

// Real-time Session Room
import { SessionRoomPage } from './pages/session/SessionRoomPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';
import { AdminSessionsPage } from './pages/admin/AdminSessionsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminTopupsPage } from './pages/admin/AdminTopupsPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'talker' | 'listener' | 'admin';
}> = ({ children, allowedRole }) => {
  const { currentUser, role, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // CRITICAL: Never redirect away if already on any onboarding step
  if (location.pathname.startsWith('/onboarding')) {
    return <>{children}</>;
  }

  // Admin access bypass
  if (allowedRole === 'admin') {
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  const effectiveRole = role || profile?.role || (localStorage.getItem('tl_selected_role') as 'talker' | 'listener' | null);

  // If user hasn't selected role or completed profile, send to onboarding
  if (!effectiveRole) {
    return <Navigate to="/onboarding" replace />;
  }

  // Role mismatch check for role-specific routes (e.g. /talker vs /listener)
  if (allowedRole && effectiveRole && effectiveRole !== allowedRole) {
    return <Navigate to={effectiveRole === 'listener' ? '/listener/dashboard' : '/talker/dashboard'} replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <CommunicationProvider>
              <Routes>
                {/* Main Public Shell */}
                <Route element={<AppLayout />}>
                  {/* Public Pages */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/become-a-listener" element={<BecomeListenerPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />

                  {/* Onboarding */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <OnboardingRolePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/talker"
                    element={
                      <ProtectedRoute>
                        <TalkerOnboardingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/listener"
                    element={
                      <ProtectedRoute>
                        <ListenerOnboardingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/listener-verification"
                    element={
                      <ProtectedRoute>
                        <ListenerVerificationPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Talker Dashboard Routes */}
                  <Route
                    path="/talker"
                    element={
                      <ProtectedRoute allowedRole="talker">
                        <DashboardLayout role="talker" />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/talker/dashboard" replace />} />
                    <Route path="dashboard" element={<TalkerDashboardPage />} />
                    <Route path="listeners" element={<ListenerDirectoryPage />} />
                    <Route path="listener/:listenerId" element={<ListenerProfilePage />} />
                    <Route path="appointments" element={<TalkerAppointmentsPage />} />
                    <Route path="conversations" element={<TalkerConversationsPage />} />
                    <Route path="wallet" element={<TalkerWalletPage />} />
                    <Route path="notifications" element={<TalkerNotificationsPage />} />
                    <Route path="settings" element={<TalkerSettingsPage />} />
                  </Route>

                  {/* Listener Dashboard Routes */}
                  <Route
                    path="/listener"
                    element={
                      <ProtectedRoute allowedRole="listener">
                        <DashboardLayout role="listener" />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/listener/dashboard" replace />} />
                    <Route path="dashboard" element={<ListenerDashboardPage />} />
                    <Route path="analytics" element={<ListenerAnalyticsPage />} />
                    <Route path="profile" element={<ListenerProfileEditPage />} />
                    <Route path="schedule" element={<ListenerSchedulePage />} />
                    <Route path="appointments" element={<ListenerAppointmentsPage />} />
                    <Route path="conversations" element={<ListenerConversationsPage />} />
                    <Route path="earnings" element={<ListenerEarningsPage />} />
                    <Route path="wallet" element={<ListenerWalletPage />} />
                    <Route path="reviews" element={<ListenerReviewsPage />} />
                    <Route path="settings" element={<ListenerSettingsPage />} />
                  </Route>

                  {/* Live Conversation Session Room */}
                  <Route
                    path="/session/:sessionId"
                    element={
                      <ProtectedRoute>
                        <SessionRoomPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Private Admin Dashboard Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRole="admin">
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="verification" element={<AdminVerificationPage />} />
                    <Route path="sessions" element={<AdminSessionsPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="topups" element={<AdminTopupsPage />} />
                    <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  </Route>

                  {/* Catch-all 404 redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </CommunicationProvider>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
