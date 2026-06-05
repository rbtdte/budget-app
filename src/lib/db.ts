import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DB_PATH || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'budget.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_FILE);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      institution TEXT NOT NULL,
      access_token TEXT NOT NULL,
      sync_cursor TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      plaid_transaction_id TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      merchant TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      account_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'posted',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      category TEXT PRIMARY KEY,
      monthly_limit REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recurring_bills (
      id TEXT PRIMARY KEY,
      merchant TEXT NOT NULL,
      avg_amount REAL NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      next_due_date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      synced_at TEXT DEFAULT (datetime('now')),
      transactions_added INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success'
    );
  `);

  // Seed default budgets if none exist
  const count = db.prepare('SELECT COUNT(*) as c FROM budgets').get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO budgets (category, monthly_limit) VALUES (?, ?)');
    const defaults: [string, number][] = [
      ['Rent', 2000],
      ['Utilities', 200],
      ['Groceries', 400],
      ['Dining', 200],
      ['Gas', 150],
      ['Subscriptions', 100],
      ['Shopping', 300],
      ['Other', 200],
    ];
    for (const [cat, limit] of defaults) {
      insert.run(cat, limit);
    }
  }
}
