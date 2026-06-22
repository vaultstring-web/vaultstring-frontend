"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingLabel,
  onboardingInputClass,
} from "../onboarding-ui"

interface Rep {
  name: string
  email: string
  title: string
}

interface AuthorizedRepsStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

function parseInitialReps(initialData?: Record<string, unknown>): Rep[] {
  const raw = initialData?.authorizedReps
  if (Array.isArray(raw) && raw.length > 0) {
    const reps = raw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((rep) => ({
        name: String(rep.name ?? ""),
        email: String(rep.email ?? ""),
        title: String(rep.title ?? ""),
      }))

    if (reps.length > 0) return reps
  }
  return [{ name: "", email: "", title: "" }]
}

export function AuthorizedRepsStep({ onNext, initialData }: AuthorizedRepsStepProps) {
  const t = useTranslations("Onboarding.authorizedReps")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.authorizedReps.validation")

  const [reps, setReps] = useState<Rep[]>(() => parseInitialReps(initialData))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    reps.forEach((rep, idx) => {
      if (!rep.name.trim()) newErrors[`name-${idx}`] = tv("nameRequired")
      if (!rep.email.trim()) newErrors[`email-${idx}`] = tv("emailRequired")
      if (!rep.title.trim()) newErrors[`title-${idx}`] = tv("titleRequired")
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext({ authorizedReps: reps })
    }
  }

  const addRep = () => {
    setReps([...reps, { name: "", email: "", title: "" }])
  }

  const removeRep = (index: number) => {
    if (reps.length > 1) {
      setReps(reps.filter((_, i) => i !== index))
    }
  }

  const updateRep = (index: number, field: keyof Rep, value: string) => {
    const newReps = [...reps]
    newReps[index] = { ...newReps[index], [field]: value }
    setReps(newReps)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {reps.map((rep, idx) => (
        <div key={idx} className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{t("representativeTitle", { n: idx + 1 })}</h3>
            {reps.length > 1 && (
              <button
                type="button"
                onClick={() => removeRep(idx)}
                className="text-destructive text-sm hover:underline"
              >
                {t("remove")}
              </button>
            )}
          </div>

          <div>
            <OnboardingLabel htmlFor={`rep-name-${idx}`}>{t("fullNameLabel")}</OnboardingLabel>
            <Input
              id={`rep-name-${idx}`}
              type="text"
              placeholder={t("fullNamePlaceholder")}
              value={rep.name}
              onChange={(e) => updateRep(idx, "name", e.target.value)}
              className={onboardingInputClass}
            />
            {errors[`name-${idx}`] ? <OnboardingError>{errors[`name-${idx}`]}</OnboardingError> : null}
          </div>

          <div>
            <OnboardingLabel htmlFor={`rep-email-${idx}`}>{t("emailLabel")}</OnboardingLabel>
            <Input
              id={`rep-email-${idx}`}
              type="email"
              placeholder={t("emailPlaceholder")}
              value={rep.email}
              onChange={(e) => updateRep(idx, "email", e.target.value)}
              className={onboardingInputClass}
            />
            {errors[`email-${idx}`] ? <OnboardingError>{errors[`email-${idx}`]}</OnboardingError> : null}
          </div>

          <div>
            <OnboardingLabel htmlFor={`rep-title-${idx}`}>{t("jobTitleLabel")}</OnboardingLabel>
            <Input
              id={`rep-title-${idx}`}
              type="text"
              placeholder={t("jobTitlePlaceholder")}
              value={rep.title}
              onChange={(e) => updateRep(idx, "title", e.target.value)}
              className={onboardingInputClass}
            />
            {errors[`title-${idx}`] ? <OnboardingError>{errors[`title-${idx}`]}</OnboardingError> : null}
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addRep}
        variant="outline"
        className="w-full border-border text-foreground hover:bg-muted/50"
      >
        {t("addAnother")}
      </Button>

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false}>{tFlow("continue")}</OnboardingContinueButton>
      </div>
    </form>
  )
}
