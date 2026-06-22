"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/src/components/ui/input"
import {
  OnboardingContinueButton,
  OnboardingInfoBox,
  OnboardingLabel,
  onboardingInputClass,
  onboardingSelectClass,
} from "../onboarding-ui"

interface PersonalDetailsStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function PersonalDetailsStep({ onNext, initialData }: PersonalDetailsStepProps) {
  const t = useTranslations("Onboarding.personalDetails")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.personalDetails.validation")

  const [formData, setFormData] = useState({
    firstName: String(initialData?.firstName ?? ""),
    lastName: String(initialData?.lastName ?? ""),
    dateOfBirth: String(initialData?.dateOfBirth ?? ""),
    nationality: String(initialData?.nationality ?? ""),
    idType: String(initialData?.idType ?? "passport"),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = tv("firstNameRequired")
    if (!formData.lastName.trim()) newErrors.lastName = tv("lastNameRequired")
    if (!formData.dateOfBirth) newErrors.dateOfBirth = tv("dateOfBirthRequired")
    if (!formData.nationality.trim()) newErrors.nationality = tv("nationalityRequired")

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="firstName">
            {t("firstNameLabel")}
          </OnboardingLabel>
          <Input
            id="firstName"
            type="text"
            placeholder={t("firstNamePlaceholder")}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.firstName ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.firstName}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="lastName">
            {t("lastNameLabel")}
          </OnboardingLabel>
          <Input
            id="lastName"
            type="text"
            placeholder={t("lastNamePlaceholder")}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.lastName ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.lastName}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <OnboardingLabel compact htmlFor="dateOfBirth">
          {t("dateOfBirthLabel")}
        </OnboardingLabel>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.dateOfBirth ? (
          <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.dateOfBirth}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="nationality">
            {t("nationalityLabel")}
          </OnboardingLabel>
          <Input
            id="nationality"
            type="text"
            placeholder={t("nationalityPlaceholder")}
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.nationality ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.nationality}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="idType">
            {t("idTypeLabel")}
          </OnboardingLabel>
          <select
            id="idType"
            value={formData.idType}
            onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
            className={onboardingSelectClass}
          >
            <option value="passport">{t("idTypePassport")}</option>
            <option value="driver_license">{t("idTypeDriverLicense")}</option>
            <option value="national_id">{t("idTypeNationalId")}</option>
          </select>
        </div>
      </div>

      <OnboardingInfoBox>{t("encryptionNote")}</OnboardingInfoBox>

      <div className="pt-4">
        <OnboardingContinueButton>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
