TRACK_ID=PS6

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

**TransactionGuard AI** is an explainable AI transaction risk investigation platform built for **NexusTiq24 Problem Statement PS06: Banking - Transaction Risk Investigation Assistant** and designed for modern banking/payment risk operations.

In high-volume banking operations, fraud analysts and human reviewers are overwhelmed by millions of daily transactions. Opaque machine learning models output arbitrary risk numbers without evidence or justification, creating severe alert fatigue and legal liabilities.

TransactionGuard AI solves this by operating as a **court-defensible, human-in-the-loop investigation workspace**. It answers one primary question unequivocally:

> ### **"Does anything in this customer's transaction history need attention?"**
> - **`YES — INVESTIGATION RECOMMENDED`** (Surfaces exact pattern shifts, triggered rules, and court-admissible evidence chains)
> - **`NO SIGNIFICANT UNUSUAL ACTIVITY`** (Confirms customer activity conforms to historical 90-day baseline norms)

---

## ⚠️ Core Defensibility & Safety Mandate

> ### **NEVER ASSERT FRAUD**
> **"The system is designed exclusively for behavioral anomaly detection, risk explanation, connected activity clustering, and human-review assistance. It NEVER asserts that 'fraud has occurred' or that a customer is guilty. It surfaces mathematical departures, extracts evidence, cites deterministic banking rules, and reserves final judgment strictly for authorized human investigators."**

Approved non-accusatory terminology:
- `Investigation Recommended`
- `Elevated Risk Activity`
- `Unusual Pattern Detected`
- `Needs Attention`
- `Human Review Recommended`

---

## 🚀 Quickstart for Evaluation Judges

The entire platform is self-contained. The evaluation judge runs **only two commands** in a single terminal:

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

### Local Development Mode
For local development with live reload:
```bash
npm run dev
```
Starts both the Python backend on `http://localhost:8000` and Vite dev server on `http://localhost:5173` via a single command.

---

## 🧠 Key Features & Architectural Innovations

### 1. Smart Case Summary Card
Every customer case features a single executive card displaying:
- **Case Status**: `YES — INVESTIGATION RECOMMENDED` or `NO SIGNIFICANT UNUSUAL ACTIVITY`
- **Attention Score**: Deterministic composite score (0–100)
- **Evidence Confidence**: Verification confidence (e.g. 94%)
- **Triggered Rules**: Number of triggered deterministic rules
- **Connected Transactions**: Relevant transactions isolated
- **Behaviour Shift**: Temporal deviation flag
- **Human Review**: Mandatory investigator requirement

### 2. Customer Risk Profile
Persistent customer investigation profile summarizing:
- Account age, typical transaction amount, typical daily frequency, habitual active hours, known payees count, common channels, open cases, and previous reviews.

### 3. Adaptive Baseline Calculation
Evaluates customer spending across multiple temporal horizons:
- Long-term 90-day baseline vs. Recent 7-day baseline vs. Current batch.
- Flags `BASELINE CHANGE DETECTED` (e.g. 4.46x upward shift) without prematurely declaring fraud, letting deterministic rules evaluate if investigation is required.

### 4. "Why This Needs Attention" — Risk Explainability Stack
Dedicated 6-step transparent panel:
1. **What changed?** (Velocity spike, off-hour beneficiary addition)
2. **Which rule triggered?** (Exact PS06 rule citations)
3. **Which transactions are involved?** (Specific transaction IDs and amounts)
4. **How different from normal?** (Comparative deviation multiples)
5. **How strong is the evidence?** (Data completeness and citation strength)
6. **What remains unknown?** (Customer intent, external contract existence)

### 5. Investigation Copilot (Analyst AI Assistant)
Interactive Copilot allowing analysts to ask natural-language questions:
- *"What changed recently?"*
- *"Why is this customer being investigated?"*
- *"Show the transactions responsible."*
- *"Compare current behaviour with previous month."*
- *"What should I check first?"*
- Answers strictly from local transaction data and rules with structured output:
  $$\text{Question} \rightarrow \text{Interpretation} \rightarrow \text{Data Used} \rightarrow \text{Findings} \rightarrow \text{Evidence}$$
- Guaranteed **zero hallucination** and automatic deterministic fallback.

### 6. Investigation Graph & Pattern Clustering
- **Investigation Graph**: Maps funds flow across Customer $\rightarrow$ Transactions $\rightarrow$ Payees, Channels, and Devices with highlighted *connected activity clusters*.
- **Pattern Clustering**: Groups transactions into discrete behavioral patterns (e.g. Pattern 01: nocturnal rapid burst; Pattern 02: routine daytime groceries).

