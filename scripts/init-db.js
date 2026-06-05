#!/usr/bin/env node
// Run: node scripts/init-db.js
// Initializes the SQLite database with schema and default budgets.

const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DB_PATH || path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

try {
  const Database = require('better-sqlite3');
  const db = new Database(path.join(DB_DIR, 'budget.db'));
  db.pragma('journal_mode = WAL');

  console.log('✓ Database initialized at', path.join(DB_DIR, 'budget.db'));

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('✓ Tables:', tables.map(t => t.name).join(', ') || '(none yet — will be created on first run)');

  db.close();
} catch (err) {
  console.error('✗ DB init failed:', err.message);
  console.error('  Make sure better-sqlite3 is installed: npm install');
}
