"use client";

import React, { useState } from "react";
import { X, ArrowUpRight, CheckCircle, Lock } from "lucide-react";

type WithdrawModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currency: { code: string; name: string; color: string };
  balance: number;
};

export default function WithdrawModal({
  isOpen,
  onClose,
  currency,
  balance,
}: WithdrawModalProps) {
  const [step, setStep] = useState<"method" | "amount" | "verify" | "success">(
    "method"
  );
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState(0);

  if (!isOpen) return null;

  const withdrawMethods = [
    {
      id: "bank",
      name: "Bank Account",
      icon: "🏦",
      time: "1-2 days",
      fee: 0.5,
    },
    {
      id: "mobile",
      name: "Mobile Money",
      icon: "📱",
      time: "5-15 min",
      fee: 0.75,
    },
    { id: "card", name: "Debit Card", icon: "💳", time: "10-30 min", fee: 1 },
    {
      id: "user",
      name: "To Another User",
      icon: "👤",
      time: "Instant",
      fee: 0,
    },
  ];

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const numAmount = parseFloat(val);
    const selectedMethodObj = withdrawMethods.find(
      (m) => m.id === selectedMethod
    );
    const methodFee = selectedMethodObj ? selectedMethodObj.fee : 0;
    setFee(
      numAmount > 0 ? Math.round(numAmount * (methodFee / 100) * 100) / 100 : 0
    );
  };

  const dailyLimit = 50000;
  const weeklyLimit = 200000;
  const usedDaily = 15000;
  const canWithdraw =
    parseFloat(amount) <= balance &&
    parseFloat(amount) <= dailyLimit - usedDaily;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <ArrowUpRight className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Withdraw {currency.code}
              </h2>
              <p className="text-sm text-muted-foreground">
                Available: ZK {balance.toLocaleString()}
              </p>
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
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Select Withdrawal Method
              </h3>
              <div className="grid gap-3 mb-6">
                {withdrawMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setAmount("");
                      setStep("amount");
                    }}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-medium text-foreground">
                            {method.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {method.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        {method.fee}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "amount" && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Withdrawal Amount
              </label>
              <div className="relative mb-6">
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

              {/* Limits Info */}
              <div className="mb-6 space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Daily Limit</span>
                    <span className="text-foreground font-medium">
                      ZK {(dailyLimit - usedDaily).toLocaleString()} remaining
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(usedDaily / dailyLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {amount && (
                <div className="space-y-2 mb-6 p-4 bg-muted/40 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Withdrawal Amount
                    </span>
                    <span className="text-foreground font-medium">
                      ZK {amount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="text-foreground font-medium">
                      ZK {fee}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-foreground">You will receive</span>
                    <span
                      className={
                        parseFloat(amount) - fee > 0
                          ? "text-primary"
                          : "text-destructive"
                      }
                    >
                      ZK {(parseFloat(amount) - fee).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {!canWithdraw && amount && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
                  Amount exceeds available balance or daily limit
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("method")}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("verify")}
                  disabled={!amount || !canWithdraw}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "verify" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Security Verification
              </h3>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Lock className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-900">
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-blue-800">
                      Enter the verification code sent to your email
                    </div>
                  </div>
                </div>
              </div>

              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                className="w-full border border-border rounded-lg px-4 py-2 text-center text-lg font-mono font-semibold focus:border-primary focus:outline-none bg-muted/30 mb-6"
              />

              <div className="mb-6 p-4 bg-muted/40 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground font-medium">
                    ZK {amount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="text-foreground font-medium">ZK {fee}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    ZK {(parseFloat(amount) + fee).toFixed(2)}
                  </span>
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
                  Confirm
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
                Withdrawal Confirmed!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Reference:{" "}
                <span className="font-mono font-semibold text-foreground">
                  WD-2024-654321
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
