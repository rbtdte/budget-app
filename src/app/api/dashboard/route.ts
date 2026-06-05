import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getLastSyncTime } from '@/lib/sync';
import { MOCK_DASHBOARD } from '@/lib/mockData';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import type { Category, DashboardData } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const accountCount = (db.prepare('SELECT COUNT(*) as c FROM accounts').get() as any).c;

    // No accounts yet → return demo data
    if (accountCount === 0) {
      return NextResponse.json({ ...MOCK_DASHBOARD, isDemo: true, lastSync: null });
    }

    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

    // Total spent this month (posted only)
    const totalRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE date >= ? AND date <= ? AND status = 'posted'
    `).get(monthStart, monthEnd) as any;

    // Category breakdown
    const categoryRows = db.prepare(`
      SELECT category, COALESCE(SUM(amount), 0) as spent
      FROM transactions
      WHERE date >= ? AND date <= ? AND status = 'posted'
      GROUP BY category
    `).all(monthStart, monthEnd) as { category: string; spent: number }[];

    const budgets = db.prepare('SELECT category, monthly_limit FROM budgets').all() as {
      category: string;
      monthly_limit: number;
    }[];

    const budgetMap: Record<string, number> = {};
    for (const b of budgets) budgetMap[b.category] = b.monthly_limit;

    const categoryBreakdown = budgets.map((b) => {
      const found = categoryRows.find((c) => c.category === b.category);
      return {
        category: b.category as Category,
        spent: found?.spent || 0,
        limit: b.monthly_limit,
      };
    }).sort((a, b) => b.spent - a.spent);

    const totalBudget = budgets.reduce((s, b) => s + b.monthly_limit, 0);

    // Recent transactions (last 10)
    const recentTransactions = db.prepare(`
      SELECT id, plaid_transaction_id as plaidTransactionId, amount, merchant, date, category, account_id as accountId, status
      FROM transactions
      ORDER BY date DESC, created_at DESC
      LIMIT 10
    `).all();

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = format(startOfMonth(d), 'yyyy-MM-dd');
      const end = format(endOfMonth(d), 'yyyy-MM-dd');
      const row = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE date >= ? AND date <= ? AND status = 'posted'
      `).get(start, end) as any;
      monthlyTrend.push({ month: format(d, 'MMM'), total: Math.round(row.total) });
    }

    // Upcoming bills
    const upcomingBills = db.prepare(`
      SELECT id, merchant, avg_amount as avgAmount, frequency, next_due_date as nextDueDate, category
      FROM recurring_bills
      ORDER BY next_due_date ASC
      LIMIT 6
    `).all();

    const data: DashboardData & { isDemo: boolean; lastSync: string | null } = {
      totalSpentThisMonth: Math.round(totalRow.total * 100) / 100,
      totalBudget,
      categoryBreakdown,
      recentTransactions: recentTransactions as any,
      monthlyTrend,
      upcomingBills: upcomingBills as any,
      isDemo: false,
      lastSync: getLastSyncTime(),
    };

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[dashboard]', err?.message);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
