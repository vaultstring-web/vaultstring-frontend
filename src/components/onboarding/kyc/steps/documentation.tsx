"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { apiFetch } from "@/src/lib/api/api-client"

interface DocumentationStepProps {
  onNext: (data: any) => void
}

export function DocumentationStep({ onNext }: DocumentationStepProps) {
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
    fieldName: "incorporation" | "articles" | "shareholders",
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFiles({ ...files, [fieldName]: file })
        setPreviews({ ...previews, [fieldName]: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
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
        const formData = new FormData()
        if (files.incorporation) formData.append("incorporation", files.incorporation)
        if (files.articles) formData.append("articles", files.articles)
        if (files.shareholders) formData.append("shareholders", files.shareholders)

        const data = await apiFetch('/compliance/kyc/submit', {
          method: "POST",
          body: formData,
        })

        console.log("Upload success:", data)
        onNext({ documents: files })
      } catch (err) {
        console.error("Upload failed", err)
        setErrors({ submit: t("errorUpload") })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const docFields = [
    { key: "incorporation" as const, label: t("incorporationLabel"), required: true },
    { key: "articles" as const, label: t("articlesLabel"), required: true },
    { key: "shareholders" as const, label: t("shareholdersLabel"), required: false },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {docFields.map(({ key, label, required }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && "*"}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, key)}
              className="hidden"
              id={`file-${key}`}
            />
            <label htmlFor={`file-${key}`} className="cursor-pointer">
              {previews[key] ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">{files[key]?.name}</p>
                  <p className="text-xs text-green-600">{t("uploadSuccess")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">{t("uploadCta")}</p>
                  <p className="text-xs text-gray-500">{t("uploadFormats")}</p>
                </div>
              )}
            </label>
          </div>
          {errors[key] && <p className="text-red-600 text-sm mt-1">{errors[key]}</p>}
        </div>
      ))}
      
      {errors.submit && <p className="text-red-600 text-sm text-center">{errors.submit}</p>}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white" disabled={isSubmitting}>
          {isSubmitting ? t("uploading") : tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}
