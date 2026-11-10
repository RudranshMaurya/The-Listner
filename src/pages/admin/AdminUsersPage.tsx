import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../lib/firebase';
import { saveUserProfile, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { UserProfile, UserRole } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Search } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  useEffect(() => {
    const unsub = onValue(ref(db, 'profiles'), (snapshot) => {
      if (snapshot.exists()) {
        setUsers(Object.values(snapshot.val()) as UserProfile[]);
      } else {
        setUsers([]);
      }
    });
    return () => unsub();
  }, []);

  const handleToggleRole = async (user: UserProfile, newRole: UserRole) => {
    if (!currentUser) return;
    try {
      await saveUserProfile({ uid: user.uid, role: newRole });
      await writeAuditLog({
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || 'admin',
        action: `Changed user role for ${user.displayName} to ${newRole}`,
        targetType: 'user',
        targetId: user.uid,
        details: `Previous: ${user.role}, New: ${newRole}`
      });
      showToast('success', `Updated ${user.displayName}'s role to ${newRole}.`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to update user.');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title text-text tracking-tight">
            User Management Directory ({users.length})
          </h2>
          <p className="text-small text-text-muted mt-0.5">
            View profiles, assign roles, and review account statuses.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-surface p-1 rounded-pill border border-border w-fit text-caption">
        {(['all', 'talker', 'listener', 'admin'] as const).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-pill capitalize transition-all cursor-pointer ${
              roleFilter === r
                ? 'bg-surface-raised text-text font-semibold shadow-soft'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {r === 'all' ? 'All Roles' : `${r}s`}
          </button>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-small">
            <thead className="bg-surface border-b border-border uppercase text-[10px] text-text-muted font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Age / Location</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`}
                        alt={u.displayName}
                        className="w-8 h-8 rounded-pill object-cover bg-surface border border-border"
                      />
                      <div>
                        <p className="font-semibold text-text">{u.displayName}</p>
                        <p className="text-caption text-text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'listener' ? 'success' : 'neutral'} size="sm">
                      {u.role}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-text-muted text-caption">
                    {u.age ? `${u.age} yrs` : '—'} • {u.location || 'India'}
                  </td>

                  <td className="py-3 px-4 text-text-muted text-caption">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleToggleRole(u, e.target.value as UserRole)}
                      className="rounded-input border border-border bg-surface px-2.5 py-1 text-caption text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
                    >
                      <option value="talker">Talker</option>
                      <option value="listener">Listener</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