### 7. Temporal Change Detection (Customer Behaviour Evolution)
Three-phase timeline reconstruction:
- **Phase 1: Before** (Stable established spending envelope)
- **Phase 2: Change Event** (New beneficiary addition timestamp)
- **Phase 3: After** (High-value rapid outflow transfers)

### 8. Investigation Priority Engine
Deterministic calculation of priority (`URGENT`, `HIGH`, `MEDIUM`, `LOW`):
$$\text{Priority} = f(\text{deviation\_magnitude}, \text{rules\_count}, \text{connected\_txns}, \text{confidence}, \text{recency})$$

### 9. Case Similarity Engine
Matches current customer patterns against historical synthetic cases:
- `CASE-102` (88% match: nocturnal rapid IMPS drain)
- `CASE-214` (76% match: rapid account drain)
- Surfacing historical dispositions and investigator takeaways.

### 10. Uncertainty Center & Responsible AI
Explicitly surfaces where evidence is incomplete or ambiguous, data completeness %, baseline strength, and material unknown factors.

### 11. Smart Evidence Pack & Export
Generates downloadable, court-defensible investigation packages in:
- **JSON**: Machine-readable full investigation payload.
- **HTML**: Standalone printable executive dossier.
- **CSV**: Filtered ledger of connected transactions.

### 12. Investigator Feedback Loop
Human reviewer dispositions recorded in tamper-evident SQLite audit logs:
- `Confirmed Explained Activity`
- `Needs Further Review`
- `No Material Concern`
- `Escalated`

---

## ⚖️ The 6 Deterministic PS06 Risk Rules

| Rule ID | Rule Name | Core Category | Deterministic Detection Threshold |
|---|---|---|---|
| **RULE-NEW-PAYEE-BURST** | **Rapid Outflow After Payee Addition** | Beneficiary Exposure | Transfer initiated within 2 hours of beneficiary registration. |
| **RULE-LARGE-TRANSFER** | **High-Value Transfer Deviation** | Amount Divergence | Amount $> 3.5\times$ customer mean AND $> \text{mean} + 2.5 \text{ StdDev}$. |
| **RULE-RAPID-VELOCITY** | **Unusual Transaction Frequency Burst** | Frequency Spike | $\ge 3$ transactions within a 60-minute sliding window. |
| **RULE-ODD-HOURS** | **Circadian Rhythm Deviation** | Circadian Anomaly | Outbound transfer between 23:00 and 05:00 for daytime transactors. |
| **RULE-CHANNEL-ANOMALY** | **Atypical Payment Channel Switching** | Channel Anomaly | Channel rarely used ($<10\%$ in history) combined with elevated amount. |
| **RULE-ROUND-AMOUNT** | **Structured Round Amount Pattern** | Structuring Pattern | Exact multiple of ₹5,000 and $> ₹10,000$. |

---

## 🔮 Future Innovation Roadmap

| Phase | Horizon | Focus Area | Status | Key Deliverables |
|---|---|---|---|---|
| **Phase 1** | Immediate | **Enhanced Behavioural Baselines** | **IMPLEMENTED** | Adaptive baselines (90d vs 7d), Customer Risk Profile, Circadian active windows, Normal Case Guarantee. |
| **Phase 2** | Immediate | **Investigation Graph & Clustering** | **IMPLEMENTED** | Entity graph mapping, Pattern clustering, Temporal evolution (Before/Change/After), Priority engine. |
| **Phase 3** | Immediate | **Investigator Copilot & Explainability** | **IMPLEMENTED** | Grounded Copilot assistant, 6-step Explainability Stack, Explainable query mode, Rule library modal. |
| **Phase 4** | Immediate | **Case Similarity & Human Feedback** | **IMPLEMENTED** | Pattern similarity matching, Non-accusatory reviewer dispositions, Smart Evidence Pack export (HTML/JSON/CSV). |
| **Phase 5** | Future Vision | **Enterprise Risk Operations Integration** | *Planned Concept* | Multi-tenant core banking webhooks, Kafka streaming event-sinks, federated learning on anonymized baseline shifts, and cross-institution beneficiary reputation networks. |

---

## 🛠️ Technology Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLite3, Google GenAI SDK (`google-genai`), NumPy, Pydantic.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios.
- **Data Persistence**: SQLite (`database/transactionguard.db`) with dynamic schema migration and cryptographically sealed audit logging (`sha256`).
- **Explainability**: Deterministic rules engine + Gemini 1.5 Flash grounded prompt synthesis + Local Copilot.

---

## ⚖️ License & Ethical AI Disclosure

Built for **NexusTiq24 — Track PS06 (Banking: Transaction Risk Investigation Assistant)**.
All customer identities and financial transactions within the synthetic dataset are entirely fictitious and engineered for algorithmic benchmark evaluation.
