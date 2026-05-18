"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { apiFetch } from "@/src/lib/api/api-client"
import { Loader2 } from "lucide-react"

interface TermsStepProps {
  onNext: (data: Record<string, unknown>) => void
  allData?: Record<string, unknown>
}

export function TermsStep({ onNext, allData }: TermsStepProps) {
  const t = useTranslations("Onboarding.terms")
  const tv = useTranslations("Onboarding.terms.validation")

  const [formData, setFormData] = useState({
    privacyPolicy: false,
    termsOfService: false,
    dataProcessing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.privacyPolicy) newErrors.privacyPolicy = tv("privacyRequired")
    if (!formData.termsOfService) newErrors.termsOfService = tv("termsRequired")
    if (!formData.dataProcessing) newErrors.dataProcessing = tv("dataRequired")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        const payload = {
          first_name: allData?.firstName,
          last_name: allData?.lastName,
          date_of_birth: allData?.dateOfBirth,
          nationality: allData?.nationality,
          id_type: allData?.idType,
          id_number: allData?.idNumber,
          address: allData?.address,
          city: allData?.city,
          country_code: allData?.countryCode || "MW",
          postal_code: allData?.postalCode,
          source_of_funds: allData?.sourceOfFunds,
          two_fa_enabled: allData?.twoFAEnabled,
          terms_accepted: true,
          privacy_policy_accepted: true,
        }

        await apiFetch("/compliance/kyc/submit", {
          method: "POST",
          body: JSON.stringify(payload),
        })

        onNext(formData)
      } catch (err: unknown) {
        console.error("KYC Submission failed:", err)
        const message = err instanceof Error ? err.message : undefined
        setErrors({ submit: message || t("errorSubmit") })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 max-h-64 overflow-y-auto">
        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-widest">
          {t("heading")}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t("body1")}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t("body2")}</p>
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
            {t.rich("privacyLabel", {
              privacy: (chunks) => <span className="text-green-600 hover:underline">{chunks}</span>,
            })}
          </label>
        </div>
        {errors.privacyPolicy && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-8">{errors.privacyPolicy}</p>
        )}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={formData.termsOfService}
            onChange={(e) => setFormData({ ...formData, termsOfService: e.target.checked })}
            className="w-5 h-5 text-green-500 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-green-500/20 mt-0.5 cursor-pointer accent-green-500"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
            {t.rich("termsLabel", {
              terms: (chunks) => <span className="text-green-600 hover:underline">{chunks}</span>,
            })}
          </label>
        </div>
        {errors.termsOfService && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-8">{errors.termsOfService}</p>
        )}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="data"
            checked={formData.dataProcessing}
            onChange={(e) => setFormData({ ...formData, dataProcessing: e.target.checked })}
            className="w-5 h-5 text-green-500 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-green-500/20 mt-0.5 cursor-pointer accent-green-500"
          />
          <label htmlFor="data" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
            {t("dataLabel")}
          </label>
        </div>
        {errors.dataProcessing && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-8">{errors.dataProcessing}</p>
        )}
        {errors.submit && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight bg-red-50 dark:bg-red-950/20 p-3 rounded-xl mt-2">
            {errors.submit}
          </p>
        )}
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
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </form>
  )
}
