"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/src/components/ui/input"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingInfoBox,
  OnboardingLabel,
  onboardingInputClass,
} from "../onboarding-ui"

interface SecuritySetupStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

const QUESTION_KEYS = ["maidenName", "firstPet", "birthCity", "favoriteTeacher", "firstCar"] as const

export function SecuritySetupStep({ onNext, initialData }: SecuritySetupStepProps) {
  const t = useTranslations("Onboarding.securitySetup")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.securitySetup.validation")

  const questions = useMemo(
    () => QUESTION_KEYS.map((key) => ({ key, label: t(`questions.${key}`) })),
    [t],
  )

  const [formData, setFormData] = useState({
    twoFAEnabled: Boolean(initialData?.twoFAEnabled ?? false),
    securityQuestion1: String(initialData?.securityQuestion1 ?? ""),
    securityAnswer1: String(initialData?.securityAnswer1 ?? ""),
    securityQuestion2: String(initialData?.securityQuestion2 ?? ""),
    securityAnswer2: String(initialData?.securityAnswer2 ?? ""),
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
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="twoFA" className="text-sm font-medium text-foreground">
            {t("twoFaLabel")}
          </Label>
        </div>
        <Switch
          id="twoFA"
          checked={formData.twoFAEnabled}
          onCheckedChange={(checked) => setFormData({ ...formData, twoFAEnabled: checked })}
        />
      </div>

      <div>
        <OnboardingLabel>{t("question1Label")}</OnboardingLabel>
        <Select
          value={formData.securityQuestion1}
          onValueChange={(value) => setFormData({ ...formData, securityQuestion1: value })}
        >
          <SelectTrigger className="w-full h-14 rounded-2xl">
            <SelectValue placeholder={t("selectQuestion")} />
          </SelectTrigger>
          <SelectContent>
            {questions.map((q) => (
              <SelectItem key={q.key} value={q.label}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.securityQuestion1 ? <OnboardingError>{errors.securityQuestion1}</OnboardingError> : null}
      </div>

      <div>
        <OnboardingLabel htmlFor="securityAnswer">{t("answerLabel")}</OnboardingLabel>
        <Input
          id="securityAnswer"
          type="text"
          placeholder={t("answerPlaceholder")}
          value={formData.securityAnswer1}
          onChange={(e) => setFormData({ ...formData, securityAnswer1: e.target.value })}
          className={onboardingInputClass}
        />
        {errors.securityAnswer1 ? <OnboardingError>{errors.securityAnswer1}</OnboardingError> : null}
      </div>

      <OnboardingInfoBox>{t("recoveryNote")}</OnboardingInfoBox>

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false}>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
