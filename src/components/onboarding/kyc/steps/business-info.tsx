"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface BusinessInfoStepProps {
  onNext: (data: Record<string, unknown>) => void
}

const INDUSTRY_KEYS = ["technology", "finance", "healthcare", "retail", "manufacturing", "education", "other"] as const

export function BusinessInfoStep({ onNext }: BusinessInfoStepProps) {
  const t = useTranslations("Onboarding.businessInfo")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.businessInfo.validation")

  const industries = useMemo(
    () => INDUSTRY_KEYS.map((key) => ({ key, label: t(`industries.${key}`) })),
    [t],
  )

  const [formData, setFormData] = useState({
    industry: "",
    companySize: "",
    website: "",
    incorporationDate: "",
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
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("industryLabel")}</label>
        <select
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option value="">{t("selectIndustry")}</option>
          {industries.map((ind) => (
            <option key={ind.key} value={ind.key}>
              {ind.label}
            </option>
          ))}
        </select>
        {errors.industry && <p className="text-red-600 text-sm mt-1">{errors.industry}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("companySizeLabel")}</label>
        <select
          value={formData.companySize}
          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option value="">{t("selectCompanySize")}</option>
          <option value="1-10">{t("size1")}</option>
          <option value="11-50">{t("size2")}</option>
          <option value="51-200">{t("size3")}</option>
          <option value="201-500">{t("size4")}</option>
          <option value="500+">{t("size5")}</option>
        </select>
        {errors.companySize && <p className="text-red-600 text-sm mt-1">{errors.companySize}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("websiteLabel")}</label>
        <Input
          type="url"
          placeholder={t("websitePlaceholder")}
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("incorporationDateLabel")}</label>
        <Input
          type="date"
          value={formData.incorporationDate}
          onChange={(e) => setFormData({ ...formData, incorporationDate: e.target.value })}
          className="w-full"
        />
        {errors.incorporationDate && <p className="text-red-600 text-sm mt-1">{errors.incorporationDate}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}
