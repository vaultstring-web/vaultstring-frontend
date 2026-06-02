"use client"

import { useState } from "react"
import { UserTypeSelection } from "./kyc/user-type-selection"
import { IndividualFlow } from "./kyc/individual-flow"
import { BusinessFlow } from "./kyc/business-flow"

export type UserType = "individual" | "business" | null

export function KYCWizard() {
  const [userType, setUserType] = useState<UserType>(null)
  const [isResuming, setIsResuming] = useState(false)

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setIsResuming(false)
  }

  const handleResumeFlow = () => {
    setIsResuming(false)
  }

  const handleChangeUserType = () => {
    setUserType(null)
  }

  if (!userType) {
    return <UserTypeSelection onSelect={handleUserTypeSelect} />
  }

  if (userType === "individual") {
    return <IndividualFlow onChangeUserType={handleChangeUserType} />
  }

  return <BusinessFlow onChangeUserType={handleChangeUserType} />
}
