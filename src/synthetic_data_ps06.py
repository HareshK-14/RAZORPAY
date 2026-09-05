"""
Synthetic Banking Transaction Data Generator for Track PS06
NexusTiq24 — Banking: Transaction Risk Investigation Assistant
Generates multi-month realistic histories including clean baselines,
ambiguous cases, and critical investigation cases.
"""

import random
import datetime
import json

KNOWN_NORMAL_PAYEES = [
    {"name": "Reliance Retail Mart", "category": "Groceries", "channel": "CARD"},
    {"name": "Tata Power Utility", "category": "Utilities", "channel": "UPI"},
    {"name": "Zomato Food Delivery", "category": "Food & Dining", "channel": "UPI"},
    {"name": "Airtel Telecommunications", "category": "Telecommunications", "channel": "UPI"},
    {"name": "Blue Tokai Coffee", "category": "Food & Beverage", "channel": "UPI"},
    {"name": "Apollo Pharmacy Express", "category": "Healthcare", "channel": "CARD"},
    {"name": "Amazon India Retail", "category": "E-Commerce", "channel": "CARD"},
    {"name": "Delhi Metro Rail Corp", "category": "Transportation", "channel": "UPI"}
]

def generate_timestamp(base_date, days_ago, hour, minute):
    dt = base_date - datetime.timedelta(days=days_ago)
    return dt.replace(hour=hour, minute=minute, second=random.randint(0, 59)).strftime("%Y-%m-%d %H:%M:%S")

