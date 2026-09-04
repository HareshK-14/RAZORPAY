/**
 * Synthetic Data Seeder — generates 1,500 realistic transactions
 * with 8–12% fraud rate and varied risk patterns.
 * Uses node:sqlite built-in (no native deps needed).
 */

const { getDb, initializeDatabase } = require('./database');
const { scoreTransaction } = require('./riskEngine');
const { generateSummary } = require('./explainability');
const { v4: uuidv4 } = require('uuid');

const COUNTRIES = ['IN', 'US', 'GB', 'SG', 'AE', 'CA', 'AU', 'DE', 'FR', 'JP'];
const HIGH_RISK_COUNTRIES = ['RU', 'CN', 'NG', 'KP', 'IR'];
const MERCHANT_IDS = Array.from({ length: 20 }, (_, i) => `MERCH${String(i + 1).padStart(4, '0')}`);
const CUSTOMER_IDS = Array.from({ length: 200 }, (_, i) => `CUST${String(i + 1).padStart(5, '0')}`);

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function formatDate(offset = 0) {
  const d = new Date(Date.now() - offset * 3600 * 1000);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

function generateFraudTransaction(txnId, idx) {
  const pattern = idx % 5;
  const customerId = randChoice(CUSTOMER_IDS);
  const merchantCountry = 'IN';
  let ipCountry = merchantCountry;
  let amount = randInt(500, 3000);
  let avgAmount = randInt(500, 3000);
  let isFirstTimeDevice = false;
  let txnLast1hr = randInt(1, 2);
  let txnLast24hr = randInt(2, 5);
  let hour = randInt(8, 21);

  switch (pattern) {
    case 0:
      amount = randInt(20000, 80000); avgAmount = randInt(1000, 4000);
      isFirstTimeDevice = true; txnLast1hr = randInt(6, 12); txnLast24hr = randInt(12, 25);
      ipCountry = randChoice(HIGH_RISK_COUNTRIES); hour = randInt(0, 4); break;
    case 1:
      amount = randInt(8000, 30000); avgAmount = randInt(1000, 5000);
      isFirstTimeDevice = true; txnLast1hr = randInt(1, 4);
      ipCountry = randChoice(HIGH_RISK_COUNTRIES); hour = randInt(1, 5); break;
    case 2:
      amount = randInt(500, 5000); avgAmount = randInt(400, 6000);
      txnLast1hr = randInt(8, 15); txnLast24hr = randInt(20, 40);
      ipCountry = Math.random() > 0.5 ? randChoice(HIGH_RISK_COUNTRIES) : merchantCountry;
      hour = randInt(0, 6); break;
    case 3:
      amount = randInt(50000, 200000); avgAmount = randInt(500, 2000);
      isFirstTimeDevice = Math.random() > 0.4; txnLast1hr = randInt(3, 8);
      ipCountry = Math.random() > 0.5 ? randChoice(HIGH_RISK_COUNTRIES) : randChoice(COUNTRIES); break;
    case 4:
      amount = randInt(5000, 20000); avgAmount = randInt(1500, 4000);
      isFirstTimeDevice = Math.random() > 0.5; txnLast1hr = randInt(3, 7);
      txnLast24hr = randInt(10, 20);
      ipCountry = Math.random() > 0.5 ? randChoice(HIGH_RISK_COUNTRIES) : randChoice(COUNTRIES);
      hour = randInt(0, 7); break;
  }

  return {
    transaction_id: txnId, customer_id: customerId,
    timestamp: formatDate(randInt(0, 720)), merchant_id: randChoice(MERCHANT_IDS),
    amount: parseFloat(amount.toFixed(2)), card_bin: `${randInt(400000, 599999)}`,
    device_id: isFirstTimeDevice ? `DEV-NEW-${uuidv4().substring(0, 8)}` : `DEV-${customerId}-001`,
    ip_country: ipCountry, merchant_country: merchantCountry,
    is_first_time_device: isFirstTimeDevice ? 1 : 0,
    txn_count_last_1hr: txnLast1hr, txn_count_last_24hr: txnLast24hr,
    avg_amount_last_30d: parseFloat(avgAmount.toFixed(2)), hour_of_day: hour, is_fraud: 1
  };
}

function generateLegitTransaction(txnId) {
  const customerId = randChoice(CUSTOMER_IDS);
  const country = randChoice(['IN', 'IN', 'IN', 'IN', 'US', 'GB', 'SG']);
  const avgAmount = randInt(500, 8000);
  const hasNoise = Math.random() < 0.15;
  const amount = hasNoise ? parseFloat((avgAmount * rand(2, 4)).toFixed(2)) : parseFloat((avgAmount * rand(0.5, 1.8)).toFixed(2));
  const hour = hasNoise ? randInt(0, 5) : randInt(7, 22);
  const isFirstTimeDevice = hasNoise && Math.random() < 0.3;

  return {
    transaction_id: txnId, customer_id: customerId,
    timestamp: formatDate(randInt(0, 720)), merchant_id: randChoice(MERCHANT_IDS),
    amount: parseFloat(amount.toFixed(2)), card_bin: `${randInt(400000, 599999)}`,
    device_id: isFirstTimeDevice ? `DEV-NEW-${uuidv4().substring(0, 8)}` : `DEV-${customerId}-001`,
    ip_country: country, merchant_country: 'IN',
    is_first_time_device: isFirstTimeDevice ? 1 : 0,
    txn_count_last_1hr: randInt(0, 2), txn_count_last_24hr: randInt(0, 5),
    avg_amount_last_30d: parseFloat(avgAmount.toFixed(2)), hour_of_day: hour, is_fraud: 0
  };
}

function seedDatabase() {
  const db = initializeDatabase();

  const existing = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  if (existing.count > 0) {
    console.log(`✅ Already seeded with ${existing.count} transactions. Skipping.`);
    return;
  }

  const TOTAL = 1500;
  const FRAUD_COUNT = Math.floor(TOTAL * 0.10);
  const LEGIT_COUNT = TOTAL - FRAUD_COUNT;

  console.log(`🌱 Seeding ${TOTAL} transactions (${FRAUD_COUNT} fraud, ${LEGIT_COUNT} legit)...`);

  const insertTxn = db.prepare(`
    INSERT OR IGNORE INTO transactions
    (transaction_id, customer_id, timestamp, merchant_id, amount, card_bin, device_id,
     ip_country, merchant_country, is_first_time_device, txn_count_last_1hr,
     txn_count_last_24hr, avg_amount_last_30d, hour_of_day, is_fraud)
    VALUES
    (:transaction_id, :customer_id, :timestamp, :merchant_id, :amount, :card_bin, :device_id,
     :ip_country, :merchant_country, :is_first_time_device, :txn_count_last_1hr,
     :txn_count_last_24hr, :avg_amount_last_30d, :hour_of_day, :is_fraud)
  `);

  const insertRisk = db.prepare(`
    INSERT OR IGNORE INTO risk_results
    (transaction_id, risk_score, risk_level, fraud_probability, confidence, is_flagged,
     reasons, risk_breakdown, behavioral_fingerprint, fallback_mode, review_recommendation, engine_version)
    VALUES
    (:transaction_id, :risk_score, :risk_level, :fraud_probability, :confidence, :is_flagged,
     :reasons, :risk_breakdown, :behavioral_fingerprint, :fallback_mode, :review_recommendation, :engine_version)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs
    (transaction_id, risk_score, risk_level, confidence, risk_signals, fallback_mode, recommendation, engine_version, raw_input)
    VALUES
    (:transaction_id, :risk_score, :risk_level, :confidence, :risk_signals, :fallback_mode, :recommendation, :engine_version, :raw_input)
  `);

  const insertReview = db.prepare(`
    INSERT OR IGNORE INTO reviews
    (transaction_id, risk_score, risk_level, top_signal, confidence, status)
    VALUES
    (:transaction_id, :risk_score, :risk_level, :top_signal, :confidence, :status)
  `);

  function processTxn(txn) {
    insertTxn.run(txn);

    const scoreInput = {
      amount: txn.amount, avg_amount_last_30d: txn.avg_amount_last_30d,
      is_first_time_device: txn.is_first_time_device === 1,
      ip_country: txn.ip_country, merchant_country: txn.merchant_country,
      txn_count_last_1hr: txn.txn_count_last_1hr, txn_count_last_24hr: txn.txn_count_last_24hr,
      hour_of_day: txn.hour_of_day
    };
    const result = scoreTransaction(scoreInput);
    const summary = generateSummary(result);

    insertRisk.run({
      transaction_id: txn.transaction_id, risk_score: result.risk_score,
      risk_level: result.risk_level, fraud_probability: result.fraud_probability,
      confidence: result.confidence, is_flagged: result.is_flagged ? 1 : 0,
      reasons: JSON.stringify(result.reasons), risk_breakdown: JSON.stringify(result.risk_breakdown),
      behavioral_fingerprint: JSON.stringify(result.behavioral_fingerprint),
      fallback_mode: result.fallback_mode ? 1 : 0,
      review_recommendation: result.review_recommendation, engine_version: 'TransactionGuard-v1'
    });

    if (result.risk_score >= 25) {
      insertAudit.run({
        transaction_id: txn.transaction_id, risk_score: result.risk_score,
        risk_level: result.risk_level, confidence: result.confidence,
        risk_signals: JSON.stringify(result.reasons.map(r => r.signal)),
        fallback_mode: result.fallback_mode ? 1 : 0,
        recommendation: result.review_recommendation, engine_version: 'TransactionGuard-v1',
        raw_input: JSON.stringify(scoreInput)
      });
    }

    if (result.is_flagged) {
      insertReview.run({
        transaction_id: txn.transaction_id, risk_score: result.risk_score,
        risk_level: result.risk_level, top_signal: summary.top_signal,
        confidence: result.confidence,
        status: Math.random() > 0.7 ? 'Reviewed' : Math.random() > 0.5 ? 'Under Review' : 'Needs Review'
      });
    }
  }

  for (let i = 0; i < FRAUD_COUNT; i++) {
    processTxn(generateFraudTransaction(`TXF${String(i + 1).padStart(5, '0')}`, i));
  }
  for (let i = 0; i < LEGIT_COUNT; i++) {
    processTxn(generateLegitTransaction(`TXL${String(i + 1).padStart(5, '0')}`));
  }

  const total = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  const fraud = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE is_fraud = 1').get().count;
  const flagged = db.prepare('SELECT COUNT(*) as count FROM risk_results WHERE is_flagged = 1').get().count;
  console.log(`✅ Seeded ${total} transactions (${fraud} fraud, ${flagged} flagged)`);
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
