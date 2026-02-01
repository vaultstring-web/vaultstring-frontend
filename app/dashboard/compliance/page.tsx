'use client';

import { useAuth } from '@/src/context/AuthContext';
import PageHeader from '@/src/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CompliancePage() {
  const { user } = useAuth();
  const status = user?.kycStatus || 'pending';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader title="Compliance Center" subtitle="Verify your identity to unlock higher limits and features." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="lg:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Current account standing</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                status === 'verified' ? 'bg-green-100 text-green-600' :
                status === 'pending' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-400'
            }`}>
                <ShieldCheck size={40} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {status === 'verified' ? 'Verified Account' : 
                 status === 'pending' ? 'Pending Review' : 'Unverified'}
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
                {status === 'verified' ? 'Your account is fully verified. You have access to all features.' : 
                 status === 'pending' ? 'We are reviewing your documents. This usually takes 24-48 hours.' : 
                 'Please submit your documents to verify your identity.'}
            </p>
            
            <div className="w-full space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Daily Limit</span>
                    <span className="font-medium">{status === 'verified' ? 'Unlimited' : 'MWK 50,000'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Monthly Limit</span>
                    <span className="font-medium">{status === 'verified' ? 'Unlimited' : 'MWK 200,000'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">International</span>
                    <span className={`font-medium ${status === 'verified' ? 'text-green-600' : 'text-slate-400'}`}>
                        {status === 'verified' ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps & Upload */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>Please upload clear photos or scans of the following documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* ID Card Section */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-900">Government Issued ID</h4>
                                <p className="text-sm text-slate-500 mt-1">Passport, National ID, or Driver's License.</p>
                                
                                <div className="mt-4 flex gap-3">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Upload size={14} /> Upload Front
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Upload size={14} /> Upload Back
                                    </Button>
                                </div>
                            </div>
                            {status === 'verified' && <CheckCircle2 className="text-green-500" />}
                        </div>
                    </div>

                    {/* Selfie Section */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <User size={24} /> // Imported User icon manually as it was missing in imports? No, I need to add it to imports.
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-900">Proof of Address</h4>
                                <p className="text-sm text-slate-500 mt-1">Utility bill or bank statement (not older than 3 months).</p>
                                
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Upload size={14} /> Upload Document
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex gap-3 text-sm">
                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                        <div>
                            We process your personal data in accordance with our Privacy Policy. Your documents are encrypted and stored securely.
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button disabled={status === 'verified' || status === 'pending'}>
                            Submit for Review
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// Need to import User icon
import { User } from 'lucide-react';
