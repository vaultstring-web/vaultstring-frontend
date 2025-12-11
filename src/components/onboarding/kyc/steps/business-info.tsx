"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface BusinessInfoStepProps {
  onNext: (data: any) => void
}

export function BusinessInfoStep({ onNext }: BusinessInfoStepProps) {
  const [formData, setFormData] = useState({
    industry: "",
    companySize: "",
    website: "",
    incorporationDate: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.industry) newErrors.industry = "Industry is required"
    if (!formData.companySize) newErrors.companySize = "Company size is required"
    if (!formData.incorporationDate) newErrors.incorporationDate = "Incorporation date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(formData)
    }
  }

  const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Other"]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
        <select
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option value="">Select an industry</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        {errors.industry && <p className="text-red-600 text-sm mt-1">{errors.industry}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Size *</label>
        <select
          value={formData.companySize}
          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option value="">Select company size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="500+">500+ employees</option>
        </select>
        {errors.companySize && <p className="text-red-600 text-sm mt-1">{errors.companySize}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
        <Input
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Incorporation Date *</label>
        <Input
          type="date"
          value={formData.incorporationDate}
          onChange={(e) => setFormData({ ...formData, incorporationDate: e.target.value })}
          className="w-full"
        />
        {errors.incorporationDate && <p className="text-red-600 text-sm mt-1">{errors.incorporationDate}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          Continue to Next Step
        </Button>
      </div>
    </form>
  )
}