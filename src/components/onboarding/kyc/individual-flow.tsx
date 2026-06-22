"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"
import { ProgressBar } from "./progress-bar"
import { PersonalDetailsStep } from "./steps/personal-details"
import { ContactInfoStep } from "./steps/contact-info"
import { IDVerificationStep } from "./steps/id-verification"
import { SourceOfFundsStep } from "./steps/source-of-funds"
import { SecuritySetupStep } from "./steps/security-setup"
import { TermsStep } from "./steps/terms"
import { CompletionStep } from "./steps/completion"
import { AuthLayout } from "@/src/components/shared/AuthLayout"
import { onboardingFlowLink } from "./onboarding-ui"

const INDIVIDUAL_STEP_IDS = ["personal", "contact", "id", "funds", "security", "terms"] as const
const DRAFT_KEY = "kyc_individual_draft"

interface IndividualFlowProps {
  onChangeUserType: () => void
}

export function IndividualFlow({ onChangeUserType }: IndividualFlowProps) {
  const tFlow = useTranslations("Onboarding.flow")
  const tSteps = useTranslations("Onboarding.individualSteps")

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as { step?: number; data?: Record<string, unknown> }
      if (typeof draft.step === "number" && draft.data) {
        setCurrentStep(Math.min(draft.step, INDIVIDUAL_STEP_IDS.length - 1))
        setFormData(draft.data)
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, [])

  const handleNext = (stepData: Record<string, unknown>) => {
    const newData = { ...formData, ...stepData }
    setFormData(newData)

    if (currentStep < INDIVIDUAL_STEP_IDS.length - 1) {
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
    return <CompletionStep type="individual" onChangeUserType={onChangeUserType} />
  }

  const stepId = INDIVIDUAL_STEP_IDS[currentStep]
  const stepTitle = tSteps(stepId)

  return (
    <AuthLayout
      title={stepTitle}
      subtitle={tFlow("stepSubtitle", {
        current: currentStep + 1,
        total: INDIVIDUAL_STEP_IDS.length,
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

        <ProgressBar progress={((currentStep + 1) / INDIVIDUAL_STEP_IDS.length) * 100} />

        <div className="pt-2">
          {currentStep === 0 && <PersonalDetailsStep onNext={handleNext} initialData={formData} />}
          {currentStep === 1 && <ContactInfoStep onNext={handleNext} initialData={formData} />}
          {currentStep === 2 && <IDVerificationStep onNext={handleNext} initialData={formData} />}
          {currentStep === 3 && <SourceOfFundsStep onNext={handleNext} initialData={formData} />}
          {currentStep === 4 && <SecuritySetupStep onNext={handleNext} initialData={formData} />}
          {currentStep === 5 && <TermsStep onNext={handleNext} allData={formData} />}
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
