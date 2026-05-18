export const generateFallbackWalletNumber = (id: string) => {
  // Deterministic fallback from UUID/String to ensure a stable 16-digit number
  const map: Record<string, string> = {
    'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5', 'f': '6', '-': ''
  };
  const numStr = String(id).toLowerCase().split('').map(c => map[c] || c).join('').replace(/\D/g, '');
  return (numStr + '4539102834756192').slice(0, 16);
};

export const formatWalletNumber = (num: string | null | undefined) => {
  if (!num) return '.... .... .... ....';
  const cleaned = String(num).replace(/\D/g, '');
  const target = cleaned.padEnd(16, '0').slice(0, 16);
  return target.match(/.{1,4}/g)?.join(' ') || target;
};

export const formatCurrency = (
  amount: number | string | null | undefined, 
  currency: string = 'MWK',
  locale: string = 'en-US'
) => {
  const val = parseFloat(String(amount || 0));
  if (isNaN(val)) return '0.00';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'MWK',
      minimumFractionDigits: 2
    }).format(val);
  } catch {
    // Fallback if currency code is invalid
    return `${currency} ${val.toLocaleString(locale, { minimumFractionDigits: 2 })}`;
  }
};

export const getStatusColor = (status: string) => {
  switch (String(status).toLowerCase()) {
    case 'completed':
    case 'success':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending':
    case 'processing':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'failed':
    case 'cancelled':
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getWalletGradient = (currency: string) => {
  const c = String(currency).toUpperCase();
  switch (c) {
    case 'MWK': return 'bg-gradient-to-br from-emerald-600 to-teal-800';
    case 'ZMW': return 'bg-gradient-to-br from-orange-500 to-amber-700';
    case 'CNY': return 'bg-gradient-to-br from-rose-500 to-red-800';
    case 'NGN': return 'bg-gradient-to-br from-green-600 to-green-900';
    case 'ZAR': return 'bg-gradient-to-br from-blue-600 to-indigo-900';
    case 'KES': return 'bg-gradient-to-br from-red-600 to-red-900';
    case 'GHS': return 'bg-gradient-to-br from-yellow-500 to-orange-700';
    case 'EGP': return 'bg-gradient-to-br from-slate-600 to-slate-900';
    default: {
      // Hash-based deterministic gradient for other African currencies
      const colors = [
        'from-blue-600 to-indigo-800',
        'from-purple-600 to-pink-800',
        'from-emerald-600 to-teal-800',
        'from-amber-500 to-orange-700',
        'from-rose-500 to-red-800',
        'from-slate-600 to-slate-900'
      ];
      const index = c.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      return `bg-gradient-to-br ${colors[index]}`;
    }
  }
};
