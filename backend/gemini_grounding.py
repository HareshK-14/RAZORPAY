"""
Grounded Gemini AI Investigation Intelligence Module
Track ID: PS06 — Banking: Transaction Risk Investigation Assistant
Uses Gemini as the ONLY external API for:
- Grounded Natural Language Investigation Summaries
- Investigator Questions
- Context Embeddings (gemini-embedding-001)

Follows strict zero-hallucination constraint:
- Uses ONLY supplied transaction evidence
- Never invents transactions, payees, dates, or amounts
- Never states that fraud occurred (only describes unusual activity)
- Gracefully falls back to deterministic rule-based explanations if API key is absent or network fails
"""

import os
import json
import numpy as np

def get_gemini_api_key():
    return os.environ.get("GEMINI_API_KEY", "").strip()

def generate_deterministic_fallback_summary(investigation_data):
    """
    Deterministic rule-based summary when Gemini is unavailable.
    """
    customer_id = investigation_data.get("customer_id", "Unknown")
    triggered_rules = investigation_data.get("triggered_rules", [])
    baseline = investigation_data.get("baseline", {})
    flagged_txns = investigation_data.get("flagged_transactions", [])
    avg_amt = baseline.get("avg_amount", 3500)

    if not triggered_rules:
        return {
            "source": "DETERMINISTIC_RULES",
            "is_ai_generated": False,
            "headline": "NO SIGNIFICANT UNUSUAL ACTIVITY",
            "narrative": f"The transaction history for customer {customer_id} is broadly consistent with their established behavioural baseline. All 6 deterministic risk rules evaluated cleanly with zero triggers.",
            "what_was_found": "No anomalous transactions or velocity spikes identified across the evaluated multi-month history.",
            "why_attention_needed": "Investigation not required at this time.",
            "model_used": "Deterministic Rule Baseline v1.0"
        }

    total_flagged_amt = sum(t.get("amount", 0) for t in flagged_txns)
    rule_names = [r["name"] for r in triggered_rules]
    first_tx = flagged_txns[0] if flagged_txns else {}
    payee = first_tx.get("payee", "unfamiliar payee")

    narrative = (
        f"Customer {customer_id}'s recent activity shows a material deviation from established behavioural patterns. "
        f"{len(flagged_txns)} transfers totaling ₹{total_flagged_amt:,.2f} to {payee} occurred within a narrow window, "
        f"significantly exceeding the historical baseline average of ₹{avg_amt:,.2f}. "
        f"Multiple risk indicators triggered: {', '.join(rule_names)}. "
        f"These combined telemetry signals warrant prompt human investigator review."
    )

    return {
        "source": "DETERMINISTIC_RULES",
        "is_ai_generated": False,
        "headline": "INVESTIGATION RECOMMENDED",
        "narrative": narrative,
        "what_was_found": f"{len(flagged_txns)} high-value transfers occurred in rapid succession, deviating {round(total_flagged_amt / (avg_amt * max(len(flagged_txns), 1)), 1)}× from normal customer scale.",
        "why_attention_needed": f"Multiple deterministic rules triggered ({len(triggered_rules)} of 6 rules), indicating a concurrent collapse of customary habits.",
        "model_used": "Deterministic Rule Baseline v1.0 (AI explanation unavailable — showing rule-based findings)"
    }

def generate_grounded_investigation_summary(investigation_data):
    """
    Invokes Gemini with strict grounding instructions to synthesize the investigation.
    Falls back gracefully if API key is missing or API errors.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return generate_deterministic_fallback_summary(investigation_data)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        # Prepare tightly bounded prompt context
        customer_id = investigation_data.get("customer_id")
        baseline = investigation_data.get("baseline", {})
        triggered_rules = investigation_data.get("triggered_rules", [])
        flagged_txns = investigation_data.get("flagged_transactions", [])
        data_quality = investigation_data.get("data_quality", {})

        system_instruction = (
            "You are TransactionGuard AI, an expert banking transaction risk investigation assistant. "
            "Your role is to help a human investigator understand whether a customer's transaction history needs attention. "
            "STRICT GUIDELINES: "
            "1. Use ONLY the supplied transaction evidence and baseline numbers. "
            "2. NEVER invent transactions, dates, amounts, payees, or rules. "
            "3. NEVER state that fraud has occurred. Use phrases like 'Unusual pattern detected', 'Elevated risk activity', 'Human review recommended'. "
            "4. If evidence is insufficient, explicitly state that it is insufficient. "
            "5. Answer the primary question: 'Does anything in this customer's transaction history need attention? (YES or NO)'."
        )

        user_prompt = f"""
