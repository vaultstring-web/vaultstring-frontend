"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useBalanceVisibility } from "@/src/hooks/useBalanceVisibility";

export default function BalanceToggle({
  className = "",
}: {
  className?: string;
}) {
  const { visible, toggle } = useBalanceVisibility();

  return (
    <button
      aria-pressed={visible}
      aria-label={visible ? "Hide balances" : "Show balances"}
      title={visible ? "Hide balances" : "Show balances"}
      onClick={toggle}
      className={`group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-accent ${className}`}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted group-hover:bg-muted-foreground/20">
        {visible ? (
          <Eye size={16} className="text-primary" />
        ) : (
          <EyeOff size={16} className="text-muted-foreground" />
        )}
      </div>
      <span className="hidden sm:inline text-foreground">
        {visible ? "Balances Visible" : "Balances Hidden"}
      </span>
    </button>
  );
}
