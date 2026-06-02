"use client"

interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full h-1 bg-border">
      <div
        className="h-full bg-linear-to-r from-primary to-accent transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
