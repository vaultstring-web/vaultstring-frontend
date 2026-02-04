import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { UserProfile } from '@/src/types/types';

interface ComplianceHeaderProps {
  kycStatus: UserProfile['kycStatus'];
}

const ComplianceHeader: React.FC<ComplianceHeaderProps> = ({ kycStatus }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-500">Compliance & KYC</h2>
        <p className="text-slate-500">Manage your identity verification documents to unlock higher limits.</p>
      </div>
      <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${
        kycStatus === 'verified' 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
      }`}>
        {kycStatus === 'verified' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
        <span className="font-semibold capitalize">{kycStatus} Account</span>
      </div>
    </div>
  );
};

export default ComplianceHeader;
