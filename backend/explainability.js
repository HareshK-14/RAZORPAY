/**
 * Explainability Engine — generates human-readable explanations
 * for risk results produced by the Risk Engine.
 */

function generateExplanation(result, input) {
  const { risk_score, risk_level, fraud_probability, confidence, reasons, fallback_mode } = result;

  const lines = [];

  lines.push(`This transaction received a risk score of ${risk_score}/100 (${risk_level}).`);

  if (fallback_mode) {
    lines.push(`⚠️ Limited data mode: some signals were unavailable, reducing confidence to ${Math.round(confidence * 100)}%.`);
  } else {
    lines.push(`The system analyzed ${reasons.length} risk signal(s) with ${Math.round(confidence * 100)}% confidence.`);
  }

  if (reasons.length === 0) {
    lines.push('No significant risk signals detected. Transaction appears consistent with normal behavior.');
  } else {
    lines.push('The following signals contributed to the risk assessment:');
    reasons.forEach((r, i) => {
      const icon = r.severity === 'HIGH' ? '🔴' : '🟠';
      lines.push(`${icon} ${r.signal}: ${r.detail} (Current: ${r.current}, Expected: ${r.expected})`);
    });
  }

  if (risk_level === 'CRITICAL' || risk_level === 'HIGH') {
    lines.push(`⚠️ Estimated fraud probability: ${Math.round(fraud_probability * 100)}%. Human review is strongly recommended before processing this transaction.`);
  }

  return lines.join('\n');
}

function generateSummary(result) {
  const { risk_level, risk_score, reasons } = result;
  const topSignal = reasons.length > 0 ? reasons[0].signal : 'None';

  return {
    headline: `${risk_level} RISK — Score ${risk_score}/100`,
    top_signal: topSignal,
    signal_count: reasons.length,
    recommendation: result.review_recommendation
  };
}

module.exports = { generateExplanation, generateSummary };
