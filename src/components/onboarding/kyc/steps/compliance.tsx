"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingInfoBox,
  OnboardingLabel,
  onboardingSelectClass,
} from "../onboarding-ui"

interface ComplianceStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function ComplianceStep({ onNext, initialData }: ComplianceStepProps) {
  const t = useTranslations("Onboarding.compliance")
  const tv = useTranslations("Onboarding.compliance.validation")

  const [formData, setFormData] = useState({
    businessPurpose: String(initialData?.businessPurpose ?? ""),
    expectedVolume: String(initialData?.expectedVolume ?? ""),
    compliance: Boolean(initialData?.compliance ?? false),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessPurpose) newErrors.businessPurpose = tv("purposeRequired")
    if (!formData.expectedVolume) newErrors.expectedVolume = tv("volumeRequired")
    if (!formData.compliance) newErrors.compliance = tv("complianceRequired")

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
        <OnboardingLabel htmlFor="businessPurpose">{t("businessPurposeLabel")}</OnboardingLabel>
        <select
          id="businessPurpose"
          value={formData.businessPurpose}
          onChange={(e) => setFormData({ ...formData, businessPurpose: e.target.value })}
          className={onboardingSelectClass}
        >
          <option value="">{t("selectPurpose")}</option>
          <option value="trading">{t("purposes.trading")}</option>
          <option value="consulting">{t("purposes.consulting")}</option>
          <option value="manufacturing">{t("purposes.manufacturing")}</option>
          <option value="services">{t("purposes.services")}</option>
          <option value="other">{t("purposes.other")}</option>
        </select>
        {errors.businessPurpose ? <OnboardingError>{errors.businessPurpose}</OnboardingError> : null}
      </div>

      <div>
        <OnboardingLabel htmlFor="expectedVolume">{t("expectedVolumeLabel")}</OnboardingLabel>
        <select
          id="expectedVolume"
          value={formData.expectedVolume}
          onChange={(e) => setFormData({ ...formData, expectedVolume: e.target.value })}
          className={onboardingSelectClass}
        >
          <option value="">{t("selectRange")}</option>
          <option value="0-10000">{t("volume0")}</option>
          <option value="10000-50000">{t("volume1")}</option>
          <option value="50000-100000">{t("volume2")}</option>
          <option value="100000+">{t("volume3")}</option>
        </select>
        {errors.expectedVolume ? <OnboardingError>{errors.expectedVolume}</OnboardingError> : null}
      </div>

      <OnboardingInfoBox variant="warning">
        <p className="font-medium">{t("confirmationHeading")}</p>
        <p>{t("confirmationBody")}</p>
      </OnboardingInfoBox>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="compliance"
          checked={formData.compliance}
          onChange={(e) => setFormData({ ...formData, compliance: e.target.checked })}
          className="w-4 h-4 text-primary border-border rounded focus:ring-ring mt-1"
        />
        <label htmlFor="compliance" className="text-sm text-foreground cursor-pointer">
          {t("checkboxLabel")}
        </label>
      </div>
      {errors.compliance ? <OnboardingError>{errors.compliance}</OnboardingError> : null}

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false}>{t("submit")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
