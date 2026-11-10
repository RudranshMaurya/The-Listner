import React from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { ShieldCheck } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-title text-text tracking-tight">
          Trust & Safety Incident Reports
        </h2>
        <p className="text-small text-text-muted mt-0.5">
          User reports regarding violations of community guidelines and boundary misconduct.
        </p>
      </div>

      <EmptyState
        icon={<ShieldCheck className="w-5 h-5 text-text-muted" />}
        title="Zero Pending Safety Reports"
        description="Our non-judgmental community is currently healthy and respectful with no active violations reported."
      />
    </div>
  );
};
