'use client';

import { CATEGORY_COLORS, CATEGORY_EMOJI } from '@/lib/categories';
import type { Category } from '@/types';

interface CategoryData {
  category: Category;
  spent: number;
  limit: number;
}

interface Props {
  categories: CategoryData[];
}

export default function CategoryBreakdown({ categories }: Props) {
  // Show top 6 non-zero categories, then remaining
  const active = categories.filter((c) => c.spent > 0).slice(0, 6);
  const empty = categories.filter((c) => c.spent === 0);

  return (
    <div className="card animate-fade-up animate-delay-2">
      <h2 className="text-base font-black text-white mb-3">Where Money Is Going</h2>
      <div className="space-y-3">
        {active.map((cat, i) => {
          const pct = Math.min((cat.spent / cat.limit) * 100, 100);
          const color = CATEGORY_COLORS[cat.category];
          const isOver = cat.spent > cat.limit;

          return (
            <div key={cat.category} className={`animate-fade-up animate-delay-${Math.min(i + 1, 5)}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_EMOJI[cat.category]}</span>
                  <span className="text-sm font-bold text-slate-200">{cat.category}</span>
                  {isOver && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                      Over!
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-black tabular-nums text-white">
                    ${cat.spent.toFixed(0)}
                  </span>
                  <span className="text-slate-500 text-xs font-semibold">
                    {' '}/ ${cat.limit}
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isOver ? '#ef4444' : color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {empty.length > 0 && (
        <p className="mt-3 text-slate-600 text-xs font-semibold">
          {empty.map((c) => CATEGORY_EMOJI[c.category] + ' ' + c.category).join(' · ')} — no spending yet
        </p>
      )}
    </div>
  );
}
