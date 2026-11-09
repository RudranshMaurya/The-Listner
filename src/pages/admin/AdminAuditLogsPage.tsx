import React, { useEffect, useState } from 'react';
import { subscribeToAuditLogs } from '../../lib/database';
import type { AuditLog } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { FileText, Shield } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const unsub = subscribeToAuditLogs((list) => setLogs(list));
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Security & Administrative Audit Logs ({logs.length})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable historical trail of all administrative adjustments, reconciliations, role modifications, and config changes.
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="Audit Log is Clean"
          description="Administrative actions (payment confirmations, verification approvals, user role edits) are recorded here."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] text-slate-400 font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {log.adminEmail}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" size="sm">
                        {log.targetType}: {log.targetId}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
