import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../lib/firebase';
import { saveUserProfile, writeAuditLog } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { UserProfile, UserRole } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Search, Shield, User, CheckCircle2 } from 'lucide-react';

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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            User Management Directory ({users.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View profiles, assign roles, and review account statuses.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search users by name/email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'talker', 'listener', 'admin'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
              roleFilter === r
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {r === 'all' ? 'All Roles' : `${r}s`}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Age / Location</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`}
                        alt={u.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'listener' ? 'listening' : 'neutral'} size="sm">
                      {u.role}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-slate-500">
                    {u.age ? `${u.age} yrs` : '—'} • {u.location || 'India'}
                  </td>

                  <td className="py-3 px-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleToggleRole(u, e.target.value as UserRole)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
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
