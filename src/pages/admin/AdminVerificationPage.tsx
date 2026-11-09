import React, { useEffect, useState } from 'react';
import { subscribeToListeners, saveListenerProfile, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { ListenerProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';

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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Listener Verification & Accreditation
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review questionnaire assessment scores and manage platform-verified credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listeners.map((listener) => (
          <Card key={listener.uid} className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={listener.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.uid}`}
                  alt={listener.displayName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{listener.displayName}</span>
                    {listener.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {listener.yearsExperience} yrs exp • {listener.age} yrs • {listener.gender}
                  </p>
                </div>
              </div>

              <Badge variant={listener.isVerified ? 'verified' : 'warning'} size="sm">
                {listener.isVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Assessment Score:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {listener.verificationScore ? `${listener.verificationScore}%` : 'Not Taken'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Qualification Status:</span>
                <span className="font-semibold uppercase text-[10px] text-indigo-600 dark:text-indigo-400">
                  {listener.verificationStatus || 'unsubmitted'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
              "{listener.bio}"
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              {listener.isVerified ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleVerification(listener, false)}
                  className="text-rose-600 hover:bg-rose-50"
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
