"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface BankingDetailsStepProps {
  onNext: (data: any) => void
}

export function BankingDetailsStep({ onNext }: BankingDetailsStepProps) {
  const t = useTranslations("Onboarding.bankingDetails")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.bankingDetails.validation")

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    bankCode: "",
    accountHolder: "",
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
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("bankNameLabel")}</label>
        <Input
          type="text"
          placeholder={t("bankNamePlaceholder")}
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          className="w-full"
        />
        {errors.bankName && <p className="text-red-600 text-sm mt-1">{errors.bankName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("accountNumberLabel")}</label>
          <Input
            type="text"
            placeholder={t("accountNumberPlaceholder")}
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full"
          />
          {errors.accountNumber && <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("bankCodeLabel")}</label>
          <Input
            type="text"
            placeholder={t("bankCodePlaceholder")}
            value={formData.bankCode}
            onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
            className="w-full"
          />
          {errors.bankCode && <p className="text-red-600 text-sm mt-1">{errors.bankCode}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("accountHolderLabel")}</label>
        <Input
          type="text"
          placeholder={t("accountHolderPlaceholder")}
          value={formData.accountHolder}
          onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
          className="w-full"
        />
        {errors.accountHolder && <p className="text-red-600 text-sm mt-1">{errors.accountHolder}</p>}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">{t("encryptedNote")}</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}