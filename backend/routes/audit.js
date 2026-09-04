const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/audit
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim() || '';

    let whereClause = '';
    let params = [];
    if (search) {
      whereClause = 'WHERE transaction_id LIKE ?';
      params.push(`%${search}%`);
    }

    const rows = db.prepare(`
      SELECT * FROM audit_logs ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalRow = db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${whereClause}`).get(...params);

    const parsed = rows.map(row => ({
      ...row,
      risk_signals: row.risk_signals ? (() => { try { return JSON.parse(row.risk_signals); } catch { return []; } })() : [],
      raw_input: row.raw_input ? (() => { try { return JSON.parse(row.raw_input); } catch { return null; } })() : null
    }));

    res.json({ audit_logs: parsed, total: totalRow ? totalRow.count : 0, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
