"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
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
import { onboardingFlowLink } from "./onboarding-ui"

const BUSINESS_STEP_IDS = [
  "company",
  "business",
  "reps",
  "ubo",
  "banking",
  "docs",
  "compliance",
] as const
const DRAFT_KEY = "kyc_business_draft"

interface BusinessFlowProps {
  onChangeUserType: () => void
}

export function BusinessFlow({ onChangeUserType }: BusinessFlowProps) {
  const tFlow = useTranslations("Onboarding.flow")
  const tSteps = useTranslations("Onboarding.businessSteps")

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as { step?: number; data?: Record<string, unknown> }
      if (typeof draft.step === "number" && draft.data) {
        setCurrentStep(Math.min(draft.step, BUSINESS_STEP_IDS.length - 1))
        setFormData(draft.data)
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, [])

  const handleNext = (stepData: Record<string, unknown>) => {
    const newData = { ...formData, ...stepData }
    setFormData(newData)

    if (currentStep < BUSINESS_STEP_IDS.length - 1) {
      setCurrentStep(currentStep + 1)
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ step: currentStep + 1, data: newData, timestamp: new Date().toISOString() }),
      )
    } else {
      localStorage.removeItem(DRAFT_KEY)
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
      DRAFT_KEY,
      JSON.stringify({
        step: currentStep,
        data: formData,
        timestamp: new Date().toISOString(),
      }),
    )
    toast.success(tFlow("draftSaved"))
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
          <button type="button" onClick={onChangeUserType} className={onboardingFlowLink}>
            {tFlow("changeType")}
          </button>
          <button type="button" onClick={handleSaveAndExit} className={onboardingFlowLink}>
            {tFlow("saveDraft")}
          </button>
        </div>

        <ProgressBar progress={((currentStep + 1) / BUSINESS_STEP_IDS.length) * 100} />

        <div className="pt-2">
          {currentStep === 0 && <CompanyDetailsStep onNext={handleNext} initialData={formData} />}
          {currentStep === 1 && <BusinessInfoStep onNext={handleNext} initialData={formData} />}
          {currentStep === 2 && <AuthorizedRepsStep onNext={handleNext} initialData={formData} />}
          {currentStep === 3 && <UBODisclosureStep onNext={handleNext} initialData={formData} />}
          {currentStep === 4 && <BankingDetailsStep onNext={handleNext} initialData={formData} />}
          {currentStep === 5 && <DocumentationStep onNext={handleNext} initialData={formData} />}
          {currentStep === 6 && <ComplianceStep onNext={handleNext} initialData={formData} />}
        </div>

        {currentStep > 0 ? (
          <Button variant="ghost" onClick={handlePrevious} className="w-full text-muted-foreground hover:text-foreground font-medium">
            {tFlow("back")}
          </Button>
        ) : null}
      </div>
    </AuthLayout>
  )
}
