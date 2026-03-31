'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, ShieldCheck, AlertCircle, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface KYCDocument {
  id: string;
  document_type: string;
  document_number: string;
  issuing_country: string;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export default function CompliancePage() {
  const { user, refreshUser } = useAuth();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [country, setCountry] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const docs = await apiFetch('/compliance/kyc/status');
      if (Array.isArray(docs)) {
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
      toast.error('Failed to load compliance status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType || !docNumber || !country || !file) {
      toast.error('Please fill in all fields and upload a document');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('document_number', docNumber);
    formData.append('issuing_country', country);
    formData.append('documents', file);

    try {
      await apiFetch('/compliance/kyc/submit', {
        method: 'POST',
        body: formData,
      });
      toast.success('KYC documents submitted successfully');
      setFile(null);
      setDocNumber('');
      setCountry('');
      setDocType('');
      await fetchStatus();
      await refreshUser(); // Update user status in context
    } catch (error: any) {
      console.error('KYC submission error:', error);
      toast.error(error.message || 'Failed to submit documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'rejected': return <XCircle className="w-4 h-4 mr-1" />;
      default: return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  // Determine if we should show the form
  // Show form if:
  // 1. No documents submitted
  // 2. Last document was rejected
  // 3. User status is not verified (and no pending docs)
  const hasPendingDocs = documents.some(d => d.status === 'pending');
  const isVerified = user?.kycStatus === 'verified' || documents.some(d => d.status === 'verified');
  const showForm = !isVerified && !hasPendingDocs;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Identity Verification</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Complete the KYC process to unlock higher limits and full account features.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Status Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                {isVerified ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={32} />
                  </div>
                ) : hasPendingDocs ? (
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Clock size={32} />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <AlertCircle size={32} />
                  </div>
                )}
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isVerified ? 'Verified' : hasPendingDocs ? 'Under Review' : 'Unverified'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {isVerified 
                      ? 'Your identity has been confirmed. You have full access.' 
                      : hasPendingDocs 
                        ? 'We are reviewing your documents. This usually takes 24-48 hours.'
                        : 'Please submit your documents to verify your identity.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Submissions */}
          {documents.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="font-medium text-sm text-slate-900 dark:text-white capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                      {doc.rejection_reason && (
                        <div className="text-xs text-red-500 mt-1">
                          Reason: {doc.rejection_reason}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(doc.status)} border capitalize`}>
                      {getStatusIcon(doc.status)}
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Submission Form */}
        <div className="md:col-span-2">
          {showForm ? (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle>Submit Documents</CardTitle>
                <CardDescription>
                  Upload a valid government-issued ID to verify your identity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="docType">Document Type</Label>
                      <Select value={docType} onValueChange={setDocType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="national_id">National ID</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Issuing Country</Label>
                      <Input 
                        id="country" 
                        placeholder="e.g. United States" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="docNumber">Document Number</Label>
                      <Input 
                        id="docNumber" 
                        placeholder="Enter document ID number" 
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="file">Document Image (Front)</Label>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:hover:border-slate-500">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {file ? (
                              <>
                                <FileText className="w-10 h-10 mb-3 text-indigo-500" />
                                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 font-semibold">{file.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Click to change</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 mb-3 text-slate-400" />
                                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">SVG, PNG, JPG or GIF (MAX. 10MB)</p>
                              </>
                            )}
                          </div>
                          <input id="file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Verification'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : isVerified ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You are fully verified!</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Thank you for verifying your identity. You now have access to all platform features, higher transaction limits, and faster processing times.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/dashboard'}>
                Return to Dashboard
              </Button>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 rounded-xl p-8 text-center space-y-4">
               <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verification in Progress</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Your documents have been received and are currently being reviewed by our compliance team. You will receive a notification once the review is complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
