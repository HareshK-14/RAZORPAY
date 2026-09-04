const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/metrics
router.get('/', (req, res) => {
  try {
    const db = getDb();

    const g = (sql, ...p) => { const r = db.prepare(sql).get(...p); return r ? (r.count ?? 0) : 0; };
    const n = (sql, ...p) => { const r = db.prepare(sql).get(...p); return r ? (r.avg ?? 0) : 0; };

    const total = g('SELECT COUNT(*) as count FROM transactions');
    const flagged = g('SELECT COUNT(*) as count FROM risk_results WHERE is_flagged = 1');
    const critical = g("SELECT COUNT(*) as count FROM risk_results WHERE risk_level = 'CRITICAL'");
    const high = g("SELECT COUNT(*) as count FROM risk_results WHERE risk_level = 'HIGH'");
    const medium = g("SELECT COUNT(*) as count FROM risk_results WHERE risk_level = 'MEDIUM'");
    const low = g("SELECT COUNT(*) as count FROM risk_results WHERE risk_level = 'LOW'");
    const avgScore = n('SELECT AVG(risk_score) as avg FROM risk_results');

    // Pending reviews
    const pendingReview = g("SELECT COUNT(*) as count FROM reviews WHERE status = 'Needs Review'");
    const underReview = g("SELECT COUNT(*) as count FROM reviews WHERE status = 'Under Review'");
    const reviewed = g("SELECT COUNT(*) as count FROM reviews WHERE status = 'Reviewed'");
    const totalReviews = pendingReview + underReview + reviewed;

    // Ground-truth fraud labels (synthetic dataset is_fraud column)
    const fraudCount = g('SELECT COUNT(*) as count FROM transactions WHERE is_fraud = 1');
    const legitCount = total - fraudCount;

    // Signal distribution
    const allReasons = db.prepare('SELECT reasons FROM risk_results WHERE reasons IS NOT NULL').all();
    const signalCounts = {};
    allReasons.forEach(row => {
      try {
        JSON.parse(row.reasons).forEach(r => {
          signalCounts[r.signal] = (signalCounts[r.signal] || 0) + 1;
        });
      } catch (e) {}
    });

    const signalDistribution = Object.entries(signalCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topSignalName = signalDistribution.length > 0 ? signalDistribution[0].name : 'Geographic mismatch';

    // Average confidence
    const avgConf = n('SELECT AVG(confidence) as avg FROM risk_results');

    // Top Risky Merchants (Section 4, Feature 2)
    const topMerchants = db.prepare(`
      SELECT t.merchant_id,
             COUNT(*) as total,
             SUM(CASE WHEN r.is_flagged = 1 THEN 1 ELSE 0 END) as flagged,
             ROUND(AVG(r.risk_score), 1) as avg_risk,
             SUM(CASE WHEN r.risk_level = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count
      FROM transactions t
      LEFT JOIN risk_results r ON t.transaction_id = r.transaction_id
      WHERE t.merchant_id IS NOT NULL
      GROUP BY t.merchant_id
      ORDER BY avg_risk DESC, flagged DESC
      LIMIT 5
    `).all().map(r => ({ ...r }));

    // Geographic Risk Overview (Section 4, Feature 3)
    const geographicRisk = db.prepare(`
      SELECT t.ip_country as country,
             COUNT(*) as total,
             SUM(CASE WHEN r.is_flagged = 1 THEN 1 ELSE 0 END) as flagged,
             ROUND(AVG(r.risk_score), 1) as avg_risk,
             SUM(CASE WHEN r.risk_level = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count
      FROM transactions t
      LEFT JOIN risk_results r ON t.transaction_id = r.transaction_id
      WHERE t.ip_country IS NOT NULL
      GROUP BY t.ip_country
      ORDER BY avg_risk DESC, total DESC
      LIMIT 6
    `).all().map(r => ({ ...r }));

    // Risk Trend Forecast & Direction (Section 4, Feature 1)
    const riskTrend = db.prepare(`
      SELECT substr(t.timestamp, 1, 10) as date,
             COUNT(*) as txn_count,
             ROUND(AVG(r.risk_score), 1) as avg_risk
      FROM transactions t
      LEFT JOIN risk_results r ON t.transaction_id = r.transaction_id
      WHERE t.timestamp IS NOT NULL
      GROUP BY substr(t.timestamp, 1, 10)
      ORDER BY date ASC
      LIMIT 14
    `).all().map(r => ({ ...r }));

    let trendDirection = 'Insufficient historical data for trend estimation.';
    if (riskTrend.length >= 4) {
      const mid = Math.floor(riskTrend.length / 2);
      const firstHalf = riskTrend.slice(0, mid).reduce((sum, p) => sum + (p.avg_risk || 0), 0) / mid;
      const secondHalf = riskTrend.slice(mid).reduce((sum, p) => sum + (p.avg_risk || 0), 0) / (riskTrend.length - mid);
      const diff = secondHalf - firstHalf;
      if (diff > 1.5) trendDirection = 'Increasing';
      else if (diff < -1.5) trendDirection = 'Decreasing';
      else trendDirection = 'Stable';
    }

    // AI Risk Brief (Section 4, Feature 5)
    const flaggedPct = total > 0 ? ((flagged / total) * 100).toFixed(1) : 0;
    const aiRiskBrief = `${total.toLocaleString()} transactions were analyzed. ${topSignalName} is currently the most frequent high-risk signal (${flagged.toLocaleString()} flagged cases, ${flaggedPct}%), while ${pendingReview} cases remain pending human review.`;

    res.json({
      total_transactions: total,
      flagged_transactions: flagged,
      critical_risk: critical,
      high_risk: high,
      medium_risk: medium,
      low_risk: low,
      average_risk_score: parseFloat(avgScore.toFixed(1)),
      average_confidence: parseFloat((avgConf * 100).toFixed(1)),
      pending_review: pendingReview,
      under_review: underReview,
      reviewed: reviewed,
      total_reviews: totalReviews,
      review_completion_rate: totalReviews > 0
        ? parseFloat(((reviewed / totalReviews) * 100).toFixed(1))
        : 0,
      flagged_rate: total > 0 ? parseFloat(((flagged / total) * 100).toFixed(1)) : 0,
      fraud_count: fraudCount,
      legit_count: legitCount,
      synthetic_fraud_rate: total > 0 ? parseFloat(((fraudCount / total) * 100).toFixed(1)) : 0,
      risk_distribution: [
        { name: 'LOW', count: low, color: '#22c55e' },
        { name: 'MEDIUM', count: medium, color: '#f59e0b' },
        { name: 'HIGH', count: high, color: '#f97316' },
        { name: 'CRITICAL', count: critical, color: '#ef4444' }
      ],
      fraud_vs_legit: [
        { name: 'Legitimate', count: legitCount, color: '#22c55e' },
        { name: 'Fraud (Synthetic)', count: fraudCount, color: '#ef4444' }
      ],
      flagged_vs_clean: [
        { name: 'Not Flagged', count: total - flagged, color: '#374151' },
        { name: 'Flagged', count: flagged, color: '#f97316' }
      ],
      review_status: [
        { name: 'Needs Review', count: pendingReview, color: '#f59e0b' },
        { name: 'Under Review', count: underReview, color: '#3b82f6' },
        { name: 'Reviewed', count: reviewed, color: '#22c55e' }
      ],
      signal_distribution: signalDistribution,
      top_merchants: topMerchants,
      geographic_risk: geographicRisk,
      risk_trend: riskTrend,
      trend_direction: trendDirection,
      ai_risk_brief: aiRiskBrief
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
