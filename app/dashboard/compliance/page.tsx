'use client';

import { useAuth } from '@/src/context/AuthContext';
import { ShieldCheck, Upload, FileText, CheckCircle2, User, MapPin, ArrowRight, Zap, Lock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';

export default function CompliancePage() {
  const { user } = useAuth();
  const status = user?.kycStatus || 'pending';

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-10 max-w-7xl mx-auto overflow-hidden">
      
      {/* Dynamic Header Section - Fixes the overlap from your reference image */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 md:p-12 rounded-[40px] shadow-xl relative border border-slate-50">
        <div className="absolute top-0 left-0 w-2 h-full bg-green-500 rounded-l-[40px]" />
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Compliance</h1>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">Verify your identity to unlock global transfers, unlimited MWK withdrawals, and higher security tiers.</p>
        </div>

        {/* Modern Progress Tracker (Referencing your screenshot 2) */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[28px] border border-slate-100">
           <Step circle="1" active />
           <div className="w-12 h-1 bg-green-500 rounded-full" />
           <Step circle="2" active={status === 'verified'} />
           <div className="w-12 h-1 bg-slate-200 rounded-full" />
           <Step circle="3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tier Status Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
             <div className="relative z-10">
                <ShieldCheck size={48} className="text-green-500 mb-6" />
                <h3 className="text-3xl font-black mb-2 capitalize">{status} Tier</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Currently reviewing your documentation for global access.</p>
                
                <div className="space-y-4">
                  <Benefit icon={<Zap size={14}/>} text="Daily: 5,000,000 MWK" />
                  <Benefit icon={<Lock size={14}/>} text="International SWIFT Access" />
                  <Benefit icon={<CheckCircle2 size={14}/>} text="Priority Dispute Resolution" />
                </div>
             </div>
          </div>
        </div>

        {/* Upload Terminal */}
        <div className="lg:col-span-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadTile 
                title="Identity Document" 
                desc="Passport or National ID card" 
                icon={<FileText />} 
                isDone={status === 'verified'} 
              />
              <UploadTile 
                title="Address Proof" 
                desc="Utility bill or bank statement" 
                icon={<MapPin />} 
                isDone={status === 'verified'} 
              />
           </div>

           <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-12 text-center group hover:border-green-500 transition-all cursor-pointer">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="text-slate-400 group-hover:text-green-500" size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900">Drag and drop documents</h4>
              <p className="text-slate-400 mt-2 font-medium">Supported formats: PDF, JPEG, PNG (Max 10MB)</p>
           </div>

           <Button 
            disabled={status === 'verified'}
            className="w-full h-20 bg-green-600 hover:bg-green-700 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-green-100 flex items-center justify-center gap-4 transition-transform hover:scale-[1.01] active:scale-[0.99]"
           >
              {status === 'pending' ? 'Verification in Progress' : 'Finalize Verification'}
              <ArrowRight />
           </Button>
        </div>
      </div>
    </div>
  );
}

// Helpers
function Step({ circle, active }: any) {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${active ? 'bg-green-500 text-white scale-110 shadow-lg' : 'bg-white text-slate-300'}`}>
      {circle}
    </div>
  );
}

function Benefit({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">{icon}</div>
      {text}
    </div>
  );
}

function UploadTile({ title, desc, icon, isDone }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all">
       <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-all">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{desc}</p>
          </div>
       </div>
       {isDone && <CheckCircle2 className="text-green-500" />}
    </div>
  );
}