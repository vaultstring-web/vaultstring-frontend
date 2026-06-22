'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'vaultstring.balance.visible';

export function useBalanceVisibility(initial = true) {
  const [visible, setVisible] = useState<boolean>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) setVisible(raw === '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, visible ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [visible]);

  function toggle() {
    setVisible((v) => !v);
  }

  return { visible, setVisible, toggle };
}
