"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"

interface SecuritySetupStepProps {
  onNext: (data: Record<string, unknown>) => void
}

const QUESTION_KEYS = ["maidenName", "firstPet", "birthCity", "favoriteTeacher", "firstCar"] as const

export function SecuritySetupStep({ onNext }: SecuritySetupStepProps) {
  const t = useTranslations("Onboarding.securitySetup")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.securitySetup.validation")

  const questions = useMemo(
    () => QUESTION_KEYS.map((key) => ({ key, label: t(`questions.${key}`) })),
    [t],
  )

  const [formData, setFormData] = useState({
    twoFAEnabled: false,
    securityQuestion1: "",
    securityAnswer1: "",
    securityQuestion2: "",
    securityAnswer2: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.securityQuestion1) newErrors.securityQuestion1 = tv("questionRequired")
    if (!formData.securityAnswer1.trim()) newErrors.securityAnswer1 = tv("answerRequired")

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
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <input
          type="checkbox"
          id="twoFA"
          checked={formData.twoFAEnabled}
          onChange={(e) => setFormData({ ...formData, twoFAEnabled: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="twoFA" className="text-sm text-gray-700 cursor-pointer">
          {t("twoFaLabel")}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("question1Label")}</label>
        <select
          value={formData.securityQuestion1}
          onChange={(e) => setFormData({ ...formData, securityQuestion1: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">{t("selectQuestion")}</option>
          {questions.map((q) => (
            <option key={q.key} value={q.label}>
              {q.label}
            </option>
          ))}
        </select>
        {errors.securityQuestion1 && <p className="text-red-600 text-sm mt-1">{errors.securityQuestion1}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("answerLabel")}</label>
        <input
          type="text"
          placeholder={t("answerPlaceholder")}
          value={formData.securityAnswer1}
          onChange={(e) => setFormData({ ...formData, securityAnswer1: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {errors.securityAnswer1 && <p className="text-red-600 text-sm mt-1">{errors.securityAnswer1}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">{t("recoveryNote")}</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}
