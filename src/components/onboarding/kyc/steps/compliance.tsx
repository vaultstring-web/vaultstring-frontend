"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"

interface ComplianceStepProps {
  onNext: (data: any) => void
}

export function ComplianceStep({ onNext }: ComplianceStepProps) {
  const [formData, setFormData] = useState({
    businessPurpose: "",
    expectedVolume: "",
    compliance: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessPurpose) newErrors.businessPurpose = "Business purpose is required"
    if (!formData.expectedVolume) newErrors.expectedVolume = "Expected transaction volume is required"
    if (!formData.compliance) newErrors.compliance = "You must accept the compliance confirmation"

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Purpose *</label>
        <select
          value={formData.businessPurpose}
          onChange={(e) => setFormData({ ...formData, businessPurpose: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option value="">Select business purpose</option>
          <option value="trading">Trading</option>
          <option value="consulting">Consulting</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="services">Services</option>
          <option value="other">Other</option>
        </select>
        {errors.businessPurpose && <p className="text-red-600 text-sm mt-1">{errors.businessPurpose}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Monthly Transaction Volume *</label>
        <select
          value={formData.expectedVolume}
          onChange={(e) => setFormData({ ...formData, expectedVolume: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option value="">Select range</option>
          <option value="0-10000">$0 - $10,000</option>
          <option value="10000-50000">$10,000 - $50,000</option>
          <option value="50000-100000">$50,000 - $100,000</option>
          <option value="100000+">$100,000+</option>
        </select>
        {errors.expectedVolume && <p className="text-red-600 text-sm mt-1">{errors.expectedVolume}</p>}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-yellow-900">Compliance Confirmation</p>
        <p className="text-sm text-yellow-800">
          I confirm that my company complies with all applicable regulations in the jurisdictions where it operates,
          including Malawi RBM requirements and China PBOC merchant requirements.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="compliance"
          checked={formData.compliance}
          onChange={(e) => setFormData({ ...formData, compliance: e.target.checked })}
          className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary mt-1"
        />
        <label htmlFor="compliance" className="text-sm text-gray-700 cursor-pointer">
          I confirm compliance with all applicable regulations *
        </label>
      </div>
      {errors.compliance && <p className="text-red-600 text-sm">{errors.compliance}</p>}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          Complete Business Verification
        </Button>
      </div>
    </form>
  )
}