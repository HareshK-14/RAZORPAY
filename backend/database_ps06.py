"""
SQLite Database Module for Track PS06 (using Python standard library sqlite3)
NexusTiq24 — Banking: Transaction Risk Investigation Assistant
"""

import sqlite3
import os
import json
from synthetic_data_ps06 import generate_multi_month_history

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "database")
DB_PATH = os.path.join(DB_DIR, "transactionguard.db")

os.makedirs(DB_DIR, exist_ok=True)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def add_column_if_not_exists(cursor, table, column, col_type):
    cols = [c[1] for c in cursor.execute(f"PRAGMA table_info({table})").fetchall()]
    if column not in cols:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")

def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Customers table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            customer_id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            account_type TEXT NOT NULL,
            case_type TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # 2. Transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            customer_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'INR',
            payee TEXT NOT NULL,
            merchant_id TEXT,
            merchant_category TEXT,
            channel TEXT DEFAULT 'UPI',
            payee_added_date TEXT,
            location TEXT,
            device_id TEXT,
            card_bin TEXT,
            ip_country TEXT DEFAULT 'IN',
            merchant_country TEXT DEFAULT 'IN',
            is_first_time_device INTEGER DEFAULT 0,
            txn_count_last_1hr INTEGER DEFAULT 1,
            txn_count_last_24hr INTEGER DEFAULT 2,
            avg_amount_last_30d REAL DEFAULT 0,
            hour_of_day INTEGER,
            is_fraud INTEGER DEFAULT 0,
            is_flagged INTEGER DEFAULT 0,
            balance_after_transaction REAL,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # Ensure all columns exist in transactions if migrating
    for col, ctype in [
        ("payee", "TEXT"), ("merchant_id", "TEXT"), ("merchant_category", "TEXT"),
        ("channel", "TEXT DEFAULT 'UPI'"), ("payee_added_date", "TEXT"),
        ("location", "TEXT"), ("balance_after_transaction", "REAL"),
        ("description", "TEXT"), ("currency", "TEXT DEFAULT 'INR'"),
        ("is_flagged", "INTEGER DEFAULT 0"), ("card_bin", "TEXT"),
        ("ip_country", "TEXT DEFAULT 'IN'"), ("merchant_country", "TEXT DEFAULT 'IN'"),
        ("is_first_time_device", "INTEGER DEFAULT 0"), ("txn_count_last_1hr", "INTEGER DEFAULT 1"),
        ("txn_count_last_24hr", "INTEGER DEFAULT 2"), ("avg_amount_last_30d", "REAL DEFAULT 0"),
        ("hour_of_day", "INTEGER"), ("is_fraud", "INTEGER DEFAULT 0")
    ]:
        add_column_if_not_exists(cursor, "transactions", col, ctype)

    # 3. Customer Baselines cache
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customer_baselines (
            customer_id TEXT PRIMARY KEY,
            avg_amount REAL,
            median_amount REAL,
            typical_frequency_per_day REAL,
            active_hours TEXT,
            common_payees TEXT,
            common_channels TEXT,
            total_transactions INTEGER,
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # 4. Reviews / Investigation Cases
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT UNIQUE,
            customer_id TEXT,
            transaction_id TEXT,
            risk_score REAL,
            attention_score REAL,
            investigation_priority TEXT DEFAULT 'MEDIUM',
            top_signal TEXT,
            confidence REAL,
            evidence_confidence REAL,
            status TEXT DEFAULT 'Needs Review',
            reviewer_notes TEXT,
            reviewed_by TEXT,
            reviewed_at TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    for col, ctype in [
        ("case_id", "TEXT"), ("customer_id", "TEXT"), ("attention_score", "REAL"),
        ("investigation_priority", "TEXT DEFAULT 'MEDIUM'"), ("evidence_confidence", "REAL")
    ]:
        add_column_if_not_exists(cursor, "reviews", col, ctype)

    # 5. Audit Logs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audit_id TEXT,
            customer_id TEXT,
            transaction_id TEXT,
            timestamp TEXT DEFAULT (datetime('now')),
            attention_score REAL,
            investigation_priority TEXT,
            evidence_confidence REAL,
            risk_score REAL,
            risk_level TEXT,
            confidence REAL,
            risk_signals TEXT,
            triggered_rules TEXT,
            ai_summary TEXT,
            recommendation TEXT,
            record_checksum TEXT,
            fallback_mode INTEGER DEFAULT 0,
            engine_version TEXT DEFAULT 'TransactionGuard-PS06',
            raw_input TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    for col, ctype in [
        ("audit_id", "TEXT"), ("customer_id", "TEXT"), ("attention_score", "REAL"),
        ("investigation_priority", "TEXT"), ("evidence_confidence", "REAL"),
        ("triggered_rules", "TEXT"), ("ai_summary", "TEXT"), ("record_checksum", "TEXT")
    ]:
        add_column_if_not_exists(cursor, "audit_logs", col, ctype)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tx_cust ON transactions(customer_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tx_id ON transactions(transaction_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_rev_cust ON reviews(customer_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_cust ON audit_logs(customer_id)")

    conn.commit()

    # Seed data if customers table is empty or less than 5 customers
    cursor.execute("SELECT COUNT(*) as c FROM customers")
    if cursor.fetchone()["c"] < 5:
        seed_data(conn)

    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    history_data = generate_multi_month_history()

    for cid, cinfo in history_data.items():
        cursor.execute("""
            INSERT OR REPLACE INTO customers (customer_id, customer_name, account_type, case_type, description)
            VALUES (?, ?, ?, ?, ?)
        """, (cid, cinfo["customer_name"], cinfo["account_type"], cinfo["case_type"], cinfo["description"]))

        for tx in cinfo["transactions"]:
            # Derive hour
            try:
                hour = int(tx["timestamp"].split(" ")[1].split(":")[0])
            except Exception:
                hour = 12

            is_flagged = 1 if tx["transaction_id"] in ["TX1001", "TX1002", "TX1003"] else 0
            cursor.execute("""
                INSERT OR REPLACE INTO transactions (
                    transaction_id, customer_id, timestamp, amount, currency,
                    payee, merchant_id, merchant_category, channel, payee_added_date,
                    location, device_id, card_bin, ip_country, merchant_country,
                    is_first_time_device, txn_count_last_1hr, txn_count_last_24hr,
                    avg_amount_last_30d, hour_of_day, is_fraud, is_flagged,
                    balance_after_transaction, description
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                tx["transaction_id"], tx["customer_id"], tx["timestamp"], tx["amount"], tx.get("currency", "INR"),
                tx["payee"], tx.get("payee", "MERCH-001"), tx.get("merchant_category"), tx.get("channel", "UPI"),
                tx.get("payee_added_date"), tx.get("location"), tx.get("device_id"), "411111", "IN", "IN",
                1 if "UNKNOWN" in str(tx.get("device_id")) else 0,
                3 if is_flagged else 1, 3 if is_flagged else 1,
                3500.0, hour, is_flagged, is_flagged,
                tx.get("balance_after_transaction"), tx.get("description")
            ))

    # Pre-seed reviews for cases needing attention
    cursor.execute("""
        INSERT OR REPLACE INTO reviews (case_id, customer_id, transaction_id, attention_score, investigation_priority, top_signal, evidence_confidence, status, reviewer_notes)
        VALUES 
        ('CASE-2026-0001', 'CUST-RISK-001', 'TX1001', 90.0, 'URGENT REVIEW', 'Burst of payments to a new payee', 94.0, 'Needs Review', 'Initial trigger: 3 high-value IMPS transfers to PAYEE-884 outside normal active window.'),
        ('CASE-2026-0002', 'CUST-AMBIG-003', 'TX1006', 25.0, 'LOW', 'Single transfer to newly added peer contact', 88.0, 'Under Review', 'Reviewing small peer lunch split transaction.')
    """)

    conn.commit()

if __name__ == "__main__":
    initialize_database()
    print(f"Database successfully initialized at {DB_PATH}")
