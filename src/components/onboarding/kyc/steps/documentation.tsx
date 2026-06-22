"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { FileText } from "lucide-react"
import { apiFetch } from "@/src/lib/api/api-client"
import {
  OnboardingContinueButton,
  OnboardingError,
  OnboardingLabel,
  onboardingUploadZone,
} from "../onboarding-ui"

interface DocumentationStepProps {
  onNext: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

type DocumentField = "incorporation" | "articles" | "shareholders"

const DOCUMENT_UPLOADS: Array<{
  key: DocumentField
  documentType: string
  required: boolean
}> = [
  { key: "incorporation", documentType: "business_incorporation_certificate", required: true },
  { key: "articles", documentType: "business_articles_association", required: true },
  { key: "shareholders", documentType: "business_shareholder_register", required: false },
]

export function DocumentationStep({ onNext, initialData }: DocumentationStepProps) {
  const t = useTranslations("Onboarding.documentation")
  const tFlow = useTranslations("Onboarding.flow")
  const tv = useTranslations("Onboarding.documentation.validation")

  const [files, setFiles] = useState({
    incorporation: null as File | null,
    articles: null as File | null,
    shareholders: null as File | null,
  })

  const [previews, setPreviews] = useState({
    incorporation: null as string | null,
    articles: null as string | null,
    shareholders: null as string | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: DocumentField,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [fieldName]: t("fileTooLarge") }))
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setFiles((prev) => ({ ...prev, [fieldName]: file }))
      setPreviews((prev) => ({ ...prev, [fieldName]: reader.result as string }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!files.incorporation) newErrors.incorporation = tv("incorporationRequired")
    if (!files.articles) newErrors.articles = tv("articlesRequired")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        const registrationNumber = String(initialData?.registrationNumber || `BUS-${Date.now()}`)
        const issuingCountry = String(initialData?.countryCode || initialData?.country || "MW").slice(0, 2).toUpperCase()

        for (const upload of DOCUMENT_UPLOADS) {
          const file = files[upload.key]
          if (!file) continue

          const formData = new FormData()
          formData.append("documents", file)
          formData.append("document_type", upload.documentType)
          formData.append("document_number", `${registrationNumber}-${upload.key}`)
          formData.append("issuing_country", issuingCountry)

          await apiFetch("/compliance/kyc/submit", {
            method: "POST",
            body: formData,
          })
        }

        if (process.env.NODE_ENV === "development") {
          console.info("[KYC] Upload success")
        }
        onNext({ documents: files })
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Upload failed", err)
        }
        setErrors({ submit: t("errorUpload") })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const docFields = DOCUMENT_UPLOADS.map((field) => ({
    ...field,
    label:
      field.key === "incorporation"
        ? t("incorporationLabel")
        : field.key === "articles"
          ? t("articlesLabel")
          : t("shareholdersLabel"),
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {docFields.map(({ key, label, required }) => (
        <div key={key}>
          <OnboardingLabel htmlFor={`file-${key}`}>
            {label} {required && "*"}
          </OnboardingLabel>
          <div className={onboardingUploadZone}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, key)}
              className="hidden"
              id={`file-${key}`}
            />
            <label htmlFor={`file-${key}`} className="cursor-pointer block">
              {previews[key] ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{files[key]?.name}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{t("uploadSuccess")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium text-foreground">{t("uploadCta")}</p>
                  <p className="text-xs text-muted-foreground">{t("uploadFormats")}</p>
                </div>
              )}
            </label>
          </div>
          {errors[key] ? <OnboardingError>{errors[key]}</OnboardingError> : null}
        </div>
      ))}

      {errors.submit ? <OnboardingError>{errors.submit}</OnboardingError> : null}

      <div className="flex justify-end gap-2 pt-4">
        <OnboardingContinueButton fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? t("uploading") : tFlow("continue")}
        </OnboardingContinueButton>
      </div>
    </form>
  )
}
