import React, { useEffect, useState } from 'react';
import { subscribeToListeners, saveListenerProfile, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { ListenerProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CheckCircle2 } from 'lucide-react';

export const AdminVerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const [listeners, setListeners] = useState<ListenerProfile[]>([]);

  useEffect(() => {
    const unsub = subscribeToListeners((list) => setListeners(list));
    return () => unsub();
  }, []);

  const handleToggleVerification = async (listener: ListenerProfile, newVerified: boolean) => {
    if (!currentUser) return;
    try {
      await saveListenerProfile({
        uid: listener.uid,
        isVerified: newVerified,
        verificationStatus: newVerified ? 'passed' : 'failed'
      });

      await writeAuditLog({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || 'admin',
        action: `${newVerified ? 'Verified' : 'Revoked verification for'} listener ${listener.displayName}`,
        targetType: 'user',
        targetId: listener.uid,
        details: `Score: ${listener.verificationScore || 0}%`
      });

      showToast('success', `${listener.displayName}'s verification status updated.`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to update verification.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Listener Verification & Accreditation
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Review questionnaire assessment scores and manage platform-verified credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listeners.map((listener) => (
          <Card key={listener.uid} padding="md" className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={listener.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.uid}`}
                  alt={listener.displayName}
                  className="w-12 h-12 rounded-card object-cover bg-surface border border-border"
                />
                <div>
                  <h4 className="text-small font-semibold text-text flex items-center gap-1.5">
                    <span>{listener.displayName}</span>
                    {listener.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    )}
                  </h4>
                  <p className="text-caption text-text-muted">
                    {listener.yearsExperience} yrs exp • {listener.age} yrs • {listener.gender}
                  </p>
                </div>
              </div>

              <Badge variant={listener.isVerified ? 'success' : 'warning'} size="sm">
                {listener.isVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>

            <div className="p-3 rounded-input bg-surface border border-border text-caption space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Assessment Score:</span>
                <span className="font-semibold text-text">
                  {listener.verificationScore ? `${listener.verificationScore}%` : 'Not Taken'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Qualification Status:</span>
                <span className="font-semibold uppercase text-[10px] text-accent">
                  {listener.verificationStatus || 'unsubmitted'}
                </span>
              </div>
            </div>

            <p className="text-caption text-text-muted italic line-clamp-2">
              "{listener.bio}"
            </p>

            <div className="pt-2 border-t border-border flex justify-end gap-2">
              {listener.isVerified ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleVerification(listener, false)}
                >
                  Revoke Verification
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleToggleVerification(listener, true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Approve & Grant Badge
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
