import React from 'react';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ShieldCheck } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Trust & Safety Incident Reports
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          User reports regarding violations of community guidelines and boundary misconduct.
        </p>
      </div>

      <EmptyState
        icon={<ShieldCheck className="w-8 h-8" />}
        title="Zero Pending Safety Reports"
        description="Our non-judgmental community is currently healthy and respectful with no active violations reported."
      />
    </div>
  );
};
