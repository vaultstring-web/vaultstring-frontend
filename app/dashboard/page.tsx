// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Dashboard from '@/src/components/dashboard/Dashboard';
import { MOCK_USER, MOCK_WALLET, MOCK_TRANSACTIONS } from '@/src/lib/constants';

export default function DashboardPage() {
  // In a real app, this data would come from API/context
  const [user] = useState(MOCK_USER);
  const [wallet] = useState(MOCK_WALLET);
  const [transactions] = useState(MOCK_TRANSACTIONS);

  return (
    <Dashboard 
      user={user} 
      wallet={wallet} 
      recentTransactions={transactions} 
    />
  );
}