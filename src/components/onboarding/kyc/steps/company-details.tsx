"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface CompanyDetailsStepProps {
  onNext: (data: any) => void
}

export function CompanyDetailsStep({ onNext }: CompanyDetailsStepProps) {
  const [formData, setFormData] = useState({
    legalName: "",
    registrationNumber: "",
    taxId: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.legalName.trim()) newErrors.legalName = "Legal name is required"
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required"
    if (!formData.taxId.trim()) newErrors.taxId = "Tax ID is required"

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
        <label className="block text-sm font-medium text-gray-700 mb-2">Legal Company Name *</label>
        <Input
          type="text"
          placeholder="ABC Corporation Ltd."
          value={formData.legalName}
          onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
          className="w-full"
        />
        {errors.legalName && <p className="text-red-600 text-sm mt-1">{errors.legalName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
          <Input
            type="text"
            placeholder="REG123456"
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            className="w-full"
          />
          {errors.registrationNumber && <p className="text-red-600 text-sm mt-1">{errors.registrationNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID *</label>
          <Input
            type="text"
            placeholder="TAX123456789"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            className="w-full"
          />
          {errors.taxId && <p className="text-red-600 text-sm mt-1">{errors.taxId}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          Continue to Next Step
        </Button>
      </div>
    </form>
  )
}