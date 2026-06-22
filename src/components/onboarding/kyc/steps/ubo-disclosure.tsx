"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Input } from "@/src/components/ui/input"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingInfoBox,
  OnboardingLabel,
  onboardingInputClass,
  onboardingRadioRow,
} from "../onboarding-ui"

interface UBODisclosureStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function UBODisclosureStep({ onNext, initialData }: UBODisclosureStepProps) {
  const t = useTranslations("Onboarding.uboDisclosure")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.uboDisclosure.validation")

  const [formData, setFormData] = useState({
    uboName: String(initialData?.uboName ?? ""),
    uboOwnershipPercentage: String(initialData?.uboOwnershipPercentage ?? ""),
    uboNationality: String(initialData?.uboNationality ?? ""),
    ownershipStructure: String(initialData?.ownershipStructure ?? "direct"),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.uboName.trim()) newErrors.uboName = tv("uboNameRequired")
    if (!formData.uboOwnershipPercentage) newErrors.uboOwnershipPercentage = tv("ownershipRequired")
    if (!formData.uboNationality.trim()) newErrors.uboNationality = tv("nationalityRequired")

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
      <OnboardingInfoBox>{t("intro")}</OnboardingInfoBox>

      <div>
        <OnboardingLabel className="mb-4">{t("ownershipStructureLabel")}</OnboardingLabel>
        <RadioGroup
          value={formData.ownershipStructure}
          onValueChange={(value) => setFormData({ ...formData, ownershipStructure: value })}
          className="space-y-2"
        >
          <div className={onboardingRadioRow}>
            <RadioGroupItem value="direct" id="ownership-direct" />
            <Label htmlFor="ownership-direct" className="flex-1 cursor-pointer text-sm text-foreground">
              {t("directOwnership")}
            </Label>
          </div>
          <div className={onboardingRadioRow}>
            <RadioGroupItem value="indirect" id="ownership-indirect" />
            <Label htmlFor="ownership-indirect" className="flex-1 cursor-pointer text-sm text-foreground">
              {t("indirectOwnership")}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <OnboardingLabel htmlFor="uboName">{t("uboNameLabel")}</OnboardingLabel>
        <Input
          id="uboName"
          type="text"
          placeholder={t("uboNamePlaceholder")}
          value={formData.uboName}
          onChange={(e) => setFormData({ ...formData, uboName: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.uboName ? <OnboardingError>{errors.uboName}</OnboardingError> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <OnboardingLabel htmlFor="uboOwnershipPercentage">{t("ownershipPercentLabel")}</OnboardingLabel>
          <Input
            id="uboOwnershipPercentage"
            type="number"
            min="0"
            max="100"
            placeholder={t("ownershipPercentPlaceholder")}
            value={formData.uboOwnershipPercentage}
            onChange={(e) => setFormData({ ...formData, uboOwnershipPercentage: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.uboOwnershipPercentage ? (
            <OnboardingError>{errors.uboOwnershipPercentage}</OnboardingError>
          ) : null}
        </div>
        <div>
          <OnboardingLabel htmlFor="uboNationality">{t("nationalityLabel")}</OnboardingLabel>
          <Input
            id="uboNationality"
            type="text"
            placeholder={t("nationalityPlaceholder")}
            value={formData.uboNationality}
            onChange={(e) => setFormData({ ...formData, uboNationality: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.uboNationality ? <OnboardingError>{errors.uboNationality}</OnboardingError> : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false}>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
