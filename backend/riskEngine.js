/**
 * TransactionGuard AI — Hybrid Risk Engine
 *
 * Scoring Breakdown (total: 0–100):
 *  - Amount Anomaly:       0–25 pts  (how much the amount deviates from historical avg)
 *  - Velocity Risk:        0–25 pts  (txn_count_last_1hr and txn_count_last_24hr)
 *  - Device Risk:          0–20 pts  (is_first_time_device)
 *  - Geographic Risk:      0–15 pts  (ip_country vs merchant_country mismatch)
 *  - Time Risk:            0–15 pts  (unusual transaction hour: midnight-5am)
 *
 *  Noise: ±3 pts random variation to avoid determinism
 */

// High-risk country pairs (IP country known for fraud origin)
const HIGH_RISK_COUNTRIES = new Set(['RU', 'CN', 'NG', 'KP', 'IR', 'PK', 'BD', 'VN', 'UA', 'RO']);
const UNUSUAL_HOURS = new Set([0, 1, 2, 3, 4, 5]); // midnight-5am

function calculateAmountAnomaly(amount, avgAmount) {
  if (!amount || amount <= 0) return { score: 5, label: 'Amount missing', ratio: null };
  if (!avgAmount || avgAmount <= 0) {
    // No historical data — moderate penalty
    const score = amount > 10000 ? 18 : amount > 5000 ? 12 : 8;
    return { score, label: 'No historical average', ratio: null };
  }

  const ratio = amount / avgAmount;
  let score = 0;

  if (ratio <= 0.5) score = 2;
  else if (ratio <= 1.2) score = 0;
  else if (ratio <= 2) score = 5;
  else if (ratio <= 3) score = 10;
  else if (ratio <= 5) score = 16;
  else if (ratio <= 8) score = 21;
  else score = 25;

  return { score: Math.min(25, score), label: 'Amount vs historical average', ratio: parseFloat(ratio.toFixed(2)) };
}

function calculateVelocityRisk(txnLast1hr, txnLast24hr) {
  let score = 0;
  const h1 = txnLast1hr ?? 0;
  const h24 = txnLast24hr ?? 0;

  // Last-hour velocity
  if (h1 >= 10) score += 20;
  else if (h1 >= 7) score += 15;
  else if (h1 >= 5) score += 10;
  else if (h1 >= 3) score += 5;
  else if (h1 >= 2) score += 2;

  // 24-hour velocity
  if (h24 >= 20) score += 5;
  else if (h24 >= 15) score += 4;
  else if (h24 >= 10) score += 3;
  else if (h24 >= 7) score += 2;
  else if (h24 >= 5) score += 1;

  return { score: Math.min(25, score), label: 'Transaction velocity', h1, h24 };
}

function calculateDeviceRisk(isFirstTimeDevice) {
  if (isFirstTimeDevice === null || isFirstTimeDevice === undefined) {
    return { score: 10, label: 'Device unknown', missing: true };
  }
  const score = isFirstTimeDevice ? 20 : 0;
  return { score, label: isFirstTimeDevice ? 'New/unknown device' : 'Known device', missing: false };
}

function calculateGeoRisk(ipCountry, merchantCountry) {
  if (!ipCountry || !merchantCountry) {
    return { score: 5, label: 'Geographic data incomplete', mismatch: null };
  }

  const mismatch = ipCountry.toUpperCase() !== merchantCountry.toUpperCase();
  const ipHigh = HIGH_RISK_COUNTRIES.has(ipCountry.toUpperCase());

  let score = 0;
  if (mismatch && ipHigh) score = 15;
  else if (mismatch) score = 8;
  else if (ipHigh) score = 5;

  return {
    score: Math.min(15, score),
    label: mismatch ? 'IP country differs from merchant country' : 'IP and merchant country match',
    mismatch,
    ipHighRisk: ipHigh
  };
}

function calculateTimeRisk(hourOfDay) {
  if (hourOfDay === null || hourOfDay === undefined) {
    return { score: 3, label: 'Hour unknown', unusual: null };
  }

  const h = parseInt(hourOfDay, 10);
  let score = 0;

  if (UNUSUAL_HOURS.has(h)) {
    score = h === 3 || h === 4 ? 15 : h === 2 || h === 5 ? 12 : 9;
  }

  return {
    score: Math.min(15, score),
    label: UNUSUAL_HOURS.has(h) ? `Unusual hour (${h}:00)` : `Normal business hour (${h}:00)`,
    unusual: UNUSUAL_HOURS.has(h),
    hour: h
  };
}

