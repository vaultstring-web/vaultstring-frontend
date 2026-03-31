"use client"

import { useState } from "react"
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

const INDIVIDUAL_STEPS = [
  { id: "personal", title: "Personal Details" },
  { id: "contact", title: "Contact Information" },
  { id: "id", title: "ID Verification" },
  { id: "funds", title: "Source of Funds" },
  { id: "security", title: "Security Setup" },
  { id: "terms", title: "Terms & Agreements" },
]

interface IndividualFlowProps {
  onChangeUserType: () => void
}

export function IndividualFlow({ onChangeUserType }: IndividualFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completed, setCompleted] = useState(false)

  const handleNext = (stepData: any) => {
    const newData = { ...formData, ...stepData }
    setFormData(newData)

    if (currentStep < INDIVIDUAL_STEPS.length - 1) {
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
    alert("Progress saved. You can resume later.")
  }

  if (completed) {
    return <CompletionStep type="individual" onChangeUserType={onChangeUserType} />
  }

  const step = INDIVIDUAL_STEPS[currentStep]

  return (
    <AuthLayout title={step.title} subtitle={`Step ${currentStep + 1} of ${INDIVIDUAL_STEPS.length}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <button 
            onClick={onChangeUserType} 
            className="text-[11px] font-bold text-slate-400 hover:text-green-600 uppercase tracking-widest transition-colors"
          >
            Change Type
          </button>
          <button 
            onClick={handleSaveAndExit} 
            className="text-[11px] font-bold text-slate-400 hover:text-green-600 uppercase tracking-widest transition-colors"
          >
            Save Draft
          </button>
        </div>

        <ProgressBar progress={((currentStep + 1) / INDIVIDUAL_STEPS.length) * 100} />

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
            Back to previous step
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}