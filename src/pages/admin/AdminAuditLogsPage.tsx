import React, { useEffect, useState } from 'react';
import { subscribeToAuditLogs } from '../../lib/database';
import type { AuditLog } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { FileText } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const unsub = subscribeToAuditLogs((list) => setLogs(list));
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Security & Audit Logs ({logs.length})
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          Immutable historical trail of all administrative actions, reconciliations, and role modifications.
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-5 h-5 text-text-muted" />}
          title="Audit Log is Clean"
          description="Administrative actions (payment confirmations, verification approvals, user role edits) are recorded here."
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="bg-surface border-b border-border uppercase text-[10px] text-text-muted font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4 text-text-muted font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-text">
                      {log.adminEmail}
                    </td>
                    <td className="py-3 px-4 text-text">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" size="sm">
                        {log.targetType}: {log.targetId}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-text-muted max-w-xs truncate text-caption">
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
