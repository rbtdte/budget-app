'use client';

import { CATEGORY_EMOJI, CATEGORY_COLORS } from '@/lib/categories';
import type { Transaction, Category } from '@/types';
import { format, parseISO } from 'date-fns';

interface Props {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: Props) {
  return (
    <div className="card animate-fade-up animate-delay-4">
      <h2 className="text-base font-black text-white mb-3">Recent Spending</h2>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 py-2 border-b border-slate-700/40 last:border-0"
          >
            {/* Category icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[tx.category] + '22' }}
            >
              {CATEGORY_EMOJI[tx.category]}
            </div>

            {/* Merchant + date */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{tx.merchant}</p>
              <p className="text-xs text-slate-500 font-semibold">
                {tx.date ? format(parseISO(tx.date), 'MMM d') : ''}
                {tx.status === 'pending' && (
                  <span className="ml-2 text-yellow-500">Pending</span>
                )}
              </p>
            </div>

            {/* Amount */}
            <span className="text-sm font-black tabular-nums text-white flex-shrink-0">
              −${tx.amount.toFixed(2)}
            </span>
          </div>
        ))}

        {transactions.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
