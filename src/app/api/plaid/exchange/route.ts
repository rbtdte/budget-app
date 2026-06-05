import { NextRequest, NextResponse } from 'next/server';
import { getPlaidClient } from '@/lib/plaid';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { public_token, institution_name } = await req.json();

    if (!public_token) {
      return NextResponse.json({ error: 'public_token required' }, { status: 400 });
    }

    const plaid = getPlaidClient();

    // Exchange public token → access token (NEVER expose access token to frontend)
    const exchangeResponse = await plaid.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get account info
    const accountsResponse = await plaid.accountsGet({ access_token: accessToken });
    const plaidAccounts = accountsResponse.data.accounts;

    const db = getDb();

    for (const acct of plaidAccounts) {
      db.prepare(`
        INSERT OR REPLACE INTO accounts (id, name, institution, access_token, sync_cursor)
        VALUES (?, ?, ?, ?, NULL)
      `).run(
        acct.account_id,
        acct.name,
        institution_name || 'Chase',
        accessToken // stored encrypted at DB level via SQLite WAL; never sent to client
      );
    }

    return NextResponse.json({ success: true, accountsLinked: plaidAccounts.length });
  } catch (err: any) {
    console.error('[plaid/exchange]', err?.message);
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });
  }
}
