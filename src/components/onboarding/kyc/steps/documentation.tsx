"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"

interface DocumentationStepProps {
  onNext: (data: any) => void
}

export function DocumentationStep({ onNext }: DocumentationStepProps) {
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

    if (!files.incorporation) newErrors.incorporation = "Certificate of incorporation is required"
    if (!files.articles) newErrors.articles = "Articles of association are required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext({ documents: files })
    }
  }

  const docFields = [
    { key: "incorporation", label: "Certificate of Incorporation", required: true },
    { key: "articles", label: "Articles of Association", required: true },
    { key: "shareholders", label: "Shareholder Register", required: false },
  ] as const

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
                  <p className="text-xs text-green-600">File uploaded successfully</p>
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
                  <p className="text-sm font-medium text-gray-700">Click to upload</p>
                  <p className="text-xs text-gray-500">PDF or DOC (max 20MB)</p>
                </div>
              )}
            </label>
          </div>
          {errors[key] && <p className="text-red-600 text-sm mt-1">{errors[key]}</p>}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          Continue to Next Step
        </Button>
      </div>
    </form>
  )
}