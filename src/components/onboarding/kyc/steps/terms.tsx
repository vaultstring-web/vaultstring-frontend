"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"

interface TermsStepProps {
  onNext: (data: any) => void
}

export function TermsStep({ onNext }: TermsStepProps) {
  const [formData, setFormData] = useState({
    privacyPolicy: false,
    termsOfService: false,
    dataProcessing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.privacyPolicy) newErrors.privacyPolicy = "You must accept the privacy policy"
    if (!formData.termsOfService) newErrors.termsOfService = "You must accept the terms of service"
    if (!formData.dataProcessing) newErrors.dataProcessing = "You must consent to data processing"

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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4 max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-gray-900">Terms and Conditions</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          By using our KYC verification service, you agree to comply with all applicable laws and regulations. You
          represent that all information provided is accurate and complete. We reserve the right to deny access or
          cancel accounts if we detect fraudulent activity or violation of our terms.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your data will be processed securely and in compliance with international data protection regulations
          including GDPR and local standards.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy"
            checked={formData.privacyPolicy}
            onChange={(e) => setFormData({ ...formData, privacyPolicy: e.target.checked })}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
          />
          <label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
            I have read and agree to the Privacy Policy *
          </label>
        </div>
        {errors.privacyPolicy && <p className="text-red-600 text-sm">{errors.privacyPolicy}</p>}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={formData.termsOfService}
            onChange={(e) => setFormData({ ...formData, termsOfService: e.target.checked })}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
            I have read and agree to the Terms of Service *
          </label>
        </div>
        {errors.termsOfService && <p className="text-red-600 text-sm">{errors.termsOfService}</p>}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="data"
            checked={formData.dataProcessing}
            onChange={(e) => setFormData({ ...formData, dataProcessing: e.target.checked })}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
          />
          <label htmlFor="data" className="text-sm text-gray-700 cursor-pointer">
            I consent to the processing and storage of my personal data as described in our Privacy Policy *
          </label>
        </div>
        {errors.dataProcessing && <p className="text-red-600 text-sm">{errors.dataProcessing}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
          Complete Verification
        </Button>
      </div>
    </form>
  )
}