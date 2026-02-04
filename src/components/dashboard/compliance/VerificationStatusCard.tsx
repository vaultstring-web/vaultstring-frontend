import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { UserProfile } from '@/src/types/types';

interface VerificationStatusCardProps {
  kycStatus: UserProfile['kycStatus'];
}

const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({ kycStatus }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${kycStatus === 'verified' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
          <ShieldCheck size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {kycStatus === 'verified' ? 'Identity Verified' : 'Verification Required'}
          </h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            {kycStatus === 'verified' 
             ? 'Your account is fully verified. You can now transact with higher limits and access all features.'
             : 'Please submit a valid government-issued ID and proof of address to lift transaction limits.'}
          </p>
          
          {kycStatus === 'verified' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Daily Limit</p>
                <p className="font-semibold text-slate-900">MWK 5,000,000</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Monthly Limit</p>
                <p className="font-semibold text-slate-900">MWK 50,000,000</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Int'l Transfers</p>
                <p className="font-semibold text-green-600">Enabled</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusCard;
