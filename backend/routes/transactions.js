const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/transactions — with optional search & filter params
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;

    // Filters
    const search = req.query.search?.trim() || '';
    const riskLevel = req.query.risk_level || '';
    const flagged = req.query.flagged; // 'true' | 'false' | ''
    const sortBy = req.query.sort_by || 'newest';

    let where = [];
    let params = [];

    if (search) {
      where.push(`(t.transaction_id LIKE ? OR t.customer_id LIKE ? OR t.merchant_id LIKE ? OR t.device_id LIKE ?)`);
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (riskLevel) {
      where.push(`r.risk_level = ?`);
      params.push(riskLevel.toUpperCase());
    }
    if (flagged === 'true') {
      where.push(`r.is_flagged = 1`);
    } else if (flagged === 'false') {
      where.push(`(r.is_flagged = 0 OR r.is_flagged IS NULL)`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const orderMap = {
      newest: 't.created_at DESC',
      oldest: 't.created_at ASC',
      highest_risk: 'r.risk_score DESC',
      highest_amount: 't.amount DESC'
    };
    const orderBy = orderMap[sortBy] || orderMap.newest;

    const rows = db.prepare(`
      SELECT t.transaction_id, t.customer_id, t.merchant_id, t.timestamp, t.amount,
             t.ip_country, t.merchant_country, t.is_first_time_device, t.is_fraud,
             t.device_id, t.card_bin, t.hour_of_day, t.created_at,
             r.risk_score, r.risk_level, r.is_flagged, r.confidence, r.fraud_probability,
             r.fallback_mode, r.review_recommendation
      FROM transactions t
      LEFT JOIN risk_results r ON t.transaction_id = r.transaction_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM transactions t
      LEFT JOIN risk_results r ON t.transaction_id = r.transaction_id
      ${whereClause}
    `).get(...params);

    res.json({
      transactions: rows.map(r => ({ ...r })),
      total: totalRow ? totalRow.count : 0,
      page,
      limit
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/search — alias for search endpoint
router.get('/search', (req, res) => {
  req.url = `/?${new URLSearchParams(req.query).toString()}`;
  router.handle(req, res);
});

// GET /api/transactions/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const txn = db.prepare(`
      SELECT t.*, r.risk_score, r.risk_level, r.fraud_probability, r.confidence,
             r.is_flagged, r.reasons, r.risk_breakdown, r.behavioral_fingerprint,
             r.fallback_mode, r.review_recommendation, r.engine_version
      FROM transactions t
      LEFT JOIN risk_results r ON t.transaction_id = r.transaction_id
      WHERE t.transaction_id = ?
    `).get(req.params.id);

    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const plain = { ...txn };
    if (plain.reasons) plain.reasons = JSON.parse(plain.reasons);
    if (plain.risk_breakdown) plain.risk_breakdown = JSON.parse(plain.risk_breakdown);
    if (plain.behavioral_fingerprint) plain.behavioral_fingerprint = JSON.parse(plain.behavioral_fingerprint);

    // Also grab the review status
    const review = db.prepare('SELECT status, reviewer_notes, reviewed_at FROM reviews WHERE transaction_id = ? ORDER BY id DESC LIMIT 1').get(req.params.id);
    plain.review = review ? { ...review } : null;

    // Recent audit entries
    const audits = db.prepare('SELECT * FROM audit_logs WHERE transaction_id = ? ORDER BY created_at DESC LIMIT 5').all(req.params.id);
    plain.audit_history = audits.map(a => ({
      ...a,
      risk_signals: a.risk_signals ? JSON.parse(a.risk_signals) : []
    }));

    res.json(plain);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
