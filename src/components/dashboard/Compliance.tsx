'use client';

import React, { useRef, useState } from 'react';
import { UserProfile } from '@/src/types/types';
import ComplianceHeader from '@/src/components/dashboard/compliance/ComplianceHeader';
import VerificationStatusCard from '@/src/components/dashboard/compliance/VerificationStatusCard';
import DocumentUploadSection from '@/src/components/dashboard/compliance/DocumentUploadSection';
import { apiFetch } from '@/src/lib/api/api-client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';

interface ComplianceProps {
  user: UserProfile;
}

const Compliance: React.FC<ComplianceProps> = ({ user }) => {
  const t = useTranslations('Compliance');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<'id' | 'address' | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [showDocPrompt, setShowDocPrompt] = useState(false);

  const handleDocumentUpload = (type: 'id' | 'address') => {
    setSelectedType(type);
    if (type === 'id') {
      setShowDocPrompt(true);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const proceedWithUpload = () => {
    const trimmed = documentNumber.trim();
    if (selectedType === 'id' && trimmed.length < 4) {
      toast.error(t('documentNumberRequired', { defaultValue: 'Enter your document or ID number.' }));
      return;
    }
    setShowDocPrompt(false);
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
    formData.append(
      'document_number',
      selectedType === 'id' ? documentNumber.trim() : `ADDR-${Date.now()}`
    );
    formData.append('issuing_country', user.countryCode || 'MW');

    try {
      await apiFetch('/compliance/kyc/submit', {
        method: 'POST',
        body: formData,
      });
      toast.success(t('uploadSuccess'));
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: unknown) {
      console.error('KYC upload failed:', err);
      toast.error(err instanceof Error ? err.message : t('uploadFailed'));
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
      <VerificationStatusCard kycStatus={user.kycStatus} />

      {showDocPrompt && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Label htmlFor="doc-number">{t('documentNumberLabel', { defaultValue: 'Document / ID number' })}</Label>
          <Input
            id="doc-number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder={t('documentNumberPlaceholder', { defaultValue: 'e.g. ABC123456' })}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="text-sm text-muted-foreground"
              onClick={() => setShowDocPrompt(false)}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              className="text-sm font-medium text-primary"
              onClick={proceedWithUpload}
            >
              {t('continueUpload', { defaultValue: 'Continue to upload' })}
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {isUploading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-950/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">{t('uploadingDocument')}</p>
            </div>
          </div>
        )}
        <DocumentUploadSection kycStatus={user.kycStatus} onUpload={handleDocumentUpload} />
      </div>
    </div>
  );
};

export default Compliance;
