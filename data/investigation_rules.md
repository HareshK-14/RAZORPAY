# Banking Transaction Risk Investigation Rules
**Track ID: PS06 — Banking: Transaction Risk Investigation Assistant**
*Deterministic Evaluation & Grounded Evidence Reference*

---

## RULE 1: Unusually Large Transfer
- **Rule ID**: `RULE-LARGE-TRANSFER`
- **Definition**: Identifies payment transfers where the transaction amount significantly exceeds the customer's established historical baseline.
- **Threshold**: 
  - Moderate Attention: Amount > 3.0× customer's historical average.
  - High Attention: Amount > 5.0× customer's historical average.
- **Interpretation**: Rapid asset depletion or unauthorized account access often begins with attempts to move large sums exceeding customary spending patterns.
- **Traceable Evidence**: Current transaction amount vs. customer's 30-day/90-day mean transaction size.
- **Example**: Normal average ₹3,500 vs. current transfer ₹25,000 (7.14× deviation).
- **System Finding**: *"Amount is 7.1× above this customer's normal transaction size."*

---

## RULE 2: Burst of Payments to a New Payee
- **Rule ID**: `RULE-NEW-PAYEE-BURST`
- **Definition**: Identifies a cluster of rapid successive transactions to a beneficiary added recently or within the preceding 48 hours.
- **Threshold**: 
  - Payee added ≤ 48 hours ago AND ≥ 2 transactions within a 60-minute rolling window.
- **Interpretation**: A newly enrolled payee subjected to rapid multiple transfers indicates possible social engineering, credential compromise, or hasty account draining.
- **Traceable Evidence**: Payee registration timestamp, inter-transaction timestamps, and aggregate burst sum.
- **Example**: Payee `PAYEE-884` added at 02:30 AM, followed by 3 payments totaling ₹65,000 within 25 minutes.
- **System Finding**: *"Burst of payments to a recently added payee."*

---

## RULE 3: Odd-Hours Activity
- **Rule ID**: `RULE-ODD-HOURS`
- **Definition**: Identifies transactions occurring outside the customer's normal historical activity window.
- **Threshold**: 
  - Transaction timestamp between 00:00 and 05:30 local time, when customer's historical active window is strictly daytime/evening (e.g. 08:00–21:00).
  - *Exception*: Not triggered if customer's historical pattern demonstrates regular nocturnal transactions.
- **Interpretation**: Fraudulent transfers and unauthorized access attempts disproportionately occur during early morning hours when cardholders/account owners are asleep and unlikely to notice immediate notification alerts.
- **Traceable Evidence**: Transaction timestamp vs. customer's empirical circadian distribution.
- **Example**: Normal window 09:00–21:00 vs. current transaction at 02:41 AM.
- **System Finding**: *"Transaction occurred outside the customer's established activity window."*

---

## RULE 4: Break from Customer's Normal Pattern
- **Rule ID**: `RULE-PATTERN-BREAK`
- **Definition**: Detects multi-factor composite divergence across three or more behavioural vectors simultaneously (amount, channel, timing, beneficiary novelty).
- **Threshold**: 
  - Combined deviation score where at least two minor anomalies coincide with a major anomaly.
- **Interpretation**: While a single deviation may be legitimate benign variation, a concurrent collapse of customary habits points to an anomalous operational state requiring human review.
- **Traceable Evidence**: Cross-vector deviation comparison against customer behavioral DNA.
- **System Finding**: *"This activity differs materially from the customer's established behaviour."*

---

## RULE 5: Velocity / Burst Pattern
- **Rule ID**: `RULE-VELOCITY-BURST`
- **Definition**: Identifies an abrupt spike in transaction execution frequency compared to the customer's recent baseline.
- **Threshold**: 
  - Transaction count within 1 hour > 4× customer's historical hourly peak (or > 5 transactions/hour for low-velocity profiles).
- **Interpretation**: Automated scripted attacks or frantic illicit fund transfers exhibit velocity profiles orders of magnitude higher than customary consumer actions.
- **Traceable Evidence**: Rolling 1-hour transaction volume vs. customer daily average velocity.
- **Example**: Customer normal 1–2 transactions/day vs. 9 transactions within 1 hour.
- **System Finding**: *"Transaction frequency is significantly above the customer's recent baseline."*

---

## RULE 6: Channel Anomaly
- **Rule ID**: `RULE-CHANNEL-ANOMALY`
- **Definition**: Identifies unexpected high-value transactions conducted over a channel rarely or never utilized by the customer.
- **Threshold**: 
  - Transaction executed via channel representing < 5% of customer's historical transaction count AND amount > 2× baseline average.
  - *Condition*: Only evaluated when comprehensive channel history is available.
- **Interpretation**: Sudden shifts from familiar mobile UPI interfaces to large external Bank Transfers/RTGS can indicate takeover or coercion.
- **Traceable Evidence**: Chosen channel vs. customer's historical channel usage breakdown.
- **Example**: 98% UPI usage historically vs. sudden ₹75,000 Wire/Bank Transfer.
- **System Finding**: *"Transaction channel differs from established customer behaviour."*
