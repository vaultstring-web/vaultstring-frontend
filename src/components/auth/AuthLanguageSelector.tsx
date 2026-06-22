"use client";

import { LanguageSelector } from "@/src/components/shared/LanguageSelector";

/** Compact language picker for auth screens (login / signup). */
export function AuthLanguageSelector() {
  return <LanguageSelector variant="select" className="w-full" />;
}
