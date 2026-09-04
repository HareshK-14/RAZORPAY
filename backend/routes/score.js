const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { scoreTransaction } = require('../riskEngine');
const { generateExplanation } = require('../explainability');
const { v4: uuidv4 } = require('uuid');

// POST /api/score
router.post('/', (req, res) => {
  try {
    const input = req.body;

    if (input.amount === undefined || input.amount === null) {
      return res.status(400).json({ error: 'amount is required' });
    }
    if (typeof input.amount !== 'number' || input.amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const transaction_id = input.transaction_id || `TX-${uuidv4().substring(0, 8).toUpperCase()}`;
    const result = scoreTransaction(input);
    const explanation = generateExplanation(result, input);
    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Insert transaction if not existing
    const existingTxn = db.prepare('SELECT transaction_id FROM transactions WHERE transaction_id = ?').get(transaction_id);
    if (!existingTxn) {
      db.prepare(`
        INSERT OR IGNORE INTO transactions
        (transaction_id, customer_id, timestamp, merchant_id, amount, ip_country, merchant_country,
         is_first_time_device, txn_count_last_1hr, txn_count_last_24hr, avg_amount_last_30d, hour_of_day)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        transaction_id, input.customer_id || 'UNKNOWN', now,
        input.merchant_id || 'UNKNOWN', input.amount,
        input.ip_country || null, input.merchant_country || null,
        input.is_first_time_device ? 1 : 0,
        input.txn_count_last_1hr ?? null, input.txn_count_last_24hr ?? null,
        input.avg_amount_last_30d ?? null, input.hour_of_day ?? null
      );
    }

    // Upsert risk result
    db.prepare(`
      INSERT OR REPLACE INTO risk_results
      (transaction_id, risk_score, risk_level, fraud_probability, confidence, is_flagged,
       reasons, risk_breakdown, behavioral_fingerprint, fallback_mode, review_recommendation, engine_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction_id, result.risk_score, result.risk_level,
      result.fraud_probability, result.confidence, result.is_flagged ? 1 : 0,
      JSON.stringify(result.reasons), JSON.stringify(result.risk_breakdown),
      JSON.stringify(result.behavioral_fingerprint), result.fallback_mode ? 1 : 0,
      result.review_recommendation, result.engine_version
    );

    // Write audit log
    db.prepare(`
      INSERT INTO audit_logs
      (transaction_id, risk_score, risk_level, confidence, risk_signals, fallback_mode, recommendation, engine_version, raw_input)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction_id, result.risk_score, result.risk_level, result.confidence,
      JSON.stringify(result.reasons.map(r => r.signal)),
      result.fallback_mode ? 1 : 0, result.review_recommendation,
      result.engine_version, JSON.stringify(input)
    );

    // Add to review queue if flagged
    if (result.is_flagged) {
      const existingReview = db.prepare('SELECT id FROM reviews WHERE transaction_id = ?').get(transaction_id);
      if (!existingReview) {
        db.prepare(`
          INSERT INTO reviews (transaction_id, risk_score, risk_level, top_signal, confidence, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          transaction_id, result.risk_score, result.risk_level,
          result.reasons[0]?.signal || 'Unknown', result.confidence, 'Needs Review'
        );
      }
    }

    return res.json({
      transaction_id, risk_score: result.risk_score, risk_level: result.risk_level,
      fraud_probability: result.fraud_probability, confidence: result.confidence,
      is_flagged: result.is_flagged, reasons: result.reasons,
      risk_breakdown: result.risk_breakdown, behavioral_fingerprint: result.behavioral_fingerprint,
      fallback_mode: result.fallback_mode, missing_fields: result.missing_fields,
      review_recommendation: result.review_recommendation, explanation,
      engine_version: result.engine_version, audit_created: true
    });
  } catch (err) {
    console.error('Score error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

module.exports = router;
