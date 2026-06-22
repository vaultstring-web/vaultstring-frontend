"use client"

import { useTranslations } from "next-intl"
import { AuthLayout } from "@/src/components/shared/AuthLayout"
import { CheckCircle2, Clock, Mail, ShieldCheck } from "lucide-react"
import { OnboardingContinueButton, onboardingFlowLink } from "../onboarding-ui"

interface CompletionStepProps {
  type: "individual" | "business"
  onChangeUserType: () => void
}

export function CompletionStep({ type, onChangeUserType }: CompletionStepProps) {
  const t = useTranslations("Onboarding.completion")

  const title = type === "individual" ? t("individualTitle") : t("businessTitle")
  const referenceId = t("referenceId", { id: Date.now().toString().slice(-8).toUpperCase() })

  return (
    <AuthLayout title={title} subtitle={t("subtitle")}>
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-card shadow-xl">
            <CheckCircle2 className="h-12 w-12 text-[rgb(var(--brand))]" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground font-medium px-4">{t("thankYou")}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            { icon: Clock, label: t("reviewTimeLabel"), value: t("reviewTimeValue") },
            { icon: Mail, label: t("confirmationLabel"), value: t("confirmationValue") },
            { icon: ShieldCheck, label: t("securityLabel"), value: t("securityValue") },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border"
            >
              <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center shadow-sm">
                <Icon className="h-5 w-5 text-[rgb(var(--brand))]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <OnboardingContinueButton onClick={() => (window.location.href = "/")}>
            {t("goDashboard")}
          </OnboardingContinueButton>

          <button type="button" onClick={onChangeUserType} className={`w-full text-center ${onboardingFlowLink}`}>
            {t("startAnother")}
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{referenceId}</p>
        </div>
      </div>
    </AuthLayout>
  )
}
