"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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

const INDIVIDUAL_STEP_IDS = ["personal", "contact", "id", "funds", "security", "terms"] as const

interface IndividualFlowProps {
  onChangeUserType: () => void
}

export function IndividualFlow({ onChangeUserType }: IndividualFlowProps) {
  const tFlow = useTranslations("Onboarding.flow")
  const tSteps = useTranslations("Onboarding.individualSteps")

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completed, setCompleted] = useState(false)

  const handleNext = (stepData: Record<string, unknown>) => {
    const newData = { ...formData, ...stepData }
    setFormData(newData)

    if (currentStep < INDIVIDUAL_STEP_IDS.length - 1) {
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
      "kyc_individual_draft",
      JSON.stringify({
        step: currentStep,
        data: formData,
        timestamp: new Date().toISOString(),
      }),
    )
    alert(tFlow("draftSaved"))
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

        <ProgressBar progress={((currentStep + 1) / INDIVIDUAL_STEP_IDS.length) * 100} />

        <div className="pt-2">
          {currentStep === 0 && <PersonalDetailsStep onNext={handleNext} />}
          {currentStep === 1 && <ContactInfoStep onNext={handleNext} />}
          {currentStep === 2 && <IDVerificationStep onNext={handleNext} />}
          {currentStep === 3 && <SourceOfFundsStep onNext={handleNext} />}
          {currentStep === 4 && <SecuritySetupStep onNext={handleNext} />}
          {currentStep === 5 && <TermsStep onNext={handleNext} allData={formData} />}
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
