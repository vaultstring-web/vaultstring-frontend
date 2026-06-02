"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface AuthorizedRepsStepProps {
  onNext: (data: any) => void
}

export function AuthorizedRepsStep({ onNext }: AuthorizedRepsStepProps) {
  const [reps, setReps] = useState([{ name: "", email: "", title: "" }])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    reps.forEach((rep, idx) => {
      if (!rep.name.trim()) newErrors[`name-${idx}`] = "Name is required"
      if (!rep.email.trim()) newErrors[`email-${idx}`] = "Email is required"
      if (!rep.title.trim()) newErrors[`title-${idx}`] = "Title is required"
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext({ authorizedReps: reps })
    }
  }

  const addRep = () => {
    setReps([...reps, { name: "", email: "", title: "" }])
  }

  const removeRep = (index: number) => {
    if (reps.length > 1) {
      setReps(reps.filter((_, i) => i !== index))
    }
  }

  const updateRep = (index: number, field: string, value: string) => {
    const newReps = [...reps]
    newReps[index] = { ...newReps[index], [field]: value }
    setReps(newReps)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {reps.map((rep, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Representative {idx + 1}</h3>
            {reps.length > 1 && (
              <button type="button" onClick={() => removeRep(idx)} className="text-red-600 text-sm hover:underline">
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <Input
              type="text"
              placeholder="John Smith"
              value={rep.name}
              onChange={(e) => updateRep(idx, "name", e.target.value)}
              className="w-full"
            />
            {errors[`name-${idx}`] && <p className="text-red-600 text-sm mt-1">{errors[`name-${idx}`]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={rep.email}
              onChange={(e) => updateRep(idx, "email", e.target.value)}
              className="w-full"
            />
            {errors[`email-${idx}`] && <p className="text-red-600 text-sm mt-1">{errors[`email-${idx}`]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
            <Input
              type="text"
              placeholder="CEO"
              value={rep.title}
              onChange={(e) => updateRep(idx, "title", e.target.value)}
              className="w-full"
            />
            {errors[`title-${idx}`] && <p className="text-red-600 text-sm mt-1">{errors[`title-${idx}`]}</p>}
          </div>
        </div>
      ))}

      <Button type="button" onClick={addRep} variant="outline" className="w-full bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
        Add Another Representative
      </Button>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
          Continue to Next Step
        </Button>
      </div>
    </form>
  )
}