"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { apiFetch } from "@/src/lib/api/api-client"
import { Loader2 } from "lucide-react"

interface TermsStepProps {
  onNext: (data: any) => void
  allData?: any
}

export function TermsStep({ onNext, allData }: TermsStepProps) {
  const [formData, setFormData] = useState({
    privacyPolicy: false,
    termsOfService: false,
    dataProcessing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.privacyPolicy) newErrors.privacyPolicy = "You must accept the privacy policy"
    if (!formData.termsOfService) newErrors.termsOfService = "You must accept the terms of service"
    if (!formData.dataProcessing) newErrors.dataProcessing = "You must consent to data processing"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        // Prepare final KYC payload
        const payload = {
          first_name: allData?.firstName,
          last_name: allData?.lastName,
          date_of_birth: allData?.dateOfBirth,
          nationality: allData?.nationality,
          id_type: allData?.idType,
          id_number: allData?.idNumber,
          address: allData?.address,
          city: allData?.city,
          country_code: allData?.countryCode || 'MW',
          postal_code: allData?.postalCode,
          source_of_funds: allData?.sourceOfFunds,
          two_fa_enabled: allData?.twoFAEnabled,
          terms_accepted: true,
          privacy_policy_accepted: true
        }

        await apiFetch('/compliance/kyc/submit', {
          method: 'POST',
          body: JSON.stringify(payload)
        })

        onNext(formData)
      } catch (err: any) {
        console.error('KYC Submission failed:', err)
        setErrors({ submit: err?.message || 'Failed to submit KYC. Please try again.' })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 max-h-64 overflow-y-auto">
        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-widest">Terms and Conditions</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          By using our KYC verification service, you agree to comply with all applicable laws and regulations. You
          represent that all information provided is accurate and complete. We reserve the right to deny access or
          cancel accounts if we detect fraudulent activity or violation of our terms.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Your data will be processed securely and in compliance with international data protection regulations
          including GDPR and local standards.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy"
            checked={formData.privacyPolicy}
            onChange={(e) => setFormData({ ...formData, privacyPolicy: e.target.checked })}
            className="w-5 h-5 text-green-500 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-green-500/20 mt-0.5 cursor-pointer accent-green-500"
          />
          <label htmlFor="privacy" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
            I have read and agree to the <span className="text-green-600 hover:underline">Privacy Policy</span> *
          </label>
        </div>
        {errors.privacyPolicy && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-8">{errors.privacyPolicy}</p>}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={formData.termsOfService}
            onChange={(e) => setFormData({ ...formData, termsOfService: e.target.checked })}
            className="w-5 h-5 text-green-500 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-green-500/20 mt-0.5 cursor-pointer accent-green-500"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
            I have read and agree to the <span className="text-green-600 hover:underline">Terms of Service</span> *
          </label>
        </div>
        {errors.termsOfService && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-8">{errors.termsOfService}</p>}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="data"
            checked={formData.dataProcessing}
            onChange={(e) => setFormData({ ...formData, dataProcessing: e.target.checked })}
            className="w-5 h-5 text-green-500 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-green-500/20 mt-0.5 cursor-pointer accent-green-500"
          />
          <label htmlFor="data" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
            I consent to the secure storage of my personal data *
          </label>
        </div>
        {errors.dataProcessing && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-8">{errors.dataProcessing}</p>}
        {errors.submit && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight bg-red-50 dark:bg-red-950/20 p-3 rounded-xl mt-2">{errors.submit}</p>}
      </div>

      <div className="pt-4">
        <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Complete Verification"
          )}
        </Button>
      </div>
    </form>
  )
}