"use client"

import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"

interface CompletionStepProps {
  type: "individual" | "business"
  onChangeUserType: () => void
}

import { AuthLayout } from "@/src/components/shared/AuthLayout"
import { CheckCircle2, Clock, Mail, ShieldCheck } from "lucide-react"

interface CompletionStepProps {
  type: "individual" | "business"
  onChangeUserType: () => void
}

export function CompletionStep({ type, onChangeUserType }: CompletionStepProps) {
  return (
    <AuthLayout 
      title={type === "individual" ? "KYC Submitted" : "Business KYC Submitted"} 
      subtitle="Your verification is being processed"
    >
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          <div className="h-24 w-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl shadow-green-500/10">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-slate-600 dark:text-slate-400 font-medium px-4">
              Thank you for completing your verification. Our compliance team is now reviewing your application.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Review Time</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">24 - 48 Hours</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Confirmation</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Email will be sent</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Security</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Full access on approval</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Dashboard
          </Button>
          
          <button 
            onClick={onChangeUserType} 
            className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-green-600 uppercase tracking-widest transition-colors"
          >
            Start Another Verification
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            Reference ID: KYC-{Date.now().toString().slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}