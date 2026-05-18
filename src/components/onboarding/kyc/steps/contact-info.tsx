"use client";

import type React from "react";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface ContactInfoStepProps {
  onNext: (data: Record<string, unknown>) => void;
}

export function ContactInfoStep({ onNext }: ContactInfoStepProps) {
  const t = useTranslations("Onboarding.contactInfo");
  const tFlow = useTranslations("Onboarding.flow");
  const tv = useTranslations("Onboarding.contactInfo.validation");

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone.trim()) newErrors.phone = tv("phoneRequired");
    if (!formData.email.trim()) newErrors.email = tv("emailRequired");
    if (!formData.address.trim()) newErrors.address = tv("addressRequired");
    if (!formData.city.trim()) newErrors.city = tv("cityRequired");
    if (!formData.country.trim()) newErrors.country = tv("countryRequired");
    if (!formData.postalCode.trim()) newErrors.postalCode = tv("postalCodeRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("phoneLabel")}
          </label>
          <Input
            type="tel"
            placeholder={t("phonePlaceholder")}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.phone && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.phone}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("emailLabel")}
          </label>
          <Input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
          {t("addressLabel")}
        </label>
        <Input
          type="text"
          placeholder={t("addressPlaceholder")}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
        />
        {errors.address && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("cityLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("cityPlaceholder")}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.city && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.city}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("countryLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("countryPlaceholder")}
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.country && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.country}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {t("postalCodeLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("postalCodePlaceholder")}
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
          />
          {errors.postalCode && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.postalCode}</p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  )
}
