'use client';

import React from 'react';
import { UserProfile } from '@/src/types/types';
import ComplianceHeader from '@/src/components/dashboard/compliance/ComplianceHeader';
import VerificationStatusCard from '@/src/components/dashboard/compliance/VerificationStatusCard';
import DocumentUploadSection from '@/src/components/dashboard/compliance/DocumentUploadSection';

interface ComplianceProps {
  user: UserProfile;
}

const Compliance: React.FC<ComplianceProps> = ({ user }) => {
  const handleDocumentUpload = (type: 'id' | 'address') => {
    // TODO: Implement document upload logic
    console.log(`Upload ${type} document`);
    // You would typically:
    // 1. Open a file input dialog
    // 2. Upload to your API
    // 3. Update the user's KYC status
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
      
      <ComplianceHeader kycStatus={user.kycStatus} />

      {/* Status Card */}
      <VerificationStatusCard kycStatus={user.kycStatus} />

      {/* Document Upload Section */}
      <DocumentUploadSection kycStatus={user.kycStatus} onUpload={handleDocumentUpload} />

    </div>
  );
};

export default Compliance;
