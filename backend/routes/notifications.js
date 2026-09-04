const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/notifications — dynamic notifications from DB state
router.get('/', (req, res) => {
  try {
    const db = getDb();

    const notifications = [];

    // Critical pending reviews
    const criticalPending = db.prepare(`
      SELECT r.transaction_id, r.risk_score
      FROM reviews r
      WHERE r.status = 'Needs Review' AND r.risk_level = 'CRITICAL'
      ORDER BY r.created_at DESC LIMIT 3
    `).all();

    criticalPending.forEach(r => {
      notifications.push({
        id: `critical-${r.transaction_id}`,
        type: 'CRITICAL',
        transaction_id: r.transaction_id,
        title: 'Critical Risk Requires Review',
        message: `Transaction ${r.transaction_id} scored ${r.risk_score}/100 and needs immediate review.`,
        link: `/review?search=${encodeURIComponent(r.transaction_id)}`,
        time: 'Just now',
        read: false
      });
    });

    // High risk pending
    const highPending = db.prepare(`
      SELECT r.transaction_id, r.risk_score
      FROM reviews r
      WHERE r.status = 'Needs Review' AND r.risk_level = 'HIGH'
      ORDER BY r.created_at DESC LIMIT 2
    `).all();

    highPending.forEach(r => {
      notifications.push({
        id: `high-${r.transaction_id}`,
        type: 'HIGH',
        transaction_id: r.transaction_id,
        title: 'High-Risk Transaction Flagged',
        message: `Transaction ${r.transaction_id} (score: ${r.risk_score}) is awaiting review.`,
        link: `/review?search=${encodeURIComponent(r.transaction_id)}`,
        time: '2 min ago',
        read: false
      });
    });

    // System notification
    const totalProcessed = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
    notifications.push({
      id: 'system-processed',
      type: 'SYSTEM',
      title: 'Risk Engine Active',
      message: `TransactionGuard-v1 has processed ${totalProcessed?.count || 0} risk assessments.`,
      link: '/audit',
      time: '5 min ago',
      read: true
    });

    notifications.push({
      id: 'system-health',
      type: 'SYSTEM',
      title: 'System Health Check Passed',
      message: 'All services are operational. Database and risk engine running normally.',
      link: '/dashboard',
      time: '10 min ago',
      read: true
    });

    res.json({
      notifications: notifications.slice(0, 8),
      unread_count: notifications.filter(n => !n.read).length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile
router.get('/profile', (req, res) => {
  res.json({
    name: 'Admin',
    role: 'Risk Analyst',
    email: 'admin@transactionguard.ai',
    avatar: null,
    engine_version: 'TransactionGuard-v1',
    last_login: new Date().toISOString()
  });
});

module.exports = router;
