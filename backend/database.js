/**
 * Database module using Node.js built-in SQLite (node:sqlite)
 * Available in Node.js 22.5+ — no native compilation required.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'transactionguard.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      merchant_id TEXT NOT NULL,
      amount REAL NOT NULL,
      card_bin TEXT,
      device_id TEXT,
      ip_country TEXT,
      merchant_country TEXT,
      is_first_time_device INTEGER DEFAULT 0,
      txn_count_last_1hr INTEGER DEFAULT 0,
      txn_count_last_24hr INTEGER DEFAULT 0,
      avg_amount_last_30d REAL DEFAULT 0,
      hour_of_day INTEGER,
      is_fraud INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS risk_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE NOT NULL,
      risk_score REAL NOT NULL,
      risk_level TEXT NOT NULL,
      fraud_probability REAL NOT NULL,
      confidence REAL NOT NULL,
      is_flagged INTEGER DEFAULT 0,
      reasons TEXT,
      risk_breakdown TEXT,
      behavioral_fingerprint TEXT,
      fallback_mode INTEGER DEFAULT 0,
      review_recommendation TEXT,
      engine_version TEXT DEFAULT 'TransactionGuard-v1',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      risk_score REAL,
      risk_level TEXT,
      confidence REAL,
      risk_signals TEXT,
      fallback_mode INTEGER DEFAULT 0,
      recommendation TEXT,
      engine_version TEXT DEFAULT 'TransactionGuard-v1',
      raw_input TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      risk_score REAL,
      risk_level TEXT,
      top_signal TEXT,
      confidence REAL,
      status TEXT DEFAULT 'Needs Review',
      reviewer_notes TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_id ON transactions(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_risk_results_txn ON risk_results(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_txn ON audit_logs(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
  `);

  console.log('✅ Database initialized at', DB_PATH);
  return database;
}

module.exports = { getDb, initializeDatabase };
