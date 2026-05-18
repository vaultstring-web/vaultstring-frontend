"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface CompanyDetailsStepProps {
  onNext: (data: any) => void
}

export function CompanyDetailsStep({ onNext }: CompanyDetailsStepProps) {
  const t = useTranslations("Onboarding.companyDetails")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.companyDetails.validation")

  const [formData, setFormData] = useState({
    legalName: "",
    registrationNumber: "",
    taxId: "",
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
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("legalNameLabel")}</label>
        <Input
          type="text"
          placeholder={t("legalNamePlaceholder")}
          value={formData.legalName}
          onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
          className="w-full"
        />
        {errors.legalName && <p className="text-red-600 text-sm mt-1">{errors.legalName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("registrationLabel")}</label>
          <Input
            type="text"
            placeholder={t("registrationPlaceholder")}
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            className="w-full"
          />
          {errors.registrationNumber && <p className="text-red-600 text-sm mt-1">{errors.registrationNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("taxIdLabel")}</label>
          <Input
            type="text"
            placeholder={t("taxIdPlaceholder")}
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            className="w-full"
          />
          {errors.taxId && <p className="text-red-600 text-sm mt-1">{errors.taxId}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}