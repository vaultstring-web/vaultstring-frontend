export function exportTransactionsToCSV(transactions: any[], filenamePrefix = 'transactions') {
  if (!transactions || transactions.length === 0) return;

  const rows = transactions.map((t) => {
    const ref = String(t.reference || t.id || '');
    const amount = String(t.amount ?? t.net_amount ?? 0);
    const currency = String(t.currency || '');
    const sid = String(t.sender_id || t.senderId || '');
    const rid = String(t.receiver_id || t.receiverId || '');
    const senderWallet = t.sender_wallet_number || (sid ? `...${sid.slice(-4)}` : '');
    const receiverWallet = t.receiver_wallet_number || (rid ? `...${rid.slice(-4)}` : '');
    const senderName = t.sender_name || t.SenderName || senderWallet;
    const receiverName = t.receiver_name || t.ReceiverName || receiverWallet;
    const status = String(t.status || '');
    const date = String(t.created_at || t.initiated_at || '');
    
    // CSV escaping
    return [ref, date, amount, currency, status, senderName, receiverName]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',');
  });

  const header = ['Reference', 'Date', 'Amount', 'Currency', 'Status', 'Sender', 'Receiver'].join(',');
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
