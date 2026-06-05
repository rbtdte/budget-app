'use client';

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_EMOJI } from '@/lib/categories';
import type { Category } from '@/types';

interface Props {
  categoryBreakdown: { category: Category; spent: number; limit: number }[];
  monthlyTrend: { month: string; total: number }[];
}

export default function SpendingChart({ categoryBreakdown, monthlyTrend }: Props) {
  const [activeTab, setActiveTab] = useState<'pie' | 'trend'>('pie');

  const pieData = categoryBreakdown
    .filter((c) => c.spent > 0)
    .map((c) => ({ name: c.category, value: Math.round(c.spent), color: CATEGORY_COLORS[c.category] }));

  return (
    <div className="card animate-fade-up animate-delay-3">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('pie')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'pie'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          By Category
        </button>
        <button
          onClick={() => setActiveTab('trend')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'trend'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          Monthly Trend
        </button>
      </div>

      {activeTab === 'pie' ? (
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value}`, '']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400 font-semibold truncate">
                  {CATEGORY_EMOJI[item.name as Category]} {item.name}
                </span>
                <span className="text-xs text-slate-300 font-black ml-auto tabular-nums">
                  ${item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 text-xs font-semibold mb-3">Last 6 months</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#spendGrad)"
                dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#818cf8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
