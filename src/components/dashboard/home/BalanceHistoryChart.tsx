import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WalletStats } from '@/src/types/types';

interface BalanceHistoryChartProps {
  wallet: WalletStats;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function BalanceHistoryChart({ wallet }: BalanceHistoryChartProps) {
  // Mock data for chart
  const chartData = [
    { name: 'Mon', balance: 650000 },
    { name: 'Tue', balance: 590000 },
    { name: 'Wed', balance: 800000 },
    { name: 'Thu', balance: 750000 },
    { name: 'Fri', balance: 820000 },
    { name: 'Sat', balance: 900000 },
    { name: 'Sun', balance: 854000 },
  ];

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-slate-400 dark:text-slate-500" />
          Balance History
        </h3>
        <Select defaultValue="7days">
          <SelectTrigger className="w-[140px] h-9 text-xs font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
            <SelectItem value="7days" className="dark:text-slate-200 dark:focus:bg-slate-700">Last 7 Days</SelectItem>
            <SelectItem value="30days" className="dark:text-slate-200 dark:focus:bg-slate-700">Last 30 Days</SelectItem>
            <SelectItem value="90days" className="dark:text-slate-200 dark:focus:bg-slate-700">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a' }}
              formatter={(value: number) => [
                `${wallet.primaryCurrency === 'CNY' ? 'CNY' : 'MWK'} ${value.toLocaleString()}`, 
                'Balance'
              ]}
            />
            <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
