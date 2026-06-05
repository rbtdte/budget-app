import { NextResponse } from 'next/server';
import { syncAllAccounts } from '@/lib/sync';
import { detectAndSaveRecurringBills } from '@/lib/bills';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Called by: app launch, cron job, manual refresh
export async function POST() {
  try {
    const db = getDb();
    const accountCount = (db.prepare('SELECT COUNT(*) as c FROM accounts').get() as any).c;

    if (accountCount === 0) {
      return NextResponse.json({ skipped: true, reason: 'No accounts linked' });
    }

    const result = await syncAllAccounts();

    // Re-detect recurring bills after sync
    detectAndSaveRecurringBills();

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[sync]', err?.message);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

// GET: returns last sync time
export async function GET() {
  const db = getDb();
  const row = db.prepare('SELECT synced_at FROM sync_log ORDER BY id DESC LIMIT 1').get() as any;
  return NextResponse.json({ lastSync: row?.synced_at || null });
}
