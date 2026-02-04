import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WalletStats } from '@/src/types/types';

interface BalanceHistoryChartProps {
  wallet: WalletStats;
}

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
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-slate-400" />
          Balance History
        </h3>
        <select className="text-sm border-slate-200 rounded-md text-slate-500 focus:ring-green-500 focus:border-green-500">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
