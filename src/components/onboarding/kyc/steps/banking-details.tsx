"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface BankingDetailsStepProps {
  onNext: (data: any) => void
}

export function BankingDetailsStep({ onNext }: BankingDetailsStepProps) {
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    bankCode: "",
    accountHolder: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required"
    if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required"
    if (!formData.bankCode.trim()) newErrors.bankCode = "Bank code is required"
    if (!formData.accountHolder.trim()) newErrors.accountHolder = "Account holder name is required"

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
        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
        <Input
          type="text"
          placeholder="Example Bank"
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          className="w-full"
        />
        {errors.bankName && <p className="text-red-600 text-sm mt-1">{errors.bankName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
          <Input
            type="text"
            placeholder="123456789"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full"
          />
          {errors.accountNumber && <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Code / SWIFT Code *</label>
          <Input
            type="text"
            placeholder="SWIFTCODE"
            value={formData.bankCode}
            onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
            className="w-full"
          />
          {errors.bankCode && <p className="text-red-600 text-sm mt-1">{errors.bankCode}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
        <Input
          type="text"
          placeholder="Company Name"
          value={formData.accountHolder}
          onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
          className="w-full"
        />
        {errors.accountHolder && <p className="text-red-600 text-sm mt-1">{errors.accountHolder}</p>}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">Your banking details are encrypted and used only for payouts.</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          Continue to Next Step
        </Button>
      </div>
    </form>
  )
}