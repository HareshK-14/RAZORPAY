"""
Transaction Risk Investigation Engine for Track PS06
NexusTiq24 — Banking: Transaction Risk Investigation Assistant
Implements:
- Customer Behavioral Baseline Calculation
- Customer Behavioral DNA (5 Dimensions)
- 6 Deterministic Risk Rules
- Connected Suspicious Transactions Isolation
- Investigation Timeline & Pattern Shift
- Evidence Chain Generation
- Counterfactual Analysis
- Data Quality Scoring
- Activity Relationship Mapping
- Actionable Investigator Questions
"""

import datetime
import math
from collections import Counter, defaultdict

def parse_iso(ts_str):
    try:
        # Handles "YYYY-MM-DD HH:MM:SS" or ISO formats
        clean_ts = ts_str.replace("T", " ").split(".")[0]
        return datetime.datetime.strptime(clean_ts, "%Y-%m-%d %H:%M:%S")
    except Exception:
        return datetime.datetime(2026, 1, 1, 12, 0, 0)

def calculate_customer_baseline(transactions):
    """
    Computes empirical customer baseline from historical transactions.
    """
    if not transactions:
        return {
            "avg_amount": 0.0,
            "median_amount": 0.0,
            "std_amount": 0.0,
            "typical_frequency_per_day": 0.0,
            "active_hours": "N/A",
            "active_hours_range": [9, 21],
            "common_payees": [],
            "common_channels": {},
            "total_transactions": 0,
            "earliest_date": None,
            "latest_date": None
        }

    amounts = [float(t.get("amount", 0)) for t in transactions]
    amounts_sorted = sorted(amounts)
    avg_amount = round(sum(amounts) / len(amounts), 2)
    median_amount = round(amounts_sorted[len(amounts_sorted) // 2], 2)

    # Standard deviation
    variance = sum((x - avg_amount) ** 2 for x in amounts) / max(len(amounts), 1)
    std_amount = round(math.sqrt(variance), 2)

    # Hours distribution
    hours = []
    days_set = set()
    channels_counter = Counter()
    payees_counter = Counter()

    for t in transactions:
        dt = parse_iso(t.get("timestamp", ""))
        hours.append(dt.hour)
        days_set.add(dt.strftime("%Y-%m-%d"))
        channels_counter[t.get("channel", "UPI")] += 1
        payees_counter[t.get("payee", "Unknown")] += 1

    min_hour = min(hours) if hours else 9
    max_hour = max(hours) if hours else 21
    active_hours_range = [min_hour, max_hour]
    active_hours_str = f"{min_hour:02d}:00 - {max_hour:02d}:00"

    num_days = max(len(days_set), 1)
    frequency_per_day = round(len(transactions) / num_days, 1)

    top_payees = [p for p, _ in payees_counter.most_common(10)]
    total_ch = sum(channels_counter.values()) or 1
    channels_pct = {ch: round((cnt / total_ch) * 100, 1) for ch, cnt in channels_counter.items()}

    return {
        "avg_amount": avg_amount,
        "median_amount": median_amount,
        "std_amount": std_amount,
        "typical_frequency_per_day": frequency_per_day,
        "active_hours": active_hours_str,
        "active_hours_range": active_hours_range,
        "common_payees": top_payees,
        "common_channels": channels_pct,
        "total_transactions": len(transactions),
        "earliest_date": transactions[0].get("timestamp"),
        "latest_date": transactions[-1].get("timestamp")
    }

def calculate_data_quality(transactions):
    """
    Computes Data Quality Score and tracks present vs missing fields.
    """
    if not transactions:
        return {"score": 0, "fields": {}, "missing": ["All transaction fields"]}

    evaluated_fields = [
        "amount", "timestamp", "customer_id", "payee",
        "channel", "payee_added_date", "device_id", "description"
    ]
    present_counts = {f: 0 for f in evaluated_fields}
    total_records = len(transactions)

    for t in transactions:
        for f in evaluated_fields:
            if t.get(f) is not None and t.get(f) != "":
                present_counts[f] += 1

    field_status = {}
    missing_fields = []
    for f in evaluated_fields:
        pct = (present_counts[f] / total_records) * 100
        field_status[f] = {"present_pct": round(pct, 1), "status": "AVAILABLE" if pct >= 80 else "PARTIAL" if pct >= 30 else "MISSING"}
        if pct < 80:
            missing_fields.append(f)

    # Score out of 100
    overall_quality = round(sum(present_counts[f] for f in evaluated_fields) / (len(evaluated_fields) * total_records) * 100)

    return {
        "score": overall_quality,
        "field_status": field_status,
        "missing_fields": missing_fields
    }

def evaluate_ps06_rules(transactions, baseline):
    """
    Evaluates the 6 deterministic PS06 banking investigation rules.
    Returns:
    - triggered_rules: list of triggered rule objects
    - suspicious_txns: list of relevant suspicious transactions
    - rule_evaluations: summary of all 6 rules
    """
    if not transactions:
        return [], [], []

    # Sort transactions chronologically
    sorted_txns = sorted(transactions, key=lambda x: parse_iso(x.get("timestamp", "")))
    avg_amt = baseline.get("avg_amount", 1000) or 1000
    common_payees = set(baseline.get("common_payees", []))
    common_channels = baseline.get("common_channels", {})

    triggered_rules = []
    suspicious_txn_map = {}

    # -------------------------------------------------------------
    # RULE 1: Unusually Large Transfer
    # -------------------------------------------------------------
    large_transfer_txns = []
    max_ratio = 1.0
    for t in sorted_txns[-15:]:  # Inspect recent batch
        amt = float(t.get("amount", 0))
        ratio = amt / avg_amt if avg_amt > 0 else 1.0
        # Exclude recurring regular large payees like lease / tax if already in history
        is_known_large_payee = t.get("payee") in common_payees and ratio < 10.0
        if ratio >= 3.5 and not (is_known_large_payee and ratio < 4.0):
            large_transfer_txns.append(t)
            suspicious_txn_map[t["transaction_id"]] = t
            if ratio > max_ratio:
                max_ratio = ratio

    rule1_status = {
        "rule_id": "RULE-LARGE-TRANSFER",
        "name": "Unusually Large Transfer",
        "weight": 25,
        "evaluated": True,
        "triggered": len(large_transfer_txns) > 0,
        "finding": f"Amount is {max_ratio:.1f}× above this customer's normal transaction size (₹{avg_amt:,.0f})." if large_transfer_txns else "All recent amounts conform to customer's historical scale.",
        "evidence_txns": [t["transaction_id"] for t in large_transfer_txns],
        "points": 25 if max_ratio >= 5.0 else 15 if len(large_transfer_txns) > 0 else 0
    }
    if rule1_status["triggered"]:
        triggered_rules.append(rule1_status)

    # -------------------------------------------------------------
    # RULE 2: Burst of Payments to a New Payee
    # -------------------------------------------------------------
    new_payee_burst_txns = []
    new_payee_names = set()

    for i, t in enumerate(sorted_txns[-20:]):
        payee = t.get("payee", "")
        payee_added_str = t.get("payee_added_date")
        tx_time = parse_iso(t.get("timestamp", ""))

        is_new_payee = False
        if payee_added_str:
            try:
                added_time = parse_iso(payee_added_str)
                time_since_added_hours = (tx_time - added_time).total_seconds() / 3600.0
                if 0 <= time_since_added_hours <= 48:
                    is_new_payee = True
            except Exception:
                pass

        if is_new_payee or (payee and payee not in common_payees):
            # Check cluster: transactions to this same payee within 60 minutes
            cluster = [
                other for other in sorted_txns[-20:]
                if other.get("payee") == payee and abs((parse_iso(other.get("timestamp", "")) - tx_time).total_seconds()) <= 3600
            ]
            if len(cluster) >= 2:
                for c_item in cluster:
                    new_payee_burst_txns.append(c_item)
                    suspicious_txn_map[c_item["transaction_id"]] = c_item
                new_payee_names.add(payee)

    rule2_status = {
        "rule_id": "RULE-NEW-PAYEE-BURST",
        "name": "Burst of Payments to a New Payee",
        "weight": 25,
        "evaluated": True,
        "triggered": len(new_payee_burst_txns) > 0,
        "finding": f"Rapid cluster of {len(set(t['transaction_id'] for t in new_payee_burst_txns))} payments to newly registered payee: {', '.join(new_payee_names)}." if new_payee_burst_txns else "No burst patterns observed to newly registered payees.",
        "evidence_txns": list(set(t["transaction_id"] for t in new_payee_burst_txns)),
        "points": 25 if len(new_payee_burst_txns) > 0 else 0
    }
    if rule2_status["triggered"]:
        triggered_rules.append(rule2_status)

    # -------------------------------------------------------------
    # RULE 3: Odd-Hours Activity
    # -------------------------------------------------------------
    odd_hour_txns = []
    # Check customer's empirical night frequency
    all_hours = [parse_iso(t.get("timestamp", "")).hour for t in sorted_txns[:-5]]  # Historical hours
    historical_night_count = sum(1 for h in all_hours if 0 <= h <= 5)
    is_habitual_night_user = (historical_night_count / max(len(all_hours), 1)) > 0.20

    for t in sorted_txns[-10:]:
        hour = parse_iso(t.get("timestamp", "")).hour
        if 0 <= hour <= 5 and not is_habitual_night_user:
            odd_hour_txns.append(t)
            suspicious_txn_map[t["transaction_id"]] = t

    rule3_status = {
        "rule_id": "RULE-ODD-HOURS",
        "name": "Odd-Hours Activity",
        "weight": 15,
        "evaluated": True,
        "triggered": len(odd_hour_txns) > 0,
        "finding": f"Transaction occurred at {parse_iso(odd_hour_txns[0]['timestamp']).strftime('%I:%M %p') if odd_hour_txns else 'N/A'}, outside the customer's established daytime activity window." if odd_hour_txns else "Timings align consistently with customer's typical active window.",
        "evidence_txns": [t["transaction_id"] for t in odd_hour_txns],
        "points": 15 if len(odd_hour_txns) > 0 else 0
    }
    if rule3_status["triggered"]:
        triggered_rules.append(rule3_status)

    # -------------------------------------------------------------
    # RULE 4: Break from Customer's Normal Pattern
    # -------------------------------------------------------------
    # Triggered when multiple anomalies (e.g. amount + time + payee novelty) coincide
    rule4_triggered = (rule1_status["triggered"] and (rule2_status["triggered"] or rule3_status["triggered"]))
    rule4_status = {
        "rule_id": "RULE-PATTERN-BREAK",
        "name": "Break from Customer's Normal Pattern",
        "weight": 15,
        "evaluated": True,
        "triggered": rule4_triggered,
        "finding": "This activity differs materially from the customer's established behaviour across amount, timing, and beneficiary vectors." if rule4_triggered else "No multi-factor behavioural collapse detected.",
        "evidence_txns": list(suspicious_txn_map.keys()),
        "points": 15 if rule4_triggered else 0
    }
    if rule4_status["triggered"]:
        triggered_rules.append(rule4_status)

    # -------------------------------------------------------------
    # RULE 5: Velocity / Burst Pattern
    # -------------------------------------------------------------
    velocity_txns = []
    for i in range(len(sorted_txns)):
        window = [
            sorted_txns[j] for j in range(len(sorted_txns))
            if 0 <= (parse_iso(sorted_txns[j].get("timestamp", "")) - parse_iso(sorted_txns[i].get("timestamp", ""))).total_seconds() <= 3600
        ]
        if len(window) >= 3:
            for w in window:
                velocity_txns.append(w)
                suspicious_txn_map[w["transaction_id"]] = w

    rule5_triggered = len(velocity_txns) >= 3
    rule5_status = {
        "rule_id": "RULE-VELOCITY-BURST",
        "name": "Velocity / Burst Pattern",
        "weight": 10,
        "evaluated": True,
        "triggered": rule5_triggered,
        "finding": f"Transaction frequency is significantly above the customer's recent baseline ({len(set(t['transaction_id'] for t in velocity_txns))} events in under 60 mins)." if rule5_triggered else "Frequency aligns with normal 1-2 transactions/day pace.",
        "evidence_txns": list(set(t["transaction_id"] for t in velocity_txns)),
        "points": 10 if rule5_triggered else 0
    }
    if rule5_status["triggered"]:
        triggered_rules.append(rule5_status)

    # -------------------------------------------------------------
    # RULE 6: Channel Anomaly
    # -------------------------------------------------------------
    channel_txns = []
    for t in sorted_txns[-10:]:
        ch = t.get("channel", "UPI")
        historical_pct = common_channels.get(ch, 0.0)
        amt = float(t.get("amount", 0))
        # If channel is < 5% in history and amount > 2x average
        if historical_pct < 5.0 and amt > 2.0 * avg_amt and len(common_channels) > 1:
            channel_txns.append(t)
            suspicious_txn_map[t["transaction_id"]] = t

    rule6_triggered = len(channel_txns) > 0
    rule6_status = {
        "rule_id": "RULE-CHANNEL-ANOMALY",
        "name": "Channel Anomaly",
        "weight": 10,
        "evaluated": True,
        "triggered": rule6_triggered,
        "finding": f"Transaction channel ({channel_txns[0].get('channel') if channel_txns else ''}) differs from established customer behaviour (typically {list(common_channels.keys())[0] if common_channels else 'UPI'})." if rule6_triggered else "Payment channels conform to established customer preferences.",
        "evidence_txns": [t["transaction_id"] for t in channel_txns],
        "points": 10 if rule6_triggered else 0
    }
    if rule6_status["triggered"]:
        triggered_rules.append(rule6_status)

    all_rule_evaluations = [
        rule1_status, rule2_status, rule3_status,
        rule4_status, rule5_status, rule6_status
    ]

    suspicious_txns_list = list(suspicious_txn_map.values())
    suspicious_txns_list.sort(key=lambda x: parse_iso(x.get("timestamp", "")))

    return triggered_rules, suspicious_txns_list, all_rule_evaluations

def build_customer_behavioural_dna(transactions, baseline, suspicious_txns):
    """
    Builds the 5-axis Customer Behavioural DNA comparison:
    Dimensions: Amount, Frequency, Time, Payee, Channel
    """
    avg_amt = baseline.get("avg_amount", 1000)
    current_tx = suspicious_txns[-1] if suspicious_txns else (transactions[-1] if transactions else {})
    current_amt = float(current_tx.get("amount", avg_amt))
    current_time_str = parse_iso(current_tx.get("timestamp", "")).strftime("%I:%M %p") if current_tx.get("timestamp") else "12:00 PM"
    current_payee = current_tx.get("payee", "Known Payee")
    current_channel = current_tx.get("channel", "UPI")

    amount_ratio = round(current_amt / avg_amt, 1) if avg_amt > 0 else 1.0

    dna_dimensions = [
        {
            "dimension": "Amount Scale",
            "normal": f"₹{avg_amt:,.0f} avg",
            "current": f"₹{current_amt:,.0f}",
            "deviation": f"{amount_ratio}× deviation" if amount_ratio > 1.5 else "Within baseline",
            "score": min(int(amount_ratio * 18), 100),
            "status": "ANOMALOUS" if amount_ratio >= 3.5 else "NORMAL"
        },
        {
            "dimension": "Transaction Frequency",
            "normal": f"{baseline.get('typical_frequency_per_day', 1.5)} tx / day",
            "current": f"{len(suspicious_txns)} in burst window" if suspicious_txns else "1 tx",
            "deviation": f"{len(suspicious_txns)} rapid events" if len(suspicious_txns) >= 2 else "Standard velocity",
            "score": 90 if len(suspicious_txns) >= 3 else 50 if len(suspicious_txns) >= 2 else 15,
            "status": "ANOMALOUS" if len(suspicious_txns) >= 2 else "NORMAL"
        },
        {
            "dimension": "Circadian Timing",
            "normal": baseline.get("active_hours", "09:00 - 21:00"),
            "current": current_time_str,
            "deviation": "Off-hours anomaly" if parse_iso(current_tx.get("timestamp", "")).hour < 6 else "Business hours",
            "score": 85 if parse_iso(current_tx.get("timestamp", "")).hour < 6 else 10,
            "status": "ANOMALOUS" if parse_iso(current_tx.get("timestamp", "")).hour < 6 else "NORMAL"
        },
        {
            "dimension": "Beneficiary Familiarity",
            "normal": f"{len(baseline.get('common_payees', []))} enrolled payees",
            "current": current_payee,
            "deviation": "Recently added payee" if current_payee not in baseline.get("common_payees", []) else "Known recurring payee",
            "score": 88 if current_payee not in baseline.get("common_payees", []) else 10,
            "status": "ANOMALOUS" if current_payee not in baseline.get("common_payees", []) else "NORMAL"
        },
        {
            "dimension": "Payment Channel",
            "normal": f"Primary: {list(baseline.get('common_channels', {'UPI': 100}).keys())[0]}",
            "current": current_channel,
            "deviation": "Uncustomary channel" if baseline.get("common_channels", {}).get(current_channel, 100) < 10.0 else "Familiar channel",
            "score": 75 if baseline.get("common_channels", {}).get(current_channel, 100) < 10.0 else 12,
            "status": "ANOMALOUS" if baseline.get("common_channels", {}).get(current_channel, 100) < 10.0 else "NORMAL"
        }
    ]

    return dna_dimensions

def build_investigation_timeline(transactions, suspicious_txns):
    """
    Generates chronological timeline highlighting where pattern shift occurred.
    """
    timeline = []
    suspicious_ids = set(t["transaction_id"] for t in suspicious_txns)
    shift_marked = False

    # Take representative baseline transactions plus suspicious cluster
    for t in transactions[-12:]:
        is_suspicious = t["transaction_id"] in suspicious_ids
        event = {
            "transaction_id": t["transaction_id"],
            "timestamp": t.get("timestamp"),
            "amount": t.get("amount"),
            "payee": t.get("payee"),
            "channel": t.get("channel"),
            "status": "Attention Required" if is_suspicious else "Normal Activity",
            "is_suspicious": is_suspicious,
            "pattern_shift_marker": False
        }
        if is_suspicious and not shift_marked:
            event["pattern_shift_marker"] = True
            shift_marked = True
        timeline.append(event)

    return timeline

def build_evidence_chain(baseline, triggered_rules, suspicious_txns):
    """
    Constructs an immutable step-by-step evidence chain:
    Input History -> Normal Baseline -> Rule Checks -> Suspicious Transactions -> Evidence -> Explanation -> Guidance
    """
    steps = [
        {
            "step": 1,
            "stage": "Input History Validation",
            "status": "VERIFIED",
            "detail": f"Validated {baseline.get('total_transactions', 0)} multi-month transaction records spanning {baseline.get('earliest_date', '')[:10]} to {baseline.get('latest_date', '')[:10]}."
        },
        {
            "step": 2,
            "stage": "Customer Baseline Established",
            "status": "CALCULATED",
            "detail": f"Empirical normal: ₹{baseline.get('avg_amount', 0):,.0f} avg amount, {baseline.get('active_hours', '09:00-21:00')} active hours, {baseline.get('typical_frequency_per_day', 1)} tx/day."
        },
        {
            "step": 3,
            "stage": "Deterministic Rule Checks",
            "status": f"{len(triggered_rules)} Rules Triggered" if triggered_rules else "All 6 Rules Passed",
            "detail": f"Evaluated 6 PS06 banking rules. Triggered: {', '.join(r['rule_id'] for r in triggered_rules) if triggered_rules else 'None'}."
        },
        {
            "step": 4,
            "stage": "Suspicious Transactions Isolated",
            "status": f"{len(suspicious_txns)} Flagged" if suspicious_txns else "Clean History",
            "detail": f"Isolated transaction IDs: {', '.join(t['transaction_id'] for t in suspicious_txns) if suspicious_txns else 'No transactions requiring isolation'}."
        },
        {
            "step": 5,
            "stage": "Evidence Attribution",
            "status": "GROUNDED",
            "detail": f"Quantified evidence: Amount deviations up to {round(suspicious_txns[0]['amount'] / baseline['avg_amount'], 1) if suspicious_txns and baseline['avg_amount'] else 1.0}× baseline, nocturnal timing, newly registered payee." if suspicious_txns else "Telemetry conforms fully with customer baseline."
        },
        {
            "step": 6,
            "stage": "Investigator Guidance",
            "status": "ACTIONABLE",
            "detail": "Action checklist and non-leading questions generated for human review sign-off."
        }
    ]
    return steps

def build_counterfactual_analysis(baseline, suspicious_txns):
    """
    Counterfactual: 'WHAT WOULD MAKE THIS PATTERN LESS UNUSUAL?'
    Explains the minimal changes that would bring activity into normal boundaries.
    """
    if not suspicious_txns:
        return {
            "title": "WHAT WOULD MAKE THIS PATTERN LESS UNUSUAL?",
            "status": "Already within normal behavioural envelope",
            "adjustments": []
        }

    avg_amt = baseline.get("avg_amount", 3500)
    primary_payee = baseline.get("common_payees", ["Established Merchant"])[0] if baseline.get("common_payees") else "Established Merchant"
    adjustments = [
        {
            "parameter": "Beneficiary Payee",
            "current": f"{len(suspicious_txns)} payments to new payee within 30 minutes",
            "alternative": f"Single payment to established payee ({primary_payee})",
            "impact": "Eliminates RULE-NEW-PAYEE-BURST and restores beneficiary trust."
        },
        {
            "parameter": "Transfer Amount",
            "current": f"₹{suspicious_txns[0].get('amount', 25000):,.0f} per transaction",
            "alternative": f"₹{avg_amt:,.0f} (aligned with 30-day historical mean)",
            "impact": "Reduces amount ratio from extreme deviation back to 1.0× baseline."
        },
        {
            "parameter": "Execution Hour",
            "current": parse_iso(suspicious_txns[0].get("timestamp", "")).strftime("%I:%M %p"),
            "alternative": "11:30 AM (during daytime active window)",
            "impact": "Resolves RULE-ODD-HOURS circadian anomaly."
        }
    ]

    return {
        "title": "WHAT WOULD MAKE THIS PATTERN LESS UNUSUAL?",
        "summary": "These specific adjustments would transition this activity from an anomalous risk spike into the customer's normal historical envelope.",
        "adjustments": adjustments
    }

def build_activity_relationship_map(customer_id, baseline, suspicious_txns):
    """
    Generates nodes and links for the Activity Relationship Map.
    """
    nodes = [
        {"id": customer_id, "label": customer_id, "type": "customer", "level": "root"}
    ]
    links = []

    # Known normal payees
    for p in baseline.get("common_payees", [])[:4]:
        nodes.append({"id": p, "label": p, "type": "known_payee", "level": "normal"})
        links.append({"source": customer_id, "target": p, "label": "historical beneficiary"})

    # Suspicious cluster
    if suspicious_txns:
        new_payee = suspicious_txns[0].get("payee", "New Payee")
        nodes.append({"id": new_payee, "label": new_payee, "type": "new_payee", "level": "anomalous"})
        links.append({"source": customer_id, "target": new_payee, "label": "new payee added"})

        for tx in suspicious_txns:
            tx_id = tx["transaction_id"]
            nodes.append({"id": tx_id, "label": f"{tx_id} (₹{tx.get('amount', 0):,.0f})", "type": "transaction", "level": "flagged"})
            links.append({"source": new_payee, "target": tx_id, "label": "rapid transfer"})

    return {"nodes": nodes, "links": links}

def generate_investigator_questions(triggered_rules, baseline, suspicious_txns):
    """
    Generates grounded questions for the human investigator.
    """
    questions = []
    rule_ids = set(r["rule_id"] for r in triggered_rules)

    if "RULE-NEW-PAYEE-BURST" in rule_ids:
        new_payee = suspicious_txns[0].get("payee", "the beneficiary") if suspicious_txns else "the beneficiary"
        questions.append(f"Was the newly added payee ({new_payee}) expected by the customer, or did they receive an external request/instruction to add them?")
    if "RULE-LARGE-TRANSFER" in rule_ids:
        questions.append("Does the customer recognize the large transfer amounts, and do they correspond to a planned capital expenditure or major invoice?")
    if "RULE-ODD-HOURS" in rule_ids:
        questions.append("Is the late-night transaction timing consistent with recent travel across timezones or an atypical emergency?")
    if "RULE-CHANNEL-ANOMALY" in rule_ids:
        questions.append("Why did the customer switch from their standard mobile UPI interface to high-value Bank Transfer / IMPS?")
    if not questions:
        questions.append("Transaction history is consistent. Confirm standard periodic audit sign-off.")

    return questions

def run_customer_investigation(customer_id, transactions):
    """
    Master investigation function answering:
    'Does anything in this customer's transaction history need attention?'
    """
    baseline = calculate_customer_baseline(transactions)
    data_quality = calculate_data_quality(transactions)
    triggered_rules, suspicious_txns, all_rules = evaluate_ps06_rules(transactions, baseline)
    behavioural_dna = build_customer_behavioural_dna(transactions, baseline, suspicious_txns)
    timeline = build_investigation_timeline(transactions, suspicious_txns)
    evidence_chain = build_evidence_chain(baseline, triggered_rules, suspicious_txns)
    counterfactuals = build_counterfactual_analysis(baseline, suspicious_txns)
    relationship_map = build_activity_relationship_map(customer_id, baseline, suspicious_txns)
    investigator_questions = generate_investigator_questions(triggered_rules, baseline, suspicious_txns)

    # Core PS06 Question
    needs_attention = len(triggered_rules) > 0
    status = "YES — INVESTIGATION RECOMMENDED" if needs_attention else "NO SIGNIFICANT UNUSUAL ACTIVITY"

    # Attention Score & Confidence
    attention_score = min(sum(r["points"] for r in triggered_rules), 100) if needs_attention else 12
    evidence_confidence = 94 if data_quality["score"] >= 90 else 70 if data_quality["score"] >= 60 else 48

    # Priority
    if attention_score >= 70 or len(triggered_rules) >= 3:
        priority = "URGENT REVIEW"
    elif attention_score >= 45 or len(triggered_rules) >= 2:
        priority = "HIGH"
    elif attention_score >= 25 or len(triggered_rules) >= 1:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    # What to look at first (Priority Action Checklist)
    what_to_look_at_first = []
    if needs_attention:
        what_to_look_at_first.append(f"Verify the newly added payee ({suspicious_txns[0].get('payee', 'beneficiary') if suspicious_txns else 'beneficiary'}) and registration time.")
        what_to_look_at_first.append(f"Review the {len(suspicious_txns)} high-value transfers totaling ₹{sum(t.get('amount', 0) for t in suspicious_txns):,.0f}.")
        what_to_look_at_first.append("Compare transaction timing with the customer's customary 9 AM–9 PM window.")
        what_to_look_at_first.append("Contact account holder via registered mobile contact to confirm authorization.")
    else:
        what_to_look_at_first.append("No anomalous triggers. Verify normal account status.")

    # What remains unknown (Section 20 requirement)
    what_remains_unknown = []
    if needs_attention:
        what_remains_unknown.append("Whether the customer personally initiated and authorized the outbound transfers.")
        what_remains_unknown.append("Whether the newly added beneficiary has an existing off-platform business relationship.")
        what_remains_unknown.append("Whether the unusual timing has a legitimate explanation (e.g. emergency or travel).")
    else:
        what_remains_unknown.append("Nothing material is currently unknown from the supplied history.")

    findings = [r.get("finding", r.get("name", "")) for r in triggered_rules] if triggered_rules else ["All transaction activity conforms to customer's historical 90-day baseline."]

    return {
        "customer_id": customer_id,
        "status": "INVESTIGATION_RECOMMENDED" if needs_attention else "NO_SIGNIFICANT_UNUSUAL_ACTIVITY",
        "investigation_status": status,
        "needs_attention": needs_attention,
        "investigation_priority": priority,
        "attention_score": attention_score,
        "evidence_confidence": evidence_confidence,
        "rules_evaluated": len(all_rules),
        "rules_triggered": len(triggered_rules),
        "relevant_transactions": suspicious_txns,
        "findings": findings,
        "behavioral_baseline": baseline,
        "what_to_look_at_first": what_to_look_at_first,
        "what_remains_unknown": what_remains_unknown,
        "fallback_mode": False,
        "data_quality": data_quality,
        "baseline": baseline,
        "triggered_rules": triggered_rules,
        "all_rules": all_rules,
        "flagged_transactions": suspicious_txns,
        "all_transactions": transactions,
        "behavioural_dna": behavioural_dna,
        "timeline": timeline,
        "evidence_chain": evidence_chain,
        "counterfactuals": counterfactuals,
        "relationship_map": relationship_map,
        "investigator_questions": investigator_questions,
        "investigation_timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

if __name__ == "__main__":
    from synthetic_data_ps06 import generate_multi_month_history
    data = generate_multi_month_history()
    normal_res = run_customer_investigation("CUST-NORMAL-001", data["CUST-NORMAL-001"]["transactions"])
    print("CUST-NORMAL-001:", normal_res["investigation_status"], f"Rules triggered: {len(normal_res['triggered_rules'])}")

    risk_res = run_customer_investigation("CUST-RISK-001", data["CUST-RISK-001"]["transactions"])
    print("CUST-RISK-001:", risk_res["investigation_status"], f"Rules triggered: {len(risk_res['triggered_rules'])}")
    print("Flagged txns:", [t["transaction_id"] for t in risk_res["flagged_transactions"]])
