"use client";

import type React from "react";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface UBODisclosureStepProps {
  onNext: (data: any) => void;
}

export function UBODisclosureStep({ onNext }: UBODisclosureStepProps) {
  const t = useTranslations("Onboarding.uboDisclosure");
  const tFlow = useTranslations("Onboarding.flow");
  const tv = useTranslations("Onboarding.uboDisclosure.validation");

  const [formData, setFormData] = useState({
    uboName: "",
    uboOwnershipPercentage: "",
    uboNationality: "",
    ownershipStructure: "direct",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.uboName.trim()) newErrors.uboName = tv("uboNameRequired");
    if (!formData.uboOwnershipPercentage)
      newErrors.uboOwnershipPercentage = tv("ownershipRequired");
    if (!formData.uboNationality.trim())
      newErrors.uboNationality = tv("nationalityRequired");

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          {t("intro")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("ownershipStructureLabel")}
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="direct"
              name="ownership"
              value="direct"
              checked={formData.ownershipStructure === "direct"}
              onChange={(e) =>
                setFormData({ ...formData, ownershipStructure: e.target.value })
              }
              className="w-4 h-4 text-secondary border-gray-300 focus:ring-secondary"
            />
            <label
              htmlFor="direct"
              className="ml-3 text-sm text-gray-900 cursor-pointer"
            >
              {t("directOwnership")}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="indirect"
              name="ownership"
              value="indirect"
              checked={formData.ownershipStructure === "indirect"}
              onChange={(e) =>
                setFormData({ ...formData, ownershipStructure: e.target.value })
              }
              className="w-4 h-4 text-secondary border-gray-300 focus:ring-secondary"
            />
            <label
              htmlFor="indirect"
              className="ml-3 text-sm text-gray-900 cursor-pointer"
            >
              {t("indirectOwnership")}
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("uboNameLabel")}
        </label>
        <Input
          type="text"
          placeholder={t("uboNamePlaceholder")}
          value={formData.uboName}
          onChange={(e) =>
            setFormData({ ...formData, uboName: e.target.value })
          }
          className="w-full"
        />
        {errors.uboName && (
          <p className="text-red-600 text-sm mt-1">{errors.uboName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("ownershipPercentLabel")}
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder={t("ownershipPercentPlaceholder")}
            value={formData.uboOwnershipPercentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                uboOwnershipPercentage: e.target.value,
              })
            }
            className="w-full"
          />
          {errors.uboOwnershipPercentage && (
            <p className="text-red-600 text-sm mt-1">
              {errors.uboOwnershipPercentage}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("nationalityLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("nationalityPlaceholder")}
            value={formData.uboNationality}
            onChange={(e) =>
              setFormData({ ...formData, uboNationality: e.target.value })
            }
            className="w-full"
          />
          {errors.uboNationality && (
            <p className="text-red-600 text-sm mt-1">
              {errors.uboNationality}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          className="bg-secondary hover:bg-secondary/90 text-white"
        >
          {tFlow("continue")}
        </Button>
      </div>
    </form>
  );
}