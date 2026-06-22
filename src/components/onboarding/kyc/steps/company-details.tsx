"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/src/components/ui/input"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingLabel,
  onboardingInputClass,
} from "../onboarding-ui"

interface CompanyDetailsStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function CompanyDetailsStep({ onNext, initialData }: CompanyDetailsStepProps) {
  const t = useTranslations("Onboarding.companyDetails")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.companyDetails.validation")

  const [formData, setFormData] = useState({
    legalName: String(initialData?.legalName ?? ""),
    registrationNumber: String(initialData?.registrationNumber ?? ""),
    taxId: String(initialData?.taxId ?? ""),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.legalName.trim()) newErrors.legalName = tv("legalNameRequired")
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = tv("registrationRequired")
    if (!formData.taxId.trim()) newErrors.taxId = tv("taxIdRequired")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <OnboardingLabel htmlFor="legalName">{t("legalNameLabel")}</OnboardingLabel>
        <Input
          id="legalName"
          type="text"
          placeholder={t("legalNamePlaceholder")}
          value={formData.legalName}
          onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.legalName ? <OnboardingError>{errors.legalName}</OnboardingError> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <OnboardingLabel htmlFor="registrationNumber">{t("registrationLabel")}</OnboardingLabel>
          <Input
            id="registrationNumber"
            type="text"
            placeholder={t("registrationPlaceholder")}
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.registrationNumber ? <OnboardingError>{errors.registrationNumber}</OnboardingError> : null}
        </div>
        <div>
          <OnboardingLabel htmlFor="taxId">{t("taxIdLabel")}</OnboardingLabel>
          <Input
            id="taxId"
            type="text"
            placeholder={t("taxIdPlaceholder")}
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.taxId ? <OnboardingError>{errors.taxId}</OnboardingError> : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false}>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
