"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/src/components/ui/input"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingLabel,
  onboardingInputClass,
  onboardingSelectClass,
} from "../onboarding-ui"

interface BusinessInfoStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

const INDUSTRY_KEYS = ["technology", "finance", "healthcare", "retail", "manufacturing", "education", "other"] as const

export function BusinessInfoStep({ onNext, initialData }: BusinessInfoStepProps) {
  const t = useTranslations("Onboarding.businessInfo")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.businessInfo.validation")

  const industries = useMemo(
    () => INDUSTRY_KEYS.map((key) => ({ key, label: t(`industries.${key}`) })),
    [t],
  )

  const [formData, setFormData] = useState({
    industry: String(initialData?.industry ?? ""),
    companySize: String(initialData?.companySize ?? ""),
    website: String(initialData?.website ?? ""),
    incorporationDate: String(initialData?.incorporationDate ?? ""),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.industry) newErrors.industry = tv("industryRequired")
    if (!formData.companySize) newErrors.companySize = tv("companySizeRequired")
    if (!formData.incorporationDate) newErrors.incorporationDate = tv("incorporationDateRequired")

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
        <OnboardingLabel htmlFor="industry">{t("industryLabel")}</OnboardingLabel>
        <select
          id="industry"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          className={onboardingSelectClass}
        >
          <option value="">{t("selectIndustry")}</option>
          {industries.map((ind) => (
            <option key={ind.key} value={ind.key}>
              {ind.label}
            </option>
          ))}
        </select>
        {errors.industry ? <OnboardingError>{errors.industry}</OnboardingError> : null}
      </div>

      <div>
        <OnboardingLabel htmlFor="companySize">{t("companySizeLabel")}</OnboardingLabel>
        <select
          id="companySize"
          value={formData.companySize}
          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
          className={onboardingSelectClass}
        >
          <option value="">{t("selectCompanySize")}</option>
          <option value="1-10">{t("size1")}</option>
          <option value="11-50">{t("size2")}</option>
          <option value="51-200">{t("size3")}</option>
          <option value="201-500">{t("size4")}</option>
          <option value="500+">{t("size5")}</option>
        </select>
        {errors.companySize ? <OnboardingError>{errors.companySize}</OnboardingError> : null}
      </div>

      <div>
        <OnboardingLabel htmlFor="website">{t("websiteLabel")}</OnboardingLabel>
        <Input
          id="website"
          type="url"
          placeholder={t("websitePlaceholder")}
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className={onboardingInputClass}
        />
      </div>

      <div>
        <OnboardingLabel htmlFor="incorporationDate">{t("incorporationDateLabel")}</OnboardingLabel>
        <Input
          id="incorporationDate"
          type="date"
          value={formData.incorporationDate}
          onChange={(e) => setFormData({ ...formData, incorporationDate: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.incorporationDate ? <OnboardingError>{errors.incorporationDate}</OnboardingError> : null}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false}>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
