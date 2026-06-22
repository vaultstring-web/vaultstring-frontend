"use client"



import type React from "react"



import { useMemo, useState } from "react"

import { useTranslations } from "next-intl"

import { Label } from "@/src/components/ui/label"

import { Input } from "@/src/components/ui/input"

import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"

import {

  OnboardingContinueButton,

  OnboardingInfoBox,

  OnboardingLabel,

  onboardingInputClass,

  onboardingRadioRow,

} from "../onboarding-ui"



interface SourceOfFundsStepProps {

  onNext: (data: Record<string, unknown>) => void

  initialData?: Record<string, unknown>

}



const EMPLOYMENT_STATUSES = ["employed", "self_employed", "unemployed", "retired", "student", "other"] as const

const INCOME_OTHER = "other"



export function SourceOfFundsStep({ onNext, initialData }: SourceOfFundsStepProps) {

  const t = useTranslations("Onboarding.sourceOfFunds")

  const tv = useTranslations("Onboarding.sourceOfFunds.validation")

  const tFlow = useTranslations("Onboarding.flow")



  const incomeRanges = useMemo(

    () => ({

      kwacha: [

        { value: "0-100000", label: t("incomeMwk0") },

        { value: "100000-500000", label: t("incomeMwk1") },

        { value: "500000-1000000", label: t("incomeMwk2") },

        { value: "1000000-5000000", label: t("incomeMwk3") },

        { value: "5000000+", label: t("incomeMwk4") },

        { value: INCOME_OTHER, label: t("incomeOther") },

      ],

      cny: [

        { value: "0-50000", label: t("incomeCny0") },

        { value: "50000-200000", label: t("incomeCny1") },

        { value: "200000-500000", label: t("incomeCny2") },

        { value: "500000-2000000", label: t("incomeCny3") },

        { value: "2000000+", label: t("incomeCny4") },

        { value: INCOME_OTHER, label: t("incomeOther") },

      ],

    }),

    [t],

  )



  const [formData, setFormData] = useState({

    employmentStatus: String(initialData?.employmentStatus ?? "employed"),

    employmentOtherDescription: String(initialData?.employmentOtherDescription ?? ""),

    employmentSupplementary: String(initialData?.employmentSupplementary ?? ""),

    currency: String(initialData?.currency ?? "kwacha"),

    incomeRange: String(initialData?.incomeRange ?? "100000-500000"),

    incomeRangeOther: String(initialData?.incomeRangeOther ?? ""),

  })

  const [errors, setErrors] = useState<Record<string, string>>({})



  const employmentLabel = (status: string) => {

    if (status === "self_employed") return t("employmentSelfEmployed")

    if (status === "employed") return t("employmentEmployed")

    if (status === "unemployed") return t("employmentUnemployed")

    if (status === "retired") return t("employmentRetired")

    if (status === "student") return t("employmentStudent")

    return t("employmentOther")

  }



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()

    const nextErrors: Record<string, string> = {}



    if (formData.employmentStatus === "other" && !formData.employmentOtherDescription.trim()) {

      nextErrors.employmentOtherDescription = tv("employmentOtherRequired")

    }

    if (formData.incomeRange === INCOME_OTHER && !formData.incomeRangeOther.trim()) {

      nextErrors.incomeRangeOther = tv("incomeOtherRequired")

    }



    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return



    onNext(formData)

  }



  const currentIncomeRanges = incomeRanges[formData.currency as keyof typeof incomeRanges]



  return (

    <form onSubmit={handleSubmit} className="space-y-6">

      <div>

        <OnboardingLabel className="mb-4">{t("employmentStatusLabel")}</OnboardingLabel>

        <RadioGroup

          value={formData.employmentStatus}

          onValueChange={(value) =>

            setFormData({ ...formData, employmentStatus: value, employmentOtherDescription: value === "other" ? formData.employmentOtherDescription : "" })

          }

          className="space-y-2"

        >

          {EMPLOYMENT_STATUSES.map((status) => (

            <div key={status} className={onboardingRadioRow}>

              <RadioGroupItem value={status} id={`employment-${status}`} />

              <Label htmlFor={`employment-${status}`} className="flex-1 cursor-pointer text-sm text-foreground">

                {employmentLabel(status)}

              </Label>

            </div>

          ))}

        </RadioGroup>

        {formData.employmentStatus === "other" ? (

          <div className="mt-3 space-y-1">

            <OnboardingLabel htmlFor="employment-other-description">{t("employmentOtherDescriptionLabel")}</OnboardingLabel>

            <Input

              id="employment-other-description"

              value={formData.employmentOtherDescription}

              onChange={(e) => setFormData({ ...formData, employmentOtherDescription: e.target.value })}

              placeholder={t("employmentOtherDescriptionPlaceholder")}

              className={onboardingInputClass}

            />

            {errors.employmentOtherDescription ? (

              <p className="text-destructive text-[10px] font-bold uppercase tracking-tight">{errors.employmentOtherDescription}</p>

            ) : null}

          </div>

        ) : null}

        <div className="mt-3 space-y-1">

          <OnboardingLabel htmlFor="employment-supplementary">{t("employmentSupplementaryLabel")}</OnboardingLabel>

          <Input

            id="employment-supplementary"

            value={formData.employmentSupplementary}

            onChange={(e) => setFormData({ ...formData, employmentSupplementary: e.target.value })}

            placeholder={t("employmentSupplementaryPlaceholder")}

            className={onboardingInputClass}

          />

        </div>

      </div>



      <div>

        <OnboardingLabel className="mb-4">{t("currencyLabel")}</OnboardingLabel>

        <RadioGroup

          value={formData.currency}

          onValueChange={(value) =>

            setFormData({

              ...formData,

              currency: value,

              incomeRange: incomeRanges[value as keyof typeof incomeRanges][1].value,

              incomeRangeOther: "",

            })

          }

          className="space-y-2"

        >

          <div className={onboardingRadioRow}>

            <RadioGroupItem value="kwacha" id="currency-kwacha" />

            <Label htmlFor="currency-kwacha" className="flex-1 cursor-pointer text-sm text-foreground">

              {t("currencyMwk")}

            </Label>

          </div>

          <div className={onboardingRadioRow}>

            <RadioGroupItem value="cny" id="currency-cny" />

            <Label htmlFor="currency-cny" className="flex-1 cursor-pointer text-sm text-foreground">

              {t("currencyCny")}

            </Label>

          </div>

        </RadioGroup>

      </div>



      <div>

        <OnboardingLabel className="mb-4">{t("incomeRangeLabel")}</OnboardingLabel>

        <RadioGroup

          value={formData.incomeRange}

          onValueChange={(value) =>

            setFormData({

              ...formData,

              incomeRange: value,

              incomeRangeOther: value === INCOME_OTHER ? formData.incomeRangeOther : "",

            })

          }

          className="space-y-2"

        >

          {currentIncomeRanges.map((range) => (

            <div key={range.value} className={onboardingRadioRow}>

              <RadioGroupItem value={range.value} id={`income-${range.value}`} />

              <Label htmlFor={`income-${range.value}`} className="flex-1 cursor-pointer text-sm text-foreground">

                {range.label}

              </Label>

            </div>

          ))}

        </RadioGroup>

        {formData.incomeRange === INCOME_OTHER ? (

          <div className="mt-3 space-y-1">

            <OnboardingLabel htmlFor="income-range-other">{t("incomeOtherDescriptionLabel")}</OnboardingLabel>

            <Input

              id="income-range-other"

              value={formData.incomeRangeOther}

              onChange={(e) => setFormData({ ...formData, incomeRangeOther: e.target.value })}

              placeholder={t("incomeOtherDescriptionPlaceholder")}

              className={onboardingInputClass}

            />

            {errors.incomeRangeOther ? (

              <p className="text-destructive text-[10px] font-bold uppercase tracking-tight">{errors.incomeRangeOther}</p>

            ) : null}

          </div>

        ) : null}

      </div>



      <OnboardingInfoBox variant="warning">{t("amlNote")}</OnboardingInfoBox>



      <div className="flex justify-end gap-2 pt-4">

        <OnboardingContinueButton fullWidth={false}>{tFlow("continue")}</OnboardingContinueButton>

      </div>

    </form>

  )

}

