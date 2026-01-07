import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/src/components/ui/table';

interface TransactionsTableProps {
  transactions: Array<any>;
  userId: string | null;
}

export default function TransactionsTable({ transactions, userId }: TransactionsTableProps) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-slate-50 text-left text-sm text-slate-600">
            <TableHead className="px-4 text-slate-600 py-3">Summary</TableHead>
            <TableHead className="px-4 text-slate-600 py-3">Date</TableHead>
            <TableHead className="px-4 text-slate-600 py-3">Reference</TableHead>
            <TableHead className="px-4 text-slate-600 py-3">Amount</TableHead>
            <TableHead className="px-4 text-slate-600 py-3">Currency</TableHead>
            <TableHead className="px-4 text-slate-600 py-3">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={String(t.id || t.reference || Math.random())} className="text-sm text-slate-900 hover:bg-slate-50">
              <TableCell className="px-4 py-3">
                {(() => {
                  const ref = String(t.reference || t.id || '');
                  const amount = String(t.amount ?? t.net_amount ?? 0);
                  const currency = String(t.currency || '');
                  const sid = String(t.sender_id || t.senderId || '');
                  const rid = String(t.receiver_id || t.receiverId || '');
                  if (userId && rid && String(userId).toLowerCase() === rid.toLowerCase()) {
                    return `Trans. ID: ${ref} You have received ${currency} ${amount}`;
                  }
                  if (userId && sid && String(userId).toLowerCase() === sid.toLowerCase()) {
                    return `Trans. ID: ${ref} You sent ${currency} ${amount}`;
                  }
                  return `Trans. ID: ${ref} ${currency} ${amount}`;
                })()}
              </TableCell>
              <TableCell className="px-4 py-3">{String(t.created_at || t.initiated_at || '')}</TableCell>
              <TableCell className="px-4 py-3 font-mono">{String(t.reference || t.id || '')}</TableCell>
              <TableCell className="px-4 py-3 font-semibold">{String(t.amount ?? t.net_amount ?? 0)}</TableCell>
              <TableCell className="px-4 py-3">{String(t.currency || '')}</TableCell>
              <TableCell className="px-4 py-3">
                {(() => {
                  const s = String(t.status || '').toLowerCase();
                  const base = 'px-2 py-1 rounded-md text-xs';
                  const cls =
                    s === 'completed'
                      ? `${base} bg-green-100 text-green-700`
                      : s === 'pending'
                      ? `${base} bg-amber-100 text-amber-700`
                      : `${base} bg-red-100 text-red-700`;
                  return <span className={cls}>{String(t.status || '').charAt(0).toUpperCase() + String(t.status || '').slice(1)}</span>;
                })()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
