const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');
const { seedDatabase } = require('./seedData');

const scoreRoute = require('./routes/score');
const transactionsRoute = require('./routes/transactions');
const metricsRoute = require('./routes/metrics');
const auditRoute = require('./routes/audit');
const reviewRoute = require('./routes/review');
const analyticsRoute = require('./routes/analytics');
const notificationsRoute = require('./routes/notifications');
const investigateRoute = require('./routes/investigate');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize DB and seed
try {
  initializeDatabase();
  seedDatabase();
} catch (err) {
  console.error('❌ Database initialization error:', err.message);
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  const { getDb } = require('./database');
  let dbStatus = 'ok';
  try { getDb().prepare('SELECT 1').get(); } catch (e) { dbStatus = 'error'; }

  res.json({
    status: 'ok',
    service: 'TransactionGuard AI',
    version: 'TransactionGuard-v1',
    timestamp: new Date().toISOString(),
    defense_only: true,
    db_engine: 'node:sqlite',
    db_status: dbStatus,
    uptime: process.uptime()
  });
});

// Profile (separate path from notifications router)
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Admin',
    role: 'Platform Administrator',
    email: 'admin@transactionguard.ai',
    avatar: null,
    engine_version: 'TransactionGuard-v1',
    last_login: new Date().toISOString()
  });
});

// Users endpoint for User Management
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      {
        id: 'u-1',
        name: 'Admin',
        email: 'admin@transactionguard.ai',
        role: 'Administrator',
        roleTitle: 'Platform Administrator',
        status: 'Active',
        lastActive: 'Just now'
      },
      {
        id: 'u-2',
        name: 'Alex',
        email: 'analyst@transactionguard.ai',
        role: 'Risk Analyst',
        roleTitle: 'Risk Analyst',
        status: 'Active',
        lastActive: '10 mins ago'
      },
      {
        id: 'u-3',
        name: 'Priya',
        email: 'reviewer@transactionguard.ai',
        role: 'Reviewer',
        roleTitle: 'Transaction Reviewer',
        status: 'Active',
        lastActive: '1 hour ago'
      }
    ]
  });
});

// Explain alias
app.post('/api/explain', (req, res) => {
  res.redirect(307, '/api/score');
});

// Re-seed
app.post('/api/seed', (req, res) => {
  try {
    const { getDb } = require('./database');
    const db = getDb();
    db.exec('DELETE FROM transactions');
    db.exec('DELETE FROM risk_results');
    db.exec('DELETE FROM audit_logs');
    db.exec('DELETE FROM reviews');
    seedDatabase();
    res.json({ message: 'Database re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/api/score', scoreRoute);
app.use('/api/transactions', transactionsRoute);
app.use('/api/metrics', metricsRoute);
app.use('/api/audit', auditRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/notifications', notificationsRoute);
app.use('/api/investigate', investigateRoute);
app.get('/api/customers', (req, res, next) => {
  req.url = '/customers';
  investigateRoute(req, res, next);
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 TransactionGuard AI backend running on http://localhost:${PORT}`);
  console.log(`📊 API health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
