"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"

interface SecuritySetupStepProps {
  onNext: (data: any) => void
}

export function SecuritySetupStep({ onNext }: SecuritySetupStepProps) {
  const [formData, setFormData] = useState({
    twoFAEnabled: false,
    securityQuestion1: "",
    securityAnswer1: "",
    securityQuestion2: "",
    securityAnswer2: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.securityQuestion1) newErrors.securityQuestion1 = "Please select a security question"
    if (!formData.securityAnswer1.trim()) newErrors.securityAnswer1 = "Please answer the security question"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(formData)
    }
  }

  const questions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "In what city were you born?",
    "What is the name of your favorite teacher?",
    "What was the make of your first car?",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <input
          type="checkbox"
          id="twoFA"
          checked={formData.twoFAEnabled}
          onChange={(e) => setFormData({ ...formData, twoFAEnabled: e.target.checked })}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="twoFA" className="text-sm text-gray-700 cursor-pointer">
          Enable two-factor authentication (2FA) for enhanced security
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Security Question 1 *</label>
        <select
          value={formData.securityQuestion1}
          onChange={(e) => setFormData({ ...formData, securityQuestion1: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select a question</option>
          {questions.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
        {errors.securityQuestion1 && <p className="text-red-600 text-sm mt-1">{errors.securityQuestion1}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer *</label>
        <input
          type="text"
          placeholder="Your answer"
          value={formData.securityAnswer1}
          onChange={(e) => setFormData({ ...formData, securityAnswer1: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {errors.securityAnswer1 && <p className="text-red-600 text-sm mt-1">{errors.securityAnswer1}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          These security questions help us verify your identity if you need to recover your account.
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