export function exportTransactionsToCSV(transactions: any[], filenamePrefix = 'transactions', currentUserId: string | null = null) {
  if (!transactions || transactions.length === 0) return;

  const rows = transactions.map((t) => {
    const ref = String(t.reference || t.id || '');
    const amount = String(t.amount ?? t.net_amount ?? 0);
    const currency = String(t.currency || '');
    const sid = String(t.sender_id || t.senderId || '');
    const rid = String(t.receiver_id || t.receiverId || '');
    
    // Determine direction if userId is provided
    let direction = 'unknown';
    if (currentUserId) {
      direction = sid === currentUserId ? 'sent' : 'received';
    }

    const senderWallet = t.sender_wallet_number || (sid ? `...${sid.slice(-4)}` : '');
    const receiverWallet = t.receiver_wallet_number || (rid ? `...${rid.slice(-4)}` : '');
    const senderName = t.sender_name || t.SenderName || senderWallet;
    const receiverName = t.receiver_name || t.ReceiverName || receiverWallet;
    
    // Generate Description / Statement
    let description = t.description || '';
    if (!description && direction !== 'unknown') {
      if (direction === 'sent') {
        description = `Sent to ${receiverName}`;
      } else {
        description = `Received from ${senderName}`;
      }
    } else if (!description) {
        // Fallback if we don't know direction
        description = `Transfer from ${senderName} to ${receiverName}`;
    }

    const status = String(t.status || '');
    const date = String(t.created_at || t.initiated_at || '');
    
    // CSV escaping
    return [ref, date, description, amount, currency, status, senderName, receiverName]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',');
  });

  const header = ['Reference', 'Date', 'Description', 'Amount', 'Currency', 'Status', 'Sender', 'Receiver'].join(',');
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
