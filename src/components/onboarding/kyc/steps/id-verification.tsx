"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/src/components/ui/input"
import { Upload } from "lucide-react"
import { apiFetch } from "@/src/lib/api/api-client"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingInfoBox,
  OnboardingLabel,
  onboardingUploadZone,
  onboardingInputClass,
} from "../onboarding-ui"

interface IDVerificationStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

const MAX_FILE_BYTES = 10 * 1024 * 1024

export function IDVerificationStep({ onNext, initialData }: IDVerificationStepProps) {
  const t = useTranslations("Onboarding.idVerification")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.idVerification.validation")

  const [formData, setFormData] = useState({
    documentNumber: String(initialData?.documentNumber ?? ""),
    expiryDate: String(initialData?.expiryDate ?? ""),
    file: null as File | null,
    preview: null as string | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setErrors((prev) => ({ ...prev, file: tv("fileTooLarge") }))
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        file,
        preview: reader.result as string,
      }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next.file
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.documentNumber.trim()) newErrors.documentNumber = tv("documentNumberRequired")
    if (!formData.expiryDate) newErrors.expiryDate = tv("expiryDateRequired")
    if (!formData.file && !initialData?.documentNumber) newErrors.file = tv("fileRequired")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (formData.file) {
        const issuingCountry = String(initialData?.countryCode || initialData?.country || "MW")
          .slice(0, 2)
          .toUpperCase()
        const body = new FormData()
        body.append("documents", formData.file)
        body.append("document_type", "national_id")
        body.append("document_number", formData.documentNumber.trim())
        body.append("issuing_country", issuingCountry)

        await apiFetch("/compliance/kyc/submit", {
          method: "POST",
          body,
        })
      }

      onNext({
        documentNumber: formData.documentNumber,
        expiryDate: formData.expiryDate,
      })
    } catch {
      setErrors({ submit: t("uploadError") })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <OnboardingLabel htmlFor="documentNumber">{t("documentNumberLabel")}</OnboardingLabel>
          <Input
            id="documentNumber"
            type="text"
            placeholder={t("documentNumberPlaceholder")}
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.documentNumber ? <OnboardingError>{errors.documentNumber}</OnboardingError> : null}
        </div>
        <div>
          <OnboardingLabel htmlFor="expiryDate">{t("expiryDateLabel")}</OnboardingLabel>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.expiryDate ? <OnboardingError>{errors.expiryDate}</OnboardingError> : null}
        </div>
      </div>

      <div>
        <OnboardingLabel>{t("uploadLabel")}</OnboardingLabel>
        <div className={onboardingUploadZone}>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="cursor-pointer block">
            {formData.preview ? (
              <div className="space-y-2">
                <img src={formData.preview || "/placeholder.svg"} alt={t("previewAlt")} className="max-h-32 mx-auto rounded" />
                <p className="text-sm text-muted-foreground">{formData.file?.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium text-foreground">{t("uploadCta")}</p>
                <p className="text-xs text-muted-foreground">{t("uploadFormats")}</p>
              </div>
            )}
          </label>
        </div>
        {errors.file ? <OnboardingError>{errors.file}</OnboardingError> : null}
      </div>

      {errors.submit ? <OnboardingError>{errors.submit}</OnboardingError> : null}

      <OnboardingInfoBox variant="success">{t("secureNote")}</OnboardingInfoBox>

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? t("uploading") : tFlow("continue")}
        </OnboardingContinueButton>
      </div>
    </form>
  )
}