function addNoise(score) {
  const noise = (Math.random() - 0.5) * 6; // ±3
  return Math.max(0, Math.min(100, Math.round(score + noise)));
}

function calculateConfidence(input) {
  let completeness = 0;
  const total = 5;

  if (input.amount !== undefined && input.amount !== null) completeness++;
  if (input.avg_amount_last_30d !== undefined && input.avg_amount_last_30d !== null) completeness++;
  if (input.is_first_time_device !== undefined && input.is_first_time_device !== null) completeness++;
  if (input.ip_country && input.merchant_country) completeness++;
  if (input.txn_count_last_1hr !== undefined) completeness++;

  const base = completeness / total;
  // Add slight variation
  const variation = (Math.random() - 0.5) * 0.06;
  return Math.max(0.35, Math.min(0.99, parseFloat((base * 0.7 + 0.28 + variation).toFixed(2))));
}

function getRiskLevel(score) {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function detectFallbackMode(input) {
  const missing = [];
  if (input.is_first_time_device === undefined || input.is_first_time_device === null) missing.push('device');
  if (input.txn_count_last_1hr === undefined || input.txn_count_last_1hr === null) missing.push('velocity');
  if (!input.avg_amount_last_30d) missing.push('historical_average');
  return { fallback: missing.length >= 2, missingFields: missing };
}

function buildBehavioralFingerprint(input) {
  const avg = input.avg_amount_last_30d || null;
  const current = input.amount;
  const amountRatio = avg ? parseFloat((current / avg).toFixed(2)) : null;
  const velRatio = input.txn_count_last_1hr ? parseFloat((input.txn_count_last_1hr / 1.5).toFixed(1)) : null;

  return {
    current: {
      amount: current,
      hour: input.hour_of_day,
      device: input.is_first_time_device ? 'New' : 'Known',
      country: input.ip_country || 'Unknown',
      velocity_1hr: input.txn_count_last_1hr ?? 'N/A'
    },
    normal: {
      avg_amount: avg,
      typical_hours: '9 AM – 9 PM',
      known_device: true,
      typical_country: input.merchant_country || 'IN',
      typical_velocity: '1–2/hour'
    },
    deviations: {
      amount_ratio: amountRatio,
      amount_label: amountRatio ? `${amountRatio}× ${amountRatio > 1 ? 'higher' : 'lower'} than normal` : 'No baseline',
      velocity_ratio: velRatio,
      velocity_label: velRatio ? `${velRatio}× above normal` : 'N/A',
      device_new: input.is_first_time_device,
      country_mismatch: input.ip_country && input.merchant_country
        ? input.ip_country.toUpperCase() !== input.merchant_country.toUpperCase()
        : null
    }
  };
}

function scoreTransaction(rawInput) {
  const input = {
    ...rawInput,
    amount: Number(rawInput.amount),
    avg_amount_last_30d: rawInput.avg_amount_last_30d !== undefined && rawInput.avg_amount_last_30d !== null
      ? Number(rawInput.avg_amount_last_30d)
      : (rawInput.historical_average !== undefined && rawInput.historical_average !== null ? Number(rawInput.historical_average) : (rawInput.avg_amount ? Number(rawInput.avg_amount) : null)),
    txn_count_last_1hr: rawInput.txn_count_last_1hr !== undefined && rawInput.txn_count_last_1hr !== null
      ? Number(rawInput.txn_count_last_1hr)
      : (rawInput.velocity_last_1h !== undefined && rawInput.velocity_last_1h !== null ? Number(rawInput.velocity_last_1h) : (rawInput.transactions_last_hour !== undefined ? Number(rawInput.transactions_last_hour) : null)),
    txn_count_last_24hr: rawInput.txn_count_last_24hr !== undefined && rawInput.txn_count_last_24hr !== null
      ? Number(rawInput.txn_count_last_24hr)
      : (rawInput.velocity_last_24h !== undefined && rawInput.velocity_last_24h !== null ? Number(rawInput.velocity_last_24h) : (rawInput.transactions_last_24_hours !== undefined ? Number(rawInput.transactions_last_24_hours) : null)),
    is_first_time_device: rawInput.is_first_time_device !== undefined
      ? Boolean(rawInput.is_first_time_device)
      : (rawInput.is_new_device !== undefined ? Boolean(rawInput.is_new_device) : (rawInput.first_time_device !== undefined ? Boolean(rawInput.first_time_device) : null)),
    ip_country: rawInput.ip_country || rawInput.country || null,
    merchant_country: rawInput.merchant_country || 'IN',
    hour_of_day: rawInput.hour_of_day !== undefined && rawInput.hour_of_day !== null
      ? Number(rawInput.hour_of_day)
      : (rawInput.hour !== undefined && rawInput.hour !== null ? Number(rawInput.hour) : null)
  };

  const { fallback, missingFields } = detectFallbackMode(input);

  const amountResult = calculateAmountAnomaly(input.amount, input.avg_amount_last_30d);
  const velocityResult = calculateVelocityRisk(input.txn_count_last_1hr, input.txn_count_last_24hr);
  const deviceResult = calculateDeviceRisk(input.is_first_time_device);
  const geoResult = calculateGeoRisk(input.ip_country, input.merchant_country);
  const timeResult = calculateTimeRisk(input.hour_of_day);

  const rawScore = amountResult.score + velocityResult.score + deviceResult.score + geoResult.score + timeResult.score;
  const risk_score = addNoise(rawScore);
  const risk_level = getRiskLevel(risk_score);
  const confidence = calculateConfidence(input);
  const fraud_probability = parseFloat(Math.min(0.99, risk_score / 100 + 0.05 * Math.random()).toFixed(2));
  const is_flagged = risk_score >= 25;

  const risk_breakdown = {
    amount_anomaly: amountResult.score,
    velocity: velocityResult.score,
    device_risk: deviceResult.score,
    geo_risk: geoResult.score,
    time_risk: timeResult.score
  };

  // Build reasons list
  const reasons = [];

  if (amountResult.score >= 10) {
    reasons.push({
      signal: 'Amount Anomaly',
      severity: amountResult.score >= 20 ? 'HIGH' : 'MEDIUM',
      current: `₹${input.amount?.toLocaleString('en-IN') || 'N/A'}`,
      expected: input.avg_amount_last_30d ? `₹${input.avg_amount_last_30d.toLocaleString('en-IN')} avg` : 'No baseline',
      detail: amountResult.ratio ? `${amountResult.ratio}× above average` : amountResult.label,
      contribution: amountResult.score
    });
  }

  if (velocityResult.score >= 5) {
    reasons.push({
      signal: 'Velocity Spike',
      severity: velocityResult.score >= 15 ? 'HIGH' : 'MEDIUM',
      current: `${velocityResult.h1} txn/hr`,
      expected: '1–2 txn/hr',
      detail: `${velocityResult.h1} transactions in last hour`,
      contribution: velocityResult.score
    });
  }

  if (deviceResult.score > 0) {
    reasons.push({
      signal: 'New Device',
      severity: 'HIGH',
      current: 'Unseen device',
      expected: 'Known device',
      detail: 'Device has not been seen before for this customer',
      contribution: deviceResult.score
    });
  }

  if (geoResult.score >= 8) {
    reasons.push({
      signal: 'Geographic Mismatch',
      severity: geoResult.score >= 12 ? 'HIGH' : 'MEDIUM',
      current: `IP: ${input.ip_country}`,
      expected: `Merchant: ${input.merchant_country}`,
      detail: geoResult.label,
      contribution: geoResult.score
    });
  }

  if (timeResult.score >= 9) {
    reasons.push({
      signal: 'Unusual Transaction Hour',
      severity: 'MEDIUM',
      current: `${input.hour_of_day}:00`,
      expected: '9:00–21:00',
      detail: timeResult.label,
      contribution: timeResult.score
    });
  }

  // Sort by contribution
  reasons.sort((a, b) => b.contribution - a.contribution);

  const behavioral_fingerprint = buildBehavioralFingerprint(input);

  let review_recommendation = 'No action required';
  if (risk_level === 'CRITICAL') review_recommendation = 'Immediate human review required';
  else if (risk_level === 'HIGH') review_recommendation = 'Human review recommended';
  else if (risk_level === 'MEDIUM') review_recommendation = 'Monitor closely';

  return {
    risk_score,
    risk_level,
    fraud_probability,
    confidence,
    is_flagged,
    reasons,
    risk_breakdown,
    behavioral_fingerprint,
    fallback_mode: fallback,
    missing_fields: missingFields,
    review_recommendation,
    engine_version: 'TransactionGuard-v1'
  };
}

module.exports = { scoreTransaction, getRiskLevel };