def generate_multi_month_history():
    customers_data = {}
    base_date = datetime.datetime(2026, 3, 15, 12, 0, 0)
    tx_counter = 1000

    # -------------------------------------------------------------
    # 1. CUST-NORMAL-001: Clean baseline, multi-month stable activity
    # -------------------------------------------------------------
    c1_txns = []
    # 90 days of normal activity (approx 50-60 transactions)
    for days_ago in range(90, 0, -1):
        if random.random() < 0.6: # ~60% of days have 1-2 transactions
            tx_count_today = random.choice([1, 1, 2])
            for _ in range(tx_count_today):
                tx_counter += 1
                payee = random.choice(KNOWN_NORMAL_PAYEES)
                hour = random.randint(9, 20)
                minute = random.randint(0, 59)
                amount = round(random.uniform(350, 4200), 2)
                c1_txns.append({
                    "transaction_id": f"TX{tx_counter}",
                    "customer_id": "CUST-NORMAL-001",
                    "timestamp": generate_timestamp(base_date, days_ago, hour, minute),
                    "amount": amount,
                    "currency": "INR",
                    "payee": payee["name"],
                    "merchant_category": payee["category"],
                    "channel": payee["channel"],
                    "payee_added_date": (base_date - datetime.timedelta(days=120)).strftime("%Y-%m-%d"),
                    "location": "Mumbai, IN",
                    "device_id": "DEV-IPHONE-C1",
                    "balance_after_transaction": round(145000 - amount, 2),
                    "description": f"Payment to {payee['name']}"
                })
    c1_txns.sort(key=lambda x: x["timestamp"])
    customers_data["CUST-NORMAL-001"] = {
        "customer_id": "CUST-NORMAL-001",
        "customer_name": "Rohan Deshmukh",
        "account_type": "Savings Account Premium",
        "case_type": "NORMAL",
        "description": "Stable salaried professional with predictable domestic retail spending.",
        "transactions": c1_txns
    }

    # -------------------------------------------------------------
    # 2. CUST-RISK-001: Difficult Case / Immediate Attention Needed
    # Normal baseline for 75 days, then sudden new payee burst at night
    # -------------------------------------------------------------
    c2_txns = []
    for days_ago in range(85, 2, -1):
        if random.random() < 0.55:
            payee = random.choice(KNOWN_NORMAL_PAYEES)
            hour = random.randint(9, 20)
            amount = round(random.uniform(800, 4500), 2)
            tx_counter += 1
            c2_txns.append({
                "transaction_id": f"TX{tx_counter}",
                "customer_id": "CUST-RISK-001",
                "timestamp": generate_timestamp(base_date, days_ago, hour, random.randint(0, 59)),
                "amount": amount,
                "currency": "INR",
                "payee": payee["name"],
                "merchant_category": payee["category"],
                "channel": payee["channel"],
                "payee_added_date": (base_date - datetime.timedelta(days=100)).strftime("%Y-%m-%d"),
                "location": "Bengaluru, IN",
                "device_id": "DEV-SAMSUNG-C2",
                "balance_after_transaction": round(210000 - amount, 2),
                "description": f"Standard payment {payee['name']}"
            })

    # The anomalous cluster on Day 1 (2026-03-14 early morning)
    # New payee PAYEE-884 added at 02:30 AM
    new_payee_time = "2026-03-14 02:30:00"
    suspicious_cluster = [
        {
            "transaction_id": "TX1001",
            "customer_id": "CUST-RISK-001",
            "timestamp": "2026-03-14 02:41:15",
            "amount": 25000.00,
            "currency": "INR",
            "payee": "PAYEE-884 (Overseas Tech Services)",
            "merchant_category": "Wire Transfer / External",
            "channel": "BANK TRANSFER",
            "payee_added_date": new_payee_time,
            "location": "Kolkata, IN",
            "device_id": "DEV-UNKNOWN-99",
            "balance_after_transaction": 185000.00,
            "description": "Immediate IMPS Outward Transfer to PAYEE-884"
        },
        {
            "transaction_id": "TX1002",
            "customer_id": "CUST-RISK-001",
            "timestamp": "2026-03-14 02:51:40",
            "amount": 18000.00,
            "currency": "INR",
            "payee": "PAYEE-884 (Overseas Tech Services)",
            "merchant_category": "Wire Transfer / External",
            "channel": "BANK TRANSFER",
            "payee_added_date": new_payee_time,
            "location": "Kolkata, IN",
            "device_id": "DEV-UNKNOWN-99",
            "balance_after_transaction": 167000.00,
            "description": "Immediate IMPS Outward Transfer to PAYEE-884"
        },
        {
            "transaction_id": "TX1003",
            "customer_id": "CUST-RISK-001",
            "timestamp": "2026-03-14 03:04:12",
            "amount": 22000.00,
            "currency": "INR",
            "payee": "PAYEE-884 (Overseas Tech Services)",
            "merchant_category": "Wire Transfer / External",
            "channel": "BANK TRANSFER",
            "payee_added_date": new_payee_time,
            "location": "Kolkata, IN",
            "device_id": "DEV-UNKNOWN-99",
            "balance_after_transaction": 145000.00,
            "description": "Immediate IMPS Outward Transfer to PAYEE-884"
        }
    ]
    c2_txns.extend(suspicious_cluster)
    c2_txns.sort(key=lambda x: x["timestamp"])

    customers_data["CUST-RISK-001"] = {
        "customer_id": "CUST-RISK-001",
        "customer_name": "Priya Ananth",
        "account_type": "Salary Account Plus",
        "case_type": "ATTENTION_REQUIRED",
        "description": "Established account experiencing sudden nocturnal IMPS burst to newly added beneficiary.",
        "transactions": c2_txns
    }

    # -------------------------------------------------------------
    # 3. CUST-AMBIG-001: Large amount but consistent with history
    # -------------------------------------------------------------
    c3_txns = []
    # Baseline with regular ₹30,000–₹50,000 monthly rent/tax transfers
    for days_ago in [75, 45, 15]:
        tx_counter += 1
        c3_txns.append({
            "transaction_id": f"TX{tx_counter}",
            "customer_id": "CUST-AMBIG-001",
            "timestamp": generate_timestamp(base_date, days_ago, 14, 20),
            "amount": 42000.00,
            "currency": "INR",
            "payee": "DLF Realty Leasing Corp",
            "merchant_category": "Real Estate / Rental",
            "channel": "BANK TRANSFER",
            "payee_added_date": (base_date - datetime.timedelta(days=200)).strftime("%Y-%m-%d"),
            "location": "Gurugram, IN",
            "device_id": "DEV-MACBOOK-C3",
            "balance_after_transaction": 450000.00,
            "description": "Scheduled Monthly Lease Disbursement"
        })
    for days_ago in range(60, 0, -2):
        payee = random.choice(KNOWN_NORMAL_PAYEES)
        tx_counter += 1
        amount = round(random.uniform(800, 3200), 2)
        c3_txns.append({
            "transaction_id": f"TX{tx_counter}",
            "customer_id": "CUST-AMBIG-001",
            "timestamp": generate_timestamp(base_date, days_ago, random.randint(10, 19), random.randint(0, 59)),
            "amount": amount,
            "currency": "INR",
            "payee": payee["name"],
            "merchant_category": payee["category"],
            "channel": payee["channel"],
            "payee_added_date": (base_date - datetime.timedelta(days=200)).strftime("%Y-%m-%d"),
            "location": "Gurugram, IN",
            "device_id": "DEV-MACBOOK-C3",
            "balance_after_transaction": 440000.00,
            "description": f"Retail expense {payee['name']}"
        })
    # Current large transaction: ₹45,000 to same DLF Realty
    c3_txns.append({
        "transaction_id": "TX1004",
        "customer_id": "CUST-AMBIG-001",
        "timestamp": "2026-03-14 11:30:00",
        "amount": 45000.00,
        "currency": "INR",
        "payee": "DLF Realty Leasing Corp",
        "merchant_category": "Real Estate / Rental",
        "channel": "BANK TRANSFER",
        "payee_added_date": (base_date - datetime.timedelta(days=200)).strftime("%Y-%m-%d"),
        "location": "Gurugram, IN",
        "device_id": "DEV-MACBOOK-C3",
        "balance_after_transaction": 395000.00,
        "description": "Scheduled Monthly Lease Disbursement"
    })
    c3_txns.sort(key=lambda x: x["timestamp"])
    customers_data["CUST-AMBIG-001"] = {
        "customer_id": "CUST-AMBIG-001",
        "customer_name": "Vikramaditya Singhania",
        "account_type": "Corporate HNI Account",
        "case_type": "AMBIGUOUS_NORMAL",
        "description": "High-value transfer that matches recurring lease/property payments in history.",
        "transactions": c3_txns
    }

    # -------------------------------------------------------------
    # 4. CUST-AMBIG-002: Nocturnal transactor (regular night-time worker)
    # -------------------------------------------------------------
    c4_txns = []
    for days_ago in range(60, 0, -1):
        if random.random() < 0.65:
            payee = random.choice(KNOWN_NORMAL_PAYEES)
            hour = random.choice([1, 2, 3, 22, 23]) # Habitually nocturnal
            tx_counter += 1
            amount = round(random.uniform(500, 2800), 2)
            c4_txns.append({
                "transaction_id": f"TX{tx_counter}",
                "customer_id": "CUST-AMBIG-002",
                "timestamp": generate_timestamp(base_date, days_ago, hour, random.randint(0, 59)),
                "amount": amount,
                "currency": "INR",
                "payee": payee["name"],
                "merchant_category": payee["category"],
                "channel": "UPI",
                "payee_added_date": (base_date - datetime.timedelta(days=150)).strftime("%Y-%m-%d"),
                "location": "Hyderabad, IN",
                "device_id": "DEV-ONEPLUS-C4",
                "balance_after_transaction": 82000.00,
                "description": f"Late night order {payee['name']}"
            })
    # Current transaction: ₹1,800 at 02:45 AM (normal for this user)
    c4_txns.append({
        "transaction_id": "TX1005",
        "customer_id": "CUST-AMBIG-002",
        "timestamp": "2026-03-14 02:45:00",
        "amount": 1800.00,
        "currency": "INR",
        "payee": "Zomato Food Delivery",
        "merchant_category": "Food & Dining",
        "channel": "UPI",
        "payee_added_date": (base_date - datetime.timedelta(days=150)).strftime("%Y-%m-%d"),
        "location": "Hyderabad, IN",
        "device_id": "DEV-ONEPLUS-C4",
        "balance_after_transaction": 80200.00,
        "description": "Late night meal delivery"
    })
    c4_txns.sort(key=lambda x: x["timestamp"])
    customers_data["CUST-AMBIG-002"] = {
        "customer_id": "CUST-AMBIG-002",
        "customer_name": "Sameer Kulkarni",
        "account_type": "Standard Savings",
        "case_type": "AMBIGUOUS_NORMAL",
        "description": "Software on-call engineer who routinely transacts in the early morning hours.",
        "transactions": c4_txns
    }

    # -------------------------------------------------------------
    # 5. CUST-AMBIG-003: Single small payment to new payee
    # -------------------------------------------------------------
    c5_txns = []
    for days_ago in range(45, 1, -1):
        if random.random() < 0.5:
            payee = random.choice(KNOWN_NORMAL_PAYEES)
            tx_counter += 1
            amount = round(random.uniform(400, 2200), 2)
            c5_txns.append({
                "transaction_id": f"TX{tx_counter}",
                "customer_id": "CUST-AMBIG-003",
                "timestamp": generate_timestamp(base_date, days_ago, random.randint(10, 18), random.randint(0, 59)),
                "amount": amount,
                "currency": "INR",
                "payee": payee["name"],
                "merchant_category": payee["category"],
                "channel": "UPI",
                "payee_added_date": (base_date - datetime.timedelta(days=90)).strftime("%Y-%m-%d"),
                "location": "Pune, IN",
                "device_id": "DEV-PIXEL-C5",
                "balance_after_transaction": 45000.00,
                "description": f"Daily expense {payee['name']}"
            })
    # Single small transfer to new payee (e.g. peer payment ₹450)
    c5_txns.append({
        "transaction_id": "TX1006",
        "customer_id": "CUST-AMBIG-003",
        "timestamp": "2026-03-14 15:20:00",
        "amount": 450.00,
        "currency": "INR",
        "payee": "Anand Verma (Personal Contact)",
        "merchant_category": "P2P Transfer",
        "channel": "UPI",
        "payee_added_date": "2026-03-14 15:10:00",
        "location": "Pune, IN",
        "device_id": "DEV-PIXEL-C5",
        "balance_after_transaction": 44550.00,
        "description": "Lunch split share"
    })
    c5_txns.sort(key=lambda x: x["timestamp"])
    customers_data["CUST-AMBIG-003"] = {
        "customer_id": "CUST-AMBIG-003",
        "customer_name": "Meera Nambiar",
        "account_type": "Student Youth Account",
        "case_type": "AMBIGUOUS_LOW_PRIORITY",
        "description": "Single minor peer transfer to a new beneficiary, no burst pattern.",
        "transactions": c5_txns
    }

    # -------------------------------------------------------------
    # 6. Additional diverse customer accounts (CUST-1024, CUST-2048, etc.)
    # -------------------------------------------------------------
    for cid, cname in [("CUST-1024", "Aditya Joshi"), ("CUST-2048", "Kavita Rao"), ("CUST-3090", "Deepak Nair")]:
        c_txns = []
        for days_ago in range(70, 0, -1):
            if random.random() < 0.6:
                payee = random.choice(KNOWN_NORMAL_PAYEES)
                tx_counter += 1
                amount = round(random.uniform(600, 5200), 2)
                c_txns.append({
                    "transaction_id": f"TX{tx_counter}",
                    "customer_id": cid,
                    "timestamp": generate_timestamp(base_date, days_ago, random.randint(9, 21), random.randint(0, 59)),
                    "amount": amount,
                    "currency": "INR",
                    "payee": payee["name"],
                    "merchant_category": payee["category"],
                    "channel": random.choice(["UPI", "UPI", "CARD"]),
                    "payee_added_date": (base_date - datetime.timedelta(days=120)).strftime("%Y-%m-%d"),
                    "location": "Chennai, IN",
                    "device_id": f"DEV-{cid}",
                    "balance_after_transaction": round(160000 - amount, 2),
                    "description": f"Payment to {payee['name']}"
                })
        c_txns.sort(key=lambda x: x["timestamp"])
        customers_data[cid] = {
            "customer_id": cid,
            "customer_name": cname,
            "account_type": "Regular Savings",
            "case_type": "NORMAL",
            "description": "Standard account holder with consistent retail transactions.",
            "transactions": c_txns
        }

    return customers_data

if __name__ == "__main__":
    data = generate_multi_month_history()
    print(f"Generated {len(data)} customer histories.")
    total_tx = sum(len(c['transactions']) for c in data.values())
    print(f"Total transactions across all multi-month profiles: {total_tx}")
