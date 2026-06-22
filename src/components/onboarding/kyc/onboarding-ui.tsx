"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { Info, ShieldCheck } from "lucide-react"

export const onboardingFieldLabel = "block text-sm font-medium text-foreground mb-2"
export const onboardingFieldLabelCompact =
  "text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
export const onboardingInputClass =
  "h-14 rounded-2xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
export const onboardingSelectClass =
  "w-full h-14 px-4 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 appearance-none cursor-pointer"
export const onboardingFlowLink =
  "text-[11px] font-bold text-muted-foreground hover:text-[rgb(var(--brand))] uppercase tracking-widest transition-colors"
export const onboardingUploadZone =
  "border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
export const onboardingRadioRow = "flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5"

type OnboardingLabelProps = {
  children: React.ReactNode
  compact?: boolean
  htmlFor?: string
  className?: string
}

export function OnboardingLabel({ children, compact, htmlFor, className }: OnboardingLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(compact ? onboardingFieldLabelCompact : onboardingFieldLabel, className)}
    >
      {children}
    </label>
  )
}

type OnboardingInfoBoxProps = {
  children: React.ReactNode
  variant?: "default" | "warning" | "success"
  className?: string
}

export function OnboardingInfoBox({ children, variant = "default", className }: OnboardingInfoBoxProps) {
  const Icon = variant === "success" ? ShieldCheck : Info

  return (
    <Alert
      className={cn(
        variant === "warning" && "border-amber-500/30 bg-amber-500/10 text-foreground",
        variant === "success" && "border-emerald-500/30 bg-emerald-500/10 text-foreground",
        variant === "default" && "border-border bg-muted/50 text-foreground",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      <AlertDescription className="text-foreground [&_p]:text-foreground">{children}</AlertDescription>
    </Alert>
  )
}

export function OnboardingContinueButton({
  children,
  className,
  fullWidth = true,
  ...props
}: React.ComponentProps<typeof Button> & { fullWidth?: boolean }) {
  return (
    <Button
      type="submit"
      className={cn(
        "h-14 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]",
        "bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export function OnboardingError({ children }: { children: React.ReactNode }) {
  return <p className="text-destructive text-sm mt-1">{children}</p>
}
