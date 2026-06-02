"use client";

import React, { useState } from "react";
import { ArrowRightLeft, TrendingUp } from "lucide-react";

export default function ConversionWidget() {
  const [fromAmount, setFromAmount] = useState("");
  const [rate] = useState(0.25); // ZMW to CNY sample rate

  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(2) : "";

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Quick Convert
          </h3>
          <p className="text-sm text-muted-foreground">
            Exchange between currencies
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
          <TrendingUp className="text-purple-600" size={20} />
        </div>
      </div>

      {/* From */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          From
        </label>
        <div className="relative">
          <input
            type="number"
            placeholder="0.00"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 pr-20 focus:border-primary focus:outline-none bg-muted/30"
          />
          <select className="absolute right-2 top-2 bg-transparent border-0 text-sm font-semibold text-foreground focus:outline-none">
            <option>ZMW</option>
            <option>CNY</option>
            <option>USD</option>
          </select>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-4">
        <button className="rounded-lg border border-border bg-muted p-2 hover:bg-muted/80 transition-colors">
          <ArrowRightLeft size={20} className="text-foreground" />
        </button>
      </div>

      {/* To */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          To
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="0.00"
            value={toAmount}
            disabled
            className="w-full border border-border rounded-lg px-4 py-2 pr-20 bg-muted/30 text-foreground font-semibold"
          />
          <select className="absolute right-2 top-2 bg-transparent border-0 text-sm font-semibold text-foreground focus:outline-none">
            <option>CNY</option>
            <option>ZMW</option>
            <option>USD</option>
          </select>
        </div>
      </div>

      {/* Rate Info */}
      {fromAmount && (
        <div className="mb-6 p-3 bg-muted/40 rounded-lg text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-semibold text-foreground">
              1 ZMW = {rate} CNY
            </span>
          </div>
        </div>
      )}

      <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all">
        Convert Now
      </button>
    </div>
  );
}
