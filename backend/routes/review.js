const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/reviews
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let rows, totalRow;
    if (status) {
      rows = db.prepare('SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(status, limit, offset);
      totalRow = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE status = ?').get(status);
    } else {
      rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
      totalRow = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
    }

    res.json({ reviews: rows.map(r => ({ ...r })), total: totalRow ? totalRow.count : 0, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reviews/:id
router.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const { status, reviewer_notes } = req.body;

    const validStatuses = ['Needs Review', 'Under Review', 'Reviewed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Review not found' });

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (status && reviewer_notes !== undefined) {
      db.prepare('UPDATE reviews SET status = ?, reviewer_notes = ?, reviewed_at = ? WHERE id = ?')
        .run(status, reviewer_notes, status === 'Reviewed' ? now : null, req.params.id);
    } else if (status) {
      db.prepare('UPDATE reviews SET status = ?, reviewed_at = ? WHERE id = ?')
        .run(status, status === 'Reviewed' ? now : null, req.params.id);
    } else if (reviewer_notes !== undefined) {
      db.prepare('UPDATE reviews SET reviewer_notes = ? WHERE id = ?').run(reviewer_notes, req.params.id);
    } else {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
    res.json({ ...updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
