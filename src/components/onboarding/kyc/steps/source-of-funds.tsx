"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"

interface SourceOfFundsStepProps {
  onNext: (data: Record<string, unknown>) => void
}

const EMPLOYMENT_STATUSES = ["employed", "self_employed", "retired", "student", "other"] as const

export function SourceOfFundsStep({ onNext }: SourceOfFundsStepProps) {
  const t = useTranslations("Onboarding.sourceOfFunds")
  const tFlow = useTranslations("Onboarding.flow")

  const incomeRanges = useMemo(
    () => ({
      kwacha: [
        { value: "0-100000", label: t("incomeMwk0") },
        { value: "100000-500000", label: t("incomeMwk1") },
        { value: "500000-1000000", label: t("incomeMwk2") },
        { value: "1000000-5000000", label: t("incomeMwk3") },
        { value: "5000000+", label: t("incomeMwk4") },
      ],
      cny: [
        { value: "0-50000", label: t("incomeCny0") },
        { value: "50000-200000", label: t("incomeCny1") },
        { value: "200000-500000", label: t("incomeCny2") },
        { value: "500000-2000000", label: t("incomeCny3") },
        { value: "2000000+", label: t("incomeCny4") },
      ],
    }),
    [t],
  )

  const [formData, setFormData] = useState({
    employmentStatus: "employed",
    currency: "kwacha",
    incomeRange: "100000-500000",
  })

  const employmentLabel = (status: string) => {
    if (status === "self_employed") return t("employmentSelfEmployed")
    if (status === "employed") return t("employmentEmployed")
    if (status === "retired") return t("employmentRetired")
    if (status === "student") return t("employmentStudent")
    return t("employmentOther")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const currentIncomeRanges = incomeRanges[formData.currency as keyof typeof incomeRanges]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">{t("employmentStatusLabel")}</label>
        <div className="space-y-3">
          {EMPLOYMENT_STATUSES.map((status) => (
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
                {employmentLabel(status)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">{t("currencyLabel")}</label>
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
                  incomeRange: incomeRanges.kwacha[1].value,
                })
              }
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="kwacha" className="ml-3 text-sm text-gray-900 cursor-pointer">
              {t("currencyMwk")}
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
                  incomeRange: incomeRanges.cny[1].value,
                })
              }
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="cny" className="ml-3 text-sm text-gray-900 cursor-pointer">
              {t("currencyCny")}
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">{t("incomeRangeLabel")}</label>
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
        <p className="text-sm text-yellow-900">{t("amlNote")}</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}
