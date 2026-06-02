// src/components/dashboard/Compliance.tsx
'use client';

import { ShieldCheck, UploadCloud, FileText, CheckCircle2, Clock } from 'lucide-react';
import { UserProfile } from '@/src/types/types';

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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Compliance & KYC</h2>
           <p className="text-slate-500">Manage your identity verification documents to unlock higher limits.</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${
            user.kycStatus === 'verified' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
            {user.kycStatus === 'verified' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
            <span className="font-semibold capitalize">{user.kycStatus} Account</span>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${user.kycStatus === 'verified' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                <ShieldCheck size={28} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {user.kycStatus === 'verified' ? 'Identity Verified' : 'Verification Required'}
                </h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {user.kycStatus === 'verified' 
                     ? 'Your account is fully verified. You can now transact with higher limits and access all features.'
                     : 'Please submit a valid government-issued ID and proof of address to lift transaction limits.'}
                </p>
                
                {user.kycStatus === 'verified' && (
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

      {/* Document Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID Document */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                     <FileText size={18} className="text-slate-400" />
                     National ID / Passport
                 </h4>
                 {user.kycStatus === 'verified' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">APPROVED</span>}
             </div>
             <div className="p-6 text-center">
                 {user.kycStatus === 'verified' ? (
                     <div className="py-4">
                         <div className="mx-auto w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                             <FileText size={32} className="text-slate-400" />
                         </div>
                         <p className="text-sm text-slate-500">Document on file: <span className="font-medium text-slate-900">MW-ID-****992</span></p>
                         <p className="text-xs text-slate-400 mt-1">Uploaded on Oct 10, 2023</p>
                     </div>
                 ) : (
                    <div 
                      onClick={() => handleDocumentUpload('id')}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                        <UploadCloud size={40} className="mx-auto text-slate-400 group-hover:text-green-500 transition-colors mb-3" />
                        <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                    </div>
                 )}
             </div>
          </div>

          {/* Proof of Address */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                     <FileText size={18} className="text-slate-400" />
                     Proof of Address
                 </h4>
                  {user.kycStatus === 'verified' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">APPROVED</span>}
             </div>
             <div className="p-6 text-center">
                 {user.kycStatus === 'verified' ? (
                     <div className="py-4">
                         <div className="mx-auto w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                             <FileText size={32} className="text-slate-400" />
                         </div>
                         <p className="text-sm text-slate-500">Document on file: <span className="font-medium text-slate-900">Utility Bill - ESCOM</span></p>
                         <p className="text-xs text-slate-400 mt-1">Uploaded on Oct 12, 2023</p>
                     </div>
                 ) : (
                    <div 
                      onClick={() => handleDocumentUpload('address')}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                        <UploadCloud size={40} className="mx-auto text-slate-400 group-hover:text-green-500 transition-colors mb-3" />
                        <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                    </div>
                 )}
             </div>
          </div>
      </div>

    </div>
  );
};

export default Compliance;