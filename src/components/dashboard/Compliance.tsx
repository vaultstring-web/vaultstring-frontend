'use client';

import React, { useRef, useState } from 'react';
import { UserProfile } from '@/src/types/types';
import ComplianceHeader from '@/src/components/dashboard/compliance/ComplianceHeader';
import VerificationStatusCard from '@/src/components/dashboard/compliance/VerificationStatusCard';
import DocumentUploadSection from '@/src/components/dashboard/compliance/DocumentUploadSection';
import { apiFetch } from '@/src/lib/api/api-client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ComplianceProps {
  user: UserProfile;
}

const Compliance: React.FC<ComplianceProps> = ({ user }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<'id' | 'address' | null>(null);

  const handleDocumentUpload = (type: 'id' | 'address') => {
    setSelectedType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('documents', file);
    formData.append('document_type', selectedType === 'id' ? 'national_id' : 'utility_bill');
    formData.append('document_number', 'SIMULATED-' + Math.random().toString(36).substring(7).toUpperCase());
    formData.append('issuing_country', user.countryCode || 'MW');

    try {
      await apiFetch('/compliance/kyc/submit', {
        method: 'POST',
        body: formData,
      });
      toast.success('Document uploaded successfully. Our team will review it shortly.');
      // Refresh page to update status
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      console.error('KYC upload failed:', err);
      toast.error(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      setSelectedType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={onFileChange}
        accept="image/*,.pdf"
      />
      
      <ComplianceHeader kycStatus={user.kycStatus} />

      {/* Status Card */}
      <VerificationStatusCard kycStatus={user.kycStatus} />

      {/* Document Upload Section */}
      <div className="relative">
        {isUploading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-950/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Uploading document...</p>
            </div>
          </div>
        )}
        <DocumentUploadSection kycStatus={user.kycStatus} onUpload={handleDocumentUpload} />
      </div>

    </div>
  );
};

export default Compliance;
