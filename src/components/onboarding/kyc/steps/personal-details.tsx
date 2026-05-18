"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface PersonalDetailsStepProps {
  onNext: (data: Record<string, unknown>) => void
}

export function PersonalDetailsStep({ onNext }: PersonalDetailsStepProps) {
  const t = useTranslations("Onboarding.personalDetails")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.personalDetails.validation")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    idType: "passport",
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
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("firstNameLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("firstNamePlaceholder")}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.firstName && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("lastNameLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("lastNamePlaceholder")}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.lastName && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
          {t("dateOfBirthLabel")}
        </label>
        <Input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
        />
        {errors.dateOfBirth && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.dateOfBirth}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("nationalityLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("nationalityPlaceholder")}
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.nationality && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.nationality}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("idTypeLabel")}
          </label>
          <select
            value={formData.idType}
            onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
            className="w-full h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-500/10 appearance-none cursor-pointer"
          >
            <option value="passport">{t("idTypePassport")}</option>
            <option value="driver_license">{t("idTypeDriverLicense")}</option>
            <option value="national_id">{t("idTypeNationalId")}</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">{t("encryptionNote")}</p>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}
