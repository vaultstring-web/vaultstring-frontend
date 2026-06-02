"use client"

import { useState } from "react"
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

const BUSINESS_STEPS = [
  { id: "company", title: "Company Details" },
  { id: "business", title: "Business Information" },
  { id: "reps", title: "Authorized Representatives" },
  { id: "ubo", title: "UBO Disclosure" },
  { id: "banking", title: "Banking Details" },
  { id: "docs", title: "Documentation" },
  { id: "compliance", title: "Compliance" },
]

interface BusinessFlowProps {
  onChangeUserType: () => void
}

export function BusinessFlow({ onChangeUserType }: BusinessFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completed, setCompleted] = useState(false)

  const handleNext = (stepData: any) => {
    const newData = { ...formData, ...stepData }
    setFormData(newData)

    if (currentStep < BUSINESS_STEPS.length - 1) {
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
    alert("Progress saved. You can resume later.")
  }

  if (completed) {
    return <CompletionStep type="business" onChangeUserType={onChangeUserType} />
  }

  const step = BUSINESS_STEPS[currentStep]
  const progress = ((currentStep + 1) / BUSINESS_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onChangeUserType} className="text-sm text-gray-600 hover:text-gray-900 transition">
            Change account type
          </button>
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {BUSINESS_STEPS.length}
          </span>
          <button onClick={handleSaveAndExit} className="text-sm text-primary hover:text-primary/80 transition">
            Save & Exit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={progress} />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{step.title}</h1>
          <p className="text-gray-600">Complete this step to proceed with your verification</p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          {currentStep === 0 && <CompanyDetailsStep onNext={handleNext} />}
          {currentStep === 1 && <BusinessInfoStep onNext={handleNext} />}
          {currentStep === 2 && <AuthorizedRepsStep onNext={handleNext} />}
          {currentStep === 3 && <UBODisclosureStep onNext={handleNext} />}
          {currentStep === 4 && <BankingDetailsStep onNext={handleNext} />}
          {currentStep === 5 && <DocumentationStep onNext={handleNext} />}
          {currentStep === 6 && <ComplianceStep onNext={handleNext} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1 bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            Previous
          </Button>
          <Button
            onClick={() => handleNext({})}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
          >
            {currentStep === BUSINESS_STEPS.length - 1 ? "Complete" : "Next"}
          </Button>
        </div>
      </main>
    </div>
  )
}