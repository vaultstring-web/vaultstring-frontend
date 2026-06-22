'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UserProfile } from '@/src/types/types';
import DocumentCard from './DocumentCard';

interface DocumentUploadSectionProps {
  kycStatus: UserProfile['kycStatus'];
  onUpload: (type: 'id' | 'address') => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ kycStatus, onUpload }) => {
  const t = useTranslations('Compliance');
  const isVerified = kycStatus === 'verified';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DocumentCard
        title={t('idDocTitle')}
        icon={FileText}
        isVerified={isVerified}
        documentNumber="MW-ID-****992"
        uploadDate="Oct 10, 2023"
        onUpload={() => onUpload('id')}
      />

      <DocumentCard
        title={t('addressDocTitle')}
        icon={FileText}
        isVerified={isVerified}
        documentNumber="Utility Bill - ESCOM"
        uploadDate="Oct 12, 2023"
        onUpload={() => onUpload('address')}
      />
    </div>
  );
};

export default DocumentUploadSection;
