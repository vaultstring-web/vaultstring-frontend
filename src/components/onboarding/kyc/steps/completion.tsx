"use client"

import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"

interface CompletionStepProps {
  type: "individual" | "business"
  onChangeUserType: () => void
}

export function CompletionStep({ type, onChangeUserType }: CompletionStepProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Success Card */}
        <Card className="p-8 text-center space-y-4 border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {type === "individual" ? "Personal KYC Completed" : "Business KYC Completed"}
          </h1>

          <p className="text-lg text-gray-600">
            {type === "individual"
              ? "Your personal information has been successfully verified. You can now access your account."
              : "Your company information has been successfully verified. You can now access your business account."}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 my-6">
            <p className="font-medium text-blue-900">What happens next?</p>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>Your information will be reviewed by our compliance team (24-48 hours)</li>
              <li>You'll receive a confirmation email once approved</li>
              <li>You can start using your account immediately</li>
            </ul>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-primary hover:bg-primary/90 text-white text-base py-3"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={onChangeUserType} 
              variant="outline" 
              className="w-full bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Start Another Verification
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>If you have any questions, contact our support team</p>
          <p className="text-xs text-gray-500">Reference ID: KYC-{Date.now().toString().slice(-8).toUpperCase()}</p>
        </div>
      </div>
    </div>
  )
}