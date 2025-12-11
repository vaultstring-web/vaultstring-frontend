"use client"

import type { UserType } from "../kyc-wizard"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"

interface UserTypeSelectionProps {
  onSelect: (type: UserType) => void
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Know Your Customer</h1>
          <p className="text-lg text-gray-600">Select your account type to begin the verification process</p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Card */}
          <Card
            className="p-8 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 border-2 border-gray-200"
            onClick={() => onSelect("individual")}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">Individual</h3>
              <p className="text-gray-700">Verify as a private person. Takes about 10 minutes.</p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Personal information
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ID verification
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Address proof
                </li>
              </ul>
              <Button
                onClick={() => onSelect("individual")}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white"
              >
                Continue as Individual
              </Button>
            </div>
          </Card>

          {/* Business Card */}
          <Card
            className="p-8 cursor-pointer transition-all hover:shadow-lg hover:border-secondary/50 border-2 border-gray-200"
            onClick={() => onSelect("business")}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm4 8H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm10 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">Business</h3>
              <p className="text-gray-700">Verify your company. Takes about 15 minutes.</p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Company details
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  UBO disclosure
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Documentation
                </li>
              </ul>
              <Button
                onClick={() => onSelect("business")}
                className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white"
              >
                Continue as Business
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>We take your privacy seriously. Your information is encrypted and secure.</p>
          <p className="text-xs text-gray-500">Compliant with Malawi RBM and China PBOC regulations</p>
        </div>
      </div>
    </div>
  )
} 