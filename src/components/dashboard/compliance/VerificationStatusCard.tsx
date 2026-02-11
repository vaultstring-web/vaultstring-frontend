import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { UserProfile } from '@/src/types/types';

interface VerificationStatusCardProps {
  kycStatus: UserProfile['kycStatus'];
}

const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({ kycStatus }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${kycStatus === 'verified' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
          <ShieldCheck size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {kycStatus === 'verified' ? 'Identity Verified' : 'Verification Required'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            {kycStatus === 'verified' 
             ? 'Your account is fully verified. You can now transact with higher limits and access all features.'
             : 'Please submit a valid government-issued ID and proof of address to lift transaction limits.'}
          </p>
          
          {kycStatus === 'verified' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Daily Limit</p>
                <p className="font-semibold text-slate-900 dark:text-white">MWK 5,000,000</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly Limit</p>
                <p className="font-semibold text-slate-900 dark:text-white">MWK 50,000,000</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Int'l Transfers</p>
                <p className="font-semibold text-green-600 dark:text-green-400">Enabled</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusCard;
