"use client";

import React, { useState } from "react";
import { X, ArrowDownLeft, CheckCircle, Clock } from "lucide-react";

type DepositModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currency: { code: string; name: string; color: string };
};

export default function DepositModal({
  isOpen,
  onClose,
  currency,
}: DepositModalProps) {
  const [step, setStep] = useState<"method" | "amount" | "confirm" | "success">(
    "method"
  );
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState(0);

  if (!isOpen) return null;

  const depositMethods = [
    { id: "bank", name: "Bank Transfer", icon: "🏦", time: "1-2 days" },
    { id: "mobile", name: "Mobile Money", icon: "📱", time: "5-15 min" },
    { id: "card", name: "Debit Card", icon: "💳", time: "10-30 min" },
  ];

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const numAmount = parseFloat(val);
    setFee(numAmount > 0 ? Math.round(numAmount * 0.01 * 100) / 100 : 0);
  };

  const handleStepChange = (nextStep: string) => {
    if (nextStep === "method") {
      setStep("method");
      setSelectedMethod("");
      setAmount("");
    } else {
      setStep(nextStep as any);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ArrowDownLeft className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Deposit {currency.code}
              </h2>
              <p className="text-sm text-muted-foreground">{currency.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted"
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "method" && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Select Deposit Method
                </h3>
                <div className="grid gap-3">
                  {depositMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setStep("amount");
                      }}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {method.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.time}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "amount" && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-semibold text-foreground">
                    ZK
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full border border-border rounded-lg pl-10 pr-4 py-3 text-lg font-semibold focus:border-primary focus:outline-none bg-muted/30"
                  />
                </div>
              </div>

              {amount && (
                <div className="space-y-2 mb-6 p-4 bg-muted/40 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">
                      ZK {amount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee (1%)</span>
                    <span className="text-foreground font-medium">
                      ZK {fee}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-foreground">You will receive</span>
                    <span className="text-primary">
                      ZK {(parseFloat(amount) - fee).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleStepChange("method")}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  disabled={!amount}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div>
              <div className="mb-6 p-4 bg-muted/40 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-foreground font-medium">
                    ZK {amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="text-foreground font-medium capitalize">
                    {selectedMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fee</span>
                  <span className="text-foreground font-medium">ZK {fee}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    ZK {(parseFloat(amount) + fee).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <Clock className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-900">
                    <div className="font-medium">Processing Time</div>
                    <div className="text-blue-800">
                      Your deposit should complete in 1-2 business days
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("success")}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Deposit Initiated!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Reference:{" "}
                <span className="font-mono font-semibold text-foreground">
                  DEP-2024-123456
                </span>
              </p>
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
