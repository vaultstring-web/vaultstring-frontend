// app/dashboard/compliance/page.tsx
'use client';

import { useAuth } from '@/src/context/AuthContext';
import PageHeader from '@/src/components/shared/PageHeader';
import Compliance from '@/src/components/dashboard/Compliance';

export default function CompliancePage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Compliance (KYC)" subtitle="Verify your identity and upload required documents." variant="hero" />
      {user && <Compliance user={user} />}
    </div>
  );
}
