'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UserProfile } from '@/src/types/types';

interface VerificationStatusCardProps {
  kycStatus: UserProfile['kycStatus'];
}

const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({ kycStatus }) => {
  const t = useTranslations('Compliance.verificationCard');
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${kycStatus === 'verified' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
          <ShieldCheck size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {kycStatus === 'verified' ? t('verifiedTitle') : t('requiredTitle')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            {kycStatus === 'verified' ? t('verifiedBody') : t('unverifiedBody')}
          </p>
          
          {kycStatus === 'verified' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('dailyLimit')}</p>
                <p className="font-semibold text-slate-900 dark:text-white">MWK 5,000,000</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('monthlyLimit')}</p>
                <p className="font-semibold text-slate-900 dark:text-white">MWK 50,000,000</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('intlTransfers')}</p>
                <p className="font-semibold text-green-600 dark:text-green-400">{t('enabled')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusCard;
