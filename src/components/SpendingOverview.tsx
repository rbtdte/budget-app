'use client';

interface Props {
  spent: number;
  budget: number;
}

export default function SpendingOverview({ spent, budget }: Props) {
  const remaining = budget - spent;
  const pct = Math.min((spent / budget) * 100, 100);
  const isOver = spent > budget;

  const color = pct < 70 ? '#10b981' : pct < 90 ? '#f59e0b' : '#ef4444';

  return (
    <div className="card animate-fade-up">
      {/* Month label */}
      <p className="text-slate-400 text-sm font-semibold mb-1">
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>

      {/* Spent amount */}
      <div className="flex items-end gap-2 mb-1">
        <span className="text-5xl font-black tabular-nums text-white">
          ${Math.floor(spent).toLocaleString()}
        </span>
        <span className="text-slate-400 font-semibold mb-2 text-lg">
          .{String(Math.round((spent % 1) * 100)).padStart(2, '0')}
        </span>
      </div>
      <p className="text-slate-400 text-sm font-semibold">spent this month</p>

      {/* Progress bar */}
      <div className="mt-4 mb-3">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Remaining / over budget */}
      <div className="flex items-center justify-between">
        <div>
          {isOver ? (
            <p className="text-red-400 font-bold text-base">
              ${Math.abs(remaining).toFixed(0)} over budget 😬
            </p>
          ) : (
            <p className="font-bold text-base" style={{ color }}>
              ${remaining.toFixed(0)} left to spend
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs font-semibold">Budget</p>
          <p className="text-slate-300 font-bold text-sm">${budget.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
