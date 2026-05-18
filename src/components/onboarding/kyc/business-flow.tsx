"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { ProgressBar } from "./progress-bar"
import { CompanyDetailsStep } from "./steps/company-details"
import { BusinessInfoStep } from "./steps/business-info"
import { AuthorizedRepsStep } from "./steps/authorized-reps"
import { UBODisclosureStep } from "./steps/ubo-disclosure"
import { BankingDetailsStep } from "./steps/banking-details"
import { DocumentationStep } from "./steps/documentation"
import { ComplianceStep } from "./steps/compliance"
import { CompletionStep } from "./steps/completion"

import { AuthLayout } from "@/src/components/shared/AuthLayout"

const BUSINESS_STEP_IDS = [
  "company",
  "business",
  "reps",
  "ubo",
  "banking",
  "docs",
  "compliance",
] as const

interface BusinessFlowProps {
  onChangeUserType: () => void
}

export function BusinessFlow({ onChangeUserType }: BusinessFlowProps) {
  const tFlow = useTranslations("Onboarding.flow")
  const tSteps = useTranslations("Onboarding.businessSteps")

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completed, setCompleted] = useState(false)

  const handleNext = (stepData: Record<string, unknown>) => {
    const newData = { ...formData, ...stepData }
    setFormData(newData)

    if (currentStep < BUSINESS_STEP_IDS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveAndExit = () => {
    localStorage.setItem(
      "kyc_business_draft",
      JSON.stringify({
        step: currentStep,
        data: formData,
        timestamp: new Date().toISOString(),
      }),
    )
    alert(tFlow("draftSaved"))
  }

  if (completed) {
    return <CompletionStep type="business" onChangeUserType={onChangeUserType} />
  }

  const stepId = BUSINESS_STEP_IDS[currentStep]
  const stepTitle = tSteps(stepId)

  return (
    <AuthLayout
      title={stepTitle}
      subtitle={tFlow("stepSubtitle", {
        current: currentStep + 1,
        total: BUSINESS_STEP_IDS.length,
      })}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <button
            onClick={onChangeUserType}
            className="text-[11px] font-bold text-slate-400 hover:text-green-600 uppercase tracking-widest transition-colors"
          >
            {tFlow("changeType")}
          </button>
          <button
            onClick={handleSaveAndExit}
            className="text-[11px] font-bold text-slate-400 hover:text-green-600 uppercase tracking-widest transition-colors"
          >
            {tFlow("saveDraft")}
          </button>
        </div>

        <ProgressBar progress={((currentStep + 1) / BUSINESS_STEP_IDS.length) * 100} />

        <div className="pt-2">
          {currentStep === 0 && <CompanyDetailsStep onNext={handleNext} />}
          {currentStep === 1 && <BusinessInfoStep onNext={handleNext} />}
          {currentStep === 2 && <AuthorizedRepsStep onNext={handleNext} />}
          {currentStep === 3 && <UBODisclosureStep onNext={handleNext} />}
          {currentStep === 4 && <BankingDetailsStep onNext={handleNext} />}
          {currentStep === 5 && <DocumentationStep onNext={handleNext} />}
          {currentStep === 6 && <ComplianceStep onNext={handleNext} />}
        </div>

        {currentStep > 0 && (
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
          >
            {tFlow("back")}
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}
