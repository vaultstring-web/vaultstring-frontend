import React, { useState } from 'react';
import { History } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination"

interface LoginRecord {
  device: string;
  location: string;
  timestamp: string;
}

const DEFAULT_HISTORY: LoginRecord[] = [
  { device: 'iPhone 13 Pro', location: 'Lilongwe, MW', timestamp: 'Just now' },
  { device: 'Windows PC (Chrome)', location: 'Blantyre, MW', timestamp: 'Oct 25, 2023 - 14:30' },
  { device: 'MacBook Pro', location: 'Lilongwe, MW', timestamp: 'Oct 24, 2023 - 09:15' },
  { device: 'Android Phone', location: 'Mzuzu, MW', timestamp: 'Oct 20, 2023 - 18:45' },
  { device: 'iPad Air', location: 'Lilongwe, MW', timestamp: 'Oct 15, 2023 - 11:20' },
  { device: 'Windows PC (Firefox)', location: 'Zomba, MW', timestamp: 'Oct 10, 2023 - 16:10' },
];

interface LoginHistoryProps {
  history?: LoginRecord[];
}

const LoginHistory: React.FC<LoginHistoryProps> = ({ history = DEFAULT_HISTORY }) => {
  const [page, setPage] = useState(1);
  const limit = 5;
  const total = history.length;
  const totalPages = Math.ceil(total / limit);

  const paginatedHistory = history.slice((page - 1) * limit, page * limit);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <History size={20} className="text-slate-400" />
          Login History
        </h3>
      </div>
      <div className="p-6">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="pb-3">Device</th>
              <th className="pb-3">Location</th>
              <th className="pb-3 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 dark:text-slate-300">
            {paginatedHistory.map((record, index) => (
              <tr key={index}>
                <td className="py-3 font-medium">{record.device}</td>
                <td className="py-3">{record.location}</td>
                <td className="py-3 text-right">{record.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => e.preventDefault()} isActive>
                    {page}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistory;
