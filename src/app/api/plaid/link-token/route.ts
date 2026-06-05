import { NextResponse } from 'next/server';
import { getPlaidClient } from '@/lib/plaid';
import { CountryCode, Products } from 'plaid';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const plaid = getPlaidClient();

    const response = await plaid.linkTokenCreate({
      user: { client_user_id: 'mom-user' },
      client_name: 'My Budget',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    // Only return the link_token (public, safe for frontend)
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err: any) {
    console.error('[plaid/link-token]', err?.message);
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 });
  }
}
