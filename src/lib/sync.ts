import { getPlaidClient } from './plaid';
import { getDb } from './db';
import { mapPlaidCategory } from './categories';
import { randomUUID } from 'crypto';

export async function syncAllAccounts(): Promise<{ added: number; updated: number; errors: string[] }> {
  const db = getDb();
  const accounts = db.prepare('SELECT * FROM accounts').all() as any[];
  
  let totalAdded = 0;
  let totalUpdated = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      const result = await syncAccount(account.id, account.access_token, account.sync_cursor);
      totalAdded += result.added;
      totalUpdated += result.updated;
    } catch (err: any) {
      // Never log the access token or sensitive data
      errors.push(`Account ${account.name}: ${err?.message || 'Unknown error'}`);
    }
  }

  // Log sync
  db.prepare(
    'INSERT INTO sync_log (transactions_added, status) VALUES (?, ?)'
  ).run(totalAdded, errors.length === 0 ? 'success' : 'partial');

  return { added: totalAdded, updated: totalUpdated, errors };
}

async function syncAccount(
  accountId: string,
  accessToken: string,
  cursor: string | null
): Promise<{ added: number; updated: number }> {
  const plaid = getPlaidClient();
  const db = getDb();

  let hasMore = true;
  let nextCursor = cursor || undefined;
  let totalAdded = 0;
  let totalUpdated = 0;

  const upsertTx = db.prepare(`
    INSERT INTO transactions (id, plaid_transaction_id, amount, merchant, date, category, account_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(plaid_transaction_id) DO UPDATE SET
      amount = excluded.amount,
      merchant = excluded.merchant,
      date = excluded.date,
      category = excluded.category,
      status = excluded.status
  `);

  const deleteTx = db.prepare('DELETE FROM transactions WHERE plaid_transaction_id = ?');

  while (hasMore) {
    const response = await plaid.transactionsSync({
      access_token: accessToken,
      cursor: nextCursor,
      count: 100,
      options: { include_personal_finance_category: true },
    });

    const { added, modified, removed, next_cursor, has_more } = response.data;

    const runBatch = db.transaction(() => {
      // Handle added transactions
      for (const tx of added) {
        const category = mapPlaidCategory(
          tx.personal_finance_category?.primary,
          tx.personal_finance_category?.detailed
        );
        upsertTx.run(
          randomUUID(),
          tx.transaction_id,
          Math.abs(tx.amount), // Plaid uses negative for credits; we want positive spend
          tx.merchant_name || tx.name || 'Unknown',
          tx.date,
          category,
          accountId,
          tx.pending ? 'pending' : 'posted'
        );
        totalAdded++;
      }

      // Handle modified (pending → posted updates)
      for (const tx of modified) {
        const category = mapPlaidCategory(
          tx.personal_finance_category?.primary,
          tx.personal_finance_category?.detailed
        );
        upsertTx.run(
          randomUUID(),
          tx.transaction_id,
          Math.abs(tx.amount),
          tx.merchant_name || tx.name || 'Unknown',
          tx.date,
          category,
          accountId,
          tx.pending ? 'pending' : 'posted'
        );
        totalUpdated++;
      }

      // Handle removed transactions
      for (const tx of removed) {
        deleteTx.run(tx.transaction_id);
      }
    });

    runBatch();

    nextCursor = next_cursor;
    hasMore = has_more;
  }

  // Persist the cursor so next sync is incremental
  db.prepare('UPDATE accounts SET sync_cursor = ? WHERE id = ?').run(nextCursor || null, accountId);

  return { added: totalAdded, updated: totalUpdated };
}

export function getLastSyncTime(): string | null {
  const db = getDb();
  const row = db.prepare('SELECT synced_at FROM sync_log ORDER BY id DESC LIMIT 1').get() as any;
  return row?.synced_at || null;
}
