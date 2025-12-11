"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface UBODisclosureStepProps {
  onNext: (data: any) => void;
}

export function UBODisclosureStep({ onNext }: UBODisclosureStepProps) {
  const [formData, setFormData] = useState({
    uboName: "",
    uboOwnershipPercentage: "",
    uboNationality: "",
    ownershipStructure: "direct",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.uboName.trim()) newErrors.uboName = "UBO name is required";
    if (!formData.uboOwnershipPercentage)
      newErrors.uboOwnershipPercentage = "Ownership percentage is required";
    if (!formData.uboNationality.trim())
      newErrors.uboNationality = "Nationality is required";

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
          UBO (Ultimate Beneficial Owner) disclosure is required for compliance.
          Please provide information about the individuals who ultimately own or
          control the company.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ownership Structure
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
              Direct ownership
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
              Indirect ownership (through another entity)
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          UBO Full Name *
        </label>
        <Input
          type="text"
          placeholder="Ida Mateyu"
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
            Ownership Percentage *
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="25"
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
            Nationality *
          </label>
          <Input
            type="text"
            placeholder="Malawian"
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
          Continue to Next Step
        </Button>
      </div>
    </form>
  );
}