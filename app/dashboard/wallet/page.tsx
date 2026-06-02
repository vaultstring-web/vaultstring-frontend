"use client";

import React from "react";
import Wallet from "@/src/components/dashboard/Wallet";
import { MOCK_WALLET, MOCK_TRANSACTIONS } from "@/src/lib/constants";

export default function DashboardWalletPage() {
  return <Wallet wallet={MOCK_WALLET} transactions={MOCK_TRANSACTIONS} />;
}
