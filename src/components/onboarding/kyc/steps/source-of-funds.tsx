"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"

interface SourceOfFundsStepProps {
  onNext: (data: any) => void
}

const incomeRanges = {
  kwacha: [
    { value: "0-100000", label: "0 - 100,000 MWK" },
    { value: "100000-500000", label: "100,000 - 500,000 MWK" },
    { value: "500000-1000000", label: "500,000 - 1,000,000 MWK" },
    { value: "1000000-5000000", label: "1,000,000 - 5,000,000 MWK" },
    { value: "5000000+", label: "5,000,000+ MWK" },
  ],
  cny: [
    { value: "0-50000", label: "0 - 50,000 CNY" },
    { value: "50000-200000", label: "50,000 - 200,000 CNY" },
    { value: "200000-500000", label: "200,000 - 500,000 CNY" },
    { value: "500000-2000000", label: "500,000 - 2,000,000 CNY" },
    { value: "2000000+", label: "2,000,000+ CNY" },
  ],
}

export function SourceOfFundsStep({ onNext }: SourceOfFundsStepProps) {
  const [formData, setFormData] = useState({
    employmentStatus: "employed",
    currency: "kwacha", // Added currency field
    incomeRange: "100000-500000",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const currentIncomeRanges = incomeRanges[formData.currency as keyof typeof incomeRanges]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Employment Status *</label>
        <div className="space-y-3">
          {["employed", "self_employed", "retired", "student", "other"].map((status) => (
            <div key={status} className="flex items-center">
              <input
                type="radio"
                id={status}
                name="employmentStatus"
                value={status}
                checked={formData.employmentStatus === status}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor={status} className="ml-3 text-sm text-gray-900 cursor-pointer capitalize">
                {status.replace("_", " ")}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Currency *</label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="kwacha"
              name="currency"
              value="kwacha"
              checked={formData.currency === "kwacha"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currency: e.target.value,
                  incomeRange: incomeRanges.kwacha[1].value, // Reset to first range
                })
              }
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="kwacha" className="ml-3 text-sm text-gray-900 cursor-pointer">
              Malawian Kwacha (MWK)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="cny"
              name="currency"
              value="cny"
              checked={formData.currency === "cny"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currency: e.target.value,
                  incomeRange: incomeRanges.cny[1].value, // Reset to first range
                })
              }
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="cny" className="ml-3 text-sm text-gray-900 cursor-pointer">
              Chinese Yuan (CNY)
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Annual Income Range *</label>
        <div className="space-y-3">
          {currentIncomeRanges.map((range) => (
            <div key={range.value} className="flex items-center">
              <input
                type="radio"
                id={range.value}
                name="incomeRange"
                value={range.value}
                checked={formData.incomeRange === range.value}
                onChange={(e) => setFormData({ ...formData, incomeRange: e.target.value })}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor={range.value} className="ml-3 text-sm text-gray-900 cursor-pointer">
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          This information helps us comply with anti-money laundering regulations.
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