"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface IDVerificationStepProps {
  onNext: (data: any) => void
}

export function IDVerificationStep({ onNext }: IDVerificationStepProps) {
  const [formData, setFormData] = useState({
    documentNumber: "",
    expiryDate: "",
    file: null as File | null,
    preview: null as string | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          file,
          preview: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.documentNumber.trim()) newErrors.documentNumber = "Document number is required"
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required"
    if (!formData.file) newErrors.file = "Document file is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext({ documentNumber: formData.documentNumber, expiryDate: formData.expiryDate })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Number *</label>
          <Input
            type="text"
            placeholder="ABC123456789"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            className="w-full"
          />
          {errors.documentNumber && <p className="text-red-600 text-sm mt-1">{errors.documentNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
          <Input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full"
          />
          {errors.expiryDate && <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document *</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition">
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="cursor-pointer">
            {formData.preview ? (
              <div className="space-y-2">
                <img src={formData.preview || "/placeholder.svg"} alt="Preview" className="max-h-32 mx-auto rounded" />
                <p className="text-sm text-gray-600">{formData.file?.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, or PDF (max 10MB)</p>
              </div>
            )}
          </label>
        </div>
        {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file}</p>}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          Your document is verified securely. We only use it to confirm your identity.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
          Continue to Next Step
        </Button>
      </div>
    </form>
  )
}