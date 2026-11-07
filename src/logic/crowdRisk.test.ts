import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCrowdRisk } from './crowdRisk';

test('evaluates safe density as NORMAL', () => {
  const result = evaluateCrowdRisk({
    zoneId: 'kotilingala_ghat',
    count: 1200,
    areaSqMeters: 2000, // 0.6 per sq m
  });
  assert.equal(result.riskLevel, 'NORMAL');
  assert.equal(result.requiresOperatorIntervention, false);
});

test('evaluates high density as WARNING', () => {
  const result = evaluateCrowdRisk({
    zoneId: 'pushkar_ghat',
    count: 7000,
    areaSqMeters: 2000, // 3.5 per sq m
  });
  assert.equal(result.riskLevel, 'WARNING');
  assert.equal(result.requiresOperatorIntervention, true);
});

test('evaluates extreme density >= 4.0 as CRITICAL', () => {
  const result = evaluateCrowdRisk({
    zoneId: 'saraswati_ghat',
    count: 9000,
    areaSqMeters: 2000, // 4.5 per sq m
  });
  assert.equal(result.riskLevel, 'CRITICAL');
  assert.equal(result.requiresOperatorIntervention, true);
});

test('rapid surge triggers WARNING even if baseline density is moderate', () => {
  const result = evaluateCrowdRisk({
    zoneId: 'bridge_approach',
    count: 3500,
    areaSqMeters: 2000, // 1.75 per sq m
    previousCount: 2000,
    timeDeltaMinutes: 10, // surge = (1500 / 10) * 60 = 9000/hr
  });
  assert.equal(result.riskLevel, 'WARNING');
  assert.equal(result.requiresOperatorIntervention, true);
});
