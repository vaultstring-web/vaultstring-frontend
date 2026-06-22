"use client"

import type { UserType } from "../kyc-wizard"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Logo } from "@/src/components/shared/Logo"

interface UserTypeSelectionProps {
  onSelect: (type: UserType) => void
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  const t = useTranslations("Onboarding.userType")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center mb-4">
            <Logo size="auth" priority />
          </div>
          <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="p-8 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 border-2 border-border bg-card"
            onClick={() => onSelect("individual")}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[rgb(var(--brand))]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-foreground">{t("individualTitle")}</h3>
              <p className="text-muted-foreground">{t("individualDescription")}</p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--brand))]" />
                  {t("individualFeaturePersonal")}
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--brand))]" />
                  {t("individualFeatureId")}
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--brand))]" />
                  {t("individualFeatureAddress")}
                </li>
              </ul>
              <Button
                onClick={() => onSelect("individual")}
                className="w-full mt-4 bg-[rgb(var(--brand))] hover:bg-[rgb(var(--brand))]/90 text-white"
              >
                {t("individualCta")}
              </Button>
            </div>
          </Card>

          <Card
            className="p-8 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 border-2 border-border bg-card"
            onClick={() => onSelect("business")}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <svg className="w-6 h-6 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm4 8H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm10 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-foreground">{t("businessTitle")}</h3>
              <p className="text-muted-foreground">{t("businessDescription")}</p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  {t("businessFeatureCompany")}
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  {t("businessFeatureUbo")}
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  {t("businessFeatureDocs")}
                </li>
              </ul>
              <Button
                variant="secondary"
                onClick={() => onSelect("business")}
                className="w-full mt-4"
              >
                {t("businessCta")}
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>{t("privacyNote")}</p>
          <p className="text-xs text-muted-foreground/80">{t("complianceNote")}</p>
        </div>
      </div>
    </div>
  )
}
