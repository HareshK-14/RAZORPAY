# TRACK_ID=PS06

# 🛡️ TransactionGuard AI
### Banking: Transaction Risk Investigation Assistant

> *"Find the pattern. Show the evidence. Keep the decision human."*

[![Competition Track](https://img.shields.io/badge/Competition_Track-NexusTiq24_PS06-blue.svg)](https://github.com/HareshK-14/RAZORPAY)
[![Execution Model](https://img.shields.io/badge/Run_Command-python_app.py-emerald.svg)](https://github.com/HareshK-14/RAZORPAY)
[![Port](https://img.shields.io/badge/Single_Port-8000-purple.svg)](http://localhost:8000)
[![Defense-Only AI](https://img.shields.io/badge/Safety-Defense--Only_AI-indigo.svg)](https://github.com/HareshK-14/RAZORPAY)
[![Gemini Grounding](https://img.shields.io/badge/Gemini-Zero_Hallucination_Fallback-amber.svg)](https://github.com/HareshK-14/RAZORPAY)

---

## 🏛️ Executive Summary & Primary Objective

**TransactionGuard AI** is a specialized banking transaction risk investigation assistant built for **NexusTiq24 Problem Statement PS06: Banking - Transaction Risk Investigation Assistant**.

In modern banking operations, fraud analysts and human reviewers are overwhelmed by millions of daily transactions. Opaque machine learning models output arbitrary risk numbers without evidence or justification, creating "alert fatigue" and legal liabilities.

TransactionGuard AI solves this by operating as a **court-defensible, human-in-the-loop investigation assistant**. It answers one primary question unequivocally:

> ### **"Does anything in this customer's transaction history need attention?"**
> - **`YES — INVESTIGATION RECOMMENDED`** (Surfaces exact pattern shifts, triggered rules, and court-admissible evidence chains)
> - **`NO SIGNIFICANT UNUSUAL ACTIVITY`** (Confirms customer activity conforms to historical 90-day baseline norms)

---

## ⚠️ Core Defensibility & Safety Mandate

> ### **NEVER ASSERT FRAUD**
> **"The system is designed exclusively for behavioral anomaly detection, risk assessment, explanation, and human-review assistance. It NEVER asserts that 'fraud has occurred' or that a customer is guilty. It surfaces mathematical departures, extracts evidence, cites deterministic banking rules, and reserves final judgment strictly for authorized human investigators."**

---

## 🚀 Quickstart for Evaluation Judges

The entire platform is self-contained. The evaluation judge runs **only two commands** in a single terminal. **No Node.js or second terminal is required by the judge**.

### 1. Installation
```bash
pip install -r requirements.txt
```

### 2. Execution
```bash
python app.py
```

Open your browser to:
```
http://localhost:8000
```

> **Single-Port Architecture**: Python FastAPI serves both the high-performance REST APIs (`/api/*`) and the compiled production frontend (`frontend/dist/index.html`) on `http://localhost:8000`.

### Optional Gemini Configuration
If you have a Google Gemini API Key:
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_api_key_here"

# Linux / macOS
export GEMINI_API_KEY="your_api_key_here"
```
> **Graceful Fallback**: If `GEMINI_API_KEY` is not provided or network access is restricted, the engine automatically switches to its **100% deterministic rule-grounded narrative engine** with zero degradation in analytical depth or uptime.

---

## 🧠 The 6 Deterministic PS06 Risk Rules

Every customer transaction is evaluated against 6 deterministic banking rules codified with mathematical thresholds in `data/investigation_rules.md`:

| Rule ID | Rule Name | Core Category | Deterministic Detection Threshold |
|---|---|---|---|
| **RULE_PS06_01** | **New Payee Velocity Spike** | Beneficiary Exposure | $\ge 2$ transfers to previously unseen payees within 24 hours OR $\ge 3	imes$ daily transaction burst to a new beneficiary. |
| **RULE_PS06_02** | **Sudden High-Value Deviation** | Amount Divergence | Transaction amount $> (	ext{Mean}_{90	ext{d}} + 3 	imes 	ext{StdDev}_{90	ext{d}})$ AND amount $> ₹50,000$. |
| **RULE_PS06_03** | **Atypical Nocturnal Activity** | Circadian Anomaly | Transaction executed between 23:00 and 06:00 for a customer whose baseline nocturnal activity is $< 5\%$. |
| **RULE_PS06_04** | **Rapid Channel Switching** | Payment Channel | Sudden departure into an unused channel (e.g. Wire Transfer/ATM) for an amount $> 2	imes$ historical average. |
| **RULE_PS06_05** | **Dormant Account Sudden Reactivation**| Account Velocity | Account inactive for $> 45$ days immediately executing high-velocity or high-value outbound transfers. |
| **RULE_PS06_06** | **Structuring / Smurfing Pattern** | AML Regulatory | $\ge 3$ consecutive transactions within 12 hours sized just below standard reporting thresholds ($₹45,000 - ₹49,999$). |

---

## 📊 Synthetic Benchmark Dataset & Case Breakdown

TransactionGuard AI includes a pre-seeded multi-month banking dataset (`backend/synthetic_data_ps06.py`) featuring 8 customer profiles and over 340 realistic transactions across 90-day baselines:

### 1. Standard Benchmark Cases
- **`CUST-NORMAL-001` (Normal Retail Customer)**
  - 45 daily retail transactions (UPI, grocery, utilities, standard hours).
  - **Verdict**: `NO SIGNIFICANT UNUSUAL ACTIVITY` (0 rules triggered).
- **`CUST-RISK-001` (High-Risk Difficult Case)**
  - Established salaried baseline followed by an overnight burst to 2 new beneficiaries (`Beneficiary_X_482`, `Mule_Acct_910`) totaling ₹2,85,000 via IMPS.
  - **Verdict**: `YES — INVESTIGATION RECOMMENDED` (5 rules triggered: RULE_PS06_01, 02, 03, 04, 06). Isolates transactions `TX1001`, `TX1002`, `TX1003`.

### 2. Difficult & Ambiguous Real-World Banking Scenarios
- **`CUST-AMBIG-001` (Case A: Large Monthly Commercial Lease)**
  - Legitimate recurring commercial lease payment occurring on the 1st of the month.
- **`CUST-AMBIG-002` (Case B: High-Frequency Metro Transit Micropayments)**
  - Rapid series of sub-₹100 transit NFC taps during peak commuting hours.
- **`CUST-AMBIG-003` (Case C: International SaaS Cloud Subscription)**
  - USD denominated corporate cloud hosting charge billed periodically.
- **`CUST-AMBIG-004` (Case D: Overnight Emergency Pharmacy POS)**
  - Atypical 02:30 AM transaction at a registered hospital/pharmacy POS terminal during a medical emergency.

---

## 🧩 Comprehensive Feature Matrix (12 Investigation Views)

The **Customer Investigation** module (`/customer-investigation`) equips human reviewers with 12 interconnected analytical panels:

1. **Investigation Summary & Posture**: Instant determination of whether customer history requires attention.
2. **Isolated Flagged Transactions**: Exact identification of anomalous transactions with amount divergence ratios.
3. **Customer Behavioral DNA**: Side-by-side comparison of 90-day baseline vs. recent window (amount mean/std, daily velocity, nocturnal ratio, channel distribution).
4. **Pattern Shift Timeline**: Chronological event mapping marking the precise moment customer behavior diverged.
5. **Deterministic Rules Evaluation**: Full breakdown of all 6 PS06 rules with thresholds and pass/fail states.
6. **Court-Admissible Evidence Chain**: Step-by-step audit trail linking historical baseline norms to anomalous deltas.
7. **Grounded Gemini AI Briefing**: Zero-hallucination natural language executive summary citing verified transaction IDs and amounts.
8. **Investigator Inquiry Protocol**: Pre-formulated targeted interview questions for customer phone verification.
9. **Activity Relationship Map**: Visual graph of funds flow across counterparties, payees, and channels.
10. **Counterfactual Analysis**: Mathematically articulates what parameter adjustments would have kept the activity within baseline.
11. **Searchable Transaction Ledger**: Full table of all historical and recent customer transactions with export capabilities.
12. **Reviewer Case Disposition Form**: Official human investigator sign-off with audit logging and action recording.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLite3, Google GenAI SDK (`google-genai`), NumPy, Pydantic.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios.
- **Data Persistence**: SQLite (`database/transactionguard.db`) with dynamic schema migration and cryptographically sealed audit logging (`sha256`).
- **Explainability**: Deterministic rules engine + Gemini 1.5 Flash grounded prompt synthesis.

---

## 📋 Repository Structure

```
TransactionGuard/
├── app.py                         # Root FastAPI entrypoint (serves API & frontend/dist/)
├── requirements.txt               # Root Python dependencies
├── README.md                      # PS06 documentation & evaluation guide
├── data/
│   └── investigation_rules.md     # Mathematical specifications for 6 PS06 Risk Rules
├── backend/
│   ├── engine_ps06.py             # Deterministic PS06 behavioral & rules engine
│   ├── gemini_grounding.py        # Grounded Gemini GenAI integration & fallback
│   ├── synthetic_data_ps06.py     # 8 multi-month customer profiles generator
│   └── database_ps06.py           # SQLite persistence layer & dynamic schema migrations
├── database/
│   └── transactionguard.db        # Pre-seeded SQLite database
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── dist/                      # Pre-compiled production frontend bundle
    └── src/
        ├── App.jsx                # Router & role authentication shell
        ├── api/api.js             # Universal API client
        ├── components/
        │   ├── Navbar.jsx         # Navigation bar with Customer Investigation
        │   └── Header.jsx         # Live telemetry header
        └── pages/
            ├── CustomerInvestigation.jsx  # Flagship PS06 Investigation Assistant
            ├── Dashboard.jsx              # Executive governance command center
            ├── Review.jsx                 # Human case review queue
            ├── Analytics.jsx              # Risk distribution & metrics
            ├── Transactions.jsx           # Universal transactions table
            └── AuditPage.jsx              # Cryptographic audit ledger
```

---

## ⚖️ License & Ethical AI Disclosure

Built for **NexusTiq24 — Track PS06 (Banking: Transaction Risk Investigation Assistant)**.
All customer identities and financial transactions within the synthetic dataset are entirely fictitious and engineered for algorithmic benchmark evaluation.