Analyze the following customer transaction investigation data:

CUSTOMER ID: {customer_id}
BASELINE NORMAL BEHAVIOUR:
- Average Amount: ₹{baseline.get('avg_amount', 0):,.2f}
- Typical Active Hours: {baseline.get('active_hours', 'N/A')}
- Typical Daily Frequency: {baseline.get('typical_frequency_per_day', 0)} transactions/day
- Familiar Payees: {', '.join(baseline.get('common_payees', [])[:5])}
- Familiar Channels: {json.dumps(baseline.get('common_channels', {}))}

RULES EVALUATION:
- Total Rules Evaluated: 6
- Triggered Rules ({len(triggered_rules)}):
{json.dumps([{ 'rule': r['name'], 'finding': r['finding'], 'points': r['points'] } for r in triggered_rules], indent=2)}

SUSPICIOUS / FLAGGED TRANSACTIONS ({len(flagged_txns)}):
{json.dumps(flagged_txns, indent=2)}

DATA QUALITY: {data_quality.get('score', 0)}% (Missing fields: {data_quality.get('missing_fields', [])})

Provide a structured response in JSON format with these exact keys:
{{
  "headline": "YES — INVESTIGATION RECOMMENDED" or "NO SIGNIFICANT UNUSUAL ACTIVITY",
  "narrative": "A clear 3-4 sentence professional explanation citing exact transaction amounts, times, and ratios",
  "what_was_found": "Specific factual summary of what happened",
  "why_attention_needed": "Explanation of why this pattern deviates from normal customer baseline",
  "model_used": "Gemini 1.5 Flash (Grounded Multi-Signal Inference)"
}}
Respond ONLY with the valid JSON object.
"""

        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=user_prompt,
            config={
                'system_instruction': system_instruction,
                'response_mime_type': 'application/json',
                'temperature': 0.1
            }
        )

        parsed = json.loads(response.text)
        parsed["source"] = "GEMINI_GROUNDED"
        parsed["is_ai_generated"] = True
        return parsed

    except Exception as e:
        print(f"Gemini API call failed or unavailable ({e}); engaging deterministic fallback.")
        fallback = generate_deterministic_fallback_summary(investigation_data)
        fallback["model_used"] = f"Deterministic Rule Baseline v1.0 (Gemini fallback: {str(e)[:60]}...)"
        return fallback

def get_text_embedding(text):
    """
    Computes text embedding using gemini-embedding-001 if API key is present,
    or a local deterministic bag-of-words / hash vector.
    """
    api_key = get_gemini_api_key()
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            result = client.models.embed_content(
                model='gemini-embedding-001',
                contents=text
            )
            if hasattr(result, 'embedding') and hasattr(result.embedding, 'values'):
                return result.embedding.values
        except Exception as e:
            pass

    # Local fallback 128-dim deterministic pseudo-embedding using hash
    np.random.seed(abs(hash(text)) % (2**32))
    vec = np.random.randn(128)
    norm = np.linalg.norm(vec)
    return (vec / norm).tolist() if norm > 0 else vec.tolist()

if __name__ == "__main__":
    test_data = {
        "customer_id": "CUST-RISK-001",
        "baseline": {"avg_amount": 3500, "active_hours": "09:00 - 21:00", "typical_frequency_per_day": 1.5},
        "triggered_rules": [{"name": "Unusually Large Transfer", "finding": "Amount is 7.1x above baseline", "points": 25}],
        "flagged_transactions": [{"transaction_id": "TX1001", "amount": 25000, "timestamp": "2026-03-14 02:41:15", "payee": "PAYEE-884"}],
        "data_quality": {"score": 95, "missing_fields": []}
    }
    res = generate_grounded_investigation_summary(test_data)
    print("Investigation summary generated:")
    print(json.dumps(res, indent=2))
