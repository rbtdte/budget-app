'use client';

import { CATEGORY_EMOJI } from '@/lib/categories';
import type { RecurringBill } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';

interface Props {
  bills: RecurringBill[];
}

export default function UpcomingBills({ bills }: Props) {
  const today = new Date();

  return (
    <div className="card animate-fade-up animate-delay-1">
      <h2 className="text-base font-black text-white mb-3">Upcoming Bills 📋</h2>
      <div className="space-y-2">
        {bills.map((bill) => {
          const due = parseISO(bill.nextDueDate);
          const daysUntil = differenceInDays(due, today);
          const isSoon = daysUntil <= 5;

          return (
            <div
              key={bill.id}
              className={`flex items-center gap-3 py-2 px-3 rounded-xl ${
                isSoon ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-700/30'
              }`}
            >
              <span className="text-xl">{CATEGORY_EMOJI[bill.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{bill.merchant}</p>
                <p className={`text-xs font-semibold ${isSoon ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {daysUntil === 0
                    ? 'Due today!'
                    : daysUntil < 0
                    ? 'Overdue'
                    : daysUntil === 1
                    ? 'Due tomorrow'
                    : `Due in ${daysUntil} days`}{' '}
                  · {format(due, 'MMM d')}
                </p>
              </div>
              <span className="text-sm font-black tabular-nums text-white">
                ~${bill.avgAmount.toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
