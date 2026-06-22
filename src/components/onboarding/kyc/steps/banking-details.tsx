"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/src/components/ui/input"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingInfoBox,
  OnboardingLabel,
  onboardingInputClass,
} from "../onboarding-ui"

interface BankingDetailsStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function BankingDetailsStep({ onNext, initialData }: BankingDetailsStepProps) {
  const t = useTranslations("Onboarding.bankingDetails")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.bankingDetails.validation")

  const [formData, setFormData] = useState({
    bankName: String(initialData?.bankName ?? ""),
    accountNumber: String(initialData?.accountNumber ?? ""),
    bankCode: String(initialData?.bankCode ?? ""),
    accountHolder: String(initialData?.accountHolder ?? ""),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.bankName.trim()) newErrors.bankName = tv("bankNameRequired")
    if (!formData.accountNumber.trim()) newErrors.accountNumber = tv("accountNumberRequired")
    if (!formData.bankCode.trim()) newErrors.bankCode = tv("bankCodeRequired")
    if (!formData.accountHolder.trim()) newErrors.accountHolder = tv("accountHolderRequired")

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
        <OnboardingLabel htmlFor="bankName">{t("bankNameLabel")}</OnboardingLabel>
        <Input
          id="bankName"
          type="text"
          placeholder={t("bankNamePlaceholder")}
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.bankName ? <OnboardingError>{errors.bankName}</OnboardingError> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <OnboardingLabel htmlFor="accountNumber">{t("accountNumberLabel")}</OnboardingLabel>
          <Input
            id="accountNumber"
            type="text"
            placeholder={t("accountNumberPlaceholder")}
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.accountNumber ? <OnboardingError>{errors.accountNumber}</OnboardingError> : null}
        </div>
        <div>
          <OnboardingLabel htmlFor="bankCode">{t("bankCodeLabel")}</OnboardingLabel>
          <Input
            id="bankCode"
            type="text"
            placeholder={t("bankCodePlaceholder")}
            value={formData.bankCode}
            onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.bankCode ? <OnboardingError>{errors.bankCode}</OnboardingError> : null}
        </div>
      </div>

      <div>
        <OnboardingLabel htmlFor="accountHolder">{t("accountHolderLabel")}</OnboardingLabel>
        <Input
          id="accountHolder"
          type="text"
          placeholder={t("accountHolderPlaceholder")}
          value={formData.accountHolder}
          onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.accountHolder ? <OnboardingError>{errors.accountHolder}</OnboardingError> : null}
      </div>

      <OnboardingInfoBox variant="success">{t("encryptedNote")}</OnboardingInfoBox>

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false}>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
