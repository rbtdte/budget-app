import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const budgets = db.prepare('SELECT category, monthly_limit as monthlyLimit FROM budgets').all();
  return NextResponse.json(budgets);
}

export async function PUT(req: NextRequest) {
  try {
    const { category, monthlyLimit } = await req.json();
    if (!category || monthlyLimit == null) {
      return NextResponse.json({ error: 'category and monthlyLimit required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('UPDATE budgets SET monthly_limit = ? WHERE category = ?').run(monthlyLimit, category);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
