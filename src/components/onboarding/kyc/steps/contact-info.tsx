"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/src/components/ui/input"
import { OnboardingContinueButton, OnboardingLabel, onboardingInputClass } from "../onboarding-ui"

interface ContactInfoStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function ContactInfoStep({ onNext, initialData }: ContactInfoStepProps) {
  const t = useTranslations("Onboarding.contactInfo")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.contactInfo.validation")

  const [formData, setFormData] = useState({
    phone: String(initialData?.phone ?? ""),
    email: String(initialData?.email ?? ""),
    address: String(initialData?.address ?? ""),
    city: String(initialData?.city ?? ""),
    country: String(initialData?.country ?? ""),
    postalCode: String(initialData?.postalCode ?? ""),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone.trim()) newErrors.phone = tv("phoneRequired")
    if (!formData.email.trim()) newErrors.email = tv("emailRequired")
    if (!formData.address.trim()) newErrors.address = tv("addressRequired")
    if (!formData.city.trim()) newErrors.city = tv("cityRequired")
    if (!formData.country.trim()) newErrors.country = tv("countryRequired")
    if (!formData.postalCode.trim()) newErrors.postalCode = tv("postalCodeRequired")

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
          <OnboardingLabel compact htmlFor="phone">
            {t("phoneLabel")}
          </OnboardingLabel>
          <Input
            id="phone"
            type="tel"
            placeholder={t("phonePlaceholder")}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.phone ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.phone}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="email">
            {t("emailLabel")}
          </OnboardingLabel>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.email ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.email}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <OnboardingLabel compact htmlFor="address">
          {t("addressLabel")}
        </OnboardingLabel>
        <Input
          id="address"
          type="text"
          placeholder={t("addressPlaceholder")}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.address ? (
          <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.address}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="city">
            {t("cityLabel")}
          </OnboardingLabel>
          <Input
            id="city"
            type="text"
            placeholder={t("cityPlaceholder")}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.city ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.city}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="country">
            {t("countryLabel")}
          </OnboardingLabel>
          <Input
            id="country"
            type="text"
            placeholder={t("countryPlaceholder")}
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.country ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.country}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <OnboardingLabel compact htmlFor="postalCode">
            {t("postalCodeLabel")}
          </OnboardingLabel>
          <Input
            id="postalCode"
            type="text"
            placeholder={t("postalCodePlaceholder")}
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className={onboardingInputClass}
          />
          {errors.postalCode ? (
            <p className="text-destructive text-[10px] font-bold uppercase tracking-tight ml-1">{errors.postalCode}</p>
          ) : null}
        </div>
      </div>

      <div className="pt-4">
        <OnboardingContinueButton>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
