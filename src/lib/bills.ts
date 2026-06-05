import stringSimilarity from 'string-similarity';
import { addMonths, addWeeks, parseISO, format, isAfter, subMonths } from 'date-fns';
import { getDb } from './db';
import type { RecurringBill, Category } from '@/types';
import { randomUUID } from 'crypto';

interface TxRow {
  merchant: string;
  amount: number;
  date: string;
  category: string;
}

export function detectAndSaveRecurringBills(): void {
  const db = getDb();

  // Look at last 3 months of transactions
  const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
  const transactions = db
    .prepare(
      `SELECT merchant, amount, date, category 
       FROM transactions 
       WHERE date >= ? AND status = 'posted'
       ORDER BY merchant, date`
    )
    .all(threeMonthsAgo) as TxRow[];

  // Group by merchant (fuzzy match)
  const groups = groupByMerchant(transactions);
  const bills: Omit<RecurringBill, 'id'>[] = [];

  for (const [merchant, txs] of Object.entries(groups)) {
    if (txs.length < 2) continue;

    const avgAmount = txs.reduce((s, t) => s + t.amount, 0) / txs.length;
    const frequency = detectFrequency(txs);
    if (!frequency) continue;

    const lastDate = parseISO(txs[txs.length - 1].date);
    const nextDueDate =
      frequency === 'monthly'
        ? format(addMonths(lastDate, 1), 'yyyy-MM-dd')
        : format(addWeeks(lastDate, 1), 'yyyy-MM-dd');

    bills.push({
      merchant,
      avgAmount,
      frequency,
      nextDueDate,
      category: txs[0].category as Category,
    });
  }

  // Persist
  const upsert = db.prepare(`
    INSERT INTO recurring_bills (id, merchant, avg_amount, frequency, next_due_date, category, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT DO NOTHING
  `);

  // Clear stale bills first
  db.prepare('DELETE FROM recurring_bills').run();

  for (const bill of bills) {
    upsert.run(randomUUID(), bill.merchant, bill.avgAmount, bill.frequency, bill.nextDueDate, bill.category);
  }
}

function groupByMerchant(transactions: TxRow[]): Record<string, TxRow[]> {
  const groups: Record<string, TxRow[]> = {};

  for (const tx of transactions) {
    const name = tx.merchant.toLowerCase().trim();
    let matched = false;

    for (const key of Object.keys(groups)) {
      const similarity = stringSimilarity.compareTwoStrings(name, key);
      if (similarity > 0.7) {
        groups[key].push(tx);
        matched = true;
        break;
      }
    }

    if (!matched) {
      groups[name] = [tx];
    }
  }

  return groups;
}

function detectFrequency(txs: TxRow[]): 'monthly' | 'weekly' | null {
  if (txs.length < 2) return null;

  const dates = txs.map((t) => parseISO(t.date)).sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];

  for (let i = 1; i < dates.length; i++) {
    const diffDays = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    gaps.push(diffDays);
  }

  const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;

  if (avgGap >= 25 && avgGap <= 35) return 'monthly';
  if (avgGap >= 5 && avgGap <= 9) return 'weekly';
  return null;
}
